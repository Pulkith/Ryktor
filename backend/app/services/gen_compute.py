import openai
import dotenv
import json

dotenv.load_dotenv()

def recursive_json_loads(data):
    # Base case: if data is not a string, return it as it is
    if not isinstance(data, str):
        return data
    
    try:
        # Try to load the string as JSON
        loaded_data = json.loads(data)
    except json.JSONDecodeError:
        # If data is not JSON, return as is
        return data

    # Recursively apply the function if the result is a dict or list
    if isinstance(loaded_data, dict):
        return {key: recursive_json_loads(value) for key, value in loaded_data.items()}
    elif isinstance(loaded_data, list):
        return [recursive_json_loads(item) for item in loaded_data]
    else:
        return loaded_data

def LLM_INSTANCE(prompt, text = "", convJSON = False):

    json_enforcer_prompt = """
    Output your result in JSON and only JSON. Your response will be used directly 
    by an automated application, so ensure the output is in the correct format. Do not 
    output any escape characters or wrapping for the JSON, just the JSON object itself.
    """

    if convJSON:
       prompt = prompt.replace("$json_enforcer$", json_enforcer_prompt)    

    model = "gpt-4o-mini-2024-07-18"

    client = openai.Client()

    messages = [
        {
                "role": "system",
                "content": prompt,
        },
    ]

    if text:
        messages.append({
            "role": "user",
            "content": text,
        })

    chat_completion = client.chat.completions.create(
        messages=messages,
        temperature=0,
        model=model
    )

    text = chat_completion.choices[0].message.content

    if convJSON:
        return recursive_json_loads(text)
    return text
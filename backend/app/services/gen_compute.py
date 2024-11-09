import openai
import dotenv
import json

dotenv.load_dotenv()

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
        return json.loads(text)
    return text
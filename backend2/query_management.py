import openai
import dotenv
import json

dotenv.load_dotenv()

def LLM_INSTANCE(prompt, text):
    model = "gpt-3.5-turbo-0125"

    client = openai.Client()

    chat_completion = client.chat.completions.create(
        messages=[
            {
                "role": "system",
                "content": prompt,
            },
            {
                "role": "user",
                "content": text,
            },
        ],
        temperature=0,
        model=model
    )

    return chat_completion.choices[0].message.content
    

def process_audio():
    # pulith API RAHHH
    pass

def process_text(language, text):
    docs = get_patient_docs()
    if language == "en":
        process_query(docs, text)
    else:
        translated_text = translate_text(language, text)
        process_query(docs, translated_text)

def get_patient_docs(): # RAG
    return []

def translate_text(language, text):
    PROMPT = """
    
    You are an expert in medical language translation.

    The below text is in the following language: {language}

    We need to convert this text to english. Please provide the translation below. The text is a patient
    reporting their symptoms for a possible hospital visit. Please make sure to keep the context of the 
    text in mind when translating, and keep the translation as accurate in meaning in possible for a 
    healthcare professional to understand.

    The text is provided by the user. Output only the translation. Your response will be used directly by an 
    automated system, so ensure that you provide no additional information other than the translation.
    """

    PROMPT = PROMPT.format(language=language)

    return LLM_INSTANCE(PROMPT, text)

treatments = [
    "Surgery",
    "Medication",
    "Physical Therapy",
    "Counseling",
    "Diet and Exercise",
]

def process_query(docs: list, query):
    PROMPT = """
    You are an expert in medical information retrieval.

    The below text is a question either typed or spoken by a user. The user is describing their
    symptoms and current condition, and is looking for information on what they should do next.

    The system will provide a list of over a 1000 possible treatment options provided by hospitals in the user's area.

    The system will also provide a summary of the user's medical history including past 
    hospital visits, medications, and chronic conditions. This also includes demographic information and 
    personal iformation.

    Based on the user's symptoms and medical history, provide a list of 5 possible treatment options, 
    ranked from most likely to least likely. Be realistic and logical (for example, if the user has a simple 
    cold, do not suggest surgery or expensive treatments or scans).

    Act like a doctor would in a real-life situation, and provide the best possible advice based on the
    information provided. The user is looking for a professional opinion on what they should do next. Based on your recommendations, 
    we will provide the user with a list of hospitals with the cheapest cost for the treatment options you provide. For each treatment,
    provide a weight, with the weights summing to 1.0. These weights are essentially your confidence in the treatment option 
    relative to the other options, so that we can minimize the expected cost for the user.

    Output your response as JSON and only JSON as it will be used directly by an automated system. Use the following format:
    [
        {
            "treatment": "name",
            "reason": "reason for treatment",
            "weight": 0.2
        }
    ]

    Below is the information.

    <TREATMENTS>
    {treatments}
    </TREATMENTS>

    <Medical History Information>
    {docs}
    </Medical History Information>
    """

    PROMPT = PROMPT.format(treatments=treatments, docs=docs)

    treatments = LLM_INSTANCE(PROMPT, query)

    treatments_list = json.loads(treatments)

    return treatments_list
    


if __name__ == "__main__":
    input = """
    नमस्कार. मला अलीकडे अनेकदा हात थरथरण्याची समस्या येत आहे. जेव्हा मी टायपिंग किंवा लिहितो तेव्हा माझा हात थोडा थरथरतो किंवा जेव्हा मी काहीही घट्ट धरतो तेव्हा माझे हस्ताक्षर आणि फोन स्क्रीन सारख्या लहान इलेक्ट्रॉनिक्स वापरण्याची क्षमता बिघडते. मला चालताना हळूहळू समतोल साधण्यात काही समस्या येत आहेत आणि मला आधारासाठी रेलिंगला धरून ठेवण्याची गरज आहे. मी सहसा दररोज योगा करतो, परंतु अलीकडे सराव करताना मला अडखळते किंवा त्याच लवचिकतेने ताणता येत नाही. मी अजूनही छान उठू शकतो आणि माझी नेहमीची ताकद आहे, पण मला जास्त वेळ लागतो आणि थकवा येतो. मला हे जाणून घ्यायचे आहे की हे वृद्धापकाळामुळे आहे की नाही. मी या लक्षणांचा सामना कसा करू शकतो? मी काय करू शकतो हे शोधण्यासाठी मला डॉक्टरांना भेटायचे आहे आणि काही निदान असल्यास मला माहित असले पाहिजे.
    """
    
    print(translate_text("Marathi", input))
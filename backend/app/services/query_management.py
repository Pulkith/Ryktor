import whisper
import json
import tempfile
from pydub import AudioSegment
import os

from .gen_compute import LLM_INSTANCE

whisper_model = whisper.load_model("base")

    

def process_audio(audio_file_path: str):
    # Load the audio file directly using the path
    audio = AudioSegment.from_file(audio_file_path)
    wav_path = 'uploaded_recording.wav'
    audio.export(wav_path, format='wav')
    
    try:
        transcription = send_transcript(wav_path)
        print(transcription)
        return transcription
    finally:
        # Clean up the temporary WAV file
        os.remove(wav_path)

def send_transcript(file):
    result = whisper_model.transcribe(file)
    print(result)
    transcription = result["text"]
    return {
        "text": transcription,
        "language": "en"  # Whisper automatically detects and transcribes to English
    }


# def process_text(language, text):
#     docs = get_patient_docs()
#     if language == "en":
#         process_query(docs, text)
#     else:
#         translated_text = translate_text(language, text)
#         process_query(docs, translated_text)

# def get_patient_docs(): # RAG
#     return []

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

def detect_text(text):
    PROMPT = """
    You are an expert in medical language translation.

    Read the following text. Figure out which language it is in. Output
    the two-letter language code of the language the text is in. For example
    if the text is in English, output "en". If the text is in Spanish, output "es".

    Output nothing else other than the two-letter language code. Your response will be used directly by an
    automated system. Output only the two-letter language code. No punctuation or additional information, just the 
    two characters.
    """

    language = LLM_INSTANCE(PROMPT, text)

    if language == "en":
        return text
    
    else:
        translated_text = translate_text(language, text)
        return translated_text



# treatments = [
#     "Surgery",
#     "Medication",
#     "Physical Therapy",
#     "Counseling",
#     "Diet and Exercise",
# ]

# def process_query(docs: list, query):
#     global treatments
    
#     PROMPT = """
#     You are an expert in medical information retrieval.
    
#     The below text is a question either typed or spoken by a user. The user is describing their
#     symptoms and current condition, and is looking for information on what they should do next.
    
#     Based on the user's symptoms and medical history, provide a list of 5 possible treatment options, 
#     ranked from most likely to least likely. Be realistic and logical.
    
#     Output your response as JSON and only JSON as it will be used directly by an automated system. Use the following format:
#     [
#         {{
#             "treatment": "name",
#             "reason": "reason for treatment",
#             "weight": 0.2
#         }}
#     ]

#     Below is the information.

#     <TREATMENTS>
#     {treatments}
#     </TREATMENTS>

#     <Medical History Information>
#     {docs}
#     </Medical History Information>
#     """
    
#     PROMPT = PROMPT.format(treatments=treatments, docs=docs)
    
#     response = LLM_INSTANCE(PROMPT, query)
    
#     treatments_list = json.loads(response)
    
#     return treatments_list
    


if __name__ == "__main__":
    input = """
    नमस्कार. मला अलीकडे अनेकदा हात थरथरण्याची समस्या येत आहे. जेव्हा मी टायपिंग किंवा लिहितो तेव्हा माझा हात थोडा थरथरतो किंवा जेव्हा मी काहीही घट्ट धरतो तेव्हा माझे हस्ताक्षर आणि फोन स्क्रीन सारख्या लहान इलेक्ट्रॉनिक्स वापरण्याची क्षमता बिघडते. मला चालताना हळूहळू समतोल साधण्यात काही समस्या येत आहेत आणि मला आधारासाठी रेलिंगला धरून ठेवण्याची गरज आहे. मी सहसा दररोज योगा करतो, परंतु अलीकडे सराव करताना मला अडखळते किंवा त्याच लवचिकतेने ताणता येत नाही. मी अजूनही छान उठू शकतो आणि माझी नेहमीची ताकद आहे, पण मला जास्त वेळ लागतो आणि थकवा येतो. मला हे जाणून घ्यायचे आहे की हे वृद्धापकाळामुळे आहे की नाही. मी या लक्षणांचा सामना कसा करू शकतो? मी काय करू शकतो हे शोधण्यासाठी मला डॉक्टरांना भेटायचे आहे आणि काही निदान असल्यास मला माहित असले पाहिजे.
    """
    
    print(translate_text("Marathi", input))
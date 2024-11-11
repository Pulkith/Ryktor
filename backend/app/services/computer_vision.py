from PIL import Image
import pytesseract
import cv2
import numpy as np
import re
from string import Template
import json as json_lib
import pdfplumber

from .gen_compute import LLM_INSTANCE

def preprocess_image(image_path):
    # Open the image with Pillow
    image = Image.open(image_path)
    # Convert to grayscale
    gray_image = np.array(image.convert('L'))
    # Apply adaptive thresholding to make text more prominent
    processed_image = cv2.adaptiveThreshold(
        gray_image, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2
    )
    return processed_image

def preprocess_heavy_billing(image_path):
    image = Image.open(image_path)
    gray_image = np.array(image.convert('L'))

    # Adaptive thresholding to enhance text
    processed_image = cv2.adaptiveThreshold(
        gray_image, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2
    )
    
    # Resize
    scale_percent = 150
    width = int(processed_image.shape[1] * scale_percent / 100)
    height = int(processed_image.shape[0] * scale_percent / 100)
    resized_image = cv2.resize(processed_image, (width, height), interpolation=cv2.INTER_LINEAR)

    # Reduce noise
    blurred_image = cv2.medianBlur(resized_image, 3)

    # Edge detection
    edges = cv2.Canny(blurred_image, 100, 200)

    # Denoise and apply morphological transformation
    denoised_image = cv2.bilateralFilter(edges, 9, 75, 75)
    kernel = np.ones((2, 2), np.uint8)
    morphed_image = cv2.morphologyEx(denoised_image, cv2.MORPH_CLOSE, kernel)

    # Adjust contrast
    adjusted_image = cv2.convertScaleAbs(morphed_image, alpha=1.5, beta=20)

    return adjusted_image


# Fast text extraction with Tesseract
def extract_text(image_path):
    processed_image = preprocess_image(image_path)
    # Use basic Tesseract configuration for fastest performance
    custom_config = r'--oem 3 --psm 6'
    text = pytesseract.image_to_string(processed_image, config=custom_config)
    return text

# Extract text with formatting preservation
def extract_text_heavy_billing(image_path):
    processed_image = preprocess_image(image_path)

    # Using Tesseract's `preserve_interword_spaces` config to keep spacing
    custom_config = r'--psm 6 preserve_interword_spaces=1'  # psm 6 treats the image as a single block with rows/columns

    # Run OCR
    text = pytesseract.image_to_string(processed_image, config=custom_config)

    return text

# def extract_text_heavy_billing(pdf_path):
#     # use pymupdf to extract text from pdf
#     text = ""

#     with 
    


# Parse specific details from the text
def parse_insurance_info(text):
    info = {
        "name": None,
        "policy_number": None,
        "group_number": None,
        "member_id": None,
    }
    # Regular expressions to match known patterns
    name_match = re.search(r"Name:\s*(\w+\s+\w+)", text)
    policy_number_match = re.search(r"Policy\s*Number:\s*(\S+)", text)
    group_number_match = re.search(r"Group\s*Number:\s*(\S+)", text)
    member_id_match = re.search(r"Member\s*ID:\s*(\S+)", text)

    # Extract found matches
    if name_match:
        info["name"] = name_match.group(1)
    if policy_number_match:
        info["policy_number"] = policy_number_match.group(1)
    if group_number_match:
        info["group_number"] = group_number_match.group(1)
    if member_id_match:
        info["member_id"] = member_id_match.group(1)

    return info

def parse_gen_insurace(raw_text, full_name):
    fields = [
        "First Name",
        "Last Name",
        "Date of Birth",
        "Policy Number",
        "Group Number",
        "Member ID",
        "Insurance Company",
        "Insurance Plan",
        "Insurance Type",
        "Effective Date",
        "In Network Deductible",
        "Out of Network Deductible",
        "In Network Out of Pocket Max",
        "Out of Network Out of Pocket Max",
    ]


    template = """
    You are an expert in reading insurance cards. The below text has been extracted from an insurance card
    using OCR. Please parse and convert the text into a structured format. The text is a patient's insurance
    information, and you need to extract the below fields. For any missing fields, please leave them as an empty string. If there are
    multiple people on the insurance card, please only extract the information for the patient named {full_name}.
    
    $json_enforcer$

    <FIELDS>
    {fields}
    </FIELDS>
    """


    formatted_prompt = template.format(fields="\n".join(fields), full_name=full_name)

    json = LLM_INSTANCE(prompt=formatted_prompt, text=raw_text, convJSON=True)

    return json

def insurance_card_pipeline(front_image_path, back_image_path, full_name):
    front_text = extract_text(front_image_path)
    back_text = extract_text(back_image_path)

    combined_text = """
    FRONT OF CARD:
    {front_text}

    BACK OF CARD:
    {back_text}
    """

    combined_text = combined_text.format(front_text=front_text, back_text=back_text)

    json = parse_gen_insurace(combined_text, full_name)

    return json

def parse_gen_medical_bill(raw_text):

    fields = {
        "Patient Name":"",
        "Hospital Name":"",
        "Date of Service":"",
        "Admission Date":"",
        "Discharge Date":"",
        "Full Location":"",
        "services": [
            {
                "Service Name":"",
                "Extra Description": "If Necessary",
                "Service Date":"",
                "Service Code":"",
                "Amount Charged":"",
            }
        ],
        "Total Amount Charged":"",
        "Insurance Responsibility / Pay":"",
        "Patient Responsibility Paid":"",
        "Patient Responsibility Remaining":"Sometimes called 'Patient Balance Due' or 'Amount Due'",
        "Possible Incorrect or Upcoded Charges":"",
        
    }

    template = """
    You are an expert in ready medical bills. The below text has been extract from a possibly multipage medical bill
    using OCR in a way that preserves f/how-to-request-an-itemized-bill-from-a-hospitalormatting as much as possible. Please extract the below fields in the format specified. For any missing fields
    please deduce them from the rest of the text if possible, and if not, leave them as an empty string. 

    Also find any fraudlent or incorrect charges. These are charges that make no sense, are priced wrong, or are upcoded. 
    If you find any, please list them in the Possible Incorrect or Upcoded Charges field. Find any discrepancies in the bill
    and describe it in the Possible Incorrect or Upcoded Charges field.

    $json_enforcer$

    <FIELDS>
    {fields}
    </FIELDS>
    """
    fields_as_string = json_lib.dumps(fields, indent=4)

    formatted_prompt = template.format(fields=fields_as_string)

    json = LLM_INSTANCE(prompt=formatted_prompt, text=raw_text, convJSON=True)

    return json


def medical_bill_pipeline(image_paths: list):
    page_count = 1
    raw_text = ""
    for image_path in image_paths:
        raw_text += f"<Page {page_count}:>\n"
        raw_text += extract_text_heavy_billing(image_path)
        page_count += 1

    json = parse_gen_medical_bill(raw_text)

    return json


def pdf_doc_pipeline(pdf_path):
    # extract all text from pdf to a single string
    raw_text = ""

    # extract text from each page of the pdf using fitz
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            raw_text += page.extract_text() + "\n"
    
    return raw_text
    

if __name__ == "__main__":
    # front_image_path = "id_card_examples/IMG_5629.PNG"
    # back_image_path = "id_card_examples/IMG_5630.PNG"
    # full_name = "Pulkith Paruchuri"
    # json = insurance_card_pipeline(front_image_path, back_image_path, full_name)
    # print(json)

    med_path = ["id_card_examples/med_bill_example.png"]

    ret = medical_bill_pipeline(med_path)


# Example usage
# image_path = "insurance_card.jpg"  # Path to the insurance card image
# raw_text = extract_text(image_path)
# print(raw_text)


# # Main function to use the above methods
# def main(image_path):
#     text = extract_text(image_path)
#     insurance_info = parse_insurance_info(text)
#     return insurance_info

# # Run the main function
# image_path = "insurance_card.jpg"  # Path to the insurance card image
# insurance_info = main(image_path)
# print(insurance_info)
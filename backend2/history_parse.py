import pymupdf

def parse_pdf(file_path):
    pdf = pymupdf.open(file_path)
    text = ""
    for page in pdf:
        text += page.get_text()
    return text

if __name__ == "__main__":
    print(parse_pdf("/Users/pulkith/Downloads/Pulkith_Paruchuri_Resume - 2024-11-01T182409.203.pdf"))
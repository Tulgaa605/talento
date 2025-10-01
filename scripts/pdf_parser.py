import sys
import json
import base64
import PyPDF2
from io import BytesIO

def extract_text_from_pdf(pdf_data):
    try:
        pdf_bytes = base64.b64decode(pdf_data)
        pdf_file = BytesIO(pdf_bytes)
        
        pdf_reader = PyPDF2.PdfReader(pdf_file)
        
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text() + "\n"
        
        return {
            "success": True,
            "text": text.strip()
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

def main():
    pdf_data = sys.stdin.read()
    
    result = extract_text_from_pdf(pdf_data)
    
    print(json.dumps(result))

if __name__ == "__main__":
    main() 
import sys
import json
import base64
import PyPDF2
from io import BytesIO

def extract_text_from_pdf(pdf_data):
    try:
        # Decode base64 PDF data
        pdf_bytes = base64.b64decode(pdf_data)
        pdf_file = BytesIO(pdf_bytes)
        
        # Create PDF reader object
        pdf_reader = PyPDF2.PdfReader(pdf_file)
        
        # Extract text from each page
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
    # Read PDF data from stdin
    pdf_data = sys.stdin.read()
    
    # Extract text
    result = extract_text_from_pdf(pdf_data)
    
    # Output result as JSON
    print(json.dumps(result))

if __name__ == "__main__":
    main() 
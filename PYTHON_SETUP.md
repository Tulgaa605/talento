# Python Setup Guide for Contract Generation

This guide explains how to set up Python and the required dependencies for generating Word contract documents.

## Prerequisites

1. **Python 3.7 or higher** must be installed on your server
2. **python-docx library** for Word document generation

## Installation Steps

### 1. Install Python (if not already installed)

#### Windows
1. Download Python from [python.org](https://www.python.org/downloads/)
2. Run the installer and **check "Add Python to PATH"**
3. Verify installation:
```bash
python --version
```

#### Linux/macOS
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install python3 python3-pip

# macOS
brew install python3
```

### 2. Install Required Python Packages

Navigate to your project directory and run:

```bash
pip install python-docx
```

Or install from requirements file:
```bash
pip install -r requirements.txt
```

### 3. Verify Setup

Check if python-docx is installed:
```bash
python -c "import docx; print('python-docx is installed')"
```

### 4. Template File

Ensure the contract template exists at:
```
public/templates/contracts/template.docx
```

The template should contain placeholders like:
- `2025 оны. . . . дугаар сарын ….-ны өдөр` - Start date
- `№ .........` - Contract number
- `Эрдэнэс-Тавантолгой ХК` - Company name
- `. . . . . . . . . . . . . . . овогтой. . ............` - Employee name
- `Регистрийн дугаар: .................` - Registration number
- `Албан тушаал: ...............` - Position
- `Харьяалагдах нэгж: ..............` - Department
- `Үндсэн цалин: ................ /............................../-н төгрөг` - Salary

## Troubleshooting

### Error: "Python суугаагүй байна"
- Python is not installed or not in PATH
- Solution: Install Python and ensure it's accessible from command line

### Error: "Template файл олдсонгүй"
- Template file is missing
- Solution: Place template.docx in `public/templates/contracts/` directory

### Error: "python-docx сан суугаагүй"
- python-docx library is not installed
- Solution: Run `pip install python-docx`

### Error: "Word файл үүсээгүй байна"
- Python script failed to generate the document
- Check server logs for detailed Python error messages
- Verify template file exists and is valid
- Ensure python-docx is properly installed

## Production Deployment

When deploying to production (e.g., Vercel, Netlify, AWS):

### Note on Serverless Platforms
Some serverless platforms (like Vercel) may have limitations running Python scripts. Consider:

1. **Alternative: Use a Node.js library** like `docxtemplater` or `officegen` instead of Python
2. **Use a microservice**: Deploy Python script as a separate microservice
3. **Pre-build approach**: Generate documents during build time if possible

### Recommended: Switch to Node.js Solution

For better deployment compatibility, consider migrating to a pure Node.js solution:

```bash
npm install docxtemplater pizzip
```

This eliminates Python dependency and works seamlessly on serverless platforms.

## Current Implementation Status

- ✅ Contract detail page created
- ✅ Windows-compatible directory creation
- ✅ Better error handling and logging
- ✅ Python version detection (python3/python)
- ✅ Template file verification
- ⚠️ Python dependency required on server

## Next Steps

Consider implementing a Node.js-based Word generation solution for better serverless platform compatibility.


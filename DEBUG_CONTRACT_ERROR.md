# Contract Generation 500 Error - Debugging Guide

## 🔍 Step 1: Check Setup Status

Server дээр энэ URL руу очиж setup status шалгаарай:

```
http://localhost:3000/api/hr/contracts/68f98def6351aa3aa2493aed/debug
```

(68f98def6351aa3aa2493aed гэдгийг өөрийн contract ID-аар солино уу)

Энэ нь танд юу дутаж байгааг харуулна.

## 🛠️ Step 2: Run Setup Check

Terminal дээр дараах command ажиллуулаарай:

```bash
npm run check:contracts
```

Энэ нь дараах зүйлсийг шалгана:
- ✅ Template file байгаа эсэх
- ✅ Python суусан эсэх
- ✅ python-docx суусан эсэх
- ✅ Output directory байгаа эсэх

## 📋 Step 3: Common Issues & Fixes

### Issue 1: Template файл олдохгүй байна

**Шалгах:**
```
public/templates/contracts/template.docx файл байгаа эсэхийг шалгаарай
```

**Засах:**
```bash
# Folder үүсгэх
mkdir -p public/templates/contracts

# Template файлыг энд хуулаад тавина
# public/templates/contracts/template.docx
```

Template файл доторх placeholders:
- `2025 оны. . . . дугаар сарын ….-ны өдөр` - Огноо
- `№ .........` - Гэрээний дугаар
- `Эрдэнэс-Тавантолгой ХК` - Компанийн нэр
- `. . . . . . . . . . . . . . . овогтой. . ............` - Ажилчны нэр
- `Регистрийн дугаар: .................` - РД
- `Албан тушаал: ...............` - Албан тушаал
- `Харьяалагдах нэгж: ..............` - Хэлтэс
- `Үндсэн цалин: ................ /............................../-н төгрөг` - Цалин

### Issue 2: Python суугаагүй байна

**Шалгах:**
```bash
python --version
# эсвэл
python3 --version
```

**Засах:**

#### Windows:
1. [python.org](https://www.python.org/downloads/) сайтаас Python татаж суулга
2. Installation үед **"Add Python to PATH"** гэснийг заавал check хийнэ
3. CMD эсвэл PowerShell дахин нээгээд `python --version` ажиллуулж шалгана

#### Linux:
```bash
sudo apt update
sudo apt install python3 python3-pip
```

#### macOS:
```bash
brew install python3
```

### Issue 3: python-docx суугаагүй байна

**Шалгах:**
```bash
python -c "import docx; print('Installed')"
# эсвэл
python3 -c "import docx; print('Installed')"
```

**Засах:**
```bash
# Project folder дээр очоод
pip install python-docx

# эсвэл requirements файлаас
pip install -r requirements.txt
```

### Issue 4: generate_contract_word.py олдохгүй байна

**Шалгах:**
```
scripts/generate_contract_word.py файл байгаа эсэхийг шалгаарай
```

Хэрэв энэ файл байхгүй бол GitHub repository-оос татаж авна уу.

## 🧪 Step 4: Test Contract Generation

Setup бүрэн болсны дараа test ажиллуулна:

```bash
npm run test:contracts
```

Энэ нь жишээ contract үүсгэж, бүх process-ийг шалгана.

## 🔧 Step 5: Check Server Logs

Server console дээр дэлгэрэнгүй алдааны мэдээлэл харна:

```bash
npm run dev
```

Дараа нь Word хэвлэх товч дараад console дээрх алдааг уншина. Энд дараах мэдээллүүд гарна:
```
Using Python command: python3
Script path: ...
JSON path: ...
Output path: ...
Python stdout: ...
Python stderr: ...
```

## 🚨 If Still Not Working

Хэрэв дээрх бүх алхмуудыг хийсэн ч алдаа гарсаар байвал:

### Option A: Server Console Log-ыг харуулах

Server terminal дээр гарч байгаа бүх алдааны мэдээллийг харуулаад өгнө үү. Ялангуяа:
- `Python execution error:`
- `Python stdout:`
- `Python stderr:`

Гэсэн мөрүүдийг хайж хараарай.

### Option B: Manual Test

Terminal дээр гараар тест хийх:

```bash
# 1. Test data үүсгэх
echo '{"contractNumber":"TEST-001","employeeName":"Баяр","employeeLastName":"Болд","salary":1500000,"salaryText":"нэг сая таван зуун мянган","startDate":"2025-01-15","position":"Инженер","department":"IT"}' > test_contract.json

# 2. Python script ажиллуулах
python scripts/generate_contract_word.py

# 3. Алдаа гарвал дэлгэрэнгүй харуулна
```

### Option C: Node.js Solution (Recommended for Production)

Python асуудал тогтмол гарч байвал Node.js solution руу шилжүүлэх:

```bash
# Та аль хэдийн эдгээр package-ууд суусан байна:
# - docxtemplater
# - pizzip

# Би танд Node.js version код бичиж өгч болно
# Python dependency хэрэггүй болно
```

Энэ нь:
- ✅ Vercel/Netlify дээр ажиллана
- ✅ Илүү хурдан
- ✅ Setup хялбар
- ✅ Python dependency хэрэггүй

## 📞 Need Help?

Дараах мэдээллүүдийг өгвөл би илүү сайн тусалж чадна:

1. `npm run check:contracts` command-ын үр дүн
2. Server console дээрх алдааны мэдээлэл (Python stdout/stderr)
3. Template файл байгаа эсэх
4. Python болон python-docx суусан эсэх

---

**Quick Checklist:**
- [ ] Template файл: `public/templates/contracts/template.docx`
- [ ] Python суусан: `python --version` ажиллаж байгаа
- [ ] python-docx суусан: `pip install python-docx`
- [ ] Test ажилласан: `npm run test:contracts`
- [ ] Debug endpoint шалгасан: `/api/hr/contracts/{id}/debug`


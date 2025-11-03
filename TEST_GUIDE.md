# 🧪 Word Generation Test Guide

## Локал тестлэх

### 1. Dev server ажиллуулах
```bash
npm run dev
```

### 2. Browser дээр тест хийх

1. Нээх: `http://localhost:3000/employer/hr/contracts`
2. Гэрээ сонгох
3. "Word татах" товч дарах
4. **Terminal console** дээр logs харах

### 3. Logs шалгах

Terminal дээр дараах мэдээлэл харагдах ёстой:
```
Starting Word generation...
Template path: C:\Users\...\public\templates\contracts\template.docx
Output path: C:\Users\...\public\uploads\contracts\contract_...docx
Contract data: { ... }
Word generation completed
Output file exists, size: 18000
```

### 4. Хэрэв алдаа гарвал

**Error: "Template файл олдсонгүй"**
```bash
# Template файл байгаа эсэхийг шалгах
ls public/templates/contracts/template.docx
```

**Error: "Module not found: @/utils/generateContractWord"**
```bash
# Server дахин ажиллуулах
# Ctrl+C дарж зогсоох
npm run dev
```

**Error: "Cannot write file"**
```bash
# Upload folder үүсгэх
mkdir -p public/uploads/contracts
```

**Error type-related алдаа**
```bash
# Types regenerate хийх
npm run build
```

## 🔍 Debugging Steps

1. **Console logs харах**
   - Terminal дээр `Starting Word generation...` гэж гарч байгаа эсэх
   - Ямар алдаа гарч байгааг харах

2. **Template шалгах**
   ```bash
   npx tsx scripts/test-contract-generation.ts
   ```
   
   Хэрэв энэ ажиллаж байвал problem нь API route дээр байна

3. **API шууд тестлэх**
   Browser console дээр:
   ```javascript
   fetch('/api/hr/contracts/YOUR_CONTRACT_ID/generate-word')
     .then(r => {
       if (!r.ok) throw new Error('Failed: ' + r.status);
       return r.blob();
     })
     .then(blob => console.log('Success!', blob.size))
     .catch(e => console.error(e))
   ```

## ✅ Success indicators:

- ✅ Terminal: "Word generation completed"
- ✅ File download starts in browser
- ✅ .docx file нээгдэнэ
- ✅ Бүх data зөв орсон байна

## ❌ Common mistakes:

- Template файл байхгүй
- Database-д contract байхгүй  
- Employee data дутуу
- File permissions асуудал

---

**Дараах алхам:** Dev server ажиллуулаад test хий!

```bash
npm run dev
```


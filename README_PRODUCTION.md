# 🚀 Production Deployment Guide

## ✅ Бэлтгэл ажил

### 1. Бүх өөрчлөлт commit хийгдсэн эсэхийг шалгах

```bash
git status
```

### 2. Build хийх

```bash
npm run build
```

Хэрэв алдаа гарвал:
- Template файл байгаа эсэхийг шалгах: `public/templates/contracts/template.docx`
- Dependencies суусан эсэхийг шалгах: `npm install`

## 🐛 500 Error засах

### Магадгүй шалтгаанууд:

1. **Template файл олдохгүй байна**
   - `public/templates/contracts/template.docx` байгаа эсэхийг шалгах
   - Production build-д template орсон эсэхийг шалгах

2. **Import path асуудал**
   ```typescript
   // API route дээр
   import { generateContractWordAdvanced } from '@/utils/generateContractWord';
   ```
   
   tsconfig.json дээр `@/*` path зөв байгаа эсэхийг шалгах

3. **File permissions**
   - `public/uploads/contracts` folder үүсч чадаж байгаа эсэх
   - Write permission байгаа эсэх

### Шалгах команд:

```bash
# Development mode
npm run dev

# Browser console дээр:
fetch('/api/hr/contracts/YOUR_CONTRACT_ID/generate-word')
  .then(r => r.blob())
  .then(blob => console.log('Success, size:', blob.size))
  .catch(e => console.error('Error:', e))
```

### Server logs шалгах:

Terminal дээр server ажиллаж байх үед алдаа гарвал:
- Console-д алдааны дэлгэрэнгүй харагдана
- Template path зөв эсэх
- Contract data зөв эсэх

## 🔧 Common fixes:

### Error: "Template файл олдсонгүй"

```bash
# Template байгаа эсэхийг шалгах
ls -la public/templates/contracts/template.docx

# Байхгүй бол:
# Template файлыг зөв folder-т хуулах
```

### Error: "Module not found"

```bash
# Dependencies дахин суулгах
rm -rf node_modules
rm package-lock.json
npm install
```

### Error: "Cannot write file"

```bash
# Upload folder үүсгэх
mkdir -p public/uploads/contracts
```

## 📋 Pre-deployment checklist:

- [ ] Build амжилттай хийгдсэн (`npm run build`)
- [ ] Template файл байгаа (`public/templates/contracts/template.docx`)
- [ ] Dependencies бүгд суусан (`npm list pizzip docxtemplater`)
- [ ] Test амжилттай (`npx tsx scripts/test-contract-generation.ts`)
- [ ] Git commit хийгдсэн
- [ ] `.gitignore`-д temporary файлууд орсон

## 🌐 Vercel Deployment:

```bash
# Production deploy
vercel --prod
```

Эсвэл GitHub-тай холбосон бол:
```bash
git push origin main
# Auto-deploy хийгдэнэ
```

## ✅ Post-deployment:

1. Production URL дээр contract үүсгэх
2. Word файл татах
3. Файл нээгдэж байгаа эсэх, бүх data орсон эсэхийг шалгах

---

**Status:** ✅ Ready  
**Last Test:** Successful  
**Version:** 2.0.0 (Node.js)


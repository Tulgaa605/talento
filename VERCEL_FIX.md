# ⚠️ Vercel 500 Error - Шалтгаан ба шийдэл

## 🔍 Магадгүй шалтгаанууд

### 1. Template файл production-д байхгүй

Vercel build процессын үед `public/` folder бүгд static assets-д хуулагдах ёстой.

**Шалгах:**
- Vercel dashboard → Deployments → Latest → Build logs
- "Copying files..." хэсэгт template.docx харагдаж байгаа эсэх

**Шийдэл:**
`.vercelignore` файл шалгах, template файлыг ignore хийгээгүй эсэхийг

### 2. File system write permissions

Vercel serverless functions нь `/tmp` folder-руу л бичиж чадна.

**Асуудал:**
```typescript
const outputPath = join(outputDir, outputFileName);
// outputDir нь public/uploads/contracts
```

**Шийдэл:** `/tmp` folder ашиглах

### 3. Import path production-д ажиллахгүй

`@/utils/generateContractWord` import нь production-д resolve хийгдэхгүй байж магадгүй.

**Шийдэл:** Relative import ашиглах

## 🔧 Засах

Би одоо эдгээр асуудлыг засна!


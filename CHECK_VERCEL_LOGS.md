# 🔍 Vercel Logs Шалгах Заавар

## Vercel Dashboard дээр logs харах:

### 1. Vercel.com-д нэвтрэх
https://vercel.com

### 2. Project сонгох
Та deploy хийсэн project-оо сонгох

### 3. Deployments tab руу очих
Latest deployment дарах

### 4. Functions tab руу очих
Эсвэл "View Function Logs"

### 5. Word generation endpoint-ийг хайх
```
/api/hr/contracts/[id]/generate-word
```

### 6. Logs харах

Дараах мэдээлэл харагдах ёстой:
```
Starting Word generation...
Environment: Vercel
Template path: /var/task/public/templates/contracts/template.docx
Template exists: true/false  <-- ЭНЭ ЧУХАЛ!
Output path: /tmp/contract_...docx
```

## 🐛 Common Vercel Issues:

### Issue 1: Template файл байхгүй

**Log:**
```
Template exists: false
Error: Template файл олдсонгүй
```

**Шийдэл:**
- Template файл git-д байгаа эсэхийг шалгах
- `.gitignore` дээр ignore хийгээгүй эсэхийг шалгах
- Deploy дахин хийх

### Issue 2: Module not found

**Log:**
```
Error: Cannot find module '@/utils/generateContractWord'
```

**Шийдэл:**
- `tsconfig.json` paths зөв эсэхийг шалгах
- Build дахин хийх

### Issue 3: File system write error

**Log:**
```
Error: EACCES: permission denied
```

**Шийдэл:**
- Би /tmp folder ашиглахаар өөрчилсөн
- Энэ асуудал гарахгүй байх ёстой

### Issue 4: Memory limit

**Log:**
```
Error: JavaScript heap out of memory
```

**Шийдэл:**
- Vercel function memory limit-ийг нэмэгдүүлэх
- Project Settings → Functions → Memory

## 📋 Logs-ийг надад хэл:

Vercel logs дээр ямар error харагдаж байгааг copy-paste хийгээд надад илгээгээрэй!

Дараах мэдээллүүд хэрэгтэй:
- `Template exists: true/false`
- `Starting Word generation...`
- Error message
- Stack trace (хэрэв байвал)

---

**Vercel CLI ашиглан logs харах:**
```bash
vercel logs
```

Эсвэл dashboard дээр:
https://vercel.com/[your-username]/[your-project]/deployments


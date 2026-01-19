# Database Index засах заавар

## Асуудал
MongoDB-д хуучин unique index байгаа тул код хуваалцах боломжгүй байна.

## Шийдэл

### 1. MongoDB Compass ашиглах (Хамгийн хялбар)

1. MongoDB Compass нээх
2. Database сонгох
3. `Department` collection сонгох
4. "Indexes" tab дээр очих
5. `code_1` гэсэн index олох
6. Тэр index-ийг устгах (Delete)

### 2. MongoDB Shell ашиглах

```javascript
// MongoDB shell дотор:
use your_database_name

// Department collection-ийн index-үүдийг харах
db.Department.getIndexes()

// Хуучин code unique index устгах
db.Department.dropIndex("code_1")

// Employee collection-ийн хуучин index устгах (хэрэв байвал)
db.Employee.dropIndex("employeeId_1")

// Position collection-ийн хуучин index устгах (хэрэв байвал)
db.Position.dropIndex("code_1")
```

### 3. Prisma Studio ашиглах

Prisma Studio нь index-үүдийг шууд засах боломжгүй, гэхдээ өгөгдлийг харах боломжтой.

## Шалгах

Index-үүдийг устгасны дараа:

1. Prisma client дахин generate хийх:
   ```bash
   npx prisma generate
   ```

2. Application restart хийх

3. Өөр компаниуд ижил кодыг ашиглаж турших

## Анхаарах зүйлс

- Index устгахаас өмнө backup хийх
- Production database дээр болгоомжтой байх
- Composite unique index (`code_companyId`) зөв байгаа эсэхийг шалгах


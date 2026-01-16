# Employer Files Overview - Тус тусад нь ангилсан

Энэхүү баримт бичигт employer-тай холбоотой бүх файлуудыг тус тусад нь ангилж харуулсан.

## 📂 FILE TREE STRUCTURE (Файлын мод бүтэц)

```
src/
├── app/
│   ├── employer/
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   ├── profile/page.tsx
│   │   ├── post-job/page.tsx
│   │   ├── jobs/
│   │   │   └── edit/[id]/page.tsx
│   │   ├── applications/
│   │   │   ├── page.tsx
│   │   │   └── [jobId]/
│   │   │       ├── page.tsx
│   │   │       ├── CvDownloadButton.tsx
│   │   │       └── QuestionnaireDropdown.tsx
│   │   ├── questionnaires/
│   │   │   ├── page.tsx
│   │   │   └── responses/page.tsx
│   │   └── hr/
│   │       ├── layout.tsx
│   │       ├── page.tsx
│   │       ├── employees/
│   │       │   ├── page.tsx
│   │       │   ├── new/page.tsx
│   │       │   └── [id]/
│   │       │       ├── page.tsx
│   │       │       └── edit/page.tsx
│   │       ├── departments/page.tsx
│   │       ├── positions/
│   │       │   ├── page.tsx
│   │       │   ├── new/page.tsx
│   │       │   └── [id]/
│   │       │       ├── page.tsx
│   │       │       └── edit/page.tsx
│   │       ├── contracts/page.tsx
│   │       ├── decisions/page.tsx
│   │       ├── training/page.tsx
│   │       ├── performance/page.tsx
│   │       ├── rewards-penalties/page.tsx
│   │       ├── reports/page.tsx
│   │       └── recruitment/page.tsx
│   └── api/
│       ├── employer/
│       │   ├── applications/
│       │   │   ├── route.ts
│       │   │   ├── new-count/route.ts
│       │   │   ├── mark-viewed/route.ts
│       │   │   └── [id]/
│       │   │       ├── route.ts
│       │   │       ├── approve/route.ts
│       │   │       ├── reject/route.ts
│       │   │       ├── status/route.ts
│       │   │       ├── send-questionnaire/route.ts
│       │   │       └── send-government-questionnaire/route.ts
│       │   ├── company/
│       │   │   ├── route.ts
│       │   │   └── update/route.ts
│       │   ├── jobs/
│       │   │   ├── route.ts
│       │   │   └── [id]/
│       │   │       ├── route.ts
│       │   │       └── edit/route.ts
│       │   ├── cvs/
│       │   │   ├── route.ts
│       │   │   └── [id]/
│       │   │       ├── approve/route.ts
│       │   │       └── reject/route.ts
│       │   ├── questionnaires/
│       │   │   ├── route.ts
│       │   │   ├── send/route.ts
│       │   │   ├── upload-attachment/route.ts
│       │   │   ├── [id]/
│       │   │   │   ├── responses/route.ts
│       │   │   │   └── download-template/
│       │   │   └── responses/[id]/
│       │   │       ├── approve/route.ts
│       │   │       └── download-attachment/
│       │   ├── new-applications/route.ts
│       │   └── upload-logo/route.ts
│       └── hr/
│           ├── users/
│           │   ├── route.ts
│           │   └── [id]/route.ts
│           ├── employees/
│           │   ├── route.ts
│           │   └── [id]/route.ts
│           ├── departments/
│           │   ├── route.ts
│           │   └── [id]/route.ts
│           ├── positions/
│           │   ├── route.ts
│           │   └── [id]/route.ts
│           ├── contracts/
│           │   ├── route.ts
│           │   └── [id]/
│           │       ├── route.ts
│           │       └── generate-word/route.ts
│           ├── decisions/
│           │   ├── route.ts
│           │   └── [id]/route.ts
│           ├── training/
│           │   ├── route.ts
│           │   ├── [id]/route.ts
│           │   └── participants/route.ts
│           ├── performance/
│           │   └── evaluations/route.ts
│           ├── rewards/route.ts
│           ├── penalties/route.ts
│           ├── reports/
│           │   ├── route.ts
│           │   ├── statistics/route.ts
│           │   ├── download/route.ts
│           │   └── [id]/download-word/route.ts
│           ├── recruitment/route.ts
│           ├── job-classifications/route.ts
│           └── occupations/route.ts
├── components/
│   ├── GlobalSidebar.tsx
│   ├── ContractModal.tsx
│   ├── QuestionnaireResponseView.tsx
│   └── QuestionnaireResponseButton.tsx
└── middleware.ts
```

## 📁 1. FRONTEND PAGES (Хуудаснууд)

### 1.1. Authentication (Нэвтрэх/Бүртгүүлэх)
```
src/app/employer/login/page.tsx          - Employer нэвтрэх хуудас
src/app/employer/register/page.tsx       - Employer бүртгүүлэх хуудас
```

### 1.2. Profile & Company (Профайл ба Компани)
```
src/app/employer/profile/page.tsx        - Employer профайл хуудас
```

### 1.3. Jobs (Ажлын байр)
```
src/app/employer/post-job/page.tsx       - Ажлын байр зарлах хуудас
src/app/employer/jobs/edit/[id]/page.tsx - Ажлын байр засах хуудас
```

### 1.4. Applications (Анкет)
```
src/app/employer/applications/page.tsx                    - Анкетын жагсаалт
src/app/employer/applications/[jobId]/page.tsx           - Тодорхой ажлын байрны анкетууд
src/app/employer/applications/[jobId]/CvDownloadButton.tsx - CV татах товч
src/app/employer/applications/[jobId]/QuestionnaireDropdown.tsx - Асуулга dropdown
```

### 1.5. Questionnaires (Асуулга)
```
src/app/employer/questionnaires/page.tsx           - Асуулгын жагсаалт
src/app/employer/questionnaires/responses/page.tsx - Асуулгын хариу
```

### 1.6. HR System (HR Систем)

#### 1.6.1. HR Dashboard
```
src/app/employer/hr/layout.tsx - HR layout
src/app/employer/hr/page.tsx  - HR dashboard (үндсэн хуудас)
```

#### 1.6.2. Employees (Ажилтнууд)
```
src/app/employer/hr/employees/page.tsx              - Ажилтны жагсаалт
src/app/employer/hr/employees/new/page.tsx         - Шинэ ажилтны бүртгэл
src/app/employer/hr/employees/[id]/page.tsx        - Ажилтны дэлгэрэнгүй
src/app/employer/hr/employees/[id]/edit/page.tsx   - Ажилтны мэдээлэл засах
```

#### 1.6.3. Departments (Хэлтэс)
```
src/app/employer/hr/departments/page.tsx - Хэлтсийн жагсаалт
```

#### 1.6.4. Positions (Албан тушаал)
```
src/app/employer/hr/positions/page.tsx              - Албан тушаалын жагсаалт
src/app/employer/hr/positions/new/page.tsx         - Шинэ албан тушаал
src/app/employer/hr/positions/[id]/page.tsx        - Албан тушаалын дэлгэрэнгүй
src/app/employer/hr/positions/[id]/edit/page.tsx   - Албан тушаал засах
```

#### 1.6.5. Contracts (Гэрээ)
```
src/app/employer/hr/contracts/page.tsx - Гэрээний жагсаалт
```

#### 1.6.6. Decisions (Шийдвэр)
```
src/app/employer/hr/decisions/page.tsx - Удирдлагын шийдвэрийн жагсаалт
```

#### 1.6.7. Training (Сургалт)
```
src/app/employer/hr/training/page.tsx - Сургалтын бүртгэл
```

#### 1.6.8. Performance (Гүйцэтгэл)
```
src/app/employer/hr/performance/page.tsx - Ажлын гүйцэтгэлийн үнэлгээ
```

#### 1.6.9. Rewards & Penalties (Шагнал/Шийтгэл)
```
src/app/employer/hr/rewards-penalties/page.tsx - Шагнал, шийтгэлийн бүртгэл
```

#### 1.6.10. Reports (Тайлан)
```
src/app/employer/hr/reports/page.tsx - HR тайлан, статистик
```

#### 1.6.11. Recruitment (Ажилд авах)
```
src/app/employer/hr/recruitment/page.tsx - Ажилд авах үйл явц
```

---

## 📁 2. API ROUTES (Backend API)

### 2.1. Employer API Routes (`/api/employer/`)

#### 2.1.1. Applications (Анкет)
```
src/app/api/employer/applications/route.ts                    - Анкетын жагсаалт
src/app/api/employer/applications/new-count/route.ts          - Шинэ анкетын тоо
src/app/api/employer/applications/mark-viewed/route.ts        - Анкет харсан гэж тэмдэглэх
src/app/api/employer/applications/[id]/route.ts               - Тодорхой анкет
src/app/api/employer/applications/[id]/approve/route.ts       - Анкет зөвшөөрөх
src/app/api/employer/applications/[id]/reject/route.ts        - Анкет татгалзах
src/app/api/employer/applications/[id]/status/route.ts        - Анкетын төлөв өөрчлөх
src/app/api/employer/applications/[id]/send-questionnaire/route.ts - Асуулга илгээх
src/app/api/employer/applications/[id]/send-government-questionnaire/route.ts - Засгийн асуулга илгээх
```

#### 2.1.2. Company (Компани)
```
src/app/api/employer/company/route.ts         - Компанийн мэдээлэл
src/app/api/employer/company/update/route.ts - Компанийн мэдээлэл шинэчлэх
src/app/api/employer/upload-logo/route.ts    - Лого байршуулах
```

#### 2.1.3. Jobs (Ажлын байр)
```
src/app/api/employer/jobs/route.ts              - Ажлын байрны жагсаалт
src/app/api/employer/jobs/[id]/route.ts        - Тодорхой ажлын байр
src/app/api/employer/jobs/[id]/edit/route.ts   - Ажлын байр засах
```

#### 2.1.4. CVs (CV)
```
src/app/api/employer/cvs/route.ts              - CV жагсаалт
src/app/api/employer/cvs/[id]/approve/route.ts - CV зөвшөөрөх
src/app/api/employer/cvs/[id]/reject/route.ts  - CV татгалзах
```

#### 2.1.5. Questionnaires (Асуулга)
```
src/app/api/employer/questionnaires/route.ts                              - Асуулгын жагсаалт
src/app/api/employer/questionnaires/send/route.ts                         - Асуулга илгээх
src/app/api/employer/questionnaires/upload-attachment/route.ts            - Хавсралт байршуулах
src/app/api/employer/questionnaires/[id]/responses/route.ts              - Асуулгын хариу
src/app/api/employer/questionnaires/[id]/download-template/              - Template татах
src/app/api/employer/questionnaires/responses/[id]/approve/route.ts      - Хариу зөвшөөрөх
src/app/api/employer/questionnaires/responses/[id]/download-attachment/  - Хариуны хавсралт татах
```

#### 2.1.6. New Applications (Шинэ анкет)
```
src/app/api/employer/new-applications/route.ts - Шинэ анкетын мэдээлэл
```

### 2.2. HR API Routes (`/api/hr/`)

#### 2.2.1. Users (Хэрэглэгчид)
```
src/app/api/hr/users/route.ts         - Хэрэглэгчдийн жагсаалт
src/app/api/hr/users/[id]/route.ts    - Тодорхой хэрэглэгч
```

#### 2.2.2. Employees (Ажилтнууд)
```
src/app/api/hr/employees/route.ts         - Ажилтны жагсаалт
src/app/api/hr/employees/[id]/route.ts    - Тодорхой ажилтны мэдээлэл
```

#### 2.2.3. Departments (Хэлтэс)
```
src/app/api/hr/departments/route.ts         - Хэлтсийн жагсаалт
src/app/api/hr/departments/[id]/route.ts    - Тодорхой хэлтэс
```

#### 2.2.4. Positions (Албан тушаал)
```
src/app/api/hr/positions/route.ts         - Албан тушаалын жагсаалт
src/app/api/hr/positions/[id]/route.ts    - Тодорхой албан тушаал
```

#### 2.2.5. Contracts (Гэрээ)
```
src/app/api/hr/contracts/route.ts                    - Гэрээний жагсаалт
src/app/api/hr/contracts/[id]/route.ts               - Тодорхой гэрээ
src/app/api/hr/contracts/[id]/generate-word/route.ts - Гэрээ Word файл үүсгэх
```

#### 2.2.6. Decisions (Шийдвэр)
```
src/app/api/hr/decisions/route.ts         - Шийдвэрийн жагсаалт
src/app/api/hr/decisions/[id]/route.ts    - Тодорхой шийдвэр
```

#### 2.2.7. Training (Сургалт)
```
src/app/api/hr/training/route.ts                    - Сургалтын жагсаалт
src/app/api/hr/training/[id]/route.ts               - Тодорхой сургалт
src/app/api/hr/training/participants/route.ts        - Сургалтын оролцогч
```

#### 2.2.8. Performance (Гүйцэтгэл)
```
src/app/api/hr/performance/evaluations/route.ts - Гүйцэтгэлийн үнэлгээ
```

#### 2.2.9. Rewards & Penalties (Шагнал/Шийтгэл)
```
src/app/api/hr/rewards/route.ts    - Шагналын жагсаалт
src/app/api/hr/penalties/route.ts  - Шийтгэлийн жагсаалт
```

#### 2.2.10. Reports (Тайлан)
```
src/app/api/hr/reports/route.ts                    - Тайлангийн жагсаалт
src/app/api/hr/reports/statistics/route.ts         - Статистик
src/app/api/hr/reports/download/route.ts           - Тайлан татах
src/app/api/hr/reports/[id]/download-word/route.ts - Тайлан Word файл татах
```

#### 2.2.11. Recruitment (Ажилд авах)
```
src/app/api/hr/recruitment/route.ts - Ажилд авах үйл явцын мэдээлэл
```

#### 2.2.12. Job Classifications & Occupations
```
src/app/api/hr/job-classifications/route.ts - Ажлын ангилал
src/app/api/hr/occupations/route.ts         - Мэргэжил
```

---

## 📊 3. SUMMARY (Дүгнэлт)

### Frontend Pages: 29 файл
- Authentication: 2 файл
- Profile: 1 файл
- Jobs: 2 файл
- Applications: 4 файл
- Questionnaires: 2 файл
- HR System: 18 файл

### API Routes: 50+ файл
- Employer API: ~20 файл
- HR API: ~30 файл

### Нийт: ~80 файл employer-тай холбоотой

---

## 🔍 4. FUNCTIONALITY GROUPS (Функционал бүлгүүд)

### Group 1: Authentication & Profile
- Login/Register
- Profile management
- Company information

### Group 2: Job Management
- Post jobs
- Edit jobs
- View applications

### Group 3: Application Management
- View applications
- Approve/Reject applications
- Send questionnaires

### Group 4: HR Core
- Employees management
- Departments
- Positions
- Contracts

### Group 5: HR Advanced
- Training
- Performance evaluation
- Rewards & Penalties
- Reports
- Recruitment

### Group 6: Questionnaires
- Create questionnaires
- Send questionnaires
- View responses
- Approve responses

---

## 📁 6. COMPONENTS (Компонентууд)

### 6.1. Employer-Specific Components
```
src/components/GlobalSidebar.tsx              - HR системийн sidebar navigation
src/components/ContractModal.tsx              - Гэрээний modal (HR-д ашиглана)
src/components/QuestionnaireResponseView.tsx  - Асуулгын хариу харах компонент
src/components/QuestionnaireResponseButton.tsx - Асуулгын хариу товч
```

### 6.2. Shared Components (Employer-д ашигладаг)
```
src/components/GovernmentEmployeeQuestionnaire.tsx - Засгийн ажилтны асуулга (employer profile-д ашиглана)
src/components/Navigation.tsx                      - Navigation компонент
```

---

## 📁 7. MIDDLEWARE & CONFIGURATION

### 7.1. Middleware
```
middleware.ts - Route хамгаалалт
  - /employer/hr/* - EMPLOYER эсвэл ADMIN role шаардлагатай
  - /employer/* - EMPLOYER эсвэл ADMIN role шаардлагатай
  - Public routes: /employer/login, /employer/register
```

### 7.2. Navigation Configuration
```
src/components/GlobalSidebar.tsx - employerNavigation массив:
  - Нүүр (/)
  - Ажилтны мэдээллийн сан (/employer/hr/employees)
  - Хэлтэс (/employer/hr/departments)
  - Албан тушаал (/employer/hr/positions)
  - Гэрээ (/employer/hr/contracts)
  - Удирдлагын шийдвэр (/employer/hr/decisions)
```

---

## 📝 8. NOTES (Тэмдэглэл)

- Бүх HR хуудаснууд `/employer/hr/` замын дор байрлана
- Бүх HR API routes `/api/hr/` замын дор байрлана
- Employer-ийн бусад API routes `/api/employer/` замын дор байрлана
- Middleware нь `/employer/hr` болон `/employer` замыг хамгаална (EMPLOYER эсвэл ADMIN role шаардлагатай)
- GlobalSidebar компонент нь employer navigation-ийг харуулна
- Бүх employer хуудаснууд authentication шаардлагатай (login/register-ээс бусад)


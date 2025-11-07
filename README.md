# RSI E-Learning Platform

Platform e-learning dengan fitur gamification, forum diskusi, dan chat.

## Tech Stack

- **Frontend**: Next.js 14 (React + TypeScript)
- **Backend**: Express.js + Node.js (TypeScript)
- **Database**: MySQL
- **Authentication**: JWT

## Setup Project

### 1. Database Setup

1. Buat database MySQL dengan nama `rsi_elearning_db`

```bash
mysql -u root -p -e "CREATE DATABASE rsi_elearning_db;"
```

2. Generate password hash untuk admin user (opsional, jika ingin menggunakan default admin):

```bash
cd backend
npx ts-node src/utils/generatePasswordHash.ts admin123
```

3. Update hash di `database/schema.sql` (baris terakhir) dengan hash yang dihasilkan, atau hapus baris INSERT admin jika tidak diperlukan.

4. Jalankan script SQL dari file `database/schema.sql`:

```bash
mysql -u root -p rsi_elearning_db < database/schema.sql
```

### 2. Backend Setup

```bash
cd backend
npm install
```

File `.env` sudah dibuat dengan konfigurasi database Anda:

```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=hafiz1180
DB_NAME=rsi_elearning_db
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
```

**Catatan**: Jika perlu mengubah konfigurasi, edit file `backend/.env` secara manual.

Test koneksi database (opsional):

```bash
npm run test-db
```

Jalankan backend:

```bash
npm run dev
```

Backend akan berjalan di `http://localhost:5000`

**Jika koneksi berhasil**, Anda akan melihat: `Database connected successfully`

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Jalankan frontend:

```bash
npm run dev
```

Frontend akan berjalan di `http://localhost:3000`

## Testing Fase 1

### Test Backend Register API

Gunakan Postman/Insomnia atau curl:

```bash
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "pelajar"
}
```

### Test Frontend

1. Buka `http://localhost:3000/register`
2. Test form validation
3. Test registrasi pelajar dan mentor
4. Verifikasi redirect dan localStorage

## Project Structure

```
rsi-elearning/
├── backend/
│   ├── src/
│   │   ├── config/          # Database config, JWT config
│   │   ├── models/          # Sequelize models
│   │   ├── controllers/     # Route controllers
│   │   ├── services/        # Business logic layer
│   │   ├── middlewares/     # Auth, validation, error handling
│   │   ├── routes/          # API routes
│   │   ├── utils/           # Helper functions
│   │   └── server.ts        # Entry point
│   ├── package.json
│   └── tsconfig.json
│
└── frontend/
    ├── src/
    │   ├── app/             # Next.js app directory
    │   ├── components/      # Reusable components
    │   ├── lib/             # Utilities, API calls
    │   ├── hooks/           # Custom hooks
    │   ├── contexts/        # Context API for global state
    │   └── types/           # TypeScript types
    ├── public/              # Static assets
    ├── package.json
    └── tsconfig.json
```

## Fase 1: Setup Project & Registrasi ✅

- ✅ Backend Express.js setup
- ✅ Database models (User)
- ✅ Authentication service (Register)
- ✅ Frontend Next.js setup
- ✅ Register page dengan form validation
- ✅ Integration frontend-backend

## Fase 2: Login Implementation ✅

- ✅ Backend login API dengan validasi
- ✅ Frontend login page dengan form validation
- ✅ AuthContext untuk global state management
- ✅ Protected routes (dashboard)
- ✅ Waiting verification page untuk mentor
- ✅ Logout functionality
- ✅ Error handling dan toast notifications

## Fase 3: Dashboard & Protected Routes ✅

- ✅ Auth middleware (authenticate & authorize)
- ✅ Get current user API
- ✅ Dashboard stats APIs untuk semua roles
- ✅ Role-based authorization
- ✅ Dashboard pages untuk Pelajar, Mentor, dan Admin
- ✅ Navbar component dengan menu dinamis
- ✅ StatCard component
- ✅ ProtectedRoute component

## Fase 4: Course Management & Enrollment System ✅

- ✅ Course & Enrollment models
- ✅ Course CRUD untuk Mentor
- ✅ Course catalog dengan filter & search
- ✅ Enrollment system untuk Pelajar
- ✅ My courses page dengan progress tracking
- ✅ Course detail page
- ✅ CourseCard & CourseFilters components

## Next Steps

Fase berikutnya akan mencakup:
- Course detail & learning page
- Materials management
- Assignments & quizzes
- Forum discussion
- Dan fitur-fitur lainnya


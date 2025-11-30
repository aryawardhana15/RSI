# 🎓 Edutopia

> Platform e-learning modern dan komprehensif dengan fitur gamification, diskusi forum, chat real-time, dan sistem administrasi yang lengkap.

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![Express](https://img.shields.io/badge/Express-4.18-green)](https://expressjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-orange)](https://www.mysql.com/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

## 📋 Daftar Isi

- [Deskripsi](#-deskripsi)
- [Fitur Utama](#-fitur-utama)
- [Tech Stack](#-tech-stack)
- [Instalasi & Setup](#-instalasi--setup)
- [Struktur Proyek](#-struktur-proyek)
- [API Documentation](#-api-documentation)
- [Role & Permission](#-role--permission)
- [Gamification System](#-gamification-system)
- [Screenshots](#-screenshots)
- [Development](#-development)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Deskripsi

**Edutopia** adalah platform pembelajaran online yang dirancang untuk memfasilitasi proses belajar mengajar secara interaktif dan engaging. Platform ini menyediakan berbagai fitur canggih untuk pelajar, mentor, dan administrator dalam mengelola konten pembelajaran, berinteraksi melalui forum, berkomunikasi melalui chat, dan memotivasi pembelajaran melalui sistem gamification.

### Key Highlights

✨ **Gamification System** - Sistem XP, Level, Badges, dan Missions yang komprehensif  
💬 **Real-time Chat** - Komunikasi langsung antara pelajar dan mentor  
📚 **Course Management** - Manajemen kursus lengkap dengan materials, assignments, dan quizzes  
💭 **Forum Discussion** - Diskusi interaktif dengan like, reply, pin, dan lock features  
🛡️ **Admin Panel** - Sistem moderasi dan administrasi yang powerful  
📊 **Analytics Dashboard** - Dashboard statistik untuk semua role  
🎨 **Modern UI/UX** - Interface yang modern dan user-friendly

---

## 🚀 Fitur Utama

### 1. 🔐 Authentication & Authorization

#### User Registration
- Registrasi untuk **Pelajar** dan **Mentor**
- Validasi form dengan real-time feedback
- Mentor registration memerlukan CV, expertise, dan experience
- Auto-redirect ke waiting verification page untuk mentor pending

#### Login System
- Secure JWT-based authentication
- Role-based access control
- Auto-login dengan localStorage persistence
- Protected routes untuk semua halaman

#### User Management
- Profile management dengan foto profil
- Bio, expertise, dan experience untuk mentor
- Suspension system untuk moderasi
- Verification system untuk mentor

### 2. 📚 Course Management System

#### Untuk Mentor
- **Create Course** - Buat kursus dengan detail lengkap
  - Title, description, category, difficulty level
  - Thumbnail image, education level
  - Draft/Published status
- **Edit Course** - Update informasi kursus
- **Delete Course** - Hapus kursus yang tidak diperlukan
- **Course Statistics** - Lihat enrollment count, progress siswa
- **Materials Management** - Kelola materi pembelajaran
  - Create, edit, delete materials
  - Support video, text content, dan file attachments
  - Order management dengan drag & drop (order_index)
- **Assignments & Quizzes** - Buat dan kelola tugas/kuis
  - Assignment dengan deadline dan file submission
  - Quiz dengan multiple choice questions
  - Auto-grading untuk quiz
  - Manual grading untuk assignment
  - View all submissions
  - Provide feedback dan score

#### Untuk Pelajar
- **Browse Courses** - Lihat semua kursus yang tersedia
  - Filter by category, difficulty, education level
  - Search by title atau description
  - Sort by date, popularity
- **Course Detail** - Lihat detail lengkap kursus
  - Course information, mentor info
  - Materials preview
  - Assignments list
  - Forum discussions
- **Enrollment System** - Enroll ke kursus
  - One-click enrollment
  - Track enrollment status
  - Progress tracking
- **Learning Interface** - Halaman pembelajaran
  - Material viewer dengan video, text, files
  - Mark material as complete
  - Progress bar
  - Navigation between materials
  - Assignment submission
  - Quiz taking interface

### 3. 📖 Materials Management

#### Material Types
- **Video Materials** - YouTube/Vimeo video embedding
- **Text Materials** - Rich text content
- **File Materials** - PDF, documents, slides

#### Features
- Order management (order_index)
- Completion tracking
- Progress calculation
- XP rewards on completion

### 4. 📝 Assignments & Quizzes

#### Assignment Features
- **Create Assignment** - Mentor dapat membuat tugas
  - Title, description, deadline
  - Max score
  - File submission support
- **Submit Assignment** - Pelajar dapat submit tugas
  - Text answer atau file upload
  - Submission tracking
  - Deadline enforcement
- **Grade Assignment** - Mentor dapat memberikan nilai
  - Score input
  - Feedback text
  - Grade timestamp

#### Quiz Features
- **Create Quiz** - Mentor dapat membuat kuis
  - Multiple choice questions (a, b, c, d)
  - Multiple questions support
  - Auto-grading system
  - Immediate score calculation
- **Take Quiz** - Pelajar dapat mengerjakan kuis
  - Question display
  - Answer selection
  - Instant result
  - Score display
  - Perfect score detection (100)

### 5. 💭 Forum Discussion System

#### Forum Threads
- **Create Thread** - Buat diskusi baru
  - Title, content, tags
  - Course-specific forums
  - Rich text content
- **View Threads** - Lihat semua threads
  - Sort by latest, most liked, most replied
  - Filter by tags
  - Search functionality
  - Pinned threads display
- **Thread Management**
  - **Pin Thread** - Mentor dapat pin important threads
  - **Lock Thread** - Mentor dapat lock threads
  - **Delete Thread** - Owner, mentor, atau admin dapat delete
  - **Like Thread** - Like/unlike functionality

#### Forum Replies
- **Create Reply** - Reply ke thread
  - Rich text content
  - Nested replies support (future)
- **Like Reply** - Like/unlike replies
- **Delete Reply** - Owner, mentor, atau admin dapat delete

#### Forum Moderation
- **Report Content** - Report inappropriate content
  - Report forum threads
  - Report replies
  - Reason for reporting
- **Admin Moderation** - Admin dapat moderate reports
  - View pending reports
  - Delete reported content
  - Dismiss reports

### 6. 💬 Real-time Chat System

#### Chat Features
- **Initiate Chat** - Pelajar dapat memulai chat
  - Chat dengan mentor berdasarkan course
  - Chat langsung dengan mentor
  - Auto-create chat room
- **Send Messages** - Kirim pesan
  - Text messages
  - File attachments (future)
  - Message timestamp
- **Message Management**
  - Edit messages
  - Delete messages
  - Read/unread status
  - Unread count indicator
- **Chat List** - Lihat semua chat rooms
  - Recent chats
  - Unread message count
  - Last message preview

#### Chat Interface
- Real-time message display
- Message bubbles (sent/received)
- Timestamp display
- Read receipt (is_read)
- Chat history

### 7. 🎮 Gamification System

#### XP System
- **Earn XP** - Dapatkan XP dari berbagai aktivitas
  - Complete material: +10 XP
  - Submit assignment: +20 XP
  - Perfect quiz score: +30 XP
  - Forum post: +5 XP
  - Forum reply: +3 XP
  - Complete course: +100 XP
  - Complete mission: Varies
- **XP History** - Lihat riwayat XP
  - Transaction history
  - Reason for XP
  - Timestamp

#### Level System
- **10 Levels** - Sistem level yang progresif
  1. Pemula (0 XP)
  2. Pelajar Aktif (100 XP)
  3. Pelajar Berdedikasi (250 XP)
  4. Pelajar Berbakat (500 XP)
  5. Pelajar Ahli (1000 XP)
  6. Master Pelajar (2000 XP)
  7. Guru Muda (3500 XP)
  8. Guru Senior (5500 XP)
  9. Profesor (8000 XP)
  10. Legenda (12000 XP)
- **Level Progress** - Progress bar untuk next level
- **Level Up Notification** - Notifikasi saat naik level

#### Badges System
- **10 Default Badges**
  - First Steps - Complete first material
  - Quiz Master - Score 100 on quiz
  - Discussion Hero - 10 forum posts
  - Course Completer - Complete 1 course
  - Speed Learner - Complete 5 materials in one day
  - Week Warrior - Login 7 days streak
  - Social Butterfly - 50 likes on forum
  - Helping Hand - 20 forum replies
  - Top Scorer - Average 90+ on 5 assignments
  - Dedicated Learner - Enroll in 5 courses
- **Badge Collection** - Lihat semua badges
  - Earned badges
  - Locked badges
  - Badge requirements
  - Badge icons

#### Missions System
- **Mission Types**
  - **Daily Missions** - Reset setiap hari
    - Daily Login
    - Complete 3 Materials
    - Forum Participant
  - **Weekly Missions** - Reset setiap minggu
    - Weekly Learner
    - Weekly Socializer
    - Submit Assignment
  - **Achievement Missions** - One-time achievements
    - First Course
    - Master Student
    - Discussion Master
    - Perfect Score
- **Mission Progress** - Track progress setiap mission
- **Mission Rewards** - XP dan badge rewards
- **Mission Completion** - Auto-complete dan reward

#### Leaderboard
- **Global Leaderboard** - Ranking semua pelajar
  - Rank by total XP
  - Display level, badges, courses completed
  - Pagination support
- **User Rank** - Lihat rank sendiri
- **Leaderboard Filters** - Filter by level, badges

### 8. 🛡️ Admin Panel & Moderation

#### Dashboard Statistics
- **User Statistics**
  - Total Pelajar
  - Total Mentor (Verified & Pending)
  - Total Users
  - New Users (Last 30 days)
- **Course Statistics**
  - Total Courses
  - Published Courses
  - New Courses (Last 30 days)
- **Platform Statistics**
  - Total Enrollments
  - Total Forum Posts
  - Pending Reports

#### Mentor Verification
- **View Pending Mentors** - Lihat mentor yang menunggu verifikasi
  - Mentor details (name, email, CV, expertise, experience)
  - Registration date
- **Approve Mentor** - Approve mentor registration
  - One-click approval
  - Auto-notification to mentor
- **Reject Mentor** - Reject mentor registration
  - Reason for rejection
  - Auto-delete account
  - Notification to mentor

#### User Management
- **View All Users** - Lihat semua users
  - Filter by role (Pelajar, Mentor)
  - Search by name/email
  - Pagination
- **User Actions**
  - **Suspend/Unsuspend User** - Toggle user suspension
    - Reason for suspension
    - Auto-notification
  - **Delete User** - Hapus user dari sistem
    - Confirmation required
    - Cascade delete

#### Course Management
- **View All Courses** - Lihat semua courses
  - Filter by published/unpublished
  - Search by title/description
  - View enrollment count, materials count
  - Mentor information
- **Course Actions**
  - **Unpublish/Publish Course** - Toggle course status
    - Reason for action
    - Notification to mentor
  - **Delete Course** - Hapus course
    - Confirmation required
    - Notification to mentor

#### Report Moderation
- **View Pending Reports** - Lihat laporan yang menunggu
  - Reporter information
  - Reported content (forum/reply)
  - Reason for report
  - Content preview
- **Resolve Reports** - Proses laporan
  - **Delete Content** - Hapus konten yang dilaporkan
  - **Dismiss Report** - Tolak laporan
  - Reason for action

#### Admin Logs
- **Activity Logs** - Track semua aktivitas admin
  - Admin name
  - Action type
  - Target type & ID
  - Description
  - Timestamp
  - Pagination

### 9. 📊 Dashboard System

#### Pelajar Dashboard
- **Statistics Cards**
  - Total Enrolled Courses
  - Courses in Progress
  - Completed Courses
  - Total XP
  - Current Level
  - Total Badges
- **Recent Activity** - Aktivitas terbaru
- **Progress Charts** - Visualisasi progress
- **Quick Actions** - Link ke fitur utama

#### Mentor Dashboard
- **Statistics Cards**
  - Total Courses Created
  - Published Courses
  - Total Students
  - Total Enrollments
- **Course Management** - Quick access ke courses
- **Recent Students** - Students terbaru
- **Quick Actions** - Create course, view courses

#### Admin Dashboard
- **Platform Statistics** - Statistik platform
- **Quick Actions** - Link ke admin features
- **Pending Items** - Badge untuk pending items
  - Pending Mentors
  - Pending Reports

### 10. 🔔 Notification System

#### Notification Types
- **Mentor Approved** - Notifikasi saat mentor di-approve
- **Mentor Rejected** - Notifikasi saat mentor di-reject
- **Account Suspended** - Notifikasi saat account di-suspend
- **Course Unpublished** - Notifikasi saat course di-unpublish
- **Course Deleted** - Notifikasi saat course dihapus
- **Level Up** - Notifikasi saat naik level
- **Badge Earned** - Notifikasi saat dapat badge
- **Mission Completed** - Notifikasi saat mission selesai
- **Assignment Graded** - Notifikasi saat assignment dinilai
- **New Message** - Notifikasi saat ada pesan baru

#### Notification Features
- Real-time notifications
- Read/unread status
- Notification center (future)
- Email notifications (future)

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **HTTP Client**: Axios
- **Form Handling**: React Hook Form
- **Validation**: express-validator (backend)
- **UI Components**: Custom components dengan Tailwind
- **Icons**: Heroicons (SVG)

### Backend
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MySQL
- **ORM**: Sequelize
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcrypt
- **Validation**: express-validator
- **File Upload**: Multer (future)

### Database
- **RDBMS**: MySQL 8.0+
- **Migrations**: SQL scripts
- **Schema**: 20+ tables
- **Relationships**: Foreign keys dengan CASCADE

### Development Tools
- **Package Manager**: npm
- **Build Tool**: TypeScript Compiler
- **Dev Server**: nodemon (backend), Next.js dev server (frontend)
- **Code Quality**: ESLint (future), Prettier (future)

---

## 📦 Instalasi & Setup

### Prerequisites

- **Node.js** >= 18.0.0
- **MySQL** >= 8.0
- **npm** >= 9.0.0

### 1. Clone Repository

```bash
git clone https://github.com/aryawardhana15/RSI.git
cd RSI
```

### 2. Database Setup

#### 2.1 Create Database

```bash
mysql -u root -p -e "CREATE DATABASE rsi_elearning_db;"
```

#### 2.2 Generate Admin Password Hash (Optional)

```bash
cd backend
npx ts-node src/utils/generatePasswordHash.ts admin123
```

Copy hash yang dihasilkan.

#### 2.3 Update Schema SQL

Edit file `database/schema.sql` baris terakhir, ganti hash password admin dengan hash yang dihasilkan di step 2.2.

#### 2.4 Run Schema SQL

```bash
mysql -u root -p rsi_elearning_db < database/schema.sql
```

### 3. Backend Setup

#### 3.1 Install Dependencies

```bash
cd backend
npm install
```

#### 3.2 Configure Environment Variables

File `.env` sudah dibuat dengan konfigurasi default. Edit jika diperlukan:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=rsi_elearning_db
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
```

#### 3.3 Test Database Connection

```bash
npm run test-db
```

Jika berhasil, Anda akan melihat: `Database connected successfully`

#### 3.4 Run Backend Server

```bash
npm run dev
```

Backend akan berjalan di `http://localhost:5000`

### 4. Frontend Setup

#### 4.1 Install Dependencies

```bash
cd frontend
npm install
```

#### 4.2 Configure API Endpoint

File `frontend/src/lib/api.ts` sudah dikonfigurasi untuk menggunakan `http://localhost:5000`. Edit jika diperlukan.

#### 4.3 Run Frontend Server

```bash
npm run dev
```

Frontend akan berjalan di `http://localhost:3000`

### 5. Verify Installation

1. Buka browser dan akses `http://localhost:3000`
2. Klik "Daftar" untuk membuat akun baru
3. Login dengan akun yang dibuat
4. Verifikasi dashboard dan fitur-fitur utama

---

## 📁 Struktur Proyek

```
rsi-elearning/
├── backend/                          # Backend Express.js application
│   ├── src/
│   │   ├── config/                   # Configuration files
│   │   │   └── database.ts          # Database connection config
│   │   ├── models/                   # Sequelize models
│   │   │   ├── User.ts              # User model
│   │   │   ├── Course.ts            # Course model
│   │   │   ├── Material.ts          # Material model
│   │   │   ├── Assignment.ts        # Assignment model
│   │   │   ├── Forum.ts             # Forum model
│   │   │   ├── Chat.ts              # Chat model
│   │   │   └── ...                  # Other models
│   │   ├── controllers/              # Route controllers
│   │   │   ├── authController.ts    # Auth endpoints
│   │   │   ├── courseController.ts  # Course endpoints
│   │   │   ├── materialController.ts # Material endpoints
│   │   │   ├── assignmentController.ts # Assignment endpoints
│   │   │   ├── forumController.ts   # Forum endpoints
│   │   │   ├── chatController.ts    # Chat endpoints
│   │   │   ├── adminController.ts   # Admin endpoints
│   │   │   └── gamificationController.ts # Gamification endpoints
│   │   ├── services/                 # Business logic layer
│   │   │   ├── authService.ts       # Auth business logic
│   │   │   ├── courseService.ts     # Course business logic
│   │   │   ├── materialService.ts   # Material business logic
│   │   │   ├── assignmentService.ts # Assignment business logic
│   │   │   ├── forumService.ts      # Forum business logic
│   │   │   ├── chatService.ts       # Chat business logic
│   │   │   ├── adminService.ts      # Admin business logic
│   │   │   └── gamificationService.ts # Gamification business logic
│   │   ├── routes/                   # API routes
│   │   │   ├── authRoutes.ts        # Auth routes
│   │   │   ├── courseRoutes.ts      # Course routes
│   │   │   ├── materialRoutes.ts    # Material routes
│   │   │   ├── assignmentRoutes.ts  # Assignment routes
│   │   │   ├── forumRoutes.ts       # Forum routes
│   │   │   ├── chatRoutes.ts        # Chat routes
│   │   │   ├── adminRoutes.ts       # Admin routes
│   │   │   └── gamificationRoutes.ts # Gamification routes
│   │   ├── middlewares/              # Express middlewares
│   │   │   └── authMiddleware.ts    # Authentication & authorization
│   │   ├── utils/                    # Utility functions
│   │   │   ├── jwt.ts               # JWT utilities
│   │   │   ├── generatePasswordHash.ts # Password hashing
│   │   │   └── createAdmin.ts       # Admin creation utility
│   │   └── server.ts                # Express server entry point
│   ├── migrations/                    # Database migrations
│   │   ├── 001_make_chat_course_id_nullable.sql
│   │   └── 002_create_admin_logs.sql
│   ├── package.json
│   ├── tsconfig.json
│   └── .env                          # Environment variables
│
├── frontend/                          # Frontend Next.js application
│   ├── src/
│   │   ├── app/                      # Next.js app directory
│   │   │   ├── admin/                # Admin pages
│   │   │   │   ├── dashboard/       # Admin dashboard
│   │   │   │   ├── mentors/         # Mentor verification
│   │   │   │   ├── users/           # User management
│   │   │   │   ├── courses/         # Course management
│   │   │   │   ├── reports/         # Report moderation
│   │   │   │   └── logs/            # Admin logs
│   │   │   ├── mentor/               # Mentor pages
│   │   │   │   ├── dashboard/       # Mentor dashboard
│   │   │   │   ├── courses/         # Course management
│   │   │   │   │   ├── create/      # Create course
│   │   │   │   │   ├── [id]/        # Course detail
│   │   │   │   │   │   ├── edit/    # Edit course
│   │   │   │   │   │   ├── materials/ # Materials management
│   │   │   │   │   │   └── assignments/ # Assignments management
│   │   │   │   └── chat/            # Mentor chat
│   │   │   ├── courses/              # Course pages (Pelajar)
│   │   │   │   ├── page.tsx         # Course catalog
│   │   │   │   └── [id]/            # Course detail
│   │   │   │       ├── page.tsx     # Course info
│   │   │   │       ├── learn/       # Learning interface
│   │   │   │       ├── forum/       # Forum discussions
│   │   │   │       └── assignments/ # Assignments & quizzes
│   │   │   ├── gamification/         # Gamification pages
│   │   │   │   ├── stats/           # User stats
│   │   │   │   ├── leaderboard/     # Leaderboard
│   │   │   │   ├── badges/          # Badge collection
│   │   │   │   ├── missions/        # Missions
│   │   │   │   └── xp-history/      # XP history
│   │   │   ├── chat/                 # Chat pages
│   │   │   │   ├── mentors/         # Mentor list
│   │   │   │   └── [id]/            # Chat room
│   │   │   ├── dashboard/            # Dashboard pages
│   │   │   ├── my-courses/           # My courses page
│   │   │   ├── login/                # Login page
│   │   │   ├── register/             # Register page
│   │   │   └── waiting-verification/ # Waiting verification page
│   │   ├── components/               # Reusable components
│   │   │   ├── Navbar.tsx           # Navigation bar
│   │   │   ├── ProtectedRoute.tsx   # Route protection
│   │   │   ├── CourseCard.tsx       # Course card component
│   │   │   ├── CourseFilters.tsx    # Course filters
│   │   │   ├── StatCard.tsx         # Statistics card
│   │   │   ├── XPBar.tsx            # XP progress bar
│   │   │   ├── BadgeCard.tsx        # Badge card
│   │   │   ├── MissionCard.tsx      # Mission card
│   │   │   ├── ChatBubble.tsx       # Chat message bubble
│   │   │   └── ChatButton.tsx       # Chat button
│   │   ├── contexts/                 # React contexts
│   │   │   └── AuthContext.tsx      # Authentication context
│   │   ├── lib/                      # Utilities
│   │   │   └── api.ts               # Axios API client
│   │   ├── types/                    # TypeScript types
│   │   │   ├── auth.ts              # Auth types
│   │   │   ├── course.ts            # Course types
│   │   │   ├── material.ts          # Material types
│   │   │   ├── assignment.ts        # Assignment types
│   │   │   ├── forum.ts             # Forum types
│   │   │   ├── chat.ts              # Chat types
│   │   │   └── gamification.ts      # Gamification types
│   │   └── globals.css               # Global styles
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.ts
│   └── next.config.js
│
├── database/                          # Database files
│   └── schema.sql                    # Database schema
│
└── README.md                          # This file
```

---

## 📡 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication
Semua endpoint yang memerlukan authentication menggunakan JWT token dalam header:
```
Authorization: Bearer <token>
```

### API Endpoints

#### 🔐 Authentication (`/api/auth`)
- `POST /register` - Register new user
- `POST /login` - Login user
- `GET /me` - Get current user (Protected)
- `POST /logout` - Logout user (Protected)

#### 📚 Courses (`/api/courses`)
- `GET /` - Get all courses (Public)
- `GET /:id` - Get course by ID (Public)
- `POST /:id/enroll` - Enroll in course (Pelajar)
- `DELETE /:id/unenroll` - Unenroll from course (Pelajar)
- `GET /my/enrolled` - Get my enrolled courses (Pelajar)
- `GET /my/created` - Get my created courses (Mentor)
- `POST /` - Create course (Mentor)
- `PUT /:id` - Update course (Mentor)
- `DELETE /:id` - Delete course (Mentor)

#### 📖 Materials (`/api/materials`)
- `GET /course/:courseId` - Get materials by course (Enrolled users)
- `GET /:id` - Get material by ID (Enrolled users)
- `POST /` - Create material (Mentor)
- `PUT /:id` - Update material (Mentor)
- `DELETE /:id` - Delete material (Mentor)
- `POST /:id/complete` - Mark material as complete (Pelajar)

#### 📝 Assignments (`/api/assignments`)
- `GET /course/:courseId` - Get assignments by course (Enrolled users)
- `GET /:id` - Get assignment by ID (Enrolled users)
- `POST /` - Create assignment (Mentor)
- `PUT /:id` - Update assignment (Mentor)
- `DELETE /:id` - Delete assignment (Mentor)
- `POST /:id/submit` - Submit assignment (Pelajar)
- `POST /:id/submit-quiz` - Submit quiz (Pelajar)
- `GET /:id/submissions` - Get submissions (Mentor)
- `POST /submissions/:id/grade` - Grade submission (Mentor)

#### 💭 Forum (`/api/forums`)
- `GET /search` - Search forums (Authenticated)
- `GET /course/:courseId` - Get forums by course (Enrolled users)
- `GET /:id` - Get forum by ID (Enrolled users)
- `POST /course/:courseId` - Create forum thread (Enrolled users)
- `POST /:id/replies` - Create reply (Enrolled users)
- `POST /:id/like` - Like/unlike forum (Enrolled users)
- `POST /replies/:id/like` - Like/unlike reply (Enrolled users)
- `PUT /:id/pin` - Pin thread (Mentor)
- `PUT /:id/lock` - Lock thread (Mentor)
- `POST /report` - Report content (Enrolled users)
- `DELETE /:id` - Delete forum thread (Owner/Mentor/Admin)
- `DELETE /replies/:id` - Delete reply (Owner/Mentor/Admin)

#### 💬 Chat (`/api/chat`)
- `GET /` - Get all chat rooms (Authenticated)
- `GET /unread-count` - Get total unread count (Authenticated)
- `GET /course/:courseId` - Get chat by course (Authenticated)
- `POST /` - Initiate chat (Pelajar)
- `GET /:chatId/messages` - Get messages (Authenticated)
- `POST /:chatId/messages` - Send message (Authenticated)
- `PUT /:chatId/read` - Mark messages as read (Authenticated)
- `PUT /messages/:messageId` - Update message (Authenticated)
- `DELETE /messages/:messageId` - Delete message (Authenticated)

#### 🎮 Gamification (`/api/gamification`)
- `GET /stats` - Get user stats (Pelajar)
- `GET /leaderboard` - Get leaderboard (Authenticated)
- `GET /badges` - Get all badges (Pelajar)
- `GET /missions` - Get user missions (Pelajar)
- `GET /xp-history` - Get XP history (Pelajar)

#### 🛡️ Admin (`/api/admin`)
- `GET /stats` - Get dashboard stats (Admin)
- `GET /mentors/pending` - Get pending mentors (Admin)
- `POST /mentors/:id/verify` - Verify mentor (Admin)
- `POST /mentors/:id/reject` - Reject mentor (Admin)
- `GET /users` - Get all users (Admin)
- `POST /users/:id/suspend` - Suspend/unsuspend user (Admin)
- `DELETE /users/:id` - Delete user (Admin)
- `GET /courses` - Get all courses (Admin)
- `PUT /courses/:id/unpublish` - Unpublish/publish course (Admin)
- `DELETE /courses/:id` - Delete course (Admin)
- `GET /reports` - Get pending reports (Admin)
- `POST /reports/:id/resolve` - Resolve report (Admin)
- `GET /logs` - Get admin logs (Admin)

---

## 👥 Role & Permission

### Pelajar (Student)
- ✅ Browse dan enroll courses
- ✅ Access enrolled courses
- ✅ Complete materials
- ✅ Submit assignments & quizzes
- ✅ Participate in forum discussions
- ✅ Chat with mentors
- ✅ View gamification stats
- ✅ View leaderboard
- ❌ Create courses
- ❌ Create materials
- ❌ Create assignments
- ❌ Grade submissions
- ❌ Moderate forums

### Mentor (Teacher)
- ✅ Create, edit, delete courses
- ✅ Create, edit, delete materials
- ✅ Create, edit, delete assignments
- ✅ Grade submissions
- ✅ Pin/lock forum threads
- ✅ View chat from students
- ✅ View course statistics
- ✅ Delete forum content (own course)
- ❌ Enroll in courses
- ❌ Access gamification features
- ❌ Moderate platform-wide

### Admin (Administrator)
- ✅ Full platform access
- ✅ Verify/reject mentors
- ✅ Manage users (suspend, delete)
- ✅ Manage courses (unpublish, delete)
- ✅ Moderate reports
- ✅ View admin logs
- ✅ View platform statistics
- ❌ Create courses (as mentor)
- ❌ Enroll in courses

---

## 🎮 Gamification System

### XP Rewards

| Activity | XP Reward |
|----------|-----------|
| Complete Material | +10 XP |
| Submit Assignment | +20 XP |
| Perfect Quiz Score (100) | +30 XP |
| Forum Post | +5 XP |
| Forum Reply | +3 XP |
| Complete Course | +100 XP |
| Complete Mission | Varies |

### Level System

| Level | Name | XP Required |
|-------|------|-------------|
| 1 | Pemula | 0 |
| 2 | Pelajar Aktif | 100 |
| 3 | Pelajar Berdedikasi | 250 |
| 4 | Pelajar Berbakat | 500 |
| 5 | Pelajar Ahli | 1,000 |
| 6 | Master Pelajar | 2,000 |
| 7 | Guru Muda | 3,500 |
| 8 | Guru Senior | 5,500 |
| 9 | Profesor | 8,000 |
| 10 | Legenda | 12,000 |

### Badges

1. **First Steps** - Complete first material
2. **Quiz Master** - Score 100 on quiz
3. **Discussion Hero** - 10 forum posts
4. **Course Completer** - Complete 1 course
5. **Speed Learner** - Complete 5 materials in one day
6. **Week Warrior** - Login 7 days streak
7. **Social Butterfly** - 50 likes on forum
8. **Helping Hand** - 20 forum replies
9. **Top Scorer** - Average 90+ on 5 assignments
10. **Dedicated Learner** - Enroll in 5 courses

### Missions

#### Daily Missions
- Daily Login (1 login, 5 XP)
- Complete 3 Materials (3 materials, 20 XP)
- Forum Participant (2 posts, 10 XP)

#### Weekly Missions
- Weekly Learner (10 materials, 50 XP)
- Weekly Socializer (5 posts, 30 XP)
- Submit Assignment (2 assignments, 40 XP)

#### Achievement Missions
- First Course (1 course, 100 XP, Badge: Course Completer)
- Master Student (5 courses, 500 XP, Badge: Dedicated Learner)
- Discussion Master (50 posts, 200 XP, Badge: Discussion Hero)
- Perfect Score (1 perfect quiz, 50 XP, Badge: Quiz Master)

---

## 🖼️ Screenshots

### Dashboard
- Pelajar Dashboard dengan statistik dan progress
- Mentor Dashboard dengan course management
- Admin Dashboard dengan platform statistics

### Course Management
- Course catalog dengan filters
- Course detail page
- Learning interface
- Materials management
- Assignments & quizzes

### Forum & Chat
- Forum discussions
- Chat interface
- Real-time messaging

### Gamification
- XP progress bar
- Badge collection
- Missions page
- Leaderboard

### Admin Panel
- Mentor verification
- User management
- Course management
- Report moderation
- Admin logs

---

## 💻 Development

### Backend Development

```bash
cd backend
npm run dev          # Run development server with nodemon
npm run build        # Build for production
npm run start        # Run production server
npm run test-db      # Test database connection
```

### Frontend Development

```bash
cd frontend
npm run dev          # Run development server
npm run build        # Build for production
npm run start        # Run production server
npm run lint         # Run ESLint (if configured)
```

### Database Migrations

```bash
# Run migration
mysql -u root -p rsi_elearning_db < backend/migrations/002_create_admin_logs.sql
```

### Code Structure

- **Controllers** - Handle HTTP requests/responses
- **Services** - Business logic layer
- **Models** - Database models (Sequelize)
- **Routes** - API route definitions
- **Middlewares** - Authentication, authorization, validation
- **Utils** - Helper functions

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Use meaningful variable and function names
- Write comments for complex logic
- Follow existing code style
- Test your changes thoroughly
- Update documentation if needed

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author
**Kelompok 3**

**Muhammad Alhafiz Arya Wardhana**

- NIM: 245150407111038
- GitHub: [@aryawardhana15](https://github.com/aryawardhana15)
- Email: wardhanahafiz567@gmail.com
- Instagram: @Malhafizaryaw


**Maya Audina**

- NIM: 245150400111028
- Github: [@myaudn](https://github.com/myaudn)
- Email: mayaaudina040@gmail.com
- Instagram: @myawdina


**Ananda Tiara Pramitha**

- NIM: 245150401111013
- Github: [@AnandaTiara](https://github.com/AnandaTiara)
- Email: tiarakuliah123@student.ub.ac.id
- Instagram: @tiaradisini._


**Muhamad Afham Ali Subekti**

- NIM: 245150407111006
- Github: [@aafhaaam](https://github.com/aafhaaam)
- Email: muhamadafham@student.ub.ac.id
- Instagram: @aafhaaam

**Muhammad Zaki Al Hilmi**

- NIM: 245150407111025
- Github: [@ZakiiiAF](https://github.com/ZakiiiAF)
- Email: mzakialhilmi@student.ub.ac.id
- Instagram: @za_kiiiiiiiiii

---

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Express.js community for the robust backend framework
- MySQL for the reliable database
- All contributors and testers

---

## 📞 Support

Jika Anda memiliki pertanyaan atau memerlukan bantuan, silakan:

1. Buka [Issue](https://github.com/aryawardhana15/RSI/issues) di GitHub
2. Email: wardhanahafiz567@gmail.com
3. Buat [Pull Request](https://github.com/aryawardhana15/RSI/pulls) untuk kontribusi

---

## 🚀 Future Enhancements

### Planned Features
- [ ] Real-time notifications dengan WebSocket
- [ ] Email notifications
- [ ] File upload untuk materials dan assignments
- [ ] Video streaming integration
- [ ] Advanced search dengan filters
- [ ] Course ratings & reviews
- [ ] Certificate generation
- [ ] Payment integration
- [ ] Mobile app (React Native)
- [ ] Multi-language support
- [ ] Dark mode
- [ ] Advanced analytics
- [ ] Export reports (PDF, Excel)
- [ ] Social login (Google, Facebook)
- [ ] Two-factor authentication (2FA)

### Technical Improvements
- [ ] Unit tests (Jest)
- [ ] Integration tests
- [ ] E2E tests (Cypress)
- [ ] CI/CD pipeline
- [ ] Docker containerization
- [ ] Kubernetes deployment
- [ ] Performance optimization
- [ ] Caching strategy (Redis)
- [ ] Load balancing
- [ ] Monitoring & logging (Winston, Sentry)

---

**⭐ Jika project ini membantu Anda, jangan lupa untuk memberikan star di GitHub!**

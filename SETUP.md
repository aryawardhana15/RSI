# Quick Setup Guide

## Prerequisites
- Node.js (v18 atau lebih baru)
- MySQL (v8.0 atau lebih baru)
- npm atau yarn

## Langkah-langkah Setup

### 1. Clone/Download Project
Pastikan Anda sudah memiliki semua file project.

### 2. Setup Database

```bash
# Buat database
mysql -u root -p -e "CREATE DATABASE rsi_elearning_db;"

# Import schema
mysql -u root -p rsi_elearning_db < database/schema.sql
```

**Catatan**: Jika ingin menggunakan default admin user, generate password hash terlebih dahulu:
```bash
cd backend
npm install
npx ts-node src/utils/generatePasswordHash.ts admin123
# Copy hash yang dihasilkan dan update di database/schema.sql (baris terakhir)
```

### 3. Setup Backend

```bash
cd backend
npm install

# Buat file .env
cp .env.example .env
# Edit .env dan sesuaikan konfigurasi database Anda

# Jalankan backend
npm run dev
```

Backend akan berjalan di `http://localhost:5000`

### 4. Setup Frontend

```bash
cd frontend
npm install

# Jalankan frontend
npm run dev
```

Frontend akan berjalan di `http://localhost:3000`

## Testing

### Test Backend API

Gunakan Postman atau curl:

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "pelajar"
  }'
```

### Test Frontend

1. Buka browser: `http://localhost:3000`
2. Klik "Daftar" atau buka langsung `http://localhost:3000/register`
3. Test registrasi dengan role "Pelajar" dan "Mentor"
4. Verifikasi form validation bekerja
5. Setelah registrasi berhasil, cek localStorage untuk token dan user data

## Troubleshooting

### Database Connection Error
- Pastikan MySQL service berjalan
- Cek konfigurasi di `backend/.env` (DB_HOST, DB_USER, DB_PASSWORD, DB_NAME)
- Pastikan database `rsi_elearning_db` sudah dibuat

### Port Already in Use
- Backend: Ubah PORT di `backend/.env`
- Frontend: Ubah port dengan `npm run dev -- -p 3001`

### Module Not Found
- Pastikan sudah menjalankan `npm install` di folder backend dan frontend
- Hapus `node_modules` dan `package-lock.json`, lalu install ulang

## Next Steps

Setelah Phase 1 berhasil, lanjutkan ke fase berikutnya untuk menambahkan:
- Login functionality
- Dashboard yang lebih lengkap
- Course management
- Dan fitur-fitur lainnya


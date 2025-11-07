# Setup Admin User

## Masalah: 401 Unauthorized saat login sebagai admin

Kemungkinan penyebab:
1. Admin user belum ada di database
2. Password admin salah atau hash tidak valid
3. Email admin tidak sesuai

## Solusi: Buat Admin User

### Cara 1: Menggunakan Script (Recommended)

Jalankan script untuk membuat admin:

```bash
cd backend
npm run create-admin
```

Atau dengan custom email/password:

```bash
npm run create-admin admin@rsi.com admin123 Admin
```

**Default credentials:**
- Email: `admin@rsi.com`
- Password: `admin123`
- Name: `Admin`

### Cara 2: Manual di Database

1. Generate password hash untuk password yang diinginkan:

```bash
cd backend
npx ts-node src/utils/generatePasswordHash.ts yourpassword
```

2. Copy hash yang dihasilkan

3. Insert ke database:

```sql
INSERT INTO users (name, email, password, role, is_verified) 
VALUES ('Admin', 'admin@rsi.com', '<hash_dari_step_1>', 'admin', TRUE);
```

Atau update admin yang sudah ada:

```sql
UPDATE users 
SET password = '<hash_dari_step_1>' 
WHERE email = 'admin@rsi.com' AND role = 'admin';
```

### Cara 3: Update Password Admin yang Sudah Ada

Jika admin sudah ada tapi password salah:

1. Generate hash baru:

```bash
cd backend
npx ts-node src/utils/generatePasswordHash.ts newpassword123
```

2. Update di database:

```sql
UPDATE users 
SET password = '<hash_baru>' 
WHERE email = 'admin@rsi.com' AND role = 'admin';
```

## Test Login Admin

Setelah admin dibuat/updated, test login:

**Via Postman/Thunder Client:**
```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "admin@rsi.com",
  "password": "admin123"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Login berhasil",
  "data": {
    "user": {
      "id": 1,
      "name": "Admin",
      "email": "admin@rsi.com",
      "role": "admin",
      "is_verified": true
    },
    "token": "..."
  }
}
```

## Troubleshooting

### Error: "Email atau password salah"
- Pastikan admin user ada di database
- Pastikan password yang digunakan benar
- Cek hash password di database (harus valid bcrypt hash)

### Error: "User tidak ditemukan"
- Admin belum dibuat di database
- Email tidak sesuai
- Jalankan script `npm run create-admin`

### Error: "Akun Anda telah dinonaktifkan"
- Admin user memiliki `is_suspended = TRUE`
- Update di database: `UPDATE users SET is_suspended = FALSE WHERE email = 'admin@rsi.com';`

## Catatan Keamanan

⚠️ **PENTING**: Setelah login pertama kali sebagai admin, segera ganti password!

Untuk ganti password, bisa:
1. Buat fitur change password (akan dibuat di fase berikutnya)
2. Atau update manual di database dengan hash baru


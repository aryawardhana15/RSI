# Fase 2: Testing Guide - Login Implementation

## ✅ Yang Sudah Diimplementasikan

### Backend
- ✅ Login service di `authService.ts`
- ✅ Login controller di `authController.ts`
- ✅ Login route di `authRoutes.ts`
- ✅ Validasi email dan password
- ✅ Check suspended account
- ✅ Check mentor verification status

### Frontend
- ✅ AuthContext untuk global state management
- ✅ AuthProvider di layout.tsx
- ✅ Halaman login lengkap dengan form validation
- ✅ Update register page untuk menggunakan AuthContext
- ✅ Update waiting-verification page dengan AuthContext
- ✅ Update dashboard page dengan protected route

## 🧪 Testing Backend APIs

### 1. Test Register (Fase 1 - Pastikan masih berfungsi)

```bash
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "Test Pelajar",
  "email": "pelajar@test.com",
  "password": "password123",
  "role": "pelajar"
}
```

**Expected**: Response 201, ada token, user tersimpan di database

### 2. Test Login - Success

```bash
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "pelajar@test.com",
  "password": "password123"
}
```

**Expected**: 
- Response 200
- `success: true`
- `message: "Login berhasil"`
- `data.user` berisi user data
- `data.token` berisi JWT token

### 3. Test Login - Email Salah

```bash
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "tidakada@test.com",
  "password": "password123"
}
```

**Expected**: 
- Response 401
- `success: false`
- `message: "Email atau password salah"`

### 4. Test Login - Password Salah

```bash
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "pelajar@test.com",
  "password": "wrongpassword"
}
```

**Expected**: 
- Response 401
- `success: false`
- `message: "Email atau password salah"`

### 5. Test Register Mentor

```bash
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "Test Mentor",
  "email": "mentor@test.com",
  "password": "password123",
  "role": "mentor",
  "cv_url": "https://drive.google.com/test",
  "expertise": "JavaScript, React, Node.js",
  "experience": "5 tahun pengalaman sebagai developer"
}
```

**Expected**: 
- Response 201
- `data.user.is_verified: false`

### 6. Test Login Mentor - Belum Verified

```bash
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "mentor@test.com",
  "password": "password123"
}
```

**Expected**: 
- Response 401
- `success: false`
- `message: "Akun Anda masih menunggu verifikasi admin"`

### 7. Test Login - Validation Error (Email Invalid)

```bash
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "invalid-email",
  "password": "password123"
}
```

**Expected**: 
- Response 400
- `success: false`
- `message: "Validation error"`
- `errors` array berisi error validation

### 8. Test Login - Password Kosong

```bash
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "pelajar@test.com",
  "password": ""
}
```

**Expected**: 
- Response 400
- `success: false`
- `message: "Validation error"`

## 🧪 Testing Frontend

### 1. Test Register → Login Flow

1. Jalankan backend: `cd backend && npm run dev`
2. Jalankan frontend: `cd frontend && npm run dev`
3. Buka `http://localhost:3000/register`
4. Register sebagai Pelajar baru dengan email baru
5. ✅ **Verifikasi**: Redirect ke `/dashboard`, toast success muncul
6. Check localStorage (DevTools → Application → Local Storage)
7. ✅ **Verifikasi**: Ada `token` dan `user` tersimpan
8. Klik tombol Logout di dashboard
9. ✅ **Verifikasi**: Redirect ke `/login`, localStorage cleared
10. Login dengan credentials yang sama
11. ✅ **Verifikasi**: Redirect ke `/dashboard`, user data benar

### 2. Test Register Mentor

1. Buka `http://localhost:3000/register`
2. Pilih role "Mentor"
3. Isi semua field termasuk CV URL, expertise, experience
4. Submit form
5. ✅ **Verifikasi**: Redirect ke `/waiting-verification`
6. ✅ **Verifikasi**: Halaman menampilkan pesan "Menunggu Verifikasi"
7. Klik Logout
8. Coba login sebagai mentor yang belum verified
9. ✅ **Verifikasi**: Error toast "Akun Anda masih menunggu verifikasi admin"

### 3. Test Form Validations - Login Page

#### Email Invalid
- Input: "testtest.com" (tanpa @)
- ✅ **Expected**: Error "Email tidak valid"

#### Password Kosong
- Input email saja, password kosong
- ✅ **Expected**: Error "Password wajib diisi"

#### Credentials Salah
- Input email/password yang salah
- ✅ **Expected**: Toast error "Email atau password salah"

### 4. Test Protected Routes

1. Logout dari dashboard
2. Coba akses `http://localhost:3000/dashboard` langsung
3. ✅ **Verifikasi**: Redirect ke `/login` (karena tidak authenticated)

### 5. Test AuthContext

1. Login sebagai pelajar
2. Buka React DevTools (jika ada)
3. Cari AuthProvider component
4. ✅ **Verifikasi**: State `user` dan `token` terisi dengan benar
5. Klik Logout
6. ✅ **Verifikasi**: State `user` dan `token` menjadi null

### 6. Test Remember Me & Forgot Password Links

1. Buka halaman login
2. ✅ **Verifikasi**: Checkbox "Ingat saya" ada (UI only, belum diimplement)
3. ✅ **Verifikasi**: Link "Lupa password?" ada (UI only, belum diimplement)

## 🧪 Testing Database

### Cek users table

```sql
SELECT id, name, email, role, is_verified, is_suspended FROM users;
```

**Verifikasi**:
- ✅ Ada user pelajar dengan `is_verified = 1`
- ✅ Ada user mentor dengan `is_verified = 0`
- ✅ Password ter-hash (bukan plain text)

## ✅ Checklist Fase 2

- [ ] Backend register API berfungsi ✓
- [ ] Backend login API berfungsi ✓
- [ ] Frontend register page berfungsi ✓
- [ ] Frontend login page berfungsi ✓
- [ ] AuthContext berfungsi (user & token tersimpan global) ✓
- [ ] Redirect logic benar berdasarkan role ✓
- [ ] Waiting verification page berfungsi untuk mentor ✓
- [ ] Temporary dashboard page berfungsi ✓
- [ ] Form validations berfungsi ✓
- [ ] Error handling berfungsi (toast notifications) ✓
- [ ] Token tersimpan di localStorage ✓
- [ ] Logout functionality berfungsi ✓
- [ ] Protected routes berfungsi ✓
- [ ] Database menyimpan user dengan benar ✓

## 🔧 Troubleshooting

### Problem: CORS Error
**Solution**: Pastikan backend sudah pakai `app.use(cors())` di server.ts

### Problem: "Cannot use import statement outside a module"
**Solution**: Cek tsconfig.json, pastikan module: "commonjs"

### Problem: localStorage is not defined
**Solution**: useEffect untuk akses localStorage (sudah dihandle di AuthContext)

### Problem: Token tidak tersimpan
**Solution**: Cek AuthContext apakah sudah di-wrap di layout.tsx

### Problem: Redirect tidak berfungsi
**Solution**: Pastikan menggunakan `useRouter` dari 'next/navigation' (bukan 'next/router')

### Problem: Login selalu error "Email atau password salah"
**Solution**: 
- Pastikan user sudah terdaftar
- Cek password yang digunakan saat register
- Cek database apakah user tersimpan dengan benar

### Problem: Mentor bisa login padahal belum verified
**Solution**: Cek logic di `authService.ts` - pastikan ada check `if (user.role === 'mentor' && !user.is_verified)`

## 🚀 Next Steps

Setelah semua testing berhasil, siap untuk **Fase 3**:
- Dashboard lengkap untuk Pelajar, Mentor, dan Admin
- Protected routes dengan middleware
- Profile page
- Logout functionality yang proper


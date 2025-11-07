# Cara Menjalankan Backend Server

## Masalah: ERR_CONNECTION_REFUSED di localhost:5000

Jika Anda mendapat error `ERR_CONNECTION_REFUSED`, berarti backend server tidak berjalan.

## Langkah-langkah:

### 1. Pastikan Anda di folder backend
```bash
cd backend
```

### 2. Pastikan dependencies sudah terinstall
```bash
npm install
```

### 3. Pastikan file .env ada dan benar
File `.env` harus ada di folder `backend/` dengan isi:
```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=hafiz1180
DB_NAME=rsi_elearning_db
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
```

### 4. Test koneksi database dulu
```bash
npm run test-db
```

Jika berhasil, akan muncul:
```
✅ Koneksi database berhasil!
```

### 5. Jalankan backend server
```bash
npm run dev
```

**Expected output:**
```
[nodemon] starting `ts-node src/server.ts`
Database connected successfully
Server running on port 5000
```

### 6. Test di browser
Buka: `http://localhost:5000/api/health`

Harus muncul:
```json
{"status":"OK","message":"Server is running"}
```

## Troubleshooting

### Error: "Cannot find module"
- Jalankan: `npm install`

### Error: "Database connection failed"
- Pastikan MySQL berjalan
- Cek konfigurasi di `.env`
- Test dengan: `npm run test-db`

### Error: "Port 5000 already in use"
- Ubah PORT di `.env` ke port lain (misalnya 5001)
- Atau stop aplikasi lain yang menggunakan port 5000

### Error TypeScript compilation
- Pastikan semua file TypeScript tidak ada error
- Cek dengan: `npx tsc --noEmit`

## Catatan

- Backend harus berjalan di terminal terpisah
- Jangan close terminal saat backend berjalan
- Untuk stop backend, tekan `Ctrl+C` di terminal


# Panduan Koneksi Database

## ✅ Konfigurasi Database Anda

File `.env` sudah dibuat dengan konfigurasi berikut:

```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=hafiz1180
DB_NAME=rsi_elearning_db
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
```

## 🧪 Test Koneksi Database

### Cara 1: Menggunakan Script Test

```bash
cd backend
npm install  # Jika belum install dependencies
npm run test-db
```

### Cara 2: Menjalankan Server

```bash
cd backend
npm run dev
```

Jika koneksi berhasil, Anda akan melihat:
```
Database connected successfully
Server running on port 5000
```

## 🔧 Troubleshooting

### Error: "Access denied for user"
- Pastikan username dan password MySQL benar
- Pastikan user MySQL memiliki akses ke database `rsi_elearning_db`

### Error: "Unknown database 'rsi_elearning_db'"
- Pastikan database sudah dibuat di DBeaver
- Atau buat database dengan:
  ```sql
  CREATE DATABASE rsi_elearning_db;
  ```

### Error: "Can't connect to MySQL server"
- Pastikan MySQL service sedang berjalan
- Cek apakah DB_HOST benar (localhost atau IP server)

## 📝 Catatan

- Jika menggunakan DBeaver, pastikan koneksi MySQL berjalan di port default (3306)
- Jika MySQL berjalan di port lain, tambahkan di `.env`: `DB_PORT=3307` (contoh)
- Pastikan database `rsi_elearning_db` sudah memiliki semua tabel dari `database/schema.sql`

## 🚀 Langkah Selanjutnya

Setelah koneksi berhasil:
1. Pastikan semua tabel sudah ada di database
2. Jalankan backend: `npm run dev`
3. Test API register di Postman atau langsung dari frontend


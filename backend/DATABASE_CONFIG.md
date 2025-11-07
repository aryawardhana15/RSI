# Konfigurasi Database

## Setup File .env

Buat file `.env` di folder `backend/` dengan konfigurasi berikut:

```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=hafiz1180
DB_NAME=rsi_elearning_db
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
```

## Catatan

- **DB_HOST**: localhost (atau IP server MySQL jika berbeda)
- **DB_USER**: root (atau username MySQL Anda)
- **DB_PASSWORD**: hafiz1180 (password MySQL Anda)
- **DB_NAME**: rsi_elearning_db (nama database yang sudah dibuat)

## Test Koneksi

Setelah membuat file `.env`, test koneksi dengan menjalankan:

```bash
cd backend
npm run dev
```

Jika koneksi berhasil, Anda akan melihat pesan: "Database connected successfully"


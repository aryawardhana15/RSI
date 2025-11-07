/**
 * Script untuk test koneksi database
 * Jalankan dengan: node test-connection.js
 */

require('dotenv').config();
const mysql = require('mysql2/promise');

async function testConnection() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME || 'rsi_elearning_db'
    });

    console.log('✅ Koneksi database berhasil!');
    console.log(`📊 Database: ${process.env.DB_NAME}`);
    console.log(`👤 User: ${process.env.DB_USER}`);
    console.log(`🌐 Host: ${process.env.DB_HOST}`);
    
    // Test query
    const [rows] = await connection.execute('SELECT COUNT(*) as count FROM users');
    console.log(`📈 Total users: ${rows[0].count}`);
    
    await connection.end();
    console.log('\n✅ Test koneksi selesai!');
  } catch (error) {
    console.error('❌ Error koneksi database:');
    console.error('   Message:', error.message);
    console.error('\n💡 Pastikan:');
    console.error('   1. File .env sudah dibuat dengan konfigurasi yang benar');
    console.error('   2. MySQL service sedang berjalan');
    console.error('   3. Database rsi_elearning_db sudah dibuat');
    console.error('   4. Username dan password MySQL benar');
    process.exit(1);
  }
}

testConnection();


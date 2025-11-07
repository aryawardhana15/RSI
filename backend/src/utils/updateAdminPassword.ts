/**
 * Script untuk update password admin yang sudah ada
 * Jalankan dengan: npx ts-node src/utils/updateAdminPassword.ts
 */
import bcrypt from 'bcryptjs';
import User from '../models/User';
import sequelize from '../config/database';
import dotenv from 'dotenv';

dotenv.config();

async function updateAdminPassword() {
  try {
    await sequelize.authenticate();
    console.log('Database connected');

    const email = process.argv[2] || 'admin@rsi.com';
    const password = process.argv[3] || 'admin123';

    // Find admin user
    const admin = await User.findOne({ where: { email, role: 'admin' } });
    
    if (!admin) {
      console.log(`❌ Admin dengan email ${email} tidak ditemukan.`);
      console.log('Gunakan: npm run create-admin untuk membuat admin baru.');
      process.exit(1);
    }

    // Hash password baru
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update password
    await admin.update({ password: hashedPassword });

    console.log('✅ Password admin berhasil diupdate!');
    console.log(`Email: ${admin.email}`);
    console.log(`Password baru: ${password}`);
    console.log(`Hash: ${hashedPassword}`);
    console.log('\n⚠️  JANGAN LUPA GANTI PASSWORD SETELAH LOGIN PERTAMA KALI!');

    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

updateAdminPassword();


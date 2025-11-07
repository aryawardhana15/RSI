/**
 * Script untuk membuat admin user
 * Jalankan dengan: npx ts-node src/utils/createAdmin.ts
 */
import bcrypt from 'bcryptjs';
import User from '../models/User';
import sequelize from '../config/database';
import dotenv from 'dotenv';

dotenv.config();

async function createAdmin() {
  try {
    await sequelize.authenticate();
    console.log('Database connected');

    const email = process.argv[2] || 'admin@rsi.com';
    const password = process.argv[3] || 'admin123';
    const name = process.argv[4] || 'Admin';

    // Check if admin already exists
    const existingAdmin = await User.findOne({ where: { email } });
    if (existingAdmin) {
      console.log(`Admin dengan email ${email} sudah ada.`);
      console.log('Gunakan password yang sudah ada atau update password di database.');
      process.exit(0);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin user
    const admin = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'admin',
      is_verified: true
    });

    console.log('✅ Admin user berhasil dibuat!');
    console.log(`Email: ${admin.email}`);
    console.log(`Password: ${password}`);
    console.log(`Name: ${admin.name}`);
    console.log('\n⚠️  JANGAN LUPA GANTI PASSWORD SETELAH LOGIN PERTAMA KALI!');

    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createAdmin();


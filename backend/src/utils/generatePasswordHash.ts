/**
 * Utility script to generate bcrypt hash for passwords
 * Run with: npx ts-node src/utils/generatePasswordHash.ts
 */
import bcrypt from 'bcryptjs';

const password = process.argv[2] || 'admin123';

bcrypt.hash(password, 10, (err, hash) => {
  if (err) {
    console.error('Error generating hash:', err);
    return;
  }
  console.log(`Password: ${password}`);
  console.log(`Hash: ${hash}`);
  console.log('\nCopy the hash above to use in database schema.sql');
});


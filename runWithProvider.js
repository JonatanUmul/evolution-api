const dotenv = require('dotenv');
const { execSync } = require('child_process');
const { existsSync } = require('fs');

dotenv.config();

const provider = process.env.DATABASE_PROVIDER ?? 'postgresql';

if (!process.env.DATABASE_PROVIDER) {
  console.warn(`DATABASE_PROVIDER is not set in the .env file, using default: ${provider}`);
}

let command = process.argv.slice(2).join(' ');

if (provider === 'sqlite') {
  console.log('Using SQLite: skipping migrations and running prisma generate...');
  try {
    execSync('npx prisma generate --schema=./prisma/sqlite-schema.prisma', { stdio: 'inherit' });
    console.log('✅ Prisma client generated successfully.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error generating Prisma client for SQLite.');
    process.exit(1);
  }
}

// Comando normal con reemplazo si no es SQLite
command = command.replace(/DATABASE_PROVIDER/g, provider);

if (command.includes('rmdir') && existsSync('prisma\\migrations')) {
  try {
    execSync('rmdir /S /Q prisma\\migrations', { stdio: 'inherit' });
  } catch (error) {
    console.error(`Error removing directory: prisma\\migrations`);
    process.exit(1);
  }
} else if (command.includes('rmdir')) {
  console.warn(`Directory 'prisma\\migrations' does not exist, skipping removal.`);
}

try {
  execSync(command, { stdio: 'inherit' });
} catch (error) {
  console.error(`Error executing command: ${command}`);
  process.exit(1);
}

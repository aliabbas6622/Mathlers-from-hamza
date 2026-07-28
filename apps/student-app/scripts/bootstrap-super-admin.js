const crypto = require('crypto');
const fs = require('fs');
const mongoose = require('mongoose');
const path = require('path');

const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const index = line.indexOf('=');
    if (index < 1 || line.trimStart().startsWith('#')) continue;
    const key = line.slice(0, index).trim();
    if (!(key in process.env)) process.env[key] = line.slice(index + 1).trim();
  }
}

const email = process.env.SUPER_ADMIN_EMAIL?.trim().toLowerCase();
const fullName = process.env.SUPER_ADMIN_NAME?.trim();
if (!process.env.MONGODB_URI || !email || !fullName) {
  throw new Error('Set MONGODB_URI, SUPER_ADMIN_EMAIL, and SUPER_ADMIN_NAME before running this script.');
}

async function bootstrap() {
  await mongoose.connect(process.env.MONGODB_URI);
  const users = mongoose.connection.collection('users');
  const playerId = `DEV-${crypto.randomBytes(5).toString('hex').toUpperCase()}`;
  const result = await users.findOneAndUpdate(
    { email },
    {
      $set: { role: 'super_admin', isActive: true, isSuspended: false },
      $setOnInsert: {
        email, fullName, playerId, isEmailVerified: false, profileComplete: true,
        level: 1, points: 0, accuracy: 0, currentStreak: 0, totalQuestions: 0,
        correctAnswers: 0, wrongAnswers: 0, competitionsJoined: 0, competitionsWon: 0,
        createdAt: new Date(), updatedAt: new Date(),
      },
    },
    { upsert: true, returnDocument: 'after' },
  );
  console.log(`Super admin is ready for ${result.email}. Create or verify the same email in Clerk, then sign in.`);
}

bootstrap()
  .catch((error) => { console.error(error.message); process.exitCode = 1; })
  .finally(() => mongoose.disconnect());

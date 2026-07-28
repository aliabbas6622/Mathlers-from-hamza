const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const dns = require('dns');

dns.setServers(['8.8.8.8']);

const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue;
    const index = trimmed.indexOf('=');
    const key = trimmed.slice(0, index).trim();
    const value = trimmed.slice(index + 1).trim();
    if (!(key in process.env)) process.env[key] = value;
  }
}

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please set MONGODB_URI before running this seed script.');
}

// User schema (minimal fields required by the real model)
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  fullName: { type: String, required: true },
  fatherName: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  gender: { type: String, required: true },
  city: { type: String, required: true },
  grade: { type: String, required: true },
  playerId: { type: String, required: true, unique: true },
  role: { type: String, enum: ['student', 'admin', 'super-admin', 'coordinator'], required: true },
  isActive: { type: Boolean, default: true },
  isSuspended: { type: Boolean, default: false },
  isEmailVerified: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

async function seedUsers() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const studentPassword = await bcrypt.hash('Student123!', 10);
    const adminPassword = await bcrypt.hash('Admin123!', 10);

    // Keep the admin account stable; only create it once.
    await User.findOneAndUpdate(
      { email: 'admin@mathlers.com' },
      {
        $setOnInsert: {
          email: 'admin@mathlers.com',
          password: adminPassword,
          fullName: 'Test Admin',
          fatherName: 'Mathlers Admin',
          dateOfBirth: new Date('1990-01-01'),
          gender: 'other',
          city: 'Karachi',
          grade: '12',
          playerId: 'ADM001',
          role: 'admin',
          isActive: true,
          isSuspended: false,
          isEmailVerified: true
        }
      },
      { upsert: true, returnDocument: 'after' }
    );

    // Recreate the student test account so it stays disposable.
    await User.deleteOne({ email: 'student@mathlers.com' });
    await User.create({
      email: 'student@mathlers.com',
      password: studentPassword,
      fullName: 'Test Student',
      fatherName: 'Mathlers Student',
      dateOfBirth: new Date('2010-01-01'),
      gender: 'other',
      city: 'Karachi',
      grade: '10',
      playerId: 'STU001',
      role: 'student',
      isActive: true,
      isSuspended: false,
      isEmailVerified: true
    });

    console.log('✅ Test users created successfully:');
    console.log('\n📧 Student Credentials:');
    console.log('   Email: student@mathlers.com');
    console.log('   Password: Student123!');
    console.log('   Role: student');
    console.log('\n📧 Admin Credentials:');
    console.log('   Email: admin@mathlers.com');
    console.log('   Password: Admin123!');
    console.log('   Role: admin');

  } catch (error) {
    console.error('Error seeding users:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

seedUsers();

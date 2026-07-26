const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please set MONGODB_URI before running this seed script.');
}

// User schema (simplified version for seeding)
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  fullName: { type: String, required: true },
  playerId: { type: String, required: true, unique: true },
  role: { type: String, enum: ['student', 'admin', 'super-admin', 'coordinator'], required: true },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

async function seedUsers() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing test users
    await User.deleteMany({ email: { $in: ['student@mathlers.com', 'admin@mathlers.com'] } });

    // Hash passwords
    const studentPassword = await bcrypt.hash('Student123!', 10);
    const adminPassword = await bcrypt.hash('Admin123!', 10);

    // Create student user
    const student = await User.create({
      email: 'student@mathlers.com',
      password: studentPassword,
      fullName: 'Test Student',
      playerId: 'STU001',
      role: 'student',
      isActive: true
    });

    // Create admin user
    const admin = await User.create({
      email: 'admin@mathlers.com',
      password: adminPassword,
      fullName: 'Test Admin',
      playerId: 'ADM001',
      role: 'admin',
      isActive: true
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

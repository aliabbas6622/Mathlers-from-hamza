import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import UserModel from '@/models/User';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const registerSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  fatherName: z.string().min(2, 'Father name must be at least 2 characters'),
  dateOfBirth: z.string().refine((val) => {
    const date = new Date(val);
    const now = new Date();
    const age = now.getFullYear() - date.getFullYear();
    return age >= 5 && age <= 25;
  }, 'Age must be between 5 and 25 years'),
  gender: z.enum(['male', 'female', 'other']),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 characters'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  schoolName: z.string().min(2, 'School name is required'),
  city: z.string().min(2, 'City is required'),
  grade: z.enum(['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const validatedData = registerSchema.parse(body);
    
    await connectDB();
    
    const existingUser = await UserModel.findOne({ email: validatedData.email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      );
    }
    
    const hashedPassword = await bcrypt.hash(validatedData.password, 12);
    
    const newUser = new UserModel({
      ...validatedData,
      password: hashedPassword,
      dateOfBirth: new Date(validatedData.dateOfBirth),
      role: 'student',
    });
    
    await newUser.save();
    
    return NextResponse.json(
      { 
        message: 'Registration successful',
        user: {
          id: newUser._id,
          email: newUser.email,
          fullName: newUser.fullName,
          playerId: newUser.playerId,
        }
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }
    
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    );
  }
}

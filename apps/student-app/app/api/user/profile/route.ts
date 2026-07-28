import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@mathlers/lib/auth';
import connectDB from '@mathlers/lib/db';
import UserModel from '@mathlers/models/User';
import { z } from 'zod';

const profileSchema = z.object({
  fullName: z.string().trim().min(2).max(100).optional(),
  fatherName: z.string().trim().min(2).max(100).optional(),
  dateOfBirth: z.string().date().optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  phone: z.string().trim().min(7).max(30).optional(),
  schoolName: z.string().trim().min(2).max(150).optional(),
  city: z.string().trim().min(2).max(100).optional(),
  grade: z.enum(['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']).optional(),
});

export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const user = await UserModel.findById(session.user.id).select('-password -resetPasswordToken -resetPasswordExpires -emailVerificationToken');

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = profileSchema.parse(await request.json());
    
    await connectDB();

    const user = await UserModel.findByIdAndUpdate(
      session.user.id,
      { $set: { ...body, ...(body.dateOfBirth ? { dateOfBirth: new Date(body.dateOfBirth) } : {}) } },
      { new: true, runValidators: true }
    ).select('-password -resetPasswordToken -resetPasswordExpires -emailVerificationToken');

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    user.profileComplete = Boolean(user.fullName && user.fatherName && user.dateOfBirth && user.gender && user.phone && user.city && user.grade);
    await user.save();

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    console.error('Update profile error:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}

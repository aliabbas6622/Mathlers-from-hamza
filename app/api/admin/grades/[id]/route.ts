import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import connectDB from '@/lib/db/mongodb';
import GradeModel from '@/models/Grade';
import { isValidObjectId } from '@/lib/utils/isValidObjectId';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || !['admin', 'super_admin'].includes(session.user.role)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;
    if (!isValidObjectId(id)) {
      return NextResponse.json({ success: false, error: 'Invalid Grade ID' }, { status: 400 });
    }

    const body = await request.json();
    const updated = await GradeModel.findByIdAndUpdate(
      id,
      {
        name: body.name,
        code: body.code?.toUpperCase(),
        order: Number(body.order) || 0,
        isActive: body.isActive,
      },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ success: false, error: 'Grade not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'Grade updated successfully',
    });
  } catch (error: any) {
    console.error('Error updating grade:', error);
    return NextResponse.json({ success: false, error: 'Failed to update grade' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || !['admin', 'super_admin'].includes(session.user.role)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;
    if (!isValidObjectId(id)) {
      return NextResponse.json({ success: false, error: 'Invalid Grade ID' }, { status: 400 });
    }

    await GradeModel.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: 'Grade deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting grade:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete grade' }, { status: 500 });
  }
}

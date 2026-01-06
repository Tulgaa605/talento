import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET single position
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const position = await prisma.position.findUnique({
      where: { id },
      include: {
        department: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        employees: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            middleName: true,
            employeeId: true,
            email: true,
            phoneNumber: true,
          },
        },
      },
    });

    if (!position) {
      return NextResponse.json(
        { error: 'Position not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(position);
  } catch (error) {
    console.error('Error fetching position:', error);
    return NextResponse.json(
      { error: 'Failed to fetch position' },
      { status: 500 }
    );
  }
}

// PUT (update position)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { title, code, description, departmentId, salaryRange, requirements } = body;

    // Validation
    if (!title || !code || !description || !departmentId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if position exists
    const existingPosition = await prisma.position.findUnique({
      where: { id },
      include: {
        employees: true,
      },
    });

    if (!existingPosition) {
      return NextResponse.json(
        { error: 'Position not found' },
        { status: 404 }
      );
    }

    // Check if code is unique (excluding current position)
    const positionWithSameCode = await prisma.position.findFirst({
      where: {
        code,
        id: { not: id },
      },
    });

    if (positionWithSameCode) {
      return NextResponse.json(
        { error: 'Position code already exists' },
        { status: 400 }
      );
    }

    // Check if department changed
    const departmentChanged = existingPosition.departmentId !== departmentId;

    // Update position and employees in a transaction
    const updatedPosition = await prisma.$transaction(async (tx) => {
      // Update position
      const position = await tx.position.update({
        where: { id },
        data: {
          title,
          code,
          description,
          departmentId,
          salaryRange,
          requirements,
        },
        include: {
          department: true,
          employees: true,
        },
      });

      // If department changed, update all employees with this position
      if (departmentChanged && existingPosition.employees.length > 0) {
        await tx.employee.updateMany({
          where: {
            positionId: id,
          },
          data: {
            departmentId: departmentId,
          },
        });
      }

      return position;
    });

    return NextResponse.json(updatedPosition);
  } catch (error) {
    console.error('Error updating position:', error);
    return NextResponse.json(
      { error: 'Failed to update position' },
      { status: 500 }
    );
  }
}

// DELETE position
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Check if position exists
    const position = await prisma.position.findUnique({
      where: { id },
      include: {
        employees: true,
      },
    });

    if (!position) {
      return NextResponse.json(
        { error: 'Position not found' },
        { status: 404 }
      );
    }

    // Check if there are employees with this position
    if (position.employees.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete position with assigned employees' },
        { status: 400 }
      );
    }

    // Delete position
    await prisma.position.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Position deleted successfully' });
  } catch (error) {
    console.error('Error deleting position:', error);
    return NextResponse.json(
      { error: 'Failed to delete position' },
      { status: 500 }
    );
  }
}

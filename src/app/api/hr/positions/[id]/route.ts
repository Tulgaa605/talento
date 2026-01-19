import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getCompanyId } from '@/lib/hr-utils';

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

    // Validation - only title is required
    if (!title) {
      return NextResponse.json(
        { error: 'Тушаалын нэр заавал оруулах шаардлагатай' },
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

    // Get current user's companyId
    const companyId = await getCompanyId(session.user.id);
    
    if (!companyId) {
      return NextResponse.json(
        { error: 'Компани олдсонгүй' },
        { status: 400 }
      );
    }

    // Use existing values if not provided
    const finalCode = code || existingPosition.code;
    const finalDepartmentId = departmentId || existingPosition.departmentId;
    const finalDescription = description !== undefined ? description : existingPosition.description;

    // Check if code is unique within the same company (excluding current position) - only if code is provided
    if (code && code !== existingPosition.code) {
      const positionWithSameCode = await prisma.position.findFirst({
        where: {
          code,
          companyId: companyId,
          id: { not: id },
        },
      });

      if (positionWithSameCode) {
        return NextResponse.json(
          { error: 'Энэ ашиглагдсан код байна' },
          { status: 400 }
        );
      }
    }

    // Check if department changed
    const departmentChanged = existingPosition.departmentId !== finalDepartmentId;

    // Update position and employees in a transaction
    const updatedPosition = await prisma.$transaction(async (tx) => {
      // Update position
      const position = await tx.position.update({
        where: { id },
        data: {
          title,
          code: finalCode,
          description: finalDescription,
          departmentId: finalDepartmentId,
          salaryRange: salaryRange !== undefined ? salaryRange : existingPosition.salaryRange,
          requirements: requirements !== undefined ? requirements : existingPosition.requirements,
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
            departmentId: finalDepartmentId,
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

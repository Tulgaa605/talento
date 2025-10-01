// File: src/app/api/hr/positions/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

type RouteCtx = { params: Promise<{ id: string }> }

// Албан тушаалын мэдээллийг авах
export async function GET(_req: NextRequest, { params }: RouteCtx) {
  const { id } = await params
  try {
    const position = await prisma.position.findUnique({
      where: { id },
      include: {
        department: { select: { id: true, name: true, code: true } },
        employees: { select: { id: true, firstName: true, lastName: true, employeeId: true } },
      },
    })

    if (!position) {
      return NextResponse.json({ error: 'Албан тушаал олдсонгүй' }, { status: 404 })
    }

    return NextResponse.json(position)
  } catch (error) {
    console.error('Албан тушаалын мэдээлэл авахад алдаа гарлаа:', error)
    return NextResponse.json({ error: 'Албан тушаалын мэдээлэл авахад алдаа гарлаа' }, { status: 500 })
  }
}

// Албан тушаалын мэдээллийг шинэчлэх
export async function PUT(req: NextRequest, { params }: RouteCtx) {
  const { id } = await params
  try {
    const body = await req.json()
    const { title, description, code, departmentId } = body as {
      title?: string
      description?: string | null
      code?: string
      departmentId?: string
    }

    if (!title || !code || !departmentId) {
      return NextResponse.json(
        { error: 'Нэр, код болон хэлтэс заавал оруулах шаардлагатай' },
        { status: 400 }
      )
    }

    // Код давхцал шалгах
    const existingPosition = await prisma.position.findFirst({
      where: { code, id: { not: id } },
    })
    if (existingPosition) {
      return NextResponse.json(
        { error: 'Энэ код өөр албан тушаалд ашиглагдсан байна' },
        { status: 400 }
      )
    }

    // Хэлтэс байгаа эсэхийг шалгах
    const department = await prisma.department.findUnique({ where: { id: departmentId } })
    if (!department) {
      return NextResponse.json({ error: 'Хэлтэс олдсонгүй' }, { status: 404 })
    }

    const updatedPosition = await prisma.position.update({
      where: { id },
      data: {
        title,
        description: description || null,
        code,
        departmentId,
      },
      include: {
        department: true,
        employees: true,
      },
    })

    return NextResponse.json(updatedPosition)
  } catch (error) {
    console.error('Албан тушаалын мэдээлэл шинэчлэхэд алдаа гарлаа:', error)
    return NextResponse.json(
      { error: 'Албан тушаалын мэдээлэл шинэчлэхэд алдаа гарлаа' },
      { status: 500 }
    )
  }
}

// Албан тушаалын устгах
export async function DELETE(_req: NextRequest, { params }: RouteCtx) {
  const { id } = await params
  try {
    const position = await prisma.position.findUnique({
      where: { id },
      include: { employees: true },
    })

    if (!position) {
      return NextResponse.json({ error: 'Албан тушаал олдсонгүй' }, { status: 404 })
    }

    if (position.employees.length > 0) {
      return NextResponse.json(
        { error: 'Энэ албан тушаалд ажилтнууд байгаа тул устгах боломжгүй' },
        { status: 400 }
      )
    }

    await prisma.position.delete({ where: { id } })

    return NextResponse.json({ message: 'Албан тушаал амжилттай устгагдлаа' }, { status: 200 })
  } catch (error) {
    console.error('Албан тушаалын устгахад алдаа гарлаа:', error)
    return NextResponse.json(
      { error: 'Албан тушаалын устгахад алдаа гарлаа' },
      { status: 500 }
    )
  }
}

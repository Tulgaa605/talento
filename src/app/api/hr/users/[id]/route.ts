// File: src/app/api/hr/users/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient, JobApplicationStatus } from '@prisma/client'

const prisma = new PrismaClient()

type RouteCtx = { params: Promise<{ id: string }> }

// Хэрэглэгчийн мэдээллийг авах
export async function GET(_req: NextRequest, { params }: RouteCtx) {
  const { id } = await params
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        image: true,
        position: true,
        department: true,
        createdAt: true,
        jobApplications: { select: { status: true } },
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'Хэрэглэгч олдсонгүй' }, { status: 404 })
    }

    // Гэрээтэй ажилчдын имэйлүүд
    const employeesWithAnyContract = await prisma.employee.findMany({
      where: { contracts: { some: {} } },
      select: { email: true },
    })
    const emailHasContractSet = new Set(
      employeesWithAnyContract
        .map(e => e.email?.toLowerCase())
        .filter(Boolean) as string[]
    )

    const apps = user.jobApplications as Array<{ status: JobApplicationStatus }> | undefined
    const employerApproved = apps?.some(a => a.status === JobApplicationStatus.EMPLOYER_APPROVED) ?? false
    const adminApproved   = apps?.some(a => a.status === JobApplicationStatus.ADMIN_APPROVED)   ?? false
    const approved        = apps?.some(a => a.status === JobApplicationStatus.APPROVED)         ?? false

    const result = {
      id: user.id,
      name: user.name ?? '',
      email: user.email ?? '',
      phoneNumber: user.phoneNumber ?? '',
      image: user.image ?? '',
      position: user.position ?? '',
      department: user.department ?? '',
      hasContract: user.email ? emailHasContractSet.has(user.email.toLowerCase()) : false,
      employerApproved,
      adminApproved,
      approved,
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Хэрэглэгчийн мэдээлэл авахад алдаа гарлаа:', error)
    return NextResponse.json({ error: 'Хэрэглэгчийн мэдээлэл авахад алдаа гарлаа' }, { status: 500 })
  }
}

// Хэрэглэгчийн мэдээллийг шинэчлэх
export async function PUT(req: NextRequest, { params }: RouteCtx) {
  const { id } = await params
  try {
    const body = await req.json()
    const { name, email, phoneNumber, position, department } = body as {
      name?: string; email?: string; phoneNumber?: string | null; position?: string | null; department?: string | null
    }

    if (!name || !email) {
      return NextResponse.json(
        { error: 'Нэр болон имэйл заавал оруулах шаардлагатай' },
        { status: 400 }
      )
    }

    const existingUser = await prisma.user.findFirst({
      where: { email, id: { not: id } },
    })
    if (existingUser) {
      return NextResponse.json(
        { error: 'Энэ имэйл өөр хэрэглэгчид ашиглагдсан байна' },
        { status: 400 }
      )
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        name,
        email,
        phoneNumber: phoneNumber ?? null,
        position: position ?? null,
        department: department ?? null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        position: true,
        department: true,
      },
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Хэрэглэгчийн мэдээлэл шинэчлэхэд алдаа гарлаа:', error)
    return NextResponse.json({ error: 'Хэрэглэгчийн мэдээлэл шинэчлэхэд алдаа гарлаа' }, { status: 500 })
  }
}

// Хэрэглэгчийг устгах
export async function DELETE(_req: NextRequest, { params }: RouteCtx) {
  const { id } = await params
  try {
    const user = await prisma.user.findUnique({ where: { id } })
    if (!user) {
      return NextResponse.json({ error: 'Хэрэглэгч олдсонгүй' }, { status: 404 })
    }

    await prisma.user.delete({ where: { id } })
    return NextResponse.json({ message: 'Хэрэглэгч амжилттай устгагдлаа' }, { status: 200 })
  } catch (error) {
    console.error('Хэрэглэгчийг устгахад алдаа гарлаа:', error)
    return NextResponse.json({ error: 'Хэрэглэгчийг устгахад алдаа гарлаа' }, { status: 500 })
  }
}

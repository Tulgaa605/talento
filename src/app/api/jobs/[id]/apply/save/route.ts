import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// params нь Promise байх ёстой
type RouteCtx = { params: Promise<{ id: string }> }

export async function POST(req: NextRequest, { params }: RouteCtx) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Please log in to save jobs' }, { status: 401 })
    }

    const { id } = await params           // <-- ЭНД await хэрэглэнэ
    const jobId = id                      // хавтас [id]-тэй тул id-г jobId болгож ашиглая

    const job = await prisma.job.findUnique({ where: { id: jobId } })
    if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 })

    const existing = await prisma.savedJob.findFirst({
      where: { userId: session.user.id, jobId }
    })

    if (existing) {
      await prisma.savedJob.delete({ where: { id: existing.id } })
      return NextResponse.json({ saved: false })
    }

    await prisma.savedJob.create({ data: { userId: session.user.id, jobId } })
    return NextResponse.json({ saved: true })
  } catch (e) {
    console.error('Error saving job:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

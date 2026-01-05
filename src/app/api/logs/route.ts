
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const logs = await prisma.activityLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100, // Limit to last 100 logs
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return NextResponse.json(logs);
  } catch (error) {
    console.error('Error fetching activity logs:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const newLog = await prisma.activityLog.create({
      data: {
        userId: body.userId,
        userName: body.userName,
        action: body.action,
        description: body.description,
        metadata: body.metadata || {},
        ipAddress: body.ipAddress,
      },
    });

    return NextResponse.json(newLog, { status: 201 });
  } catch (error) {
    console.error('Error creating activity log:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}


import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const events = await prisma.event.findMany({
      orderBy: { date: 'desc' },
      include: {
        createdBy: {
          select: { id: true, name: true },
        },
        _count: {
          select: { claims: true },
        },
      },
    });

    return NextResponse.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const newEvent = await prisma.event.create({
      data: {
        name: body.name,
        date: new Date(body.date),
        claimDeadline: new Date(body.claimDeadline),
        templateUrl: body.templateUrl,
        templateConfig: body.templateConfig || {},
        createdById: body.createdById,
      },
    });

    return NextResponse.json(newEvent, { status: 201 });
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

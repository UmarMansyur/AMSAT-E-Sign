
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const letters = await prisma.letter.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
        signatures: true,
      },
    });

    return NextResponse.json(letters);
  } catch (error) {
    console.error('Error fetching letters:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const newLetter = await prisma.letter.create({
      data: {
        letterNumber: body.letterNumber,
        letterDate: new Date(body.letterDate),
        subject: body.subject,
        attachment: body.attachment,
        content: body.content,
        status: 'draft',
        createdById: body.createdById,
      },
    });

    return NextResponse.json(newLetter, { status: 201 });
  } catch (error) {
    console.error('Error creating letter:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

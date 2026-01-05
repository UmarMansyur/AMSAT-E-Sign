
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type Params = Promise<{ id: string }>;

export async function GET(request: Request, { params }: { params: Params }) {
  const { id } = await params;
  try {
    const letter = await prisma.letter.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true, jobTitle: true },
        },
        signatures: {
          include: {
            signer: {
              select: { id: true, name: true, jobTitle: true },
            },
          },
        },
      },
    });

    if (!letter) {
      return NextResponse.json({ error: 'Letter not found' }, { status: 404 });
    }

    return NextResponse.json(letter);
  } catch (error) {
    console.error('Error fetching letter:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Params }) {
  const { id } = await params;
  try {
    const body = await request.json();

    // Check if letter is already signed
    const existingLetter = await prisma.letter.findUnique({
      where: { id },
    });

    if (existingLetter?.status === 'signed') {
      return NextResponse.json(
        { error: 'Signed letters cannot be modified' },
        { status: 400 }
      );
    }

    const updatedLetter = await prisma.letter.update({
      where: { id },
      data: {
        letterNumber: body.letterNumber,
        letterDate: body.letterDate ? new Date(body.letterDate) : undefined,
        subject: body.subject,
        attachment: body.attachment,
        content: body.content,
      },
    });

    return NextResponse.json(updatedLetter);
  } catch (error: any) {
    console.error('Error updating letter:', error);
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Letter not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Params }) {
  const { id } = await params;
  try {
    // Check if letter is signed
    const letter = await prisma.letter.findUnique({
      where: { id },
    });

    if (letter?.status === 'signed') {
      return NextResponse.json(
        { error: 'Signed letters cannot be deleted' },
        { status: 400 }
      );
    }

    await prisma.letter.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Letter deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting letter:', error);
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Letter not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

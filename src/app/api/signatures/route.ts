
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const signatures = await prisma.signature.findMany({
      orderBy: { signedAt: 'desc' },
      include: {
        letter: {
          select: { id: true, letterNumber: true, subject: true },
        },
        signer: {
          select: { id: true, name: true, jobTitle: true },
        },
      },
    });

    return NextResponse.json(signatures);
  } catch (error) {
    console.error('Error fetching signatures:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

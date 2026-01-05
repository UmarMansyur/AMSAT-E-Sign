
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const [
      totalLetters,
      signedLetters,
      draftLetters,
      invalidLetters,
      totalUsers,
      activeUsers,
      totalEvents,
      totalClaims,
    ] = await Promise.all([
      prisma.letter.count(),
      prisma.letter.count({ where: { status: 'signed' } }),
      prisma.letter.count({ where: { status: 'draft' } }),
      prisma.letter.count({ where: { status: 'invalid' } }),
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.event.count(),
      prisma.certificateClaim.count(),
    ]);

    return NextResponse.json({
      totalLetters,
      signedLetters,
      draftLetters,
      invalidLetters,
      totalUsers,
      activeUsers,
      totalEvents,
      totalClaims,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}


import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type Params = Promise<{ id: string }>;

export async function POST(request: Request, { params }: { params: Params }) {
  const { id } = await params;
  try {
    const body = await request.json();
    const { signerId, signerName, contentHash, qrCodeUrl, metadata } = body;

    if (!signerId || !signerName || !contentHash || !qrCodeUrl) {
      return NextResponse.json(
        { error: 'Missing required fields: signerId, signerName, contentHash, qrCodeUrl' },
        { status: 400 }
      );
    }

    // Use transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx: typeof prisma) => {
      // 1. Check if letter exists and is draft
      const letter = await tx.letter.findUnique({
        where: { id },
      });

      if (!letter) {
        throw new Error('Letter not found');
      }

      if (letter.status === 'signed') {
        throw new Error('Letter is already signed');
      }

      // 2. Update letter status
      await tx.letter.update({
        where: { id },
        data: {
          status: 'signed',
          contentHash,
          qrCodeUrl,
        },
      });

      // 3. Create signature
      const signature = await tx.signature.create({
        data: {
          letterId: id,
          signerId,
          signerName,
          contentHash,
          metadata: metadata || {},
        },
      });

      return signature;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error('Error signing letter:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 400 }
    );
  }
}

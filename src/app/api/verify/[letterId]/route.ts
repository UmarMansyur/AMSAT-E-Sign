
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyLetterIntegrity } from '@/lib/crypto';

type Params = Promise<{ letterId: string }>;

export async function GET(request: Request, { params }: { params: Params }) {
  const { letterId } = await params;
  try {
    // First try to find a letter
    const letter = await prisma.letter.findUnique({
      where: { id: letterId },
      include: {
        signatures: {
          include: {
            signer: {
              select: { id: true, name: true, jobTitle: true },
            },
          },
        },
        createdBy: {
          select: { name: true },
        },
      },
    });

    if (letter) {
      // Verify integrity
      const isIntegrityValid = letter.contentHash
        ? verifyLetterIntegrity(
          letter.letterNumber,
          letter.letterDate,
          letter.subject,
          letter.attachment,
          letter.content || undefined,
          letter.contentHash
        )
        : false;

      const signature = letter.signatures[0];
      const isValid = letter.status === 'signed' && signature && isIntegrityValid;

      return NextResponse.json({
        type: 'letter',
        isValid,
        isIntegrityValid,
        letter: {
          id: letter.id,
          letterNumber: letter.letterNumber,
          letterDate: letter.letterDate,
          subject: letter.subject,
          attachment: letter.attachment,
          status: letter.status,
          contentHash: letter.contentHash,
          qrCodeUrl: letter.qrCodeUrl,
        },
        signature: signature
          ? {
            id: signature.id,
            signerName: signature.signerName,
            signerJobTitle: signature.signer?.jobTitle,
            signedAt: signature.signedAt,
          }
          : null,
      });
    }

    // Try to find a certificate claim
    const claim = await prisma.certificateClaim.findUnique({
      where: { id: letterId },
      include: {
        event: {
          select: { id: true, name: true, date: true },
        },
      },
    });

    if (claim) {
      return NextResponse.json({
        type: 'certificate',
        isValid: true,
        claim: {
          id: claim.id,
          recipientName: claim.recipientName,
          callSign: claim.callSign,
          certificateNumber: claim.certificateNumber,
          claimedAt: claim.claimedAt,
        },
        event: claim.event,
      });
    }

    // Not found
    return NextResponse.json(
      { isValid: false, error: 'Document not found' },
      { status: 404 }
    );
  } catch (error) {
    console.error('Error verifying document:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

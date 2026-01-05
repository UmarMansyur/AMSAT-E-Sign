
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { v4 as uuidv4 } from 'uuid';
import { generateQRCodeDataUrl } from '@/lib/qr-generator';

type Params = Promise<{ id: string }>;

// GET claims for an event
export async function GET(request: Request, { params }: { params: Params }) {
  const { id } = await params;
  try {
    const claims = await prisma.certificateClaim.findMany({
      where: { eventId: id },
      orderBy: { claimedAt: 'desc' },
    });

    return NextResponse.json(claims);
  } catch (error) {
    console.error('Error fetching claims:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST - Claim a certificate
export async function POST(request: Request, { params }: { params: Params }) {
  const { id: eventId } = await params;
  try {
    const body = await request.json();
    const { recipientName, callSign, userId } = body;

    if (!recipientName) {
      return NextResponse.json(
        { error: 'Recipient name is required' },
        { status: 400 }
      );
    }

    // Check if event exists and deadline hasn't passed
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    if (new Date() > new Date(event.claimDeadline)) {
      return NextResponse.json(
        { error: 'Claim deadline has passed' },
        { status: 400 }
      );
    }

    // Generate certificate number and QR code
    const claimId = uuidv4();
    const certificateNumber = `CERT/${eventId.substring(0, 4)}/${claimId.substring(0, 4)}`.toUpperCase();

    const qrPayload = JSON.stringify({
      type: 'certificate',
      eventId,
      claimId,
      recipientName,
      callSign: callSign || undefined,
      valid: true,
    });

    const qrCodeUrl = await generateQRCodeDataUrl(qrPayload);

    const newClaim = await prisma.certificateClaim.create({
      data: {
        id: claimId,
        eventId,
        userId,
        recipientName,
        callSign,
        certificateNumber,
        qrCodeUrl,
      },
    });

    return NextResponse.json(newClaim, { status: 201 });
  } catch (error) {
    console.error('Error claiming certificate:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

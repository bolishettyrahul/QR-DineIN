import { NextRequest } from 'next/server';
import QRCode from 'qrcode';
import prisma from '@/lib/prisma';
import { successResponse, notFound, internalError } from '@/lib/api-response';

export async function GET(
  _request: NextRequest,
  { params }: { params: { tableId: string } }
) {
  try {
    const table = await prisma.table.findUnique({
      where: { id: params.tableId, isActive: true },
    });

    if (!table) {
      return notFound('Table not found');
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const qrUrl = `${appUrl}/table/${table.id}`;

    // Generate QR code as data URL
    const qrDataUrl = await QRCode.toDataURL(qrUrl, {
      width: 400,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });

    // Save QR code URL to table
    await prisma.table.update({
      where: { id: params.tableId },
      data: { qrCodeUrl: qrDataUrl },
    });

    return successResponse({
      tableId: table.id,
      tableNumber: table.number,
      qrUrl,
      qrCodeDataUrl: qrDataUrl,
    });
  } catch (error) {
    console.error('Generate QR error:', error);
    return internalError();
  }
}

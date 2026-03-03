import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, notFound, internalError } from '@/lib/api-response';

export async function GET(
  _request: NextRequest,
  { params }: { params: { paymentId: string } }
) {
  try {
    const payment = await prisma.payment.findUnique({
      where: { id: params.paymentId },
      include: {
        order: {
          select: { id: true, orderNumber: true, totalAmount: true, status: true },
        },
      },
    });

    if (!payment) {
      return notFound('Payment not found');
    }

    return successResponse(payment);
  } catch (error) {
    console.error('Get payment error:', error);
    return internalError();
  }
}

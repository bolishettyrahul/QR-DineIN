import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, notFound, internalError } from '@/lib/api-response';

export async function GET(
  _request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: params.orderId },
      include: {
        items: {
          include: {
            menuItem: { select: { imageUrl: true, isVeg: true } },
          },
        },
        table: { select: { number: true, label: true } },
        payment: true,
        statusLogs: {
          orderBy: { createdAt: 'asc' },
          include: {
            staff: { select: { name: true } },
          },
        },
      },
    });

    if (!order) {
      return notFound('Order not found');
    }

    return successResponse(order);
  } catch (error) {
    console.error('Get order error:', error);
    return internalError();
  }
}

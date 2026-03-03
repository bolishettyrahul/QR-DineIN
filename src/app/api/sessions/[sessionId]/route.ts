import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { updateSessionSchema } from '@/lib/validations';
import { successResponse, validationError, notFound, internalError } from '@/lib/api-response';

export async function GET(
  _request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const session = await prisma.session.findUnique({
      where: { id: params.sessionId },
      include: {
        table: { select: { id: true, number: true, label: true } },
        orders: {
          orderBy: { createdAt: 'desc' },
          include: {
            items: true,
            payment: true,
          },
        },
      },
    });

    if (!session) {
      return notFound('Session not found');
    }

    return successResponse(session);
  } catch (error) {
    console.error('Get session error:', error);
    return internalError();
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const body = await request.json();
    const parsed = updateSessionSchema.safeParse(body);

    if (!parsed.success) {
      return validationError('Invalid input', parsed.error.issues);
    }

    const session = await prisma.session.findUnique({
      where: { id: params.sessionId },
    });

    if (!session) {
      return notFound('Session not found');
    }

    const updated = await prisma.$transaction(async (tx) => {
      const updatedSession = await tx.session.update({
        where: { id: params.sessionId },
        data: {
          status: parsed.data.status,
          completedAt: ['COMPLETED', 'EXPIRED', 'CANCELLED'].includes(parsed.data.status)
            ? new Date()
            : undefined,
        },
      });

      // If session is ending, free up the table
      if (['COMPLETED', 'EXPIRED', 'CANCELLED'].includes(parsed.data.status)) {
        await tx.table.update({
          where: { id: session.tableId },
          data: { status: 'AVAILABLE' },
        });
      }

      return updatedSession;
    });

    return successResponse(updated);
  } catch (error) {
    console.error('Update session error:', error);
    return internalError();
  }
}

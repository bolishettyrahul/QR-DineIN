import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, notFound, internalError, errorResponse } from '@/lib/api-response';

export async function GET(
  _request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const session = await prisma.session.findUnique({
      where: { id: params.sessionId },
      select: {
        id: true,
        status: true,
        tableId: true,
        expiresAt: true,
        table: { select: { number: true, label: true } },
      },
    });

    if (!session) {
      return notFound('Session not found');
    }

    // Check if expired
    if (session.status === 'ACTIVE' && new Date() > session.expiresAt) {
      await prisma.$transaction(async (tx) => {
        await tx.session.update({
          where: { id: params.sessionId },
          data: { status: 'EXPIRED', completedAt: new Date() },
        });
        await tx.table.update({
          where: { id: session.tableId },
          data: { status: 'AVAILABLE' },
        });
      });

      return errorResponse('SESSION_EXPIRED', 'Session has expired', 410);
    }

    return successResponse({
      valid: session.status === 'ACTIVE',
      session,
    });
  } catch (error) {
    console.error('Validate session error:', error);
    return internalError();
  }
}

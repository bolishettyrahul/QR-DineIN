import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { createSessionSchema } from '@/lib/validations';
import { successResponse, validationError, notFound, internalError, errorResponse } from '@/lib/api-response';
import { checkRateLimit, getClientIP } from '@/lib/middleware-helpers';

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIP(request);
    if (!checkRateLimit(`session-create:${ip}`, 5, 60000)) {
      return errorResponse('RATE_LIMITED', 'Too many session requests. Try again in 1 minute.', 429);
    }

    const body = await request.json();
    const parsed = createSessionSchema.safeParse(body);

    if (!parsed.success) {
      return validationError('Invalid input', parsed.error.issues);
    }

    const { tableId, guestCount } = parsed.data;

    // Validate table exists and is active
    const table = await prisma.table.findUnique({
      where: { id: tableId, isActive: true },
    });

    if (!table) {
      return notFound('Table not found. Please scan the QR code again.');
    }

    if (table.status === 'DISABLED') {
      return errorResponse('VALIDATION_ERROR', 'This table is currently disabled.', 400);
    }

    // Check for existing active session
    const existingSession = await prisma.session.findFirst({
      where: { tableId, status: 'ACTIVE' },
    });

    if (existingSession) {
      // Return existing session (same party scenario)
      const response = successResponse(existingSession);
      response.cookies.set('session-id', existingSession.id, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 4 * 60 * 60,
        path: '/',
      });
      return response;
    }

    // Create new session with 4-hour expiry
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 4);

    const session = await prisma.$transaction(async (tx) => {
      // Update table status
      await tx.table.update({
        where: { id: tableId },
        data: { status: 'OCCUPIED' },
      });

      // Create session
      return tx.session.create({
        data: {
          tableId,
          guestCount,
          expiresAt,
        },
      });
    });

    const response = successResponse(session, 201);

    // Set session cookie
    response.cookies.set('session-id', session.id, {
      httpOnly: false, // Needs to be readable by frontend for SWR keys
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 4 * 60 * 60, // 4 hours
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Create session error:', error);
    return internalError();
  }
}

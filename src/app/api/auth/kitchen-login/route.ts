import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { signToken } from '@/lib/auth';
import { kitchenLoginSchema } from '@/lib/validations';
import { successResponse, validationError, unauthorized, rateLimited, internalError } from '@/lib/api-response';
import { checkRateLimit, getClientIP } from '@/lib/middleware-helpers';

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIP(request);
    if (!checkRateLimit(`kitchen-login:${ip}`, 5, 60000)) {
      return rateLimited('Too many login attempts. Try again in 1 minute.');
    }

    const body = await request.json();
    const parsed = kitchenLoginSchema.safeParse(body);

    if (!parsed.success) {
      return validationError('Invalid input', parsed.error.issues);
    }

    const { pin } = parsed.data;

    const staff = await prisma.staff.findFirst({
      where: { pin, role: 'KITCHEN', isActive: true },
    });

    if (!staff) {
      return unauthorized('Invalid PIN');
    }

    const token = await signToken({
      staffId: staff.id,
      role: 'KITCHEN',
      name: staff.name,
    });

    const response = successResponse({
      token,
      staff: { id: staff.id, name: staff.name, role: staff.role },
    });

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 8 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Kitchen login error:', error);
    return internalError();
  }
}

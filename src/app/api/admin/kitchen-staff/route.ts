import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { createKitchenStaffSchema } from '@/lib/validations';
import { successResponse, validationError, conflict, internalError } from '@/lib/api-response';

export async function GET() {
  try {
    const staff = await prisma.staff.findMany({
      where: { role: 'KITCHEN' },
      select: {
        id: true,
        name: true,
        pin: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return successResponse(staff);
  } catch (error) {
    console.error('List kitchen staff error:', error);
    return internalError();
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createKitchenStaffSchema.safeParse(body);

    if (!parsed.success) {
      return validationError('Invalid input', parsed.error.issues);
    }

    // Check if PIN already used
    const existingPin = await prisma.staff.findFirst({
      where: { pin: parsed.data.pin, role: 'KITCHEN', isActive: true },
    });

    if (existingPin) {
      return conflict('This PIN is already in use');
    }

    const staff = await prisma.staff.create({
      data: {
        name: parsed.data.name,
        pin: parsed.data.pin,
        role: 'KITCHEN',
      },
      select: {
        id: true,
        name: true,
        pin: true,
        isActive: true,
        createdAt: true,
      },
    });

    return successResponse(staff, 201);
  } catch (error) {
    console.error('Create kitchen staff error:', error);
    return internalError();
  }
}

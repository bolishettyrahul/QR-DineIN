import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
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
        pin: false,
        isActive: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Don't expose hashed PINs — return masked value
    const safeStaff = staff.map(s => ({ ...s, pin: '****' }));
    return successResponse(safeStaff);
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

    // Check if PIN already used (compare hashed PINs)
    const existingStaff = await prisma.staff.findMany({
      where: { role: 'KITCHEN', isActive: true },
    });

    for (const s of existingStaff) {
      if (s.pin && await bcrypt.compare(parsed.data.pin, s.pin)) {
        return conflict('This PIN is already in use');
      }
    }

    // Hash the PIN before storing
    const hashedPin = await bcrypt.hash(parsed.data.pin, 10);

    const staff = await prisma.staff.create({
      data: {
        name: parsed.data.name,
        pin: hashedPin,
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

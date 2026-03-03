import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { createMenuItemSchema } from '@/lib/validations';
import { successResponse, validationError, internalError } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');

    const menuItems = await prisma.menuItem.findMany({
      where: {
        isActive: true,
        ...(categoryId ? { categoryId } : {}),
      },
      include: {
        category: { select: { id: true, name: true } },
      },
      orderBy: [
        { category: { sortOrder: 'asc' } },
        { sortOrder: 'asc' },
        { name: 'asc' },
      ],
    });

    // Group by category for the public menu
    const grouped = menuItems.reduce((acc, item) => {
      const catName = item.category.name;
      if (!acc[catName]) {
        acc[catName] = {
          categoryId: item.category.id,
          categoryName: catName,
          items: [],
        };
      }
      acc[catName].items.push(item);
      return acc;
    }, {} as Record<string, { categoryId: string; categoryName: string; items: typeof menuItems }>);

    return successResponse(Object.values(grouped));
  } catch (error) {
    console.error('List menu error:', error);
    return internalError();
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createMenuItemSchema.safeParse(body);

    if (!parsed.success) {
      return validationError('Invalid input', parsed.error.issues);
    }

    const menuItem = await prisma.menuItem.create({
      data: parsed.data,
      include: {
        category: { select: { id: true, name: true } },
      },
    });

    return successResponse(menuItem, 201);
  } catch (error) {
    console.error('Create menu item error:', error);
    return internalError();
  }
}

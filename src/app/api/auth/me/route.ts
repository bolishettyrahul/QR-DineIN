import { NextRequest } from 'next/server';
import { getStaffFromRequest } from '@/lib/middleware-helpers';
import { successResponse, unauthorized, internalError } from '@/lib/api-response';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const staff = await getStaffFromRequest(request);

    if (!staff) {
      return unauthorized('Invalid or expired token');
    }

    return successResponse({
      staffId: staff.staffId,
      role: staff.role,
      name: staff.name,
    });
  } catch (error) {
    console.error('Auth check error:', error);
    return internalError();
  }
}

import { NextResponse } from 'next/server';

// ─── Success Response ────────────────────────────────────────────────────────

export function successResponse<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

// ─── Error Response ──────────────────────────────────────────────────────────

export type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'RATE_LIMITED'
  | 'INTERNAL_ERROR'
  | 'SESSION_EXPIRED'
  | 'TABLE_OCCUPIED'
  | 'DUPLICATE_ORDER';

export function errorResponse(
  code: ErrorCode,
  message: string,
  status = 400,
  details?: unknown[]
) {
  return NextResponse.json(
    {
      success: false,
      error: { code, message, ...(details ? { details } : {}) },
    },
    { status }
  );
}

// ─── Common Error Helpers ────────────────────────────────────────────────────

export function notFound(message = 'Resource not found') {
  return errorResponse('NOT_FOUND', message, 404);
}

export function unauthorized(message = 'Authentication required') {
  return errorResponse('UNAUTHORIZED', message, 401);
}

export function forbidden(message = 'Insufficient permissions') {
  return errorResponse('FORBIDDEN', message, 403);
}

export function validationError(message: string, details?: unknown[]) {
  return errorResponse('VALIDATION_ERROR', message, 400, details);
}

export function conflict(message: string) {
  return errorResponse('CONFLICT', message, 409);
}

export function rateLimited(message = 'Too many requests') {
  return errorResponse('RATE_LIMITED', message, 429);
}

export function internalError(message = 'Internal server error') {
  return errorResponse('INTERNAL_ERROR', message, 500);
}

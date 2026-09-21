import { NextResponse } from 'next/server';
import { lockVault } from '@/lib/storage';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST() {
  await lockVault();
  return NextResponse.json({
    success: true,
    message: 'Vault locked successfully',
  });
}

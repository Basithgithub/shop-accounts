import { NextResponse } from 'next/server';
import { unlockVault } from '@/lib/storage';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { password, username } = body;

    if (!password) {
      return NextResponse.json({ error: 'Password is required' }, { status: 400 });
    }

    const result = await unlockVault(password, username);
    if (!result.success) {
      return NextResponse.json({ error: result.message || 'Incorrect password' }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      message: 'Vault unlocked successfully',
      user: result.user ? {
        id: result.user.id,
        username: result.user.username,
        name: result.user.name,
        role: result.user.role,
      } : null,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Login failed' }, { status: 500 });
  }
}


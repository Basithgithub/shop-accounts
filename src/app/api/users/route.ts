import { NextResponse } from 'next/server';
import {
  isVaultUnlocked,
  getVaultData,
  saveVaultData,
  isCurrentUserAdmin,
  getCurrentUser,
} from '@/lib/storage';
import { hashPassword } from '@/lib/crypto';
import { UserAccount, UserRole } from '@/types/accounts';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  if (!(await isVaultUnlocked())) {
    return NextResponse.json({ error: 'Vault is locked' }, { status: 401 });
  }

  try {
    const data = await getVaultData();
    data.users = data.users || [];

    const safeUsers = data.users.map((u) => ({
      id: u.id,
      username: u.username,
      name: u.name,
      role: u.role,
      createdAt: u.createdAt,
      isActive: u.isActive,
    }));

    const currentUser = await getCurrentUser();
    const isAdmin = await isCurrentUserAdmin();

    return NextResponse.json({
      success: true,
      users: safeUsers,
      currentUser: currentUser ? {
        id: currentUser.id,
        username: currentUser.username,
        name: currentUser.name,
        role: currentUser.role,
      } : null,
      isAdmin,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  if (!(await isVaultUnlocked())) {
    return NextResponse.json({ error: 'Vault is locked' }, { status: 401 });
  }

  // Strict Administrator Check: Only Administrator Basith has access to create users
  if (!(await isCurrentUserAdmin())) {
    return NextResponse.json(
      { error: 'Access Denied: Only Administrator Basith has access to create new users.' },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const { username, name, role, password } = body;

    if (!username || username.trim().length < 2) {
      return NextResponse.json({ error: 'Username must be at least 2 characters' }, { status: 400 });
    }

    if (!password || password.trim().length < 3) {
      return NextResponse.json({ error: 'Password / PIN must be at least 3 characters' }, { status: 400 });
    }

    const data = await getVaultData();
    data.users = data.users || [];

    const existing = data.users.find(
      (u) => u.username.toLowerCase() === username.trim().toLowerCase()
    );
    if (existing) {
      return NextResponse.json({ error: 'Username already exists' }, { status: 400 });
    }

    const { hash, salt } = hashPassword(password.trim());
    const userRole: UserRole = role === 'ADMIN' ? 'ADMIN' : 'STAFF';

    const newUser: UserAccount = {
      id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      username: username.trim(),
      name: name?.trim() || username.trim(),
      role: userRole,
      pinHash: hash,
      pinSalt: salt,
      createdAt: new Date().toISOString(),
      isActive: true,
    };

    data.users.push(newUser);
    await saveVaultData(data);

    return NextResponse.json({
      success: true,
      message: `User "${newUser.username}" created successfully with role ${newUser.role}!`,
      user: {
        id: newUser.id,
        username: newUser.username,
        name: newUser.name,
        role: newUser.role,
        createdAt: newUser.createdAt,
        isActive: newUser.isActive,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  if (!(await isVaultUnlocked())) {
    return NextResponse.json({ error: 'Vault is locked' }, { status: 401 });
  }

  // Strict Administrator Check
  if (!(await isCurrentUserAdmin())) {
    return NextResponse.json(
      { error: 'Access Denied: Only Administrator Basith can delete users.' },
      { status: 403 }
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('id');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const data = await getVaultData();
    data.users = data.users || [];

    const targetUser = data.users.find((u) => u.id === userId);
    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Protection: Never allow deleting the primary administrator Basith
    if (targetUser.username.toLowerCase() === 'basith') {
      return NextResponse.json(
        { error: 'Cannot delete the primary administrator Basith.' },
        { status: 400 }
      );
    }

    data.users = data.users.filter((u) => u.id !== userId);
    await saveVaultData(data);

    return NextResponse.json({
      success: true,
      message: `User "${targetUser.username}" removed.`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

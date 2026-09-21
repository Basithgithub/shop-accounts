import { NextResponse } from 'next/server';
import { isVaultSetup, isVaultUnlocked, getVaultData, getCurrentUser, isCurrentUserAdmin } from '@/lib/storage';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const setup = await isVaultSetup();
  const unlocked = await isVaultUnlocked();

  let shopName = 'KV Dryfish Kulumani, Trichy';
  let currentUser = null;
  const usernames: string[] = ['Basith'];

  if (unlocked) {
    try {
      const data = await getVaultData();
      shopName = data.profile.shopName;
      if (Array.isArray(data.users)) {
        data.users.forEach((u) => {
          if (!usernames.includes(u.username)) {
            usernames.push(u.username);
          }
        });
      }
      const user = await getCurrentUser();
      if (user) {
        currentUser = {
          id: user.id,
          username: user.username,
          name: user.name,
          role: user.role,
        };
      }
    } catch {
      // ignore
    }
  }

  const isAdmin = await isCurrentUserAdmin();

  return NextResponse.json({
    isSetup: setup,
    isUnlocked: unlocked,
    shopName,
    currentUser,
    isAdmin,
    availableUsers: usernames,
  });
}


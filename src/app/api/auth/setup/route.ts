import { NextResponse } from 'next/server';
import { isVaultSetup, setupVault } from '@/lib/storage';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(req: Request) {
  try {
    if (await isVaultSetup()) {
      return NextResponse.json(
        { error: 'Vault is already setup. Use master password to unlock.' },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { password, shopName, ownerName, phone, initialCash, initialUpi } = body;

    if (!password || password.length < 4) {
      return NextResponse.json(
        { error: 'Master password/PIN must be at least 4 characters.' },
        { status: 400 }
      );
    }

    const vaultData = await setupVault(password, {
      shopName: shopName?.trim() || 'My Dry Fish Shop',
      ownerName: ownerName?.trim() || 'Shop Owner',
      phone: phone?.trim() || '',
      initialCash: Number(initialCash) || 0,
      initialUpi: Number(initialUpi) || 0,
    });

    return NextResponse.json({
      success: true,
      message: 'Shop accounts vault setup successfully with AES-256-GCM encryption!',
      profile: vaultData.profile,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to setup vault' }, { status: 500 });
  }
}

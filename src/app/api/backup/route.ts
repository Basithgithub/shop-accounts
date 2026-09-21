import { NextResponse } from 'next/server';
import { isVaultUnlocked, getVaultData, getRawEncryptedFile, importEncryptedFile } from '@/lib/storage';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: Request) {
  if (!(await isVaultUnlocked())) {
    return NextResponse.json({ error: 'Vault is locked' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'encrypted';

    if (type === 'decrypted') {
      const data = await getVaultData();
      return new NextResponse(JSON.stringify(data, null, 2), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="dry_fish_accounts_backup_${Date.now()}.json"`,
        },
      });
    }

    // Default: return encrypted container
    const encryptedRaw = await getRawEncryptedFile();
    return new NextResponse(encryptedRaw, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="dry_fish_vault_${Date.now()}.enc.json"`,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { fileContent, password } = body;

    if (!fileContent || !password) {
      return NextResponse.json({ error: 'File content and password are required' }, { status: 400 });
    }

    await importEncryptedFile(fileContent, password);

    return NextResponse.json({
      success: true,
      message: 'Encrypted backup restored and vault unlocked successfully!',
    });
  } catch (err: any) {
    return NextResponse.json({ error: `Restore failed: ${err.message}` }, { status: 400 });
  }
}

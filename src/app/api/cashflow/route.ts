import { NextResponse } from 'next/server';
import { isVaultUnlocked, getVaultData, saveVaultData, getCashFlowSummary } from '@/lib/storage';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  if (!(await isVaultUnlocked())) {
    return NextResponse.json({ error: 'Vault is locked' }, { status: 401 });
  }

  try {
    const data = await getVaultData();
    const summary = getCashFlowSummary(data);

    return NextResponse.json({
      success: true,
      data,
      summary,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  if (!(await isVaultUnlocked())) {
    return NextResponse.json({ error: 'Vault is locked' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const data = await getVaultData();

    if (body.profile) {
      data.profile = {
        ...data.profile,
        ...body.profile,
      };
    }

    if (Array.isArray(body.fishVarieties)) {
      data.fishVarieties = body.fishVarieties;
    }

    await saveVaultData(data);
    const summary = getCashFlowSummary(data);

    return NextResponse.json({
      success: true,
      data,
      summary,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

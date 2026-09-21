import { NextResponse } from 'next/server';
import { isVaultUnlocked, getVaultData, saveVaultData, getCashFlowSummary } from '@/lib/storage';
import { SupplierKhata, Transaction } from '@/types/accounts';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(req: Request) {
  if (!(await isVaultUnlocked())) {
    return NextResponse.json({ error: 'Vault is locked' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { action } = body;
    const data = await getVaultData();
    const todayStr = new Date().toISOString().split('T')[0];

    if (action === 'CREATE_SUPPLIER') {
      const { name, phone, location, notes, initialBalance } = body;
      if (!name || !name.trim()) {
        return NextResponse.json({ error: 'Supplier name is required' }, { status: 400 });
      }

      const bal = parseFloat(initialBalance) || 0;
      const newSupplier: SupplierKhata = {
        id: `supp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        name: name.trim(),
        phone: phone?.trim() || '',
        location: location?.trim() || '',
        notes: notes?.trim() || '',
        totalBilled: bal,
        totalPaid: 0,
        currentBalance: bal,
        lastUpdated: todayStr,
        history: bal > 0 ? [
          {
            id: `sh_${Date.now()}`,
            date: todayStr,
            type: 'STOCK_INWARD',
            amount: bal,
            notes: 'Opening balance payable',
          }
        ] : [],
      };

      data.suppliers.unshift(newSupplier);
      await saveVaultData(data);
      return NextResponse.json({ success: true, supplier: newSupplier, summary: getCashFlowSummary(data) });
    }

    if (action === 'ADD_BILL') {
      const { supplierId, amount, notes, date } = body;
      const numAmount = parseFloat(amount);
      if (isNaN(numAmount) || numAmount <= 0) {
        return NextResponse.json({ error: 'Valid bill amount required' }, { status: 400 });
      }

      const supplier = data.suppliers.find((s) => s.id === supplierId);
      if (!supplier) {
        return NextResponse.json({ error: 'Supplier not found' }, { status: 404 });
      }

      const txDate = date || todayStr;
      supplier.totalBilled += numAmount;
      supplier.currentBalance = supplier.totalBilled - supplier.totalPaid;
      supplier.lastUpdated = txDate;
      supplier.history.unshift({
        id: `sh_${Date.now()}`,
        date: txDate,
        type: 'STOCK_INWARD',
        amount: numAmount,
        notes: notes?.trim() || 'Dry fish stock inward credit',
      });

      await saveVaultData(data);
      return NextResponse.json({ success: true, supplier, summary: getCashFlowSummary(data) });
    }

    if (action === 'RECORD_PAYMENT') {
      const { supplierId, amount, paymentMode, notes, date } = body;
      const numAmount = parseFloat(amount);
      if (isNaN(numAmount) || numAmount <= 0) {
        return NextResponse.json({ error: 'Valid payment amount required' }, { status: 400 });
      }

      const supplier = data.suppliers.find((s) => s.id === supplierId);
      if (!supplier) {
        return NextResponse.json({ error: 'Supplier not found' }, { status: 404 });
      }

      const txDate = date || todayStr;
      const mode = paymentMode === 'UPI' ? 'UPI' : 'CASH';

      supplier.totalPaid += numAmount;
      supplier.currentBalance = supplier.totalBilled - supplier.totalPaid;
      supplier.lastUpdated = txDate;
      supplier.history.unshift({
        id: `sh_${Date.now()}`,
        date: txDate,
        type: 'PAYMENT_MADE',
        amount: numAmount,
        paymentMode: mode,
        notes: notes?.trim() || `Paid to ${supplier.name}`,
      });

      // Automatically create an OUTFLOW transaction from cash/UPI register!
      const newTx: Transaction = {
        id: `tx_${Date.now()}`,
        date: txDate,
        timestamp: Date.now(),
        type: 'OUTFLOW',
        category: 'SUPPLIER_PAYMENT',
        amount: numAmount,
        paymentMode: mode,
        title: `Supplier Payment: ${supplier.name}`,
        notes: notes?.trim() || undefined,
        supplierKhataId: supplier.id,
      };
      data.transactions.unshift(newTx);

      await saveVaultData(data);
      return NextResponse.json({ success: true, supplier, transaction: newTx, summary: getCashFlowSummary(data) });
    }

    if (action === 'DELETE_SUPPLIER') {
      const { supplierId } = body;
      data.suppliers = data.suppliers.filter((s) => s.id !== supplierId);
      await saveVaultData(data);
      return NextResponse.json({ success: true, summary: getCashFlowSummary(data) });
    }

    return NextResponse.json({ error: 'Invalid action specified' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

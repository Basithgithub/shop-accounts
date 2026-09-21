import { NextResponse } from 'next/server';
import { isVaultUnlocked, getVaultData, saveVaultData, getCashFlowSummary } from '@/lib/storage';
import { Transaction } from '@/types/accounts';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(req: Request) {
  if (!(await isVaultUnlocked())) {
    return NextResponse.json({ error: 'Vault is locked' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      type,
      category,
      amount,
      paymentMode,
      title,
      date,
      notes,
      customerCount,
      fishVariety,
      quantityKg,
      customerKhataId,
      supplierKhataId,
      purchaseBatchId,
    } = body;

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return NextResponse.json({ error: 'Valid positive amount is required' }, { status: 400 });
    }

    if (!type || (type !== 'INFLOW' && type !== 'OUTFLOW')) {
      return NextResponse.json({ error: 'Transaction type must be INFLOW or OUTFLOW' }, { status: 400 });
    }

    if (!paymentMode || (paymentMode !== 'CASH' && paymentMode !== 'UPI')) {
      return NextResponse.json({ error: 'Payment mode must be CASH or UPI' }, { status: 400 });
    }

    const data = await getVaultData();
    data.purchaseBatches = data.purchaseBatches || [];
    const txDate = date || new Date().toISOString().split('T')[0];

    let batchProfitAmount: number | undefined;
    let batchProfitPct: number | undefined;

    // If linked to an active purchase batch (Daily sales recovering purchase cost)
    if (purchaseBatchId && type === 'INFLOW') {
      const batch = data.purchaseBatches.find((b) => b.id === purchaseBatchId);
      if (batch) {
        batch.salesEntries = batch.salesEntries || [];
        batch.salesEntries.unshift({
          transactionId: `tx_${Date.now()}`,
          date: txDate,
          amount: numAmount,
          paymentMode,
          notes: title,
        });
        // recompute metrics
        const salesSum = batch.salesEntries.reduce((acc, s) => acc + s.amount, 0);
        batch.totalSalesAmount = Math.round(salesSum * 100) / 100;
        batch.profitOrLossAmount = Math.round((batch.totalSalesAmount - batch.totalCost) * 100) / 100;
        batch.profitOrLossPercentage = batch.totalCost > 0
          ? Math.round(((batch.profitOrLossAmount / batch.totalCost) * 100) * 100) / 100
          : 0;

        batchProfitAmount = batch.profitOrLossAmount;
        batchProfitPct = batch.profitOrLossPercentage;
      }
    }

    const newTx: Transaction = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      date: txDate,
      timestamp: Date.now(),
      type,
      category: category || (type === 'INFLOW' ? 'DAILY_SALES_FULL' : 'OTHER_EXPENSE'),
      amount: numAmount,
      paymentMode,
      title: title?.trim() || (type === 'INFLOW' ? 'Retail Fish Sales' : 'Shop Expense'),
      notes: notes?.trim() || undefined,
      customerCount: customerCount ? parseInt(customerCount, 10) : undefined,
      fishVariety: fishVariety?.trim() || undefined,
      quantityKg: quantityKg ? parseFloat(quantityKg) : undefined,
      customerKhataId: customerKhataId || undefined,
      supplierKhataId: supplierKhataId || undefined,
      purchaseBatchId: purchaseBatchId || undefined,
      profitOrLoss: batchProfitAmount,
      profitPercentage: batchProfitPct,
    };

    // If this transaction is linked to a customer repayment
    if (customerKhataId && type === 'INFLOW') {
      const customer = data.customers.find((c) => c.id === customerKhataId);
      if (customer) {
        customer.totalRepaid = (customer.totalRepaid || 0) + numAmount;
        customer.currentBalance = customer.totalCreditGiven - customer.totalRepaid;
        customer.lastUpdated = txDate;
        customer.history.unshift({
          id: `kh_${Date.now()}`,
          date: txDate,
          type: 'PAYMENT_RECEIVED',
          amount: numAmount,
          paymentMode,
          notes: title,
        });
      }
    }

    // If this transaction is linked to a supplier payment
    if (supplierKhataId && type === 'OUTFLOW') {
      const supplier = data.suppliers.find((s) => s.id === supplierKhataId);
      if (supplier) {
        supplier.totalPaid = (supplier.totalPaid || 0) + numAmount;
        supplier.currentBalance = supplier.totalBilled - supplier.totalPaid;
        supplier.lastUpdated = txDate;
        supplier.history.unshift({
          id: `sh_${Date.now()}`,
          date: txDate,
          type: 'PAYMENT_MADE',
          amount: numAmount,
          paymentMode,
          notes: title,
        });
      }
    }

    // Add to transaction list (newest first)
    data.transactions.unshift(newTx);
    await saveVaultData(data);

    const summary = getCashFlowSummary(data);

    return NextResponse.json({
      success: true,
      transaction: newTx,
      summary,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  if (!(await isVaultUnlocked())) {
    return NextResponse.json({ error: 'Vault is locked' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Transaction ID is required' }, { status: 400 });
    }

    const data = await getVaultData();
    const index = data.transactions.findIndex((t) => t.id === id);

    if (index === -1) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    const removedTx = data.transactions[index];

    // If linked to batch, remove from batch sales
    if (removedTx.purchaseBatchId && data.purchaseBatches) {
      const batch = data.purchaseBatches.find((b) => b.id === removedTx.purchaseBatchId);
      if (batch && batch.salesEntries) {
        batch.salesEntries = batch.salesEntries.filter((s) => s.transactionId !== removedTx.id);
        const salesSum = batch.salesEntries.reduce((acc, s) => acc + s.amount, 0);
        batch.totalSalesAmount = Math.round(salesSum * 100) / 100;
        batch.profitOrLossAmount = Math.round((batch.totalSalesAmount - batch.totalCost) * 100) / 100;
        batch.profitOrLossPercentage = batch.totalCost > 0
          ? Math.round(((batch.profitOrLossAmount / batch.totalCost) * 100) * 100) / 100
          : 0;
      }
    }

    data.transactions.splice(index, 1);
    await saveVaultData(data);

    const summary = getCashFlowSummary(data);

    return NextResponse.json({
      success: true,
      message: 'Transaction deleted successfully',
      summary,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}


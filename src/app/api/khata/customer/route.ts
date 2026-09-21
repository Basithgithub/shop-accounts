import { NextResponse } from 'next/server';
import { isVaultUnlocked, getVaultData, saveVaultData, getCashFlowSummary } from '@/lib/storage';
import { CustomerKhata, Transaction } from '@/types/accounts';

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

    if (action === 'CREATE_CUSTOMER') {
      const { name, phone, address, notes, initialCredit } = body;
      if (!name || !name.trim()) {
        return NextResponse.json({ error: 'Customer name is required' }, { status: 400 });
      }

      const credit = parseFloat(initialCredit) || 0;
      const newCustomer: CustomerKhata = {
        id: `cust_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        name: name.trim(),
        phone: phone?.trim() || '',
        address: address?.trim() || '',
        notes: notes?.trim() || '',
        totalCreditGiven: credit,
        totalRepaid: 0,
        currentBalance: credit,
        lastUpdated: todayStr,
        history: credit > 0 ? [
          {
            id: `kh_${Date.now()}`,
            date: todayStr,
            type: 'CREDIT_GIVEN',
            amount: credit,
            notes: 'Opening credit balance',
          }
        ] : [],
      };

      data.customers.unshift(newCustomer);
      await saveVaultData(data);
      return NextResponse.json({ success: true, customer: newCustomer, summary: getCashFlowSummary(data) });
    }

    if (action === 'ADD_CREDIT') {
      const { customerId, amount, notes, date } = body;
      const numAmount = parseFloat(amount);
      if (isNaN(numAmount) || numAmount <= 0) {
        return NextResponse.json({ error: 'Valid credit amount required' }, { status: 400 });
      }

      const customer = data.customers.find((c) => c.id === customerId);
      if (!customer) {
        return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
      }

      const txDate = date || todayStr;
      customer.totalCreditGiven += numAmount;
      customer.currentBalance = customer.totalCreditGiven - customer.totalRepaid;
      customer.lastUpdated = txDate;
      customer.history.unshift({
        id: `kh_${Date.now()}`,
        date: txDate,
        type: 'CREDIT_GIVEN',
        amount: numAmount,
        notes: notes?.trim() || 'Dry fish retail credit taken',
      });

      await saveVaultData(data);
      return NextResponse.json({ success: true, customer, summary: getCashFlowSummary(data) });
    }

    if (action === 'RECORD_PAYMENT') {
      const { customerId, amount, paymentMode, notes, date } = body;
      const numAmount = parseFloat(amount);
      if (isNaN(numAmount) || numAmount <= 0) {
        return NextResponse.json({ error: 'Valid payment amount required' }, { status: 400 });
      }

      const customer = data.customers.find((c) => c.id === customerId);
      if (!customer) {
        return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
      }

      const txDate = date || todayStr;
      const mode = paymentMode === 'UPI' ? 'UPI' : 'CASH';

      customer.totalRepaid += numAmount;
      customer.currentBalance = customer.totalCreditGiven - customer.totalRepaid;
      customer.lastUpdated = txDate;
      customer.history.unshift({
        id: `kh_${Date.now()}`,
        date: txDate,
        type: 'PAYMENT_RECEIVED',
        amount: numAmount,
        paymentMode: mode,
        notes: notes?.trim() || `Repayment from ${customer.name}`,
      });

      // Automatically create an INFLOW transaction into cash/UPI register!
      const newTx: Transaction = {
        id: `tx_${Date.now()}`,
        date: txDate,
        timestamp: Date.now(),
        type: 'INFLOW',
        category: 'CUSTOMER_UDHAAR_SETTLE',
        amount: numAmount,
        paymentMode: mode,
        title: `Udhaar Repayment: ${customer.name}`,
        notes: notes?.trim() || undefined,
        customerKhataId: customer.id,
      };
      data.transactions.unshift(newTx);

      await saveVaultData(data);
      return NextResponse.json({ success: true, customer, transaction: newTx, summary: getCashFlowSummary(data) });
    }

    if (action === 'DELETE_CUSTOMER') {
      const { customerId } = body;
      data.customers = data.customers.filter((c) => c.id !== customerId);
      await saveVaultData(data);
      return NextResponse.json({ success: true, summary: getCashFlowSummary(data) });
    }

    return NextResponse.json({ error: 'Invalid action specified' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

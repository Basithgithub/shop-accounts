import { NextResponse } from 'next/server';
import {
  isVaultUnlocked,
  getVaultData,
  saveVaultData,
  getCashFlowSummary,
  recomputeBatchMetrics,
} from '@/lib/storage';
import { PurchaseBatch, Transaction } from '@/types/accounts';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  if (!(await isVaultUnlocked())) {
    return NextResponse.json({ error: 'Vault is locked' }, { status: 401 });
  }

  try {
    const data = await getVaultData();
    data.purchaseBatches = data.purchaseBatches || [];
    data.purchaseBatches.forEach(recomputeBatchMetrics);

    return NextResponse.json({
      success: true,
      batches: data.purchaseBatches,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  if (!(await isVaultUnlocked())) {
    return NextResponse.json({ error: 'Vault is locked' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { action } = body;
    const data = await getVaultData();
    data.purchaseBatches = data.purchaseBatches || [];
    const todayStr = new Date().toISOString().split('T')[0];

    // 1. Create a new Dry Fish Purchase Batch
    if (action === 'CREATE_BATCH') {
      const {
        batchName,
        fishVariety,
        quantityKg,
        purchaseAmount,
        additionalCost,
        paymentMode,
        supplierName,
        date,
      } = body;

      const numPurchase = parseFloat(purchaseAmount);
      if (isNaN(numPurchase) || numPurchase <= 0) {
        return NextResponse.json({ error: 'Valid purchase amount is required' }, { status: 400 });
      }

      const numAddCost = parseFloat(additionalCost) || 0;
      const numKg = quantityKg ? parseFloat(quantityKg) : undefined;
      const isCreditUnpaid = body.paymentStatus === 'UNPAID' || body.isPayAfterSales === true;
      const mode = paymentMode === 'UPI' ? 'UPI' : 'CASH';
      const batchDate = date || todayStr;
      const totalCost = numPurchase + numAddCost;
      const paidAmount = isCreditUnpaid ? 0 : totalCost;
      const supplierDues = isCreditUnpaid ? totalCost : 0;
      const suppName = supplierName?.trim() || (isCreditUnpaid ? 'Dry Fish Wholesale Supplier' : undefined);

      const newBatch: PurchaseBatch = {
        id: `batch_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        batchName: batchName?.trim() || `Lot: ${fishVariety} ${numKg ? `(${numKg}kg)` : ''}`,
        fishVariety: fishVariety?.trim() || 'Dry Fish',
        quantityKg: numKg,
        purchaseAmount: numPurchase,
        additionalCost: numAddCost,
        totalCost,
        paymentMode: mode,
        paymentStatus: isCreditUnpaid ? 'UNPAID' : 'PAID',
        paidAmount,
        supplierDues,
        datePurchased: batchDate,
        supplierName: suppName,
        status: 'ACTIVE',
        totalSalesAmount: 0,
        profitOrLossAmount: -totalCost,
        profitOrLossPercentage: -100,
        salesEntries: [],
      };

      data.purchaseBatches.unshift(newBatch);

      let createdTx: Transaction | undefined;

      if (!isCreditUnpaid) {
        // Paid immediately from Drawer / Bank: create OUTFLOW transaction
        createdTx = {
          id: `tx_${Date.now()}`,
          date: batchDate,
          timestamp: Date.now(),
          type: 'OUTFLOW',
          category: 'FISH_STOCK_PURCHASE',
          amount: totalCost,
          paymentMode: mode,
          title: `Purchased Stock: ${newBatch.batchName}`,
          fishVariety: newBatch.fishVariety,
          quantityKg: numKg,
          purchaseBatchId: newBatch.id,
          notes: `Initial purchase ₹${numPurchase}${numAddCost > 0 ? ` + ₹${numAddCost} freight/salt` : ''}`,
        };
        data.transactions.unshift(createdTx);
      } else if (suppName) {
        // Bought on credit: record in Supplier Khata
        let supplier = data.suppliers.find((s) => s.name.toLowerCase() === suppName.toLowerCase());
        if (!supplier) {
          supplier = {
            id: `supp_${Date.now()}`,
            name: suppName,
            phone: '',
            location: 'Harbor / Wholesale',
            totalBilled: 0,
            totalPaid: 0,
            currentBalance: 0,
            lastUpdated: batchDate,
            history: [],
          };
          data.suppliers.push(supplier);
        }
        supplier.totalBilled += totalCost;
        supplier.currentBalance += totalCost;
        supplier.lastUpdated = batchDate;
        supplier.history.unshift({
          id: `sh_${Date.now()}`,
          date: batchDate,
          type: 'STOCK_INWARD',
          amount: totalCost,
          notes: `Credit purchase for batch: ${newBatch.batchName} (To pay after sales)`,
        });
      }

      await saveVaultData(data);
      const summary = getCashFlowSummary(data);

      return NextResponse.json({
        success: true,
        batch: newBatch,
        transaction: createdTx,
        summary,
      });
    }

    // 2. Pay Supplier from Sales for a Batch
    if (action === 'PAY_BATCH_SUPPLIER') {
      const { batchId, amount, paymentMode: payMode, notes } = body;
      const batch = data.purchaseBatches.find((b) => b.id === batchId);
      if (!batch) {
        return NextResponse.json({ error: 'Batch not found' }, { status: 404 });
      }

      const payAmount = parseFloat(amount);
      if (isNaN(payAmount) || payAmount <= 0) {
        return NextResponse.json({ error: 'Valid payment amount is required' }, { status: 400 });
      }

      const mode = payMode === 'UPI' ? 'UPI' : 'CASH';
      batch.paidAmount = (batch.paidAmount || 0) + payAmount;
      batch.supplierDues = Math.max(0, (batch.supplierDues || batch.totalCost) - payAmount);
      if (batch.supplierDues === 0) {
        batch.paymentStatus = 'PAID';
      } else {
        batch.paymentStatus = 'PARTIAL';
      }

      // Record OUTFLOW
      const tx: Transaction = {
        id: `tx_${Date.now()}`,
        date: todayStr,
        timestamp: Date.now(),
        type: 'OUTFLOW',
        category: 'SUPPLIER_PAYMENT',
        amount: payAmount,
        paymentMode: mode,
        title: `Supplier Payment for ${batch.batchName}`,
        purchaseBatchId: batch.id,
        notes: notes?.trim() || `Paid from sales to ${batch.supplierName || 'supplier'}`,
      };
      data.transactions.unshift(tx);

      // Update supplier khata
      if (batch.supplierName) {
        const supp = data.suppliers.find((s) => s.name.toLowerCase() === batch.supplierName?.toLowerCase());
        if (supp) {
          supp.totalPaid += payAmount;
          supp.currentBalance = Math.max(0, supp.currentBalance - payAmount);
          supp.lastUpdated = todayStr;
          supp.history.unshift({
            id: `sh_${Date.now()}`,
            date: todayStr,
            type: 'PAYMENT_MADE',
            amount: payAmount,
            paymentMode: mode,
            notes: `Paid for ${batch.batchName}`,
          });
        }
      }

      await saveVaultData(data);
      const summary = getCashFlowSummary(data);

      return NextResponse.json({
        success: true,
        batch,
        transaction: tx,
        summary,
      });
    }

    // 2. Close Purchase Batch (Save and archive final profit/loss and percentage)
    if (action === 'CLOSE_BATCH') {
      const { batchId, closureNotes } = body;
      const batch = data.purchaseBatches.find((b) => b.id === batchId);

      if (!batch) {
        return NextResponse.json({ error: 'Purchase batch not found' }, { status: 404 });
      }

      recomputeBatchMetrics(batch);
      batch.status = 'CLOSED';
      batch.dateClosed = todayStr;
      batch.closureNotes = closureNotes?.trim() || undefined;

      await saveVaultData(data);
      const summary = getCashFlowSummary(data);

      return NextResponse.json({
        success: true,
        message: `Batch "${batch.batchName}" closed successfully with ${batch.profitOrLossPercentage >= 0 ? '+' : ''}${batch.profitOrLossPercentage}% profit!`,
        batch,
        summary,
      });
    }

    // 3. Re-open Batch
    if (action === 'REOPEN_BATCH') {
      const { batchId } = body;
      const batch = data.purchaseBatches.find((b) => b.id === batchId);
      if (!batch) {
        return NextResponse.json({ error: 'Batch not found' }, { status: 404 });
      }
      batch.status = 'ACTIVE';
      batch.dateClosed = undefined;
      recomputeBatchMetrics(batch);

      await saveVaultData(data);
      return NextResponse.json({ success: true, batch, summary: getCashFlowSummary(data) });
    }

    // 4. Delete Batch
    if (action === 'DELETE_BATCH') {
      const { batchId } = body;
      data.purchaseBatches = data.purchaseBatches.filter((b) => b.id !== batchId);
      await saveVaultData(data);
      return NextResponse.json({ success: true, summary: getCashFlowSummary(data) });
    }

    // 5. Update / Edit Batch (edit purchase amount, supplier dues, variety, dates, etc.)
    if (action === 'UPDATE_BATCH') {
      const {
        batchId,
        batchName,
        fishVariety,
        quantityKg,
        purchaseAmount,
        additionalCost,
        supplierDues,
        datePurchased,
        supplierName,
        paymentStatus,
      } = body;

      const batch = data.purchaseBatches.find((b) => b.id === batchId);
      if (!batch) {
        return NextResponse.json({ error: 'Purchase batch not found' }, { status: 404 });
      }

      if (purchaseAmount !== undefined) {
        const numPurchase = parseFloat(purchaseAmount);
        if (!isNaN(numPurchase) && numPurchase >= 0) {
          batch.purchaseAmount = numPurchase;
        }
      }

      if (additionalCost !== undefined) {
        const numAdd = parseFloat(additionalCost);
        if (!isNaN(numAdd) && numAdd >= 0) {
          batch.additionalCost = numAdd;
        }
      }

      if (batchName?.trim()) {
        batch.batchName = batchName.trim();
      }

      if (fishVariety?.trim()) {
        batch.fishVariety = fishVariety.trim();
      }

      if (quantityKg !== undefined) {
        const numKg = parseFloat(quantityKg);
        batch.quantityKg = !isNaN(numKg) && numKg > 0 ? numKg : undefined;
      }

      if (datePurchased) {
        batch.datePurchased = datePurchased;
      }

      if (supplierName !== undefined) {
        batch.supplierName = supplierName.trim() || undefined;
      }

      if (paymentStatus) {
        batch.paymentStatus = paymentStatus;
      }

      if (supplierDues !== undefined) {
        const numDues = parseFloat(supplierDues);
        if (!isNaN(numDues) && numDues >= 0) {
          batch.supplierDues = numDues;
          if (batch.supplierName) {
            const supp = data.suppliers.find((s) => s.name.toLowerCase() === batch.supplierName?.toLowerCase());
            if (supp) {
              supp.currentBalance = numDues;
              supp.totalBilled = Math.max(supp.totalBilled, numDues);
            }
          }
        }
      }

      recomputeBatchMetrics(batch);
      await saveVaultData(data);
      const summary = getCashFlowSummary(data);

      return NextResponse.json({
        success: true,
        batch,
        summary,
      });
    }

    return NextResponse.json({ error: 'Invalid action specified' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

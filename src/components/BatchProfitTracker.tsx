'use client';

import React, { useState } from 'react';
import {
  Package,
  Plus,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Scale,
  Calendar,
  IndianRupee,
  Clock,
  Archive,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Sparkles,
  Truck,
  Pencil,
  AlertCircle,
} from 'lucide-react';
import { PurchaseBatch, ShopProfile, PaymentMode, PurchasePaymentStatus } from '@/types/accounts';
import { useTranslation } from '@/lib/i18n';

interface BatchProfitTrackerProps {
  batches: PurchaseBatch[];
  fishVarieties: string[];
  profile?: ShopProfile;
  onRefresh: () => void;
  onOpenSaleForBatch: (batchId: string, batchName: string) => void;
}

export default function BatchProfitTracker({
  batches,
  fishVarieties,
  profile,
  onRefresh,
  onOpenSaleForBatch,
}: BatchProfitTrackerProps) {
  const { t, isTamil } = useTranslation();
  const currency = profile?.currencySymbol || '₹';

  // Create Batch Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [batchName, setBatchName] = useState('');
  const [fishVariety, setFishVariety] = useState(fishVarieties[0] || 'Mixed Dry Fish / கலவை கருவாடு');
  const [quantityKg, setQuantityKg] = useState('');
  const [purchaseAmount, setPurchaseAmount] = useState('');
  const [additionalCost, setAdditionalCost] = useState('');
  const [isPayAfterSales, setIsPayAfterSales] = useState(true);
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('CASH');
  const [supplierName, setSupplierName] = useState('');
  const [loading, setLoading] = useState(false);

  // Edit Batch Modal
  const [editTargetBatch, setEditTargetBatch] = useState<PurchaseBatch | null>(null);
  const [editBatchName, setEditBatchName] = useState('');
  const [editFishVariety, setEditFishVariety] = useState('');
  const [editQuantityKg, setEditQuantityKg] = useState('');
  const [editPurchaseAmount, setEditPurchaseAmount] = useState('');
  const [editAdditionalCost, setEditAdditionalCost] = useState('');
  const [editSupplierDues, setEditSupplierDues] = useState('');
  const [editDatePurchased, setEditDatePurchased] = useState('');
  const [editSupplierName, setEditSupplierName] = useState('');

  // Close Batch Modal
  const [closeTargetBatch, setCloseTargetBatch] = useState<PurchaseBatch | null>(null);
  const [closureNotes, setClosureNotes] = useState('');

  // Pay Supplier Modal
  const [payTargetBatch, setPayTargetBatch] = useState<PurchaseBatch | null>(null);
  const [payAmount, setPayAmount] = useState('');
  const [payMode, setPayMode] = useState<PaymentMode>('CASH');
  const [payNotes, setPayNotes] = useState('');

  // Expand sales entries
  const [expandedBatchId, setExpandedBatchId] = useState<string | null>(null);

  // Tab
  const [tab, setTab] = useState<'ACTIVE' | 'CLOSED'>('ACTIVE');

  const activeBatches = batches.filter((b) => b.status === 'ACTIVE');
  const closedBatches = batches.filter((b) => b.status === 'CLOSED');

  const handleOpenEditModal = (batch: PurchaseBatch) => {
    setEditTargetBatch(batch);
    setEditBatchName(batch.batchName);
    setEditFishVariety(batch.fishVariety);
    setEditQuantityKg(batch.quantityKg ? String(batch.quantityKg) : '');
    setEditPurchaseAmount(String(batch.purchaseAmount || ''));
    setEditAdditionalCost(String(batch.additionalCost || '0'));
    setEditSupplierDues(String(batch.supplierDues !== undefined ? batch.supplierDues : (batch.paymentStatus === 'UNPAID' ? batch.totalCost : 0)));
    setEditDatePurchased(batch.datePurchased || new Date().toISOString().split('T')[0]);
    setEditSupplierName(batch.supplierName || '');
  };

  const handleSaveEditBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTargetBatch) return;

    setLoading(true);
    try {
      const res = await fetch('/api/batches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'UPDATE_BATCH',
          batchId: editTargetBatch.id,
          batchName: editBatchName,
          fishVariety: editFishVariety,
          quantityKg: editQuantityKg ? parseFloat(editQuantityKg) : undefined,
          purchaseAmount: parseFloat(editPurchaseAmount) || 0,
          additionalCost: parseFloat(editAdditionalCost) || 0,
          supplierDues: parseFloat(editSupplierDues) || 0,
          datePurchased: editDatePurchased,
          supplierName: editSupplierName,
        }),
      });

      if (res.ok) {
        setEditTargetBatch(null);
        onRefresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    const numPurchase = parseFloat(purchaseAmount);
    if (isNaN(numPurchase) || numPurchase <= 0) return;

    setLoading(true);
    try {
      const res = await fetch('/api/batches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'CREATE_BATCH',
          batchName: batchName.trim() || `Lot: ${fishVariety} ${quantityKg ? `(${quantityKg}kg)` : ''}`,
          fishVariety,
          quantityKg: quantityKg ? parseFloat(quantityKg) : undefined,
          purchaseAmount: numPurchase,
          additionalCost: parseFloat(additionalCost) || 0,
          paymentMode,
          paymentStatus: isPayAfterSales ? 'UNPAID' : 'PAID',
          isPayAfterSales,
          supplierName: supplierName.trim() || undefined,
        }),
      });

      if (res.ok) {
        setBatchName('');
        setQuantityKg('');
        setPurchaseAmount('');
        setAdditionalCost('');
        setSupplierName('');
        setShowCreateModal(false);
        onRefresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseBatch = async () => {
    if (!closeTargetBatch) return;
    setLoading(true);
    try {
      const res = await fetch('/api/batches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'CLOSE_BATCH',
          batchId: closeTargetBatch.id,
          closureNotes,
        }),
      });

      if (res.ok) {
        setCloseTargetBatch(null);
        setClosureNotes('');
        onRefresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReopenBatch = async (batchId: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/batches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'REOPEN_BATCH',
          batchId,
        }),
      });
      if (res.ok) {
        onRefresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePaySupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payTargetBatch) return;
    const num = parseFloat(payAmount);
    if (isNaN(num) || num <= 0) return;

    setLoading(true);
    try {
      const res = await fetch('/api/batches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'PAY_BATCH_SUPPLIER',
          batchId: payTargetBatch.id,
          amount: num,
          paymentMode: payMode,
          notes: payNotes,
        }),
      });

      if (res.ok) {
        setPayTargetBatch(null);
        setPayAmount('');
        setPayNotes('');
        onRefresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden mb-6">
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-50 to-white">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              {t.batchesHeading}
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {t.batchesSubheading}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Active / Closed Tabs */}
          <div className="flex rounded-lg bg-slate-100 p-1 text-xs font-semibold">
            <button
              onClick={() => setTab('ACTIVE')}
              className={`px-3 py-1.5 rounded-md transition ${
                tab === 'ACTIVE'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {t.activeBatchesTab} ({activeBatches.length})
            </button>
            <button
              onClick={() => setTab('CLOSED')}
              className={`px-3 py-1.5 rounded-md transition ${
                tab === 'CLOSED'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {t.closedBatchesTab} ({closedBatches.length})
            </button>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>{t.addNewBatch}</span>
          </button>
        </div>
      </div>

      {/* Batches Content */}
      <div className="p-4 sm:p-6 space-y-4">
        {tab === 'ACTIVE' && activeBatches.length === 0 && (
          <div className="text-center py-10 text-slate-400">
            <Package className="w-10 h-10 mx-auto mb-2 opacity-40 text-slate-400" />
            <p className="text-sm font-medium">{t.noBatchesYet}</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-3 text-xs font-semibold text-sky-600 hover:text-sky-700 underline"
            >
              {t.addNewBatch}
            </button>
          </div>
        )}

        {tab === 'CLOSED' && closedBatches.length === 0 && (
          <div className="text-center py-10 text-slate-400">
            <Archive className="w-10 h-10 mx-auto mb-2 opacity-40 text-slate-400" />
            <p className="text-sm font-medium">
              {isTamil ? 'முடிக்கப்பட்ட பேட்ச்கள் எதுவும் இல்லை.' : 'No closed batches yet.'}
            </p>
          </div>
        )}

        {/* Render Batches */}
        {(tab === 'ACTIVE' ? activeBatches : closedBatches).map((batch) => {
          const isClosed = batch.status === 'CLOSED';
          const recoveryPercent = batch.totalCost > 0
            ? Math.min(100, Math.round((batch.totalSalesAmount / batch.totalCost) * 100))
            : 0;
          const isProfitable = batch.profitOrLossAmount > 0;
          const isBreakEven = batch.profitOrLossAmount === 0 && batch.totalSalesAmount > 0;
          const isUnpaidCredit = batch.paymentStatus === 'UNPAID' || (batch.supplierDues && batch.supplierDues > 0);
          const isExpanded = expandedBatchId === batch.id;
          const neededToBreakEven = Math.max(0, batch.totalCost - batch.totalSalesAmount);

          return (
            <div
              key={batch.id}
              className={`rounded-2xl border transition overflow-hidden ${
                isClosed
                  ? 'border-slate-200 bg-slate-50/50'
                  : isProfitable
                  ? 'border-emerald-200 bg-emerald-50/20'
                  : 'border-slate-200/90 bg-white hover:border-slate-300'
              }`}
            >
              {/* Batch Top Header */}
              <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-bold text-slate-900">
                      {batch.batchName}
                    </h3>

                    {/* Variety Tag */}
                    <span className="text-[11px] font-semibold bg-sky-100 text-sky-800 px-2.5 py-0.5 rounded-full">
                      {batch.fishVariety}
                    </span>

                    {/* Quantity if available */}
                    {batch.quantityKg && (
                      <span className="text-[11px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <Scale className="w-3 h-3 text-slate-500" />
                        {batch.quantityKg} kg
                      </span>
                    )}

                    {/* Payment Status Badges */}
                    {isUnpaidCredit ? (
                      <span className="text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                        <Truck className="w-3 h-3 text-amber-700" />
                        {t.payAfterSalesBadge} (₹{(batch.supplierDues || batch.totalCost).toLocaleString('en-IN')})
                      </span>
                    ) : (
                      <span className="text-[11px] font-medium bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                        {isTamil ? 'உடனடி செலுத்தியது' : 'Paid Upfront'}
                      </span>
                    )}

                    {isClosed && (
                      <span className="text-[11px] font-bold bg-slate-200 text-slate-700 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-slate-600" />
                        {isTamil ? 'முடிக்கப்பட்டது' : 'Closed Lot'}
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-slate-500 flex items-center gap-3 flex-wrap">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {batch.datePurchased}
                    </span>
                    {batch.supplierName && (
                      <span className="flex items-center gap-1">
                        <Truck className="w-3.5 h-3.5 text-slate-400" />
                        {batch.supplierName}
                      </span>
                    )}
                    {isClosed && batch.dateClosed && (
                      <span className="text-slate-400">
                        • {isTamil ? 'முடிந்த தேதி:' : 'Closed on:'} {batch.dateClosed}
                      </span>
                    )}
                  </div>
                </div>

                {/* Profit/Loss Badge & Edit Button */}
                <div className="flex items-center gap-3 sm:text-right">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                      {isProfitable
                        ? t.netProfitRealized
                        : isBreakEven
                        ? (isTamil ? 'அடக்கவிலை அடைந்தது' : 'Break Even')
                        : t.netLossSoFar}
                    </span>
                    <div className="flex items-baseline gap-1 sm:justify-end">
                      <span
                        className={`text-lg sm:text-xl font-black ${
                          isProfitable
                            ? 'text-emerald-600'
                            : isBreakEven
                            ? 'text-sky-600'
                            : 'text-amber-700'
                        }`}
                      >
                        {isProfitable ? '+' : ''}
                        {currency}{Math.abs(batch.profitOrLossAmount).toLocaleString('en-IN')}
                      </span>
                      <span
                        className={`text-xs font-bold ${
                          isProfitable
                            ? 'text-emerald-600'
                            : isBreakEven
                            ? 'text-sky-600'
                            : 'text-amber-700'
                        }`}
                      >
                        ({isProfitable ? '+' : ''}{batch.profitOrLossPercentage}%)
                      </span>
                    </div>
                  </div>

                  {/* Edit Batch button */}
                  <button
                    onClick={() => handleOpenEditModal(batch)}
                    className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                    title={isTamil ? 'கொள்முதல் விவரங்களை திருத்து' : 'Edit Lot Details'}
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Financial Progress & KPI Bar */}
              <div className="p-4 sm:p-5 space-y-3">
                {/* 4 Metric Columns */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  {/* Total Purchase Cost */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="text-slate-500 font-medium block">
                      {t.batchCost}
                    </span>
                    <span className="text-sm sm:text-base font-bold text-slate-900 mt-0.5 block">
                      {currency}{batch.totalCost.toLocaleString('en-IN')}
                    </span>
                    {batch.additionalCost ? (
                      <span className="text-[10px] text-slate-400">
                        (₹{batch.purchaseAmount} + ₹{batch.additionalCost} {isTamil ? 'செலவு' : 'freight'})
                      </span>
                    ) : null}
                  </div>

                  {/* Supplier Pending Dues */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="text-slate-500 font-medium block">
                      {isTamil ? 'சப்ளையர் பாக்கி' : 'Supplier Due'}
                    </span>
                    <span className={`text-sm sm:text-base font-bold mt-0.5 block ${
                      (batch.supplierDues || 0) > 0 ? 'text-rose-600' : 'text-emerald-600'
                    }`}>
                      {currency}{(batch.supplierDues ?? (batch.paymentStatus === 'UNPAID' ? batch.totalCost : 0)).toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {isTamil ? 'விற்பனைக்கு பின் தரவேண்டியது' : 'To pay after sales'}
                    </span>
                  </div>

                  {/* Sales Realized */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="text-slate-500 font-medium block">
                      {t.salesRecovery}
                    </span>
                    <span className="text-sm sm:text-base font-bold text-sky-700 mt-0.5 block">
                      {currency}{batch.totalSalesAmount.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {batch.salesEntries.length} {isTamil ? 'விற்பனை பதிவுகள்' : 'sales sessions'}
                    </span>
                  </div>

                  {/* Net Realized Profit/Loss */}
                  <div className={`p-3 rounded-xl border ${
                    isProfitable
                      ? 'bg-emerald-50/60 border-emerald-100'
                      : 'bg-amber-50/60 border-amber-100'
                  }`}>
                    <span className="text-slate-500 font-medium block">
                      {t.profitOrLoss} ({t.profitPercent})
                    </span>
                    <span
                      className={`text-sm sm:text-base font-black mt-0.5 block ${
                        isProfitable ? 'text-emerald-700' : 'text-amber-800'
                      }`}
                    >
                      {isProfitable ? '+' : ''}
                      {currency}{batch.profitOrLossAmount.toLocaleString('en-IN')} ({batch.profitOrLossPercentage}%)
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {isProfitable
                        ? (isTamil ? 'லாபம் பெறப்பட்டது' : 'In pure profit')
                        : (isTamil ? `ரூ ${neededToBreakEven} மீதமுள்ளது` : `₹${neededToBreakEven} to recover`)}
                    </span>
                  </div>
                </div>

                {/* Progress Bar (Visual Recovery) */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                      {isProfitable ? (
                        <>
                          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700 font-bold">{t.targetCovered}</span>
                        </>
                      ) : (
                        <span>
                          {recoveryPercent}% {t.recoveredOf} {currency}{batch.totalCost.toLocaleString('en-IN')}
                        </span>
                      )}
                    </span>
                    {!isProfitable && (
                      <span className="text-amber-800 font-semibold text-[11px]">
                        {currency}{neededToBreakEven.toLocaleString('en-IN')} {t.neededToBreakEven}
                      </span>
                    )}
                  </div>

                  <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden relative">
                    <div
                      className={`h-full transition-all duration-500 rounded-full ${
                        isProfitable
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                          : 'bg-gradient-to-r from-sky-500 to-cyan-400'
                      }`}
                      style={{ width: `${Math.min(100, (batch.totalSalesAmount / (batch.totalCost || 1)) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Batch Action Buttons */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    {/* View Sales Entries dropdown */}
                    <button
                      onClick={() => setExpandedBatchId(isExpanded ? null : batch.id)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition"
                    >
                      <span>
                        {isTamil ? 'விற்பனை பட்டியல்' : 'Sales History'} ({batch.salesEntries.length})
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>

                    {/* Edit Lot Details */}
                    <button
                      onClick={() => handleOpenEditModal(batch)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition"
                    >
                      <Pencil className="w-3.5 h-3.5 text-slate-400" />
                      <span>{isTamil ? 'திருத்து' : 'Edit Lot'}</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Pay Supplier button if due */}
                    {!isClosed && (batch.supplierDues || 0) > 0 && (
                      <button
                        onClick={() => {
                          setPayTargetBatch(batch);
                          setPayAmount(String(batch.supplierDues || ''));
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold shadow-sm transition"
                        title="Pay supplier from retail sales"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        <span>{isTamil ? 'சப்ளையருக்கு கொடு' : 'Pay Supplier'}</span>
                      </button>
                    )}

                    {/* Add Daily Sale for this batch */}
                    {!isClosed && (
                      <button
                        onClick={() => onOpenSaleForBatch(batch.id, batch.batchName)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-sm transition active:scale-95"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{t.recordSaleForBatch}</span>
                      </button>
                    )}

                    {/* Close Batch & Lock Profit */}
                    {!isClosed && (
                      <button
                        onClick={() => setCloseTargetBatch(batch)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition"
                        title="Close batch and permanently lock profit"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-slate-500" />
                        <span>{t.closeBatchBtn}</span>
                      </button>
                    )}

                    {/* Reopen Batch if closed */}
                    {isClosed && (
                      <button
                        onClick={() => handleReopenBatch(batch.id)}
                        disabled={loading}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 rounded-lg text-xs font-semibold transition"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>{t.reopenBatchBtn}</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Expanded Sales Entries List */}
                {isExpanded && (
                  <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs">
                    <h4 className="font-bold text-slate-800 mb-2">
                      {isTamil ? 'இந்த பேட்சில் பதிவான விற்பனைகள்:' : 'Daily Sales Entries for this Batch:'}
                    </h4>
                    {batch.salesEntries.length === 0 ? (
                      <p className="text-slate-400 italic">
                        {isTamil
                          ? 'விற்பனை பதிவுகள் எதுவும் இல்லை. மேலே உள்ள "+ விற்பனையை சேர்" பொத்தானை கிளிக் செய்யவும்.'
                          : 'No sales recorded yet. Click "+ Add Daily Sale" above to log sales.'}
                      </p>
                    ) : (
                      <div className="divide-y divide-slate-200">
                        {batch.salesEntries.map((entry, idx) => (
                          <div key={entry.transactionId || idx} className="py-2 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-[10px]">
                                {idx + 1}
                              </span>
                              <div>
                                <span className="font-semibold text-slate-900 block">
                                  {entry.notes || (isTamil ? 'தினசரி விற்பனை' : 'Daily Sales')}
                                </span>
                                <span className="text-[11px] text-slate-400">
                                  {entry.date} • {entry.paymentMode === 'UPI' ? 'UPI' : (isTamil ? 'ரொக்கம்' : 'Cash')}
                                </span>
                              </div>
                            </div>
                            <span className="font-bold text-emerald-600 text-sm">
                              +{currency}{entry.amount.toLocaleString('en-IN')}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Edit Purchase Batch & Supplier Dues */}
      {editTargetBatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 max-h-[92vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              {isTamil ? 'கொள்முதல் & சப்ளையர் பாக்கி திருத்துதல்' : 'Edit Lot Purchase & Supplier Dues'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              {isTamil ? 'கொள்முதல் தொகை, சப்ளையர் பாக்கி மற்றும் விபரங்களை திருத்தவும்' : 'Update purchase cost, balance owed to supplier, and lot details'}
            </p>

            <form onSubmit={handleSaveEditBatch} className="space-y-3 text-xs">
              {/* Batch Name */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {isTamil ? 'பேட்ச் பெயர்' : 'Batch / Lot Label'} *
                </label>
                <input
                  type="text"
                  required
                  value={editBatchName}
                  onChange={(e) => setEditBatchName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              {/* Fish Variety */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {t.fishVariety} *
                </label>
                <select
                  value={editFishVariety}
                  onChange={(e) => setEditFishVariety(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
                >
                  {fishVarieties.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>

              {/* Purchase Amount & Supplier Dues */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {t.batchCost} (₹) *
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={editPurchaseAmount}
                    onChange={(e) => setEditPurchaseAmount(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-black text-slate-900 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-amber-900 mb-1">
                    {isTamil ? 'சப்ளையர் பாக்கி (₹)' : 'Supplier Due (₹)'} *
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={editSupplierDues}
                    onChange={(e) => setEditSupplierDues(e.target.value)}
                    className="w-full px-3 py-2 border border-amber-300 rounded-lg text-xs font-black text-rose-600 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Additional Cost & Weight */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {isTamil ? 'கூடுதல் செலவு (உப்பு/வண்டி)' : 'Additional Cost (₹)'}
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={editAdditionalCost}
                    onChange={(e) => setEditAdditionalCost(e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {t.quantityKg}
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={editQuantityKg}
                    onChange={(e) => setEditQuantityKg(e.target.value)}
                    placeholder="25"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              {/* Purchase Date & Supplier Name */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {t.datePurchased}
                  </label>
                  <input
                    type="date"
                    required
                    value={editDatePurchased}
                    onChange={(e) => setEditDatePurchased(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {t.supplierName}
                  </label>
                  <input
                    type="text"
                    value={editSupplierName}
                    onChange={(e) => setEditSupplierName(e.target.value)}
                    placeholder={isTamil ? 'சப்ளையர் பெயர்' : 'Supplier Name'}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditTargetBatch(null)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold text-xs"
                >
                  {t.cancelBtn}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg font-bold text-xs shadow-sm transition"
                >
                  {loading ? (isTamil ? 'சேமிக்கிறது...' : 'Saving...') : (isTamil ? 'மாற்றங்களை சேமி' : 'Save Changes')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Create New Purchase Batch */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              {t.addNewBatch}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              {isTamil
                ? 'புதிய கருவாடு மூட்டை/பேட்ச் விவரங்களை உள்ளிடவும்'
                : 'Enter details of inward dry fish stock batch'}
            </p>

            <form onSubmit={handleCreateBatch} className="space-y-3 text-xs">
              {/* Fish Variety */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {t.fishVariety} *
                </label>
                <select
                  value={fishVariety}
                  onChange={(e) => setFishVariety(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
                >
                  {fishVarieties.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>

              {/* Batch Name */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {isTamil ? 'பேட்ச் பெயர்' : 'Batch / Lot Label'}
                </label>
                <input
                  type="text"
                  value={batchName}
                  onChange={(e) => setBatchName(e.target.value)}
                  placeholder={isTamil ? 'எ.கா: Lot #2: நெத்திலி 20kg' : 'e.g. Lot #2: Anchovy 20kg'}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              {/* Purchase Amount & Quantity */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {t.batchCost} (₹) *
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={purchaseAmount}
                    onChange={(e) => setPurchaseAmount(e.target.value)}
                    placeholder="16500"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {t.quantityKg}
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={quantityKg}
                    onChange={(e) => setQuantityKg(e.target.value)}
                    placeholder="25"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Additional Cost (Freight / Salt) */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {isTamil ? 'கூடுதல் செலவு (போக்குவரத்து / உப்பு)' : 'Additional Cost (Freight/Salt) (₹)'}
                </label>
                <input
                  type="number"
                  step="any"
                  value={additionalCost}
                  onChange={(e) => setAdditionalCost(e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              {/* Supplier Credit / Pay After Sales toggle */}
              <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3">
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-amber-950 text-xs">
                  <input
                    type="checkbox"
                    checked={isPayAfterSales}
                    onChange={(e) => setIsPayAfterSales(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                  />
                  <span>
                    {isTamil
                      ? 'விற்பனைக்கு பின் பணம் (சப்ளையர் கடன் - கல்லாவிலிருந்து எடுக்க வேண்டாம்)'
                      : 'Pay After Sales (Supplier Credit - Do not deduct from drawer now)'}
                  </span>
                </label>
                <p className="text-[11px] text-amber-800 mt-1 pl-6">
                  {isTamil
                    ? 'தொகை சப்ளையர் பாக்கியாக பதிவு செய்யப்படும். விற்பனை ஆன பிறகு தொகையை செலுத்தலாம்.'
                    : 'Recorded as supplier debt to be paid after daily sales recovery.'}
                </p>
              </div>

              {/* Payment Channel if paid now */}
              {!isPayAfterSales && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {t.paymentModeLabel}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMode('CASH')}
                      className={`py-2 rounded-lg font-semibold text-xs border ${
                        paymentMode === 'CASH'
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                          : 'border-slate-200 text-slate-600'
                      }`}
                    >
                      {t.cashMode}
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMode('UPI')}
                      className={`py-2 rounded-lg font-semibold text-xs border ${
                        paymentMode === 'UPI'
                          ? 'bg-sky-50 border-sky-500 text-sky-700'
                          : 'border-slate-200 text-slate-600'
                      }`}
                    >
                      {t.upiMode}
                    </button>
                  </div>
                </div>
              )}

              {/* Supplier Name */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {t.supplierName}
                </label>
                <input
                  type="text"
                  value={supplierName}
                  onChange={(e) => setSupplierName(e.target.value)}
                  placeholder={isTamil ? 'எ.கா: திருச்சி / துறைமுக சப்ளையர்' : 'e.g. Harbor Merchant'}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              {/* Form Buttons */}
              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold text-xs"
                >
                  {t.cancelBtn}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg font-bold text-xs shadow-sm transition"
                >
                  {loading ? (isTamil ? 'சேமிக்கிறது...' : 'Saving...') : t.saveBtn}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Pay Supplier from Sales */}
      {payTargetBatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              {isTamil ? 'சப்ளையருக்கு பணம் செலுத்து' : 'Pay Supplier from Sales'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              {payTargetBatch.batchName} • {isTamil ? 'பாக்கி:' : 'Balance Due:'}{' '}
              <strong className="text-rose-600">
                {currency}{(payTargetBatch.supplierDues || payTargetBatch.totalCost).toLocaleString('en-IN')}
              </strong>
            </p>

            <form onSubmit={handlePaySupplier} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {isTamil ? 'செலுத்தும் தொகை (₹)' : 'Payment Amount (₹)'} *
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  placeholder="16500"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {t.paymentModeLabel}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPayMode('CASH')}
                    className={`py-2 rounded-lg font-semibold text-xs border ${
                      payMode === 'CASH'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    {t.cashMode}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPayMode('UPI')}
                    className={`py-2 rounded-lg font-semibold text-xs border ${
                      payMode === 'UPI'
                        ? 'bg-sky-50 border-sky-500 text-sky-700'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    {t.upiMode}
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {t.notesLabel}
                </label>
                <input
                  type="text"
                  value={payNotes}
                  onChange={(e) => setPayNotes(e.target.value)}
                  placeholder={isTamil ? 'விற்பனை பணத்திலிருந்து கொடுத்தது' : 'Paid from daily sales'}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setPayTargetBatch(null)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold text-xs"
                >
                  {t.cancelBtn}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-bold text-xs shadow-sm transition"
                >
                  {loading ? (isTamil ? 'செலுத்துகிறது...' : 'Paying...') : (isTamil ? 'பணம் செலுத்து' : 'Confirm Payment')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Close Batch & Lock Profit */}
      {closeTargetBatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              {t.closeBatchBtn}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              {closeTargetBatch.batchName}
            </p>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 mb-4 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">{t.batchCost}:</span>
                <span className="font-bold text-slate-900">
                  {currency}{closeTargetBatch.totalCost.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">{t.salesRecovery}:</span>
                <span className="font-bold text-sky-700">
                  {currency}{closeTargetBatch.totalSalesAmount.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2">
                <span className="font-bold text-slate-800">{t.profitOrLoss}:</span>
                <span
                  className={`font-black ${
                    closeTargetBatch.profitOrLossAmount >= 0
                      ? 'text-emerald-600'
                      : 'text-amber-700'
                  }`}
                >
                  {closeTargetBatch.profitOrLossAmount >= 0 ? '+' : ''}
                  {currency}{closeTargetBatch.profitOrLossAmount.toLocaleString('en-IN')} (
                  {closeTargetBatch.profitOrLossPercentage}%)
                </span>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {isTamil ? 'முடிவு குறிப்பு (விருப்பமானது)' : 'Closure Notes (Optional)'}
              </label>
              <textarea
                value={closureNotes}
                onChange={(e) => setClosureNotes(e.target.value)}
                placeholder={isTamil ? 'எ.கா: முழு பேட்சும் வெற்றிகரமாக விற்று முடிந்தது' : 'e.g. All stock sold out'}
                rows={2}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setCloseTargetBatch(null)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold text-xs"
              >
                {t.cancelBtn}
              </button>
              <button
                type="button"
                onClick={handleCloseBatch}
                disabled={loading}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs shadow-sm transition"
              >
                {loading ? (isTamil ? 'பூட்டுகிறது...' : 'Locking...') : (isTamil ? 'லாபத்தை சேமித்து முடி' : 'Lock Final Profit')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

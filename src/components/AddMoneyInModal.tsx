'use client';

import React, { useState, useEffect } from 'react';
import { X, ArrowDownLeft, Sparkles } from 'lucide-react';
import { PaymentMode, PurchaseBatch } from '@/types/accounts';
import { useTranslation } from '@/lib/i18n';

interface AddMoneyInModalProps {
  isOpen: boolean;
  onClose: () => void;
  batches: PurchaseBatch[];
  initialBatchId?: string;
  onSuccess: () => void;
}

export default function AddMoneyInModal({
  isOpen,
  onClose,
  batches,
  initialBatchId,
  onSuccess,
}: AddMoneyInModalProps) {
  const { t, isTamil } = useTranslation();
  const [amount, setAmount] = useState('');
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('CASH');
  const [selectedBatchId, setSelectedBatchId] = useState(initialBatchId || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const activeBatches = batches.filter((b) => b.status === 'ACTIVE');

  useEffect(() => {
    if (initialBatchId) {
      setSelectedBatchId(initialBatchId);
    } else if (activeBatches.length > 0 && !selectedBatchId) {
      setSelectedBatchId(activeBatches[0].id);
    }
  }, [initialBatchId, activeBatches, selectedBatchId]);

  if (!isOpen) return null;

  const targetBatch = activeBatches.find((b) => b.id === selectedBatchId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError(isTamil ? 'சரியான விற்பனை தொகையை உள்ளிடவும்' : 'Please enter a valid amount');
      return;
    }

    setLoading(true);
    setError('');

    // Automatically generate title from batch or default
    const autoTitle = targetBatch
      ? (isTamil ? `விற்பனை: ${targetBatch.batchName}` : `Sales: ${targetBatch.batchName}`)
      : (isTamil ? 'தினசரி சில்லறை விற்பனை' : 'Daily Retail Sales');

    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'INFLOW',
          category: 'DAILY_SALES_FULL',
          amount: numAmount,
          paymentMode,
          title: autoTitle,
          date,
          notes: notes.trim() || undefined,
          purchaseBatchId: selectedBatchId || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to record sales');
      } else {
        setAmount('');
        setNotes('');
        onSuccess();
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ArrowDownLeft className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                {isTamil ? 'விற்பனை வரவு சேர்த்தல்' : 'Record Daily Sales (+)'}
              </h3>
              <p className="text-xs text-slate-500">
                {isTamil ? 'சில்லறை விற்பனை பணத்தை சேர்க்கவும்' : 'Add retail sales to counter cash or UPI'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-3 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          {/* 1. Amount & Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {t.amountLabel} *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 font-bold">₹</span>
                <input
                  type="number"
                  step="any"
                  required
                  autoFocus
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="2500"
                  className="w-full pl-7 pr-3 py-2 border border-slate-300 rounded-lg text-base font-black text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {t.dateLabel} *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-800"
              />
            </div>
          </div>

          {/* 2. Payment Channel: Cash vs UPI */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              {t.paymentModeLabel} *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMode('CASH')}
                className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-bold transition ${
                  paymentMode === 'CASH'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-500/20 shadow-sm'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>💵 {t.cashMode}</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMode('UPI')}
                className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-bold transition ${
                  paymentMode === 'UPI'
                    ? 'border-sky-500 bg-sky-50 text-sky-800 ring-2 ring-sky-500/20 shadow-sm'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>📱 {t.upiMode}</span>
              </button>
            </div>
          </div>

          {/* 3. Batch Selection (Link to Dry Fish Batch) */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              {t.selectBatchLabel}
            </label>
            {activeBatches.length > 0 ? (
              <select
                value={selectedBatchId}
                onChange={(e) => setSelectedBatchId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="">
                  {isTamil ? '-- பேட்ச் தேர்வு செய்யவில்லை (பொது விற்பனை) --' : '-- None (General Daily Sales) --'}
                </option>
                {activeBatches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.batchName} (அடக்கவிலை: ₹{b.totalCost.toLocaleString('en-IN')})
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-slate-400 italic text-[11px]">
                {isTamil ? 'செயலில் உள்ள பேட்ச்கள் எதுவும் இல்லை' : 'No active batches available'}
              </p>
            )}

            {/* Live Profit & Break-Even Preview */}
            {targetBatch && amount && parseFloat(amount) > 0 && (
              <div className="mt-2 p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl">
                <div className="flex items-center gap-1.5 text-emerald-900 font-bold text-xs mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{isTamil ? 'லாப முன்னேற்ற முன்னோட்டம்:' : 'Lot Recovery Preview:'}</span>
                </div>
                <div className="text-[11px] text-emerald-800 space-y-0.5">
                  <p>
                    {isTamil ? 'விற்பனை தொகை:' : 'Total Sales:'}{' '}
                    ₹{targetBatch.totalSalesAmount.toLocaleString('en-IN')} + ₹{amount} ={' '}
                    <strong>₹{(targetBatch.totalSalesAmount + parseFloat(amount)).toLocaleString('en-IN')}</strong>
                  </p>
                  <p>
                    {isTamil ? 'அடக்கவிலை மீட்பு:' : 'Recovery:'}{' '}
                    <strong>
                      {Math.min(100, Math.round(((targetBatch.totalSalesAmount + parseFloat(amount)) / targetBatch.totalCost) * 100))}%
                    </strong>{' '}
                    of ₹{targetBatch.totalCost.toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* 4. Notes (Optional) */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              {t.notesLabel}
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={isTamil ? 'கூடுதல் குறிப்புகள் (விருப்பமானது)' : 'Optional notes'}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
            />
          </div>

          {/* Submit Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold"
            >
              {t.cancelBtn}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold shadow-sm transition"
            >
              {loading ? (isTamil ? 'பதிவாகிறது...' : 'Saving...') : t.saveBtn}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { X, MinusCircle, ArrowUpRight, Scale, Package, Store, Truck, Home } from 'lucide-react';
import { SupplierKhata, PaymentMode, OutflowCategory } from '@/types/accounts';
import { useTranslation } from '@/lib/i18n';

interface AddMoneyOutModalProps {
  isOpen: boolean;
  onClose: () => void;
  suppliers: SupplierKhata[];
  fishVarieties: string[];
  onSuccess: () => void;
}

export default function AddMoneyOutModal({
  isOpen,
  onClose,
  suppliers,
  fishVarieties,
  onSuccess,
}: AddMoneyOutModalProps) {
  const { t, isTamil } = useTranslation();
  const [outflowType, setOutflowType] = useState<'FISH_STOCK' | 'PACKAGING' | 'OVERHEAD' | 'SUPPLIER_PAY' | 'DRAWING'>('FISH_STOCK');
  const [category, setCategory] = useState<OutflowCategory>('FISH_STOCK_PURCHASE');
  const [amount, setAmount] = useState('');
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('CASH');
  const [title, setTitle] = useState(isTamil ? 'கருவாடு கொள்முதல்' : 'Dry Fish Stock Purchase');
  const [fishVariety, setFishVariety] = useState(fishVarieties[0] || 'Mixed Dry Fish / கலவை கருவாடு');
  const [quantityKg, setQuantityKg] = useState('');
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleTypeChange = (type: 'FISH_STOCK' | 'PACKAGING' | 'OVERHEAD' | 'SUPPLIER_PAY' | 'DRAWING') => {
    setOutflowType(type);
    if (type === 'FISH_STOCK') {
      setCategory('FISH_STOCK_PURCHASE');
      setTitle(isTamil ? `கொள்முதல்: ${fishVariety}` : `Stock: ${fishVariety}`);
    } else if (type === 'PACKAGING') {
      setCategory('PACKAGING_AND_POUCHES');
      setTitle(isTamil ? 'பேக்கிங் கவர் & உப்பு' : 'Pouches, Salt & Packaging');
    } else if (type === 'OVERHEAD') {
      setCategory('STALL_RENT_AND_POWER');
      setTitle(isTamil ? 'கடை வாடகை / மின்சாரம் / வண்டி வாடகை' : 'Rent, Power & Freight');
    } else if (type === 'SUPPLIER_PAY') {
      setCategory('SUPPLIER_PAYMENT');
      setTitle(isTamil ? 'சப்ளையர் பாக்கி செலுத்தியது' : 'Supplier Balance Settlement');
    } else {
      setCategory('OWNER_DRAWING');
      setTitle(isTamil ? 'வீட்டு செலவு எடுத்தது' : 'Owner Personal Drawing');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError(isTamil ? 'சரியான தொகையை உள்ளிடவும்' : 'Please enter a valid amount');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'OUTFLOW',
          category,
          amount: numAmount,
          paymentMode,
          title,
          date,
          notes,
          fishVariety: outflowType === 'FISH_STOCK' ? fishVariety : undefined,
          quantityKg: outflowType === 'FISH_STOCK' && quantityKg ? parseFloat(quantityKg) : undefined,
          supplierKhataId: outflowType === 'SUPPLIER_PAY' ? selectedSupplierId : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to record expense');
      } else {
        setAmount('');
        setNotes('');
        setQuantityKg('');
        onSuccess();
        onClose();
      }
    } catch {
      setError(isTamil ? 'சர்வர் தொடர்பு பிழை' : 'Error communicating with server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <ArrowUpRight className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                {isTamil ? 'பண செலவு பதிவு (Money Out)' : 'Record Money Out (-)'}
              </h3>
              <p className="text-xs text-slate-500">
                {isTamil ? 'கருவாடு கொள்முதல், கடை செலவு & சப்ளையர் செலுத்துதல்' : 'Stock purchases, retail expenses & supplier payments'}
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

        {/* Expense Category Tabs */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-5 gap-1.5 bg-slate-100 p-1.5 rounded-xl text-[11px] font-semibold">
          <button
            type="button"
            onClick={() => handleTypeChange('FISH_STOCK')}
            className={`py-1.5 px-2 rounded-lg transition text-center ${
              outflowType === 'FISH_STOCK'
                ? 'bg-white text-rose-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {isTamil ? 'கொள்முதல்' : 'Fish Stock'}
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange('PACKAGING')}
            className={`py-1.5 px-2 rounded-lg transition text-center ${
              outflowType === 'PACKAGING'
                ? 'bg-white text-rose-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {isTamil ? 'பேக்கிங்/உப்பு' : 'Packing'}
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange('OVERHEAD')}
            className={`py-1.5 px-2 rounded-lg transition text-center ${
              outflowType === 'OVERHEAD'
                ? 'bg-white text-rose-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {isTamil ? 'வாடகை/வண்டி' : 'Rent/Power'}
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange('SUPPLIER_PAY')}
            className={`py-1.5 px-2 rounded-lg transition text-center ${
              outflowType === 'SUPPLIER_PAY'
                ? 'bg-white text-rose-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {isTamil ? 'சப்ளையர்' : 'Supplier'}
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange('DRAWING')}
            className={`py-1.5 px-2 rounded-lg transition text-center ${
              outflowType === 'DRAWING'
                ? 'bg-white text-rose-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {isTamil ? 'வீட்டு செலவு' : 'Drawing'}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          {/* Amount & Date */}
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
                  placeholder="1500"
                  className="w-full pl-7 pr-3 py-2 border border-slate-300 rounded-lg text-base font-black text-slate-900 focus:ring-2 focus:ring-rose-500 focus:outline-none"
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
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-none text-slate-800"
              />
            </div>
          </div>

          {/* Payment Channel: Cash vs UPI */}
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
                    ? 'border-rose-500 bg-rose-50 text-rose-800 ring-2 ring-rose-500/20'
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
                    ? 'border-sky-500 bg-sky-50 text-sky-800 ring-2 ring-sky-500/20'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>📱 {t.upiMode}</span>
              </button>
            </div>
          </div>

          {/* Fish Stock Details */}
          {outflowType === 'FISH_STOCK' && (
            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {t.fishVariety}
                </label>
                <select
                  value={fishVariety}
                  onChange={(e) => {
                    setFishVariety(e.target.value);
                    setTitle(isTamil ? `கொள்முதல்: ${e.target.value}` : `Stock: ${e.target.value}`);
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                >
                  {fishVarieties.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {t.quantityKg}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-slate-400">
                    <Scale className="w-3.5 h-3.5" />
                  </span>
                  <input
                    type="number"
                    step="any"
                    value={quantityKg}
                    onChange={(e) => setQuantityKg(e.target.value)}
                    placeholder="25"
                    className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Supplier Selection */}
          {outflowType === 'SUPPLIER_PAY' && (
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {t.supplierName} *
              </label>
              <select
                value={selectedSupplierId}
                onChange={(e) => setSelectedSupplierId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium"
              >
                <option value="">{isTamil ? '-- சப்ளையரை தேர்வு செய்க --' : '-- Select Supplier --'}</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({isTamil ? 'பாக்கி:' : 'Due:'} ₹{s.currentBalance.toLocaleString('en-IN')})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Title & Notes */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              {isTamil ? 'தலைப்பு / செலவு விபரம்' : 'Description / Title'}
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              {t.notesLabel}
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={isTamil ? 'கூடுதல் விபரம் (விருப்பமானது)' : 'Optional notes / remarks'}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
            />
          </div>

          {/* Action Buttons */}
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
              className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-bold shadow-sm transition"
            >
              {loading ? (isTamil ? 'பதிவாகிறது...' : 'Saving...') : t.saveBtn}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

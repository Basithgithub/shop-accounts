'use client';

import React, { useState } from 'react';
import {
  Building2,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  Phone,
  Truck,
  IndianRupee,
  Check,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { SupplierKhata, ShopProfile } from '@/types/accounts';
import { useTranslation } from '@/lib/i18n';

interface KhataSectionProps {
  suppliers: SupplierKhata[];
  profile?: ShopProfile;
  onRefresh: () => void;
}

export default function KhataSection({
  suppliers,
  profile,
  onRefresh,
}: KhataSectionProps) {
  const { t, isTamil } = useTranslation();
  const currency = profile?.currencySymbol || '₹';

  // Supplier Modals
  const [showAddSupplier, setShowAddSupplier] = useState(false);
  const [newSuppName, setNewSuppName] = useState('');
  const [newSuppPhone, setNewSuppPhone] = useState('');
  const [newSuppLocation, setNewSuppLocation] = useState('');

  const [billModalSupp, setBillModalSupp] = useState<SupplierKhata | null>(null);
  const [billAmount, setBillAmount] = useState('');
  const [billNote, setBillNote] = useState('');

  const [paySuppModal, setPaySuppModal] = useState<SupplierKhata | null>(null);
  const [paySuppAmount, setPaySuppAmount] = useState('');
  const [paySuppMode, setPaySuppMode] = useState<'CASH' | 'UPI'>('CASH');

  const [expandedId, setExpandedId] = useState<string | null>(null);

  const totalOwed = suppliers.reduce(
    (acc, s) => acc + (s.currentBalance > 0 ? s.currentBalance : 0),
    0
  );

  const handleCreateSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSuppName.trim()) return;

    await fetch('/api/khata/supplier', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'CREATE_SUPPLIER',
        name: newSuppName,
        phone: newSuppPhone,
        location: newSuppLocation,
      }),
    });
    setNewSuppName('');
    setNewSuppPhone('');
    setNewSuppLocation('');
    setShowAddSupplier(false);
    onRefresh();
  };

  const handleAddBill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!billModalSupp || !billAmount) return;

    await fetch('/api/khata/supplier', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'ADD_BILL',
        supplierId: billModalSupp.id,
        amount: parseFloat(billAmount),
        notes: billNote,
      }),
    });
    setBillModalSupp(null);
    setBillAmount('');
    setBillNote('');
    onRefresh();
  };

  const handlePaySupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paySuppModal || !paySuppAmount) return;

    await fetch('/api/khata/supplier', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'RECORD_PAYMENT',
        supplierId: paySuppModal.id,
        amount: parseFloat(paySuppAmount),
        paymentMode: paySuppMode,
        notes: isTamil ? 'சப்ளையர் பாக்கி செலுத்தியது' : 'Settlement of supplier balance',
      }),
    });
    setPaySuppModal(null);
    setPaySuppAmount('');
    onRefresh();
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden mb-6">
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-50 to-white">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              {t.supplierHeading}
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {t.supplierSubheading}
          </p>
        </div>

        {/* Total Owed & Add Supplier */}
        <div className="flex items-center gap-3">
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-1.5 text-right">
            <span className="text-[10px] uppercase font-bold text-amber-800 block">
              {t.totalOwedToSuppliers}
            </span>
            <span className="text-sm sm:text-base font-black text-rose-700">
              {currency}{totalOwed.toLocaleString('en-IN')}
            </span>
          </div>

          <button
            onClick={() => setShowAddSupplier(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>{t.addSupplier}</span>
          </button>
        </div>
      </div>

      {/* Supplier List */}
      <div className="p-4 sm:p-6">
        {suppliers.length === 0 ? (
          <div className="text-center py-10 text-slate-400">
            <Building2 className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p className="text-sm font-medium">{t.noSuppliersYet}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {suppliers.map((supp) => {
              const isExpanded = expandedId === supp.id;
              const hasBalance = supp.currentBalance > 0;

              return (
                <div
                  key={supp.id}
                  className={`rounded-2xl border p-4 sm:p-5 transition ${
                    hasBalance
                      ? 'border-amber-200 bg-amber-50/10 hover:border-amber-300'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">
                        {supp.name}
                      </h3>
                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 flex-wrap">
                        {supp.location && (
                          <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                            {supp.location}
                          </span>
                        )}
                        {supp.phone && (
                          <span className="flex items-center gap-1 text-slate-600">
                            <Phone className="w-3 h-3 text-slate-400" />
                            {supp.phone}
                          </span>
                        )}
                      </div>
                      {supp.notes && (
                        <p className="text-[11px] text-slate-500 mt-1 italic">
                          {supp.notes}
                        </p>
                      )}
                    </div>

                    {/* Balance */}
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        {isTamil ? 'பாக்கி தொகை' : 'Balance Owed'}
                      </span>
                      <span
                        className={`text-lg font-black ${
                          hasBalance ? 'text-rose-600' : 'text-slate-400'
                        }`}
                      >
                        {currency}{supp.currentBalance.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  {/* Quick stats */}
                  <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-400 block">
                        {isTamil ? 'மொத்த சரக்கு பில்:' : 'Total Billed:'}
                      </span>
                      <span className="font-semibold text-slate-800">
                        {currency}{supp.totalBilled.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">
                        {isTamil ? 'செலுத்தியது:' : 'Total Paid:'}
                      </span>
                      <span className="font-semibold text-emerald-600">
                        {currency}{supp.totalPaid.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : supp.id)}
                      className="text-xs font-semibold text-slate-500 hover:text-slate-900 flex items-center gap-1"
                    >
                      <span>
                        {t.paymentHistory} ({supp.history.length})
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setBillModalSupp(supp)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition"
                      >
                        {isTamil ? '+ புதிய பில்' : '+ Inward Bill'}
                      </button>
                      <button
                        onClick={() => {
                          setPaySuppModal(supp);
                          setPaySuppAmount(String(supp.currentBalance || ''));
                        }}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-sm transition"
                      >
                        {t.paySupplierBtn}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Transaction History */}
                  {isExpanded && (
                    <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs">
                      {supp.history.length === 0 ? (
                        <p className="text-slate-400 italic">
                          {isTamil ? 'வரலாறு எதுவும் இல்லை' : 'No history yet'}
                        </p>
                      ) : (
                        <div className="divide-y divide-slate-200">
                          {supp.history.map((entry) => (
                            <div key={entry.id} className="py-1.5 flex items-center justify-between">
                              <div>
                                <span className="font-medium text-slate-800 block">
                                  {entry.notes || (entry.type === 'STOCK_INWARD' ? (isTamil ? 'சரக்கு வரவு' : 'Inward Stock') : (isTamil ? 'பணம் செலுத்தியது' : 'Payment'))}
                                </span>
                                <span className="text-[10px] text-slate-400">
                                  {entry.date} {entry.paymentMode ? `• ${entry.paymentMode}` : ''}
                                </span>
                              </div>
                              <span
                                className={`font-bold ${
                                  entry.type === 'STOCK_INWARD'
                                    ? 'text-rose-600'
                                    : 'text-emerald-600'
                                }`}
                              >
                                {entry.type === 'STOCK_INWARD' ? '+' : '-'}
                                {currency}{entry.amount.toLocaleString('en-IN')}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Supplier Modal */}
      {showAddSupplier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              {t.addSupplier}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              {isTamil ? 'மீனவர் அல்லது மொத்த வியாபாரி விவரங்களை உள்ளிடவும்' : 'Add dry fish supplier / harbor merchant'}
            </p>

            <form onSubmit={handleCreateSupplier} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {t.supplierName} *
                </label>
                <input
                  type="text"
                  required
                  value={newSuppName}
                  onChange={(e) => setNewSuppName(e.target.value)}
                  placeholder={isTamil ? 'எ.கா: அந்தோணி - கன்னியாகுமரி துறைமுகம்' : 'e.g. Coastal Merchant'}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {t.supplierLocation}
                </label>
                <input
                  type="text"
                  value={newSuppLocation}
                  onChange={(e) => setNewSuppLocation(e.target.value)}
                  placeholder={isTamil ? 'எ.கா: திருச்சி / காசிமேடு' : 'e.g. Harbor / Market'}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {isTamil ? 'தொலைபேசி எண்' : 'Phone Number'}
                </label>
                <input
                  type="tel"
                  value={newSuppPhone}
                  onChange={(e) => setNewSuppPhone(e.target.value)}
                  placeholder="9876543210"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddSupplier(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold"
                >
                  {t.cancelBtn}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-bold shadow-sm"
                >
                  {t.saveBtn}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Inward Bill Modal */}
      {billModalSupp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              {isTamil ? 'புதிய கொள்முதல் பில் சேர்த்தல்' : 'Add Inward Bill'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">{billModalSupp.name}</p>

            <form onSubmit={handleAddBill} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {t.amountLabel} *
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  value={billAmount}
                  onChange={(e) => setBillAmount(e.target.value)}
                  placeholder="10000"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {t.notesLabel}
                </label>
                <input
                  type="text"
                  value={billNote}
                  onChange={(e) => setBillNote(e.target.value)}
                  placeholder={isTamil ? 'எ.கா: 30kg மாசி கருவாடு வந்தது' : 'e.g. Inward stock lot'}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setBillModalSupp(null)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold"
                >
                  {t.cancelBtn}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-bold shadow-sm"
                >
                  {t.saveBtn}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pay Supplier Modal */}
      {paySuppModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              {t.paySupplierBtn}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              {paySuppModal.name} • {isTamil ? 'பாக்கி:' : 'Balance:'}{' '}
              <strong className="text-rose-600">
                {currency}{paySuppModal.currentBalance.toLocaleString('en-IN')}
              </strong>
            </p>

            <form onSubmit={handlePaySupplier} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {t.amountLabel} *
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  value={paySuppAmount}
                  onChange={(e) => setPaySuppAmount(e.target.value)}
                  placeholder="5000"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {t.paymentModeLabel}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaySuppMode('CASH')}
                    className={`py-2 rounded-lg font-semibold text-xs border ${
                      paySuppMode === 'CASH'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    {t.cashMode}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaySuppMode('UPI')}
                    className={`py-2 rounded-lg font-semibold text-xs border ${
                      paySuppMode === 'UPI'
                        ? 'bg-sky-50 border-sky-500 text-sky-700'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    {t.upiMode}
                  </button>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setPaySuppModal(null)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold"
                >
                  {t.cancelBtn}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold shadow-sm"
                >
                  {t.paySupplierBtn}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

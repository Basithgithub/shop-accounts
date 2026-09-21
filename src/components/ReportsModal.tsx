'use client';

import React, { useState, useMemo } from 'react';
import { X, Printer, FileText, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { Transaction, ShopProfile, CashRegister } from '@/types/accounts';

interface ReportsModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  register: CashRegister;
  profile?: ShopProfile;
}

export default function ReportsModal({
  isOpen,
  onClose,
  transactions,
  register,
  profile,
}: ReportsModalProps) {
  const currency = profile?.currencySymbol || '₹';
  const [period, setPeriod] = useState<'TODAY' | 'WEEK' | 'MONTH' | 'ALL'>('TODAY');

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const monthPrefix = useMemo(() => todayStr.substring(0, 7), [todayStr]);
  const weekAgoStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().split('T')[0];
  }, []);

  const reportData = useMemo(() => {
    const filtered = transactions.filter((tx) => {
      if (tx.id === 'tx_init_1' || tx.id === 'tx_init_2') return false;
      if (period === 'TODAY') return tx.date === todayStr;
      if (period === 'WEEK') return tx.date >= weekAgoStr && tx.date <= todayStr;
      if (period === 'MONTH') return tx.date.startsWith(monthPrefix);
      return true;
    });

    let totalInflow = 0;
    let totalOutflow = 0;
    let cashInflow = 0;
    let upiInflow = 0;
    let cashOutflow = 0;
    let upiOutflow = 0;
    let totalFootfall = 0;
    let retailSalesRevenue = 0;

    const categoryBreakdown: Record<string, number> = {};

    filtered.forEach((tx) => {
      categoryBreakdown[tx.category] = (categoryBreakdown[tx.category] || 0) + tx.amount;

      if (tx.type === 'INFLOW') {
        totalInflow += tx.amount;
        if (tx.paymentMode === 'CASH') cashInflow += tx.amount;
        else upiInflow += tx.amount;

        if (
          tx.category === 'DAILY_SALES_MORNING' ||
          tx.category === 'DAILY_SALES_EVENING' ||
          tx.category === 'DAILY_SALES_FULL'
        ) {
          retailSalesRevenue += tx.amount;
          if (tx.customerCount) totalFootfall += tx.customerCount;
        }
      } else {
        totalOutflow += tx.amount;
        if (tx.paymentMode === 'CASH') cashOutflow += tx.amount;
        else upiOutflow += tx.amount;
      }
    });

    return {
      filtered,
      totalInflow,
      totalOutflow,
      netCashFlow: totalInflow - totalOutflow,
      cashInflow,
      upiInflow,
      cashOutflow,
      upiOutflow,
      totalFootfall,
      retailSalesRevenue,
      avgTicket: totalFootfall > 0 ? Math.round(retailSalesRevenue / totalFootfall) : 0,
      categoryBreakdown,
    };
  }, [transactions, period, todayStr, weekAgoStr, monthPrefix]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const getCategoryLabel = (cat: string) => {
    const map: Record<string, string> = {
      DAILY_SALES_MORNING: 'Morning Retail Sales',
      DAILY_SALES_EVENING: 'Evening Retail Sales',
      DAILY_SALES_FULL: 'Full Day Retail Sales',
      OWNER_CAPITAL: 'Owner Capital Added',
      OTHER_INFLOW: 'Other Inflows',
      FISH_STOCK_PURCHASE: 'Dry Fish Stock Purchases',
      PACKAGING_AND_POUCHES: 'Retail Packaging & Pouches',
      SALT_AND_PRESERVATIVES: 'Salt & Preservatives',
      MARKETING_AND_SAMPLES: 'Tasting Samples & Marketing',
      TRANSPORT_AND_LABOR: 'Transport & Harbor Porters',
      STALL_RENT_AND_POWER: 'Stall Rent & Electricity',
      SUPPLIER_PAYMENT: 'Supplier Debt Payments',
      OWNER_DRAWING: 'Owner Personal Drawings',
      OTHER_EXPENSE: 'Other Shop Expenses',
    };
    return map[cat] || cat;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between no-print">
          <div className="flex items-center gap-2.5">
            <FileText className="w-5 h-5 text-sky-400" />
            <div>
              <h3 className="font-bold text-base">Cash Flow Statement &amp; Analytics</h3>
              <p className="text-xs text-slate-400">{profile?.shopName || 'Dry Fish Shop'}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Statement</span>
            </button>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="px-6 py-3 bg-slate-100/80 border-b border-slate-200 flex items-center justify-between text-xs no-print">
          <span className="font-semibold text-slate-700">Select Time Window:</span>
          <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => setPeriod('TODAY')}
              className={`px-3 py-1 rounded-md transition ${period === 'TODAY' ? 'bg-sky-600 text-white font-bold' : 'text-slate-600'}`}
            >
              Today
            </button>
            <button
              onClick={() => setPeriod('WEEK')}
              className={`px-3 py-1 rounded-md transition ${period === 'WEEK' ? 'bg-sky-600 text-white font-bold' : 'text-slate-600'}`}
            >
              Last 7 Days
            </button>
            <button
              onClick={() => setPeriod('MONTH')}
              className={`px-3 py-1 rounded-md transition ${period === 'MONTH' ? 'bg-sky-600 text-white font-bold' : 'text-slate-600'}`}
            >
              This Month
            </button>
            <button
              onClick={() => setPeriod('ALL')}
              className={`px-3 py-1 rounded-md transition ${period === 'ALL' ? 'bg-sky-600 text-white font-bold' : 'text-slate-600'}`}
            >
              All Time
            </button>
          </div>
        </div>

        {/* Printable Statement Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Shop Header for Print */}
          <div className="border-b border-slate-200 pb-4 text-center">
            <h2 className="text-xl font-bold text-slate-900">{profile?.shopName || 'Dry Fish Shop'}</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Cash Flow &amp; Accounts Statement • Period:{' '}
              <strong className="text-slate-700">
                {period === 'TODAY' ? `Today (${todayStr})` : period === 'WEEK' ? 'Last 7 Days' : period === 'MONTH' ? `Month of ${monthPrefix}` : 'All Time'}
              </strong>
            </p>
          </div>

          {/* Key Statement Summary Grid */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl">
              <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider block">
                Total Inflow
              </span>
              <span className="text-lg font-black text-emerald-700">
                +{currency}{reportData.totalInflow.toLocaleString('en-IN')}
              </span>
              <div className="text-[10px] text-emerald-900 mt-1">
                Cash: {currency}{reportData.cashInflow} • UPI: {currency}{reportData.upiInflow}
              </div>
            </div>

            <div className="p-3 bg-rose-50/70 border border-rose-200 rounded-xl">
              <span className="text-[10px] uppercase font-bold text-rose-800 tracking-wider block">
                Total Outflow
              </span>
              <span className="text-lg font-black text-rose-700">
                -{currency}{reportData.totalOutflow.toLocaleString('en-IN')}
              </span>
              <div className="text-[10px] text-rose-900 mt-1">
                Cash: {currency}{reportData.cashOutflow} • UPI: {currency}{reportData.upiOutflow}
              </div>
            </div>

            <div className={`p-3 border rounded-xl ${reportData.netCashFlow >= 0 ? 'bg-sky-50/70 border-sky-200' : 'bg-amber-50/70 border-amber-200'}`}>
              <span className="text-[10px] uppercase font-bold text-slate-700 tracking-wider block">
                Net Cash Flow
              </span>
              <span className={`text-lg font-black ${reportData.netCashFlow >= 0 ? 'text-sky-700' : 'text-amber-700'}`}>
                {reportData.netCashFlow >= 0 ? '+' : ''}{currency}{reportData.netCashFlow.toLocaleString('en-IN')}
              </span>
              <div className="text-[10px] text-slate-500 mt-1">
                {reportData.netCashFlow >= 0 ? 'Surplus / Savings' : 'Deficit / Reinvestment'}
              </div>
            </div>
          </div>

          {/* Startup Retail Metrics Banner */}
          <div className="bg-indigo-50/60 border border-indigo-100 rounded-xl p-3 flex items-center justify-around text-xs text-indigo-900">
            <div>
              <span className="text-slate-500 block">Retail Footfall:</span>
              <strong className="text-sm font-bold">{reportData.totalFootfall} shoppers</strong>
            </div>
            <div className="h-6 w-px bg-indigo-200"></div>
            <div>
              <span className="text-slate-500 block">Average Ticket Spend:</span>
              <strong className="text-sm font-bold">{currency}{reportData.avgTicket} / customer</strong>
            </div>
            <div className="h-6 w-px bg-indigo-200"></div>
            <div>
              <span className="text-slate-500 block">Current Cash in Register:</span>
              <strong className="text-sm font-bold text-emerald-700">{currency}{register.cashInHand}</strong>
            </div>
          </div>

          {/* Category-wise Breakdown Table */}
          <div>
            <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider mb-2">
              Detailed Breakdown by Category
            </h4>
            <table className="w-full text-xs text-left border border-slate-200 rounded-xl overflow-hidden">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3 text-right">Total Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {Object.keys(reportData.categoryBreakdown).length === 0 ? (
                  <tr>
                    <td colSpan={2} className="py-4 text-center text-slate-400">
                      No activity in this period.
                    </td>
                  </tr>
                ) : (
                  Object.entries(reportData.categoryBreakdown).map(([cat, total]) => (
                    <tr key={cat}>
                      <td className="py-2 px-3 font-medium text-slate-800">{getCategoryLabel(cat)}</td>
                      <td className="py-2 px-3 text-right font-bold text-slate-900">
                        {currency}{total.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

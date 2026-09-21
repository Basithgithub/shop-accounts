'use client';

import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  ArrowDownLeft,
  ArrowUpRight,
  PiggyBank,
  Truck,
} from 'lucide-react';
import { CashFlowSummary, ShopProfile } from '@/types/accounts';
import { useTranslation } from '@/lib/i18n';

interface CashFlowSummaryCardsProps {
  summary: CashFlowSummary;
  profile?: ShopProfile;
}

export default function CashFlowSummaryCards({ summary, profile }: CashFlowSummaryCardsProps) {
  const { t, isTamil } = useTranslation();
  const currency = profile?.currencySymbol || '₹';
  const isNetPositive = summary.todayNet >= 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
      {/* 1. Today's Inflow */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {t.todayInflow}
          </span>
          <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ArrowDownLeft className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-xl sm:text-2xl font-black text-slate-900">
            {currency}{summary.todayInflow.toLocaleString('en-IN')}
          </span>
        </div>
        <p className="mt-1 text-[11px] text-emerald-600 font-medium flex items-center gap-1">
          <TrendingUp className="w-3 h-3" /> {isTamil ? 'சில்லறை விற்பனை வரவு' : 'Retail daily sales'}
        </p>
      </div>

      {/* 2. Today's Outflow */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {t.todayOutflow}
          </span>
          <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-xl sm:text-2xl font-black text-slate-900">
            {currency}{summary.todayOutflow.toLocaleString('en-IN')}
          </span>
        </div>
        <p className="mt-1 text-[11px] text-rose-600 font-medium flex items-center gap-1">
          <TrendingDown className="w-3 h-3" /> {isTamil ? 'செலவு & கொள்முதல்' : 'Stock & expenses'}
        </p>
      </div>

      {/* 3. Today's Net Cash Flow */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {t.todayNet}
          </span>
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              isNetPositive ? 'bg-sky-50 text-sky-600' : 'bg-amber-50 text-amber-600'
            }`}
          >
            <PiggyBank className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span
            className={`text-xl sm:text-2xl font-black ${
              isNetPositive ? 'text-sky-700' : 'text-amber-700'
            }`}
          >
            {isNetPositive ? '+' : ''}
            {currency}{summary.todayNet.toLocaleString('en-IN')}
          </span>
        </div>
        <p className="mt-1 text-[11px] text-slate-500">
          {isTamil ? 'இந்த மாதம்:' : 'This Month:'}{' '}
          <span className="font-semibold text-slate-700">
            {summary.monthNet >= 0 ? '+' : ''}
            {currency}
            {summary.monthNet.toLocaleString('en-IN')}
          </span>
        </p>
      </div>

      {/* 4. Supplier Dues to Pay (Pay After Sales: e.g. ₹16,500) */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-amber-200/90 shadow-sm hover:shadow-md transition">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-amber-900 uppercase tracking-wider">
            {isTamil ? 'சப்ளையர் பாக்கி' : 'Supplier Dues to Pay'}
          </span>
          <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center">
            <Truck className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-xl sm:text-2xl font-black text-rose-600">
            {currency}{summary.totalSupplierPayable.toLocaleString('en-IN')}
          </span>
        </div>
        <p className="mt-1 text-[11px] text-amber-800 font-medium">
          {isTamil ? 'விற்பனைக்கு பின் தரவேண்டியது' : 'To pay after sales'}
        </p>
      </div>
    </div>
  );
}

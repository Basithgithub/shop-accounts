'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  ArrowDownLeft,
  ArrowUpRight,
  Trash2,
  Calendar,
  Filter,
  Scale,
  Users,
} from 'lucide-react';
import { Transaction, ShopProfile } from '@/types/accounts';
import { useTranslation } from '@/lib/i18n';

interface CashBookLedgerProps {
  transactions: Transaction[];
  profile?: ShopProfile;
  onDeleteTransaction: (id: string) => void;
}

export default function CashBookLedger({
  transactions,
  profile,
  onDeleteTransaction,
}: CashBookLedgerProps) {
  const { t, isTamil } = useTranslation();
  const currency = profile?.currencySymbol || '₹';

  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<'TODAY' | 'YESTERDAY' | 'WEEK' | 'MONTH' | 'ALL'>('TODAY');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'INFLOW' | 'OUTFLOW'>('ALL');
  const [channelFilter, setChannelFilter] = useState<'ALL' | 'CASH' | 'UPI'>('ALL');

  // Date calculations
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const yesterdayStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0];
  }, []);
  const currentMonthPrefix = useMemo(() => todayStr.substring(0, 7), [todayStr]);

  const oneWeekAgoStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().split('T')[0];
  }, []);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // Type filter
      if (typeFilter !== 'ALL' && tx.type !== typeFilter) return false;

      // Channel filter
      if (channelFilter !== 'ALL' && tx.paymentMode !== channelFilter) return false;

      // Date filter
      if (dateFilter === 'TODAY' && tx.date !== todayStr) return false;
      if (dateFilter === 'YESTERDAY' && tx.date !== yesterdayStr) return false;
      if (dateFilter === 'WEEK' && (tx.date < oneWeekAgoStr || tx.date > todayStr)) return false;
      if (dateFilter === 'MONTH' && !tx.date.startsWith(currentMonthPrefix)) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = tx.title.toLowerCase().includes(q);
        const matchNotes = tx.notes?.toLowerCase().includes(q) || false;
        const matchFish = tx.fishVariety?.toLowerCase().includes(q) || false;
        const matchCategory = tx.category.toLowerCase().includes(q);
        if (!matchTitle && !matchNotes && !matchFish && !matchCategory) return false;
      }

      return true;
    });
  }, [transactions, typeFilter, channelFilter, dateFilter, searchQuery, todayStr, yesterdayStr, oneWeekAgoStr, currentMonthPrefix]);

  // Aggregate totals for the filtered view
  const { totalIn, totalOut, netFlow } = useMemo(() => {
    let inSum = 0;
    let outSum = 0;
    filteredTransactions.forEach((tx) => {
      if (tx.id === 'tx_init_1' || tx.id === 'tx_init_2') return;
      if (tx.type === 'INFLOW') inSum += tx.amount;
      else if (tx.type === 'OUTFLOW') outSum += tx.amount;
    });
    return {
      totalIn: inSum,
      totalOut: outSum,
      netFlow: inSum - outSum,
    };
  }, [filteredTransactions]);

  const getCategoryBadge = (category: string, type: 'INFLOW' | 'OUTFLOW') => {
    switch (category) {
      case 'DAILY_SALES_MORNING':
      case 'DAILY_SALES_EVENING':
      case 'DAILY_SALES_FULL':
        return <span className="bg-emerald-100 text-emerald-800 text-[10px] font-semibold px-2 py-0.5 rounded">{isTamil ? 'விற்பனை' : 'Retail Sales'}</span>;
      case 'FISH_STOCK_PURCHASE':
        return <span className="bg-cyan-100 text-cyan-800 text-[10px] font-semibold px-2 py-0.5 rounded">{isTamil ? 'கருவாடு கொள்முதல்' : 'Fish Stock'}</span>;
      case 'PACKAGING_AND_POUCHES':
        return <span className="bg-indigo-100 text-indigo-800 text-[10px] font-semibold px-2 py-0.5 rounded">{isTamil ? 'பேக்கிங்/உப்பு' : 'Packaging'}</span>;
      case 'SALT_AND_PRESERVATIVES':
        return <span className="bg-amber-100 text-amber-800 text-[10px] font-semibold px-2 py-0.5 rounded">{isTamil ? 'கல் உப்பு' : 'Salt'}</span>;
      case 'MARKETING_AND_SAMPLES':
        return <span className="bg-purple-100 text-purple-800 text-[10px] font-semibold px-2 py-0.5 rounded">{isTamil ? 'விளம்பரம்/மாதிரி' : 'Samples'}</span>;
      case 'STALL_RENT_AND_POWER':
        return <span className="bg-slate-100 text-slate-800 text-[10px] font-semibold px-2 py-0.5 rounded">{isTamil ? 'வாடகை/மின்சாரம்' : 'Rent/Power'}</span>;
      case 'TRANSPORT_AND_LABOR':
        return <span className="bg-orange-100 text-orange-800 text-[10px] font-semibold px-2 py-0.5 rounded">{isTamil ? 'வண்டி கூலி' : 'Freight'}</span>;
      case 'SUPPLIER_PAYMENT':
        return <span className="bg-rose-100 text-rose-800 text-[10px] font-semibold px-2 py-0.5 rounded">{isTamil ? 'சப்ளையர் செலுத்தியது' : 'Supplier Settled'}</span>;
      case 'OWNER_DRAWING':
        return <span className="bg-pink-100 text-pink-800 text-[10px] font-semibold px-2 py-0.5 rounded">{isTamil ? 'வீட்டு செலவு' : 'Drawing'}</span>;
      default:
        return <span className="bg-slate-100 text-slate-700 text-[10px] font-medium px-2 py-0.5 rounded">{type}</span>;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden mb-8">
      {/* Table Header Controls */}
      <div className="p-4 sm:p-5 border-b border-slate-200/90 space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <span>📖 {t.cashBookHeading}</span>
            </h2>
            <p className="text-xs text-slate-500">
              {isTamil ? 'ரொக்கம் & UPI வரவு-செலவுகளின் காலவரிசை பதிவு' : 'Live chronological record of all counter cash & UPI movements'}
            </p>
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 bg-slate-50/70"
            />
          </div>
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
          {/* Date Filter Pills */}
          <div className="flex items-center gap-1 bg-slate-100/90 p-1 rounded-xl text-xs font-semibold text-slate-600">
            <button
              onClick={() => setDateFilter('TODAY')}
              className={`px-3 py-1 rounded-lg transition ${
                dateFilter === 'TODAY' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'hover:text-slate-900'
              }`}
            >
              {t.filterToday}
            </button>
            <button
              onClick={() => setDateFilter('YESTERDAY')}
              className={`px-3 py-1 rounded-lg transition ${
                dateFilter === 'YESTERDAY' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'hover:text-slate-900'
              }`}
            >
              {t.filterYesterday}
            </button>
            <button
              onClick={() => setDateFilter('WEEK')}
              className={`px-3 py-1 rounded-lg transition ${
                dateFilter === 'WEEK' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'hover:text-slate-900'
              }`}
            >
              {t.filter7Days}
            </button>
            <button
              onClick={() => setDateFilter('MONTH')}
              className={`px-3 py-1 rounded-lg transition ${
                dateFilter === 'MONTH' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'hover:text-slate-900'
              }`}
            >
              {t.filterMonth}
            </button>
            <button
              onClick={() => setDateFilter('ALL')}
              className={`px-3 py-1 rounded-lg transition ${
                dateFilter === 'ALL' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'hover:text-slate-900'
              }`}
            >
              {t.filterAll}
            </button>
          </div>

          {/* Type & Channel Filters */}
          <div className="flex items-center gap-2">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="text-xs font-medium border border-slate-200 bg-white rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-sky-500"
            >
              <option value="ALL">{isTamil ? 'அனைத்து வகை' : 'All Types'}</option>
              <option value="INFLOW">{isTamil ? 'வரவு (+)' : 'Inflow (+)'}</option>
              <option value="OUTFLOW">{isTamil ? 'செலவு (-)' : 'Outflow (-)'}</option>
            </select>

            <select
              value={channelFilter}
              onChange={(e) => setChannelFilter(e.target.value as any)}
              className="text-xs font-medium border border-slate-200 bg-white rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-sky-500"
            >
              <option value="ALL">{t.allChannels}</option>
              <option value="CASH">{t.cashOnly}</option>
              <option value="UPI">{t.upiOnly}</option>
            </select>
          </div>
        </div>

        {/* Filter Summary Ribbon */}
        <div className="pt-2 flex items-center justify-between border-t border-slate-100 text-xs">
          <span className="text-slate-500 font-medium">
            {filteredTransactions.length} {isTamil ? 'பதிவுகள்' : 'entries'}
          </span>
          <div className="flex items-center gap-4">
            <span className="text-emerald-700 font-semibold">
              {t.inflowTotal}: +{currency}{totalIn.toLocaleString('en-IN')}
            </span>
            <span className="text-rose-700 font-semibold">
              {t.outflowTotal}: -{currency}{totalOut.toLocaleString('en-IN')}
            </span>
            <span className="font-bold text-slate-900 border-l border-slate-200 pl-3">
              {isTamil ? 'நிகர வரவு:' : 'Net:'}{' '}
              <span className={netFlow >= 0 ? 'text-sky-700' : 'text-amber-700'}>
                {netFlow >= 0 ? '+' : ''}{currency}{netFlow.toLocaleString('en-IN')}
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="overflow-x-auto">
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <Calendar className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-xs font-medium">{t.noTransactions}</p>
          </div>
        ) : (
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">{isTamil ? 'தேதி' : 'Date'}</th>
                <th className="py-3 px-4">{isTamil ? 'வகை' : 'Category'}</th>
                <th className="py-3 px-4">{isTamil ? 'விபரம்' : 'Description'}</th>
                <th className="py-3 px-4">{isTamil ? 'செலுத்தும் முறை' : 'Channel'}</th>
                <th className="py-3 px-4 text-right">{isTamil ? 'தொகை (₹)' : 'Amount'}</th>
                <th className="py-3 px-3 text-center w-12">{isTamil ? 'செயல்' : 'Action'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.map((tx) => {
                const isInflow = tx.type === 'INFLOW';
                return (
                  <tr key={tx.id} className="hover:bg-slate-50/80 transition group">
                    {/* Date */}
                    <td className="py-3 px-4 whitespace-nowrap text-slate-600 font-medium">
                      {tx.date}
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {getCategoryBadge(tx.category, tx.type)}
                    </td>

                    {/* Title & Notes */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{tx.title}</div>
                      {tx.notes && (
                        <div className="text-[11px] text-slate-500 line-clamp-1">{tx.notes}</div>
                      )}
                      {tx.customerCount && (
                        <div className="text-[10px] text-indigo-600 font-medium flex items-center gap-1 mt-0.5">
                          <Users className="w-3 h-3" />
                          <span>{tx.customerCount} {isTamil ? 'நபர்கள்' : 'buyers'}</span>
                        </div>
                      )}
                    </td>

                    {/* Channel */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 font-bold text-[11px] px-2 py-0.5 rounded-full ${
                          tx.paymentMode === 'CASH'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-sky-50 text-sky-700'
                        }`}
                      >
                        {tx.paymentMode === 'CASH' ? '💵 ' + (isTamil ? 'ரொக்கம்' : 'Cash') : '📱 UPI'}
                      </span>
                    </td>

                    {/* Amount */}
                    <td className="py-3 px-4 whitespace-nowrap text-right font-black text-sm">
                      <span className={isInflow ? 'text-emerald-600' : 'text-rose-600'}>
                        {isInflow ? '+' : '-'}
                        {currency}{tx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </td>

                    {/* Delete Action */}
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => {
                          if (confirm(isTamil ? 'இந்த பதிவை நீக்க விரும்புகிறீர்களா?' : 'Are you sure you want to delete this transaction?')) {
                            onDeleteTransaction(tx.id);
                          }
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 rounded transition"
                        title={isTamil ? 'நீக்கு' : 'Delete'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

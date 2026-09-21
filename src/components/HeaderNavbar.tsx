'use client';

import React from 'react';
import {
  Wallet,
  Smartphone,
  Lock,
  PlusCircle,
  MinusCircle,
  Shield,
  FileBarChart2,
  Fish,
  Languages,
} from 'lucide-react';
import { CashFlowSummary, ShopProfile } from '@/types/accounts';
import { useTranslation } from '@/lib/i18n';

interface HeaderNavbarProps {
  profile?: ShopProfile;
  summary?: CashFlowSummary;
  currentUser?: { id: string; username: string; name: string; role: string } | null;
  onOpenMoneyIn: () => void;
  onOpenMoneyOut: () => void;
  onOpenReports: () => void;
  onOpenSecurity: () => void;
  onLock: () => void;
}

export default function HeaderNavbar({
  profile,
  summary,
  currentUser,
  onOpenMoneyIn,
  onOpenMoneyOut,
  onOpenReports,
  onOpenSecurity,
  onLock,
}: HeaderNavbarProps) {
  const { language, setLanguage, t, isTamil } = useTranslation();
  const currency = profile?.currencySymbol || '₹';
  const isAdmin = currentUser?.role === 'ADMIN';

  const toggleLanguage = () => {
    setLanguage(language === 'ta' ? 'en' : 'ta');
  };

  return (
    <header className="sticky top-0 z-30 bg-slate-900 border-b border-slate-800 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Shop Branding */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-tr from-cyan-600 to-sky-400 flex items-center justify-center shadow-inner flex-shrink-0">
              <Fish className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-white line-clamp-1">
                  {profile?.shopName || 'KV Dryfish Kulumani, Trichy'}
                </h1>
                {currentUser && (
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      isAdmin
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                        : 'bg-slate-700 text-slate-300 border-slate-600'
                    }`}
                  >
                    {isAdmin ? '👑' : '👤'} {currentUser.name || currentUser.username} ({isAdmin ? t.adminTitle : t.staffTitle})
                  </span>
                )}
              </div>
              <p className="text-xs text-sky-200/70 hidden sm:block">
                {profile?.tagline || (isTamil ? 'கருவாடு சில்லறை விற்பனை & லாப கணக்கு - குலுமணி, திருச்சி' : 'Retail Dry Fish Cash Flow & Profit Ledger - Kulumani, Trichy')}
              </p>
            </div>
          </div>

          {/* Real-Time Cash Position Badges */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Cash in Drawer */}
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl px-3.5 py-1.5 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Wallet className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400 block">
                  {t.cashInHand}
                </span>
                <span className="text-sm font-bold text-emerald-400">
                  {currency}{(summary?.cashInHand ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Bank / UPI */}
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl px-3.5 py-1.5 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center">
                <Smartphone className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400 block">
                  {t.upiBalance}
                </span>
                <span className="text-sm font-bold text-sky-400">
                  {currency}{(summary?.upiBalance ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons & Language Toggle */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700 rounded-lg text-xs font-semibold shadow-sm transition active:scale-95"
              title="Switch Language / மொழியை மாற்றவும்"
            >
              <Languages className="w-3.5 h-3.5" />
              <span>{isTamil ? '🇮🇳 தமிழ்' : '🇬🇧 EN'}</span>
            </button>

            <button
              onClick={onOpenMoneyIn}
              className="inline-flex items-center gap-1.5 px-3 py-2 sm:px-3.5 sm:py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg text-xs sm:text-sm shadow-sm transition active:scale-95"
              title="Add Daily Sales or Inflow"
            >
              <PlusCircle className="w-4 h-4 text-emerald-100" />
              <span>{t.moneyInBtn}</span>
            </button>

            <button
              onClick={onOpenMoneyOut}
              className="inline-flex items-center gap-1.5 px-3 py-2 sm:px-3.5 sm:py-2 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-lg text-xs sm:text-sm shadow-sm transition active:scale-95"
              title="Add Fish Stock Purchase, Packaging, Salt, Rent or Expense"
            >
              <MinusCircle className="w-4 h-4 text-rose-100" />
              <span>{t.moneyOutBtn}</span>
            </button>

            {/* Utility Actions */}
            <div className="hidden sm:flex items-center gap-1 border-l border-slate-700/80 pl-2 ml-1">
              <button
                onClick={onOpenReports}
                className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition"
                title={t.reportsBtn}
              >
                <FileBarChart2 className="w-4 h-4" />
              </button>

              <button
                onClick={onOpenSecurity}
                className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition"
                title={t.securityBtn}
              >
                <Shield className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={onLock}
              className="p-2 text-amber-300 hover:text-amber-200 hover:bg-amber-500/10 rounded-lg border border-amber-500/20 transition flex items-center gap-1.5 text-xs font-medium ml-1"
              title={t.lockVault}
            >
              <Lock className="w-3.5 h-3.5" />
              <span className="hidden md:inline">{t.lockVault}</span>
            </button>
          </div>
        </div>

        {/* Mobile Sub-bar for Balances */}
        <div className="lg:hidden flex items-center justify-between py-2 border-t border-slate-800 text-xs text-slate-300">
          <div className="flex items-center gap-1">
            <span className="text-slate-400">{t.cashInHand}:</span>
            <span className="font-bold text-emerald-400">
              {currency}{(summary?.cashInHand ?? 0).toLocaleString('en-IN')}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-slate-400">UPI:</span>
            <span className="font-bold text-sky-400">
              {currency}{(summary?.upiBalance ?? 0).toLocaleString('en-IN')}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onOpenReports} className="text-sky-300 hover:underline">{t.reportsBtn}</button>
            <span>•</span>
            <button onClick={onOpenSecurity} className="text-amber-300 hover:underline">{t.securityBtn}</button>
          </div>
        </div>
      </div>
    </header>
  );
}

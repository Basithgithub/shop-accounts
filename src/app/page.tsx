'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect, useCallback } from 'react';
import HeaderNavbar from '@/components/HeaderNavbar';
import CashFlowSummaryCards from '@/components/CashFlowSummaryCards';
import BatchProfitTracker from '@/components/BatchProfitTracker';
import CashBookLedger from '@/components/CashBookLedger';
import KhataSection from '@/components/KhataSection';
import AddMoneyInModal from '@/components/AddMoneyInModal';
import AddMoneyOutModal from '@/components/AddMoneyOutModal';
import ReportsModal from '@/components/ReportsModal';
import SecurityModal from '@/components/SecurityModal';
import AuthModal from '@/components/AuthModal';
import { ShopVaultData, CashFlowSummary } from '@/types/accounts';
import { LanguageProvider, useTranslation } from '@/lib/i18n';

function ShopAccountsMain() {
  const { isTamil } = useTranslation();
  const [isSetup, setIsSetup] = useState<boolean | null>(null);
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<{ id: string; username: string; name: string; role: string } | null>(null);
  const [vaultData, setVaultData] = useState<ShopVaultData | null>(null);
  const [summary, setSummary] = useState<CashFlowSummary | null>(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showMoneyIn, setShowMoneyIn] = useState(false);
  const [showMoneyOut, setShowMoneyOut] = useState(false);
  const [showReports, setShowReports] = useState(false);
  const [showSecurity, setShowSecurity] = useState(false);

  // Selected batch for sales logging
  const [saleBatchId, setSaleBatchId] = useState<string | undefined>(undefined);

  // Check auth status
  const checkAuth = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/status', { cache: 'no-store' });
      const data = await res.json();
      setIsSetup(data.isSetup);
      setIsUnlocked(data.isUnlocked);
      setCurrentUser(data.currentUser || null);

      if (data.isUnlocked) {
        await loadVaultData();
      }
    } catch (err) {
      console.error('Failed to check auth status', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch full accounts data
  const loadVaultData = async () => {
    try {
      const res = await fetch('/api/cashflow', { cache: 'no-store' });
      if (res.status === 401) {
        setIsUnlocked(false);
        setVaultData(null);
        return;
      }
      const data = await res.json();
      if (data.success) {
        setVaultData(data.data);
        setSummary(data.summary);
      }
    } catch (err) {
      console.error('Failed to load accounts data', err);
    }
  };

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Lock Vault
  const handleLock = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setIsUnlocked(false);
      setVaultData(null);
      setSummary(null);
    } catch (err) {
      console.error('Failed to lock vault', err);
    }
  };

  // Delete transaction
  const handleDeleteTransaction = async (id: string) => {
    try {
      const res = await fetch(`/api/transactions?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        loadVaultData();
      }
    } catch (err) {
      console.error('Failed to delete transaction', err);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0f172a',
          color: '#ffffff',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              border: '4px solid rgba(56, 189, 248, 0.2)',
              borderTopColor: '#38bdf8',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
            }}
          />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <p style={{ fontSize: '13px', color: '#bae6fd', fontWeight: 500 }}>
            {isTamil ? 'கணக்கு பெட்டகத்தின் நிலை சரிபார்க்கப்படுகிறது...' : 'Checking encrypted vault status...'}
          </p>
        </div>
      </div>
    );
  }

  // If vault is not setup or currently locked
  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-between">
        <AuthModal
          isSetup={!!isSetup}
          onUnlocked={async () => {
            await checkAuth();
          }}
        />
      </div>
    );
  }

  // If unlocked but vault data is still being loaded
  if (!vaultData || !summary) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0f172a',
          color: '#ffffff',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              border: '4px solid rgba(56, 189, 248, 0.2)',
              borderTopColor: '#38bdf8',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
            }}
          />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <p style={{ fontSize: '13px', color: '#bae6fd', fontWeight: 500 }}>
            {isTamil ? 'கணக்குகள் பதிவேற்றப்படுகின்றன...' : 'Loading shop ledger...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Top Navigation */}
      <HeaderNavbar
        profile={vaultData.profile}
        summary={summary}
        currentUser={currentUser}
        onOpenMoneyIn={() => setShowMoneyIn(true)}
        onOpenMoneyOut={() => setShowMoneyOut(true)}
        onOpenReports={() => setShowReports(true)}
        onOpenSecurity={() => setShowSecurity(true)}
        onLock={handleLock}
      />

      {/* Main Content Dashboard */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* KPI Cash Flow Summary Cards */}
        <CashFlowSummaryCards summary={summary} profile={vaultData.profile} />

        {/* Dry Fish Batch Purchase & Profit/Loss Tracker */}
        <BatchProfitTracker
          batches={vaultData.purchaseBatches || []}
          fishVarieties={vaultData.fishVarieties}
          profile={vaultData.profile}
          onRefresh={loadVaultData}
          onOpenSaleForBatch={(bId) => {
            setSaleBatchId(bId);
            setShowMoneyIn(true);
          }}
        />

        {/* Daily Cash Book & Ledger */}
        <CashBookLedger
          transactions={vaultData.transactions}
          profile={vaultData.profile}
          onDeleteTransaction={handleDeleteTransaction}
        />

        {/* Supplier Khata & Payables Ledger */}
        <KhataSection
          suppliers={vaultData.suppliers}
          profile={vaultData.profile}
          onRefresh={loadVaultData}
        />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500 no-print">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            {vaultData.profile.shopName} • {isTamil ? 'கருவாடு சில்லறை வரவு-செலவு பெட்டகம்' : 'Dry Fish Retail Accounts Vault'}
          </span>
          <span className="text-[11px] text-slate-400">
            AES-256-GCM • {isTamil ? 'பாதுகாக்கப்பட்ட உள்ளூர் JSON கோப்பு' : 'Protected Single-User Local JSON Storage'}
          </span>
        </div>
      </footer>

      {/* Action Modals */}
      <AddMoneyInModal
        isOpen={showMoneyIn}
        onClose={() => {
          setShowMoneyIn(false);
          setSaleBatchId(undefined);
        }}
        batches={vaultData.purchaseBatches || []}
        initialBatchId={saleBatchId}
        onSuccess={loadVaultData}
      />

      <AddMoneyOutModal
        isOpen={showMoneyOut}
        onClose={() => setShowMoneyOut(false)}
        suppliers={vaultData.suppliers}
        fishVarieties={vaultData.fishVarieties}
        onSuccess={loadVaultData}
      />

      <ReportsModal
        isOpen={showReports}
        onClose={() => setShowReports(false)}
        transactions={vaultData.transactions}
        register={vaultData.cashRegister}
        profile={vaultData.profile}
      />

      <SecurityModal
        isOpen={showSecurity}
        onClose={() => setShowSecurity(false)}
        vaultData={vaultData}
        onRefresh={loadVaultData}
      />
    </div>
  );
}

export default function ShopAccountsApp() {
  return (
    <LanguageProvider>
      <ShopAccountsMain />
    </LanguageProvider>
  );
}

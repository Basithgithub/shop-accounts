'use client';

import React, { useState } from 'react';
import { Lock, KeyRound, ShieldCheck, Eye, EyeOff, Sparkles, Languages } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

interface AuthModalProps {
  isSetup: boolean;
  onUnlocked: () => void;
}

export default function AuthModal({ isSetup, onUnlocked }: AuthModalProps) {
  const { language, setLanguage, t, isTamil } = useTranslation();

  // Login states
  const [loginUsername, setLoginUsername] = useState('Basith');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Setup states
  const [shopName, setShopName] = useState('KV Dryfish Kulumani, Trichy');
  const [ownerName, setOwnerName] = useState('Basith');
  const [phone, setPhone] = useState('');
  const [initialCash, setInitialCash] = useState('0');
  const [initialUpi, setInitialUpi] = useState('0');
  const [setupPassword, setSetupPassword] = useState('9090');
  const [confirmPassword, setConfirmPassword] = useState('9090');

  const toggleLang = () => {
    setLanguage(language === 'ta' ? 'en' : 'ta');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginPassword) {
      setError(isTamil ? 'கடவுச்சொல் அல்லது PIN ஐ உள்ளிடவும்' : 'Please enter your master password or PIN');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: loginUsername.trim(),
          password: loginPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || (isTamil ? 'தவறான கடவுச்சொல்' : 'Incorrect master password'));
      } else {
        onUnlocked();
      }
    } catch {
      setError(isTamil ? 'சர்வர் தொடர்பு பிழை' : 'Failed to connect to local server');
    } finally {
      setLoading(false);
    }
  };

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!setupPassword || setupPassword.length < 4) {
      setError(isTamil ? 'கடவுச்சொல் குறைந்தது 4 எழுத்துக்கள் இருக்க வேண்டும்' : 'Password/PIN must be at least 4 characters');
      return;
    }
    if (setupPassword !== confirmPassword) {
      setError(isTamil ? 'கடவுச்சொற்கள் பொருந்தவில்லை' : 'Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: setupPassword,
          shopName,
          ownerName,
          phone,
          initialCash: parseFloat(initialCash) || 0,
          initialUpi: parseFloat(initialUpi) || 0,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to setup vault');
      } else {
        onUnlocked();
      }
    } catch {
      setError(isTamil ? 'சர்வர் தொடர்பு பிழை' : 'Failed to connect to local server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden relative">
        {/* Language switch button */}
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={toggleLang}
            className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-800/80 hover:bg-slate-700 text-sky-300 border border-slate-700 rounded-lg text-xs font-semibold shadow-sm transition"
          >
            <Languages className="w-3.5 h-3.5" />
            <span>{isTamil ? 'தமிழ்' : 'EN'}</span>
          </button>
        </div>

        {/* Header Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-sky-900 to-slate-900 p-6 text-white text-center relative">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-cyan-500/20 text-cyan-300 ring-4 ring-cyan-500/10 mb-3">
            {isSetup ? <Lock className="w-7 h-7" /> : <Sparkles className="w-7 h-7 text-amber-300" />}
          </div>
          <h2 className="text-xl font-bold tracking-tight">
            {isSetup
              ? (isTamil ? 'KV Dryfish - கணக்கு பெட்டகம்' : 'KV Dryfish - Accounts Vault')
              : (isTamil ? 'கணக்கு பெட்டகம் அமைத்தல்' : 'Setup Protected Accounts Vault')}
          </h2>
          <p className="text-xs text-sky-200 mt-1">
            {isSetup
              ? (isTamil ? 'குலுமணி, திருச்சி • ரொக்கம் & லாப கணக்கு' : 'Kulumani, Trichy • Cash Flow & Profit Ledger')
              : (isTamil ? 'AES-256-GCM குறியாக்கத்துடன் தனிப்பட்ட கணக்கு' : 'Single-user setup with AES-256-GCM local encrypted JSON')}
          </p>

          <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <ShieldCheck className="w-3.5 h-3.5" />
            {isTamil ? 'பாதுகாக்கப்பட்ட JSON கோப்பு • தரவுத்தளம் இல்லை' : 'Protected Local JSON File • Zero Database'}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center justify-between">
              <span>{error}</span>
              <button onClick={() => setError('')} className="text-red-400 hover:text-red-700 font-bold ml-2">×</button>
            </div>
          )}

          {isSetup ? (
            /* Unlock Form */
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Administrator info badge */}
              <div className="bg-sky-50 border border-sky-200 rounded-xl p-3 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-sky-950 block">
                    {isTamil ? 'நிர்வாகி: Basith' : 'Administrator: Basith'}
                  </span>
                  <span className="text-[11px] text-sky-700">
                    {isTamil ? 'கடவுச்சொல்: 9090' : 'Default PIN: 9090'}
                  </span>
                </div>
                <span className="px-2 py-0.5 bg-sky-600 text-white font-bold text-[10px] rounded-full">
                  ADMIN
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  {isTamil ? 'பயனர்பெயர்' : 'User Account / Username'}
                </label>
                <input
                  type="text"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  placeholder="Basith"
                  required
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  {isTamil ? 'கடவுச்சொல் / PIN' : 'Password / PIN'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder={isTamil ? 'PIN உள்ளிடவும் (எ.கா: 9090)' : 'Enter PIN (e.g. 9090)'}
                    autoFocus
                    required
                    className="w-full pl-9 pr-10 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-sm font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-700 hover:to-blue-800 text-white font-medium rounded-lg shadow-sm hover:shadow transition text-sm flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    {isTamil ? 'கணக்கு பெட்டகத்தை திறக்க' : 'Unlock Accounts Vault'}
                  </>
                )}
              </button>

              <p className="text-[11px] text-slate-400 text-center">
                {isTamil
                  ? 'பாதுகாப்பு: 30 நிமிடங்கள் செயல்படாமல் இருந்தால் தானாக பூட்டப்படும்'
                  : 'Auto-locks after 30 minutes of inactivity for counter privacy'}
              </p>
            </form>
          ) : (
            /* Setup Form */
            <form onSubmit={handleSetup} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {isTamil ? 'கடை பெயர்' : 'Shop Name'}
                </label>
                <input
                  type="text"
                  required
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {isTamil ? 'உரிமையாளர் பெயர் (நிர்வாகி)' : 'Owner / Admin Name'}
                </label>
                <input
                  type="text"
                  required
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {isTamil ? 'கடவுச்சொல் (PIN)' : 'PIN / Password'}
                  </label>
                  <input
                    type="password"
                    required
                    value={setupPassword}
                    onChange={(e) => setSetupPassword(e.target.value)}
                    placeholder="9090"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {isTamil ? 'மீண்டும் PIN' : 'Confirm PIN'}
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="9090"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-2.5 px-4 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-lg shadow-sm transition text-xs"
              >
                {loading ? (isTamil ? 'அமைக்கப்படுகிறது...' : 'Initializing...') : (isTamil ? 'பெட்டகத்தை துவங்கு' : 'Initialize Vault')}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

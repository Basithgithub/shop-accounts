'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  Download,
  Upload,
  Lock,
  FileCode,
  Tag,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  Users,
  UserPlus,
  ShieldAlert,
  KeyRound,
} from 'lucide-react';
import { ShopProfile, ShopVaultData } from '@/types/accounts';

interface SecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
  vaultData?: ShopVaultData;
  onRefresh: () => void;
}

export default function SecurityModal({
  isOpen,
  onClose,
  vaultData,
  onRefresh,
}: SecurityModalProps) {
  const [activeTab, setActiveTab] = useState<'BACKUP' | 'FISH_VARIETIES' | 'SETTINGS' | 'USERS'>('BACKUP');

  // Settings
  const [shopName, setShopName] = useState(vaultData?.profile.shopName || '');
  const [ownerName, setOwnerName] = useState(vaultData?.profile.ownerName || '');
  const [phone, setPhone] = useState(vaultData?.profile.phone || '');
  const [tagline, setTagline] = useState(vaultData?.profile.tagline || '');
  const [currencySymbol, setCurrencySymbol] = useState(vaultData?.profile.currencySymbol || '₹');

  // Fish Varieties
  const [varieties, setVarieties] = useState<string[]>(vaultData?.fishVarieties || []);
  const [newFish, setNewFish] = useState('');

  // Import
  const [restorePassword, setRestorePassword] = useState('');
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // User Management
  const [userList, setUserList] = useState<any[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<'STAFF' | 'ADMIN'>('STAFF');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [userMsg, setUserMsg] = useState('');
  const [userError, setUserError] = useState('');
  const [creatingUser, setCreatingUser] = useState(false);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        const d = await res.json();
        setUserList(d.users || []);
        setIsAdmin(d.isAdmin);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);


  if (!isOpen) return null;

  const downloadEncryptedBackup = () => {
    window.location.href = '/api/backup?type=encrypted';
  };

  const downloadDecryptedBackup = () => {
    window.location.href = '/api/backup?type=decrypted';
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/cashflow', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        profile: {
          shopName,
          ownerName,
          phone,
          tagline,
          currencySymbol,
        },
      }),
    });
    setIsSuccess(true);
    setTimeout(() => setIsSuccess(false), 2000);
    onRefresh();
  };

  const handleAddVariety = async () => {
    if (!newFish.trim()) return;
    const updated = [...varieties, newFish.trim()];
    setVarieties(updated);
    setNewFish('');

    await fetch('/api/cashflow', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fishVarieties: updated }),
    });
    onRefresh();
  };

  const handleRemoveVariety = async (name: string) => {
    const updated = varieties.filter((v) => v !== name);
    setVarieties(updated);

    await fetch('/api/cashflow', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fishVarieties: updated }),
    });
    onRefresh();
  };

  const handleRestoreFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!restorePassword) {
      alert('Please enter the master password for the backup file first');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const content = evt.target?.result as string;
      try {
        const res = await fetch('/api/backup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fileContent: content, password: restorePassword }),
        });
        const d = await res.json();
        if (!res.ok) {
          setImportStatus(`Failed: ${d.error}`);
        } else {
          setImportStatus('Backup restored successfully!');
          onRefresh();
        }
      } catch {
        setImportStatus('Failed to upload file');
      }
    };
    reader.readAsText(file);
  };

    const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserMsg('');
    setUserError('');
    if (!newUsername || !newUserPassword) {
      setUserError('Username and Password/PIN are required');
      return;
    }

    setCreatingUser(true);
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: newUsername.trim(),
          name: newName.trim() || newUsername.trim(),
          role: newRole,
          password: newUserPassword.trim(),
        }),
      });
      const d = await res.json();
      if (!res.ok) {
        setUserError(d.error || 'Failed to create user');
      } else {
        setUserMsg(`User "${newUsername}" created successfully!`);
        setNewUsername('');
        setNewName('');
        setNewUserPassword('');
        fetchUsers();
      }
    } catch {
      setUserError('Error communicating with server');
    } finally {
      setCreatingUser(false);
    }
  };

  const handleDeleteUser = async (userId: string, name: string) => {
    if (!window.confirm(`Delete user "${name}"?`)) return;
    try {
      const res = await fetch(`/api/users?id=${encodeURIComponent(userId)}`, {
        method: 'DELETE',
      });
      const d = await res.json();
      if (!res.ok) {
        alert(d.error || 'Failed to delete user');
      } else {
        fetchUsers();
      }
    } catch {
      alert('Error communicating with server');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="font-bold text-base">Security, Users &amp; Settings</h3>
              <p className="text-xs text-slate-400">Manage protected storage, staff users and shop details</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
          <button
            onClick={() => setActiveTab('USERS')}
            className={`flex-1 py-3 border-b-2 text-center transition ${
              activeTab === 'USERS'
                ? 'border-sky-600 text-sky-700 bg-white font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Users &amp; Staff ({userList.length})
          </button>
          <button
            onClick={() => setActiveTab('BACKUP')}
            className={`flex-1 py-3 border-b-2 text-center transition ${
              activeTab === 'BACKUP'
                ? 'border-sky-600 text-sky-700 bg-white font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Encrypted Backup
          </button>
          <button
            onClick={() => setActiveTab('FISH_VARIETIES')}
            className={`flex-1 py-3 border-b-2 text-center transition ${
              activeTab === 'FISH_VARIETIES'
                ? 'border-sky-600 text-sky-700 bg-white font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Dry Fish Varieties ({varieties.length})
          </button>
          <button
            onClick={() => setActiveTab('SETTINGS')}
            className={`flex-1 py-3 border-b-2 text-center transition ${
              activeTab === 'SETTINGS'
                ? 'border-sky-600 text-sky-700 bg-white font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Shop Profile
          </button>
        </div>


        {/* Tab 0: Users & Staff Management */}
        {activeTab === 'USERS' && (
          <div className="p-6 space-y-5 text-xs max-h-[75vh] overflow-y-auto">
            {/* Administrator Authority Header */}
            <div className="p-3.5 bg-gradient-to-r from-sky-50 to-blue-50 border border-sky-200 rounded-xl space-y-1">
              <div className="font-bold text-sky-950 text-sm flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4 text-sky-600" /> Administrator: Basith
                </span>
                <span className="px-2 py-0.5 bg-sky-600 text-white font-bold text-[10px] rounded-full">
                  ADMIN ACCESS
                </span>
              </div>
              <p className="text-sky-800 leading-relaxed">
                As configured, <strong>only administrator Basith</strong> has the access to create new user accounts, assign staff roles, and manage permissions.
              </p>
            </div>

            {isAdmin ? (
              <>
                {/* Create New User Form */}
                <form onSubmit={handleCreateUser} className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                  <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                    <UserPlus className="w-4 h-4 text-sky-600" /> Create New User Account
                  </h4>

                  {userMsg && (
                    <div className="p-2 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-semibold">
                      {userMsg}
                    </div>
                  )}

                  {userError && (
                    <div className="p-2 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs font-semibold">
                      {userError}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Username <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value)}
                        placeholder="e.g. Salim"
                        required
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Full Name / Display Name
                      </label>
                      <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="e.g. Salim (Counter Cashier)"
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">User Role</label>
                      <select
                        value={newRole}
                        onChange={(e) => setNewRole(e.target.value as any)}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white font-medium"
                      >
                        <option value="STAFF">STAFF (Cashier / Sales Logger)</option>
                        <option value="ADMIN">ADMIN (Full Authority)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Login Password / PIN <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="password"
                        value={newUserPassword}
                        onChange={(e) => setNewUserPassword(e.target.value)}
                        placeholder="User PIN / Password"
                        required
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white"
                      />
                    </div>
                  </div>

                  <div className="pt-1 flex justify-end">
                    <button
                      type="submit"
                      disabled={creatingUser}
                      className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-sm transition"
                    >
                      {creatingUser ? (
                        <span className="inline-block animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent"></span>
                      ) : (
                        <>
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>Create User</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>

                {/* Existing Users List */}
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                    Existing Users ({userList.length})
                  </h4>
                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
                    {userList.map((u) => {
                      const isBasith = u.username.toLowerCase() === 'basith';
                      return (
                        <div key={u.id} className="p-3 flex items-center justify-between hover:bg-slate-50">
                          <div>
                            <div className="font-bold text-slate-900 flex items-center gap-2">
                              <span>{u.name || u.username}</span>
                              <span className="text-slate-400 font-normal">(@{u.username})</span>
                              {isBasith && (
                                <span className="px-2 py-0.2 text-[10px] font-bold bg-amber-100 text-amber-800 rounded-full">
                                  Primary Admin
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5">
                              Role: <strong className="text-slate-700">{u.role}</strong> • Created: {u.createdAt ? u.createdAt.split('T')[0] : '-'}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                                u.role === 'ADMIN'
                                  ? 'bg-sky-100 text-sky-800'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {u.role}
                            </span>

                            {!isBasith && (
                              <button
                                onClick={() => handleDeleteUser(u.id, u.username)}
                                className="p-1 text-slate-400 hover:text-rose-600 transition rounded"
                                title="Remove User"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            ) : (
              <div className="p-6 bg-amber-50 border border-amber-200 rounded-xl text-center space-y-2">
                <ShieldAlert className="w-8 h-8 text-amber-600 mx-auto" />
                <h4 className="font-bold text-amber-900 text-sm">Access Restricted</h4>
                <p className="text-xs text-amber-800 max-w-sm mx-auto">
                  Only administrator <strong>Basith</strong> has access to create, edit, or manage users in this shop accounts vault.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Tab 1: Backup & Security */}
        {activeTab === 'BACKUP' && (
          <div className="p-6 space-y-5 text-xs">
            {/* Encryption badge */}
            <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1">
              <div className="font-bold text-emerald-900 text-sm flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-emerald-600" /> Local Encrypted JSON Storage Active
              </div>
              <p className="text-emerald-800 leading-relaxed">
                Your shop data is stored in <code className="bg-emerald-100 px-1 py-0.5 rounded text-[11px]">data/shop_vault.enc</code>. It is encrypted using <strong>AES-256-GCM</strong> with 100,000 PBKDF2 iterations. Even if another user opens the file, it cannot be read without your master password.
              </p>
            </div>

            {/* Export Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={downloadEncryptedBackup}
                className="p-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-semibold flex items-center justify-center gap-2 shadow-sm transition"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <span>Download Encrypted Backup</span>
              </button>

              <button
                onClick={downloadDecryptedBackup}
                className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-xl font-semibold flex items-center justify-center gap-2 transition"
              >
                <FileCode className="w-4 h-4 text-slate-600" />
                <span>Download Plain JSON (Inspect)</span>
              </button>
            </div>

            {/* Restore / Import */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                <Upload className="w-4 h-4 text-sky-600" /> Restore Vault from Backup File
              </h4>
              <p className="text-slate-500">
                To restore from a backup file, enter the password used when the backup was created:
              </p>

              <div>
                <input
                  type="password"
                  value={restorePassword}
                  onChange={(e) => setRestorePassword(e.target.value)}
                  placeholder="Master password for backup file"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white mb-2"
                />

                <input
                  type="file"
                  accept=".json,.enc"
                  onChange={handleRestoreFile}
                  className="w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100"
                />
              </div>

              {importStatus && (
                <div className="p-2 rounded bg-sky-100 text-sky-800 text-[11px] font-semibold">
                  {importStatus}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Dry Fish Varieties */}
        {activeTab === 'FISH_VARIETIES' && (
          <div className="p-6 space-y-4 text-xs max-h-[70vh] overflow-y-auto">
            <div>
              <label className="block font-semibold text-slate-800 mb-1">Add Dry Fish Variety</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newFish}
                  onChange={(e) => setNewFish(e.target.value)}
                  placeholder="e.g. Dry Silver Belly (Karuvadu)"
                  className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                />
                <button
                  onClick={handleAddVariety}
                  className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="font-semibold text-slate-600 block mb-1">Available Varieties:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {varieties.map((v) => (
                  <div
                    key={v}
                    className="flex items-center justify-between p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  >
                    <span className="font-medium text-slate-800 flex items-center gap-1">
                      <Tag className="w-3 h-3 text-cyan-600" /> {v}
                    </span>
                    <button
                      onClick={() => handleRemoveVariety(v)}
                      className="text-slate-400 hover:text-red-600 p-1"
                      title="Remove variety"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Shop Profile Settings */}
        {activeTab === 'SETTINGS' && (
          <form onSubmit={handleSaveProfile} className="p-6 space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Shop / Brand Name</label>
              <input
                type="text"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                required
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Owner Name</label>
                <input
                  type="text"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Currency Symbol</label>
                <input
                  type="text"
                  value={currencySymbol}
                  onChange={(e) => setCurrencySymbol(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Shop Phone / WhatsApp</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tagline</label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              {isSuccess ? (
                <span className="text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Changes saved!
                </span>
              ) : <span></span>}

              <button
                type="submit"
                className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg flex items-center gap-1.5 shadow-sm"
              >
                <Save className="w-3.5 h-3.5" /> Save Changes
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

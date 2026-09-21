import fs from 'node:fs';
import path from 'node:path';
import {
  ShopVaultData,
  EncryptedContainer,
  CashFlowSummary,
  Transaction,
  PurchaseBatch,
  UserAccount,
} from '@/types/accounts';
import {
  encryptVaultData,
  decryptVaultData,
  hashPassword,
  verifyPasswordHash,
} from './crypto';
import { createInitialVaultData } from './default-data';
import { isCloudKvEnabled, kvGet, kvSet } from './kv';
import { setSessionCookie, getSessionCookie, clearSessionCookie } from './session';

const DATA_DIR = path.join(process.cwd(), 'data');
const VAULT_FILE = path.join(DATA_DIR, 'shop_vault.enc');
const AUTH_FILE = path.join(DATA_DIR, 'auth_meta.json');
const SESSION_FILE = path.join(DATA_DIR, '.active_session.json');
const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes idle timeout

const KV_VAULT_KEY = 'kv_dryfish_vault';
const KV_AUTH_KEY = 'kv_dryfish_auth_meta';

interface AuthMeta {
  isSetup: boolean;
  hash: string;
  salt: string;
  lastLogin?: string;
}

interface LocalActiveSession {
  unlocked: boolean;
  password: string;
  currentUser?: UserAccount;
  lastActivity: number;
}

function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    try {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    } catch {}
  }
}

function getLocalFileSession(): LocalActiveSession | null {
  try {
    if (!fs.existsSync(SESSION_FILE)) return null;
    const raw = fs.readFileSync(SESSION_FILE, 'utf8');
    const session: LocalActiveSession = JSON.parse(raw);
    if (!session || !session.unlocked || !session.password) return null;
    if (Date.now() - session.lastActivity > SESSION_TIMEOUT_MS) {
      clearLocalFileSession();
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

function saveLocalFileSession(session: LocalActiveSession): void {
  try {
    ensureDataDir();
    fs.writeFileSync(SESSION_FILE, JSON.stringify(session, null, 2), 'utf8');
  } catch {}
}

function clearLocalFileSession(): void {
  try {
    if (fs.existsSync(SESSION_FILE)) {
      fs.unlinkSync(SESSION_FILE);
    }
  } catch {}
}

/**
 * Resolves active session from either secure HTTP-only cookie or local session file
 */
function getActiveSession(): { user: UserAccount; password: string } | null {
  // 1. Try secure HTTP-only cookie (primary for Vercel & Web requests)
  const cookieSession = getSessionCookie();
  if (cookieSession && cookieSession.user && cookieSession.masterPassword) {
    return {
      user: cookieSession.user,
      password: cookieSession.masterPassword,
    };
  }

  // 2. Fallback to local session file for background scripts or CLI
  const fileSession = getLocalFileSession();
  if (fileSession && fileSession.unlocked && fileSession.password) {
    return {
      user: fileSession.currentUser || {
        id: 'user_admin_basith',
        username: 'Basith',
        name: 'Basith (Administrator)',
        role: 'ADMIN',
        pinHash: '',
        pinSalt: '',
        createdAt: new Date().toISOString(),
        isActive: true,
      },
      password: fileSession.password,
    };
  }

  return null;
}

export async function getAuthMeta(): Promise<AuthMeta> {
  if (isCloudKvEnabled()) {
    const raw = await kvGet(KV_AUTH_KEY);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {}
    }
    // Seed from local file bundle if present in repo
    if (fs.existsSync(AUTH_FILE)) {
      try {
        const fileContent = fs.readFileSync(AUTH_FILE, 'utf8');
        await kvSet(KV_AUTH_KEY, fileContent);
        return JSON.parse(fileContent);
      } catch {}
    }
    return { isSetup: false, hash: '', salt: '' };
  }

  ensureDataDir();
  if (!fs.existsSync(AUTH_FILE)) {
    return { isSetup: false, hash: '', salt: '' };
  }
  try {
    const raw = fs.readFileSync(AUTH_FILE, 'utf8');
    return JSON.parse(raw);
  } catch {
    return { isSetup: false, hash: '', salt: '' };
  }
}

export async function saveAuthMeta(meta: AuthMeta): Promise<void> {
  const serialized = JSON.stringify(meta, null, 2);
  if (isCloudKvEnabled()) {
    await kvSet(KV_AUTH_KEY, serialized);
  } else {
    ensureDataDir();
    fs.writeFileSync(AUTH_FILE, serialized, 'utf8');
  }
}

async function getRawEncryptedContainer(): Promise<EncryptedContainer> {
  if (isCloudKvEnabled()) {
    const raw = await kvGet(KV_VAULT_KEY);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {}
    }
    // Seed from bundled repo file if present
    if (fs.existsSync(VAULT_FILE)) {
      try {
        const fileContent = fs.readFileSync(VAULT_FILE, 'utf8');
        await kvSet(KV_VAULT_KEY, fileContent);
        return JSON.parse(fileContent);
      } catch {}
    }
    throw new Error('Encrypted vault not found in cloud storage');
  }

  ensureDataDir();
  if (!fs.existsSync(VAULT_FILE)) {
    throw new Error('Vault file not found on disk');
  }
  const raw = fs.readFileSync(VAULT_FILE, 'utf8');
  return JSON.parse(raw);
}

async function saveRawEncryptedContainer(container: EncryptedContainer): Promise<void> {
  const serialized = JSON.stringify(container, null, 2);
  if (isCloudKvEnabled()) {
    await kvSet(KV_VAULT_KEY, serialized);
  } else {
    ensureDataDir();
    const tempPath = `${VAULT_FILE}.tmp`;
    fs.writeFileSync(tempPath, serialized, 'utf8');
    fs.renameSync(tempPath, VAULT_FILE);
  }
}

export async function isVaultSetup(): Promise<boolean> {
  const meta = await getAuthMeta();
  if (!meta.isSetup) return false;
  if (isCloudKvEnabled()) {
    const raw = await kvGet(KV_VAULT_KEY);
    if (raw) return true;
    return fs.existsSync(VAULT_FILE);
  }
  return fs.existsSync(VAULT_FILE);
}

export async function isVaultUnlocked(): Promise<boolean> {
  return getActiveSession() !== null;
}

export async function getCurrentUser(): Promise<UserAccount | null> {
  const session = getActiveSession();
  return session?.user || null;
}

export async function isCurrentUserAdmin(): Promise<boolean> {
  const user = await getCurrentUser();
  return user?.role === 'ADMIN';
}

export async function lockVault(): Promise<void> {
  clearSessionCookie();
  clearLocalFileSession();
}

export async function setupVault(
  masterPass: string,
  profile: { shopName: string; ownerName: string; phone: string; initialCash: number; initialUpi: number }
): Promise<ShopVaultData> {
  const { hash, salt } = hashPassword(masterPass);
  await saveAuthMeta({
    isSetup: true,
    hash,
    salt,
    lastLogin: new Date().toISOString(),
  });

  const initialData = createInitialVaultData(
    profile.shopName,
    profile.ownerName,
    profile.phone,
    profile.initialCash,
    profile.initialUpi
  );

  const container = encryptVaultData(initialData, masterPass);
  await saveRawEncryptedContainer(container);

  const adminUser = initialData.users.find((u) => u.role === 'ADMIN') || initialData.users[0];

  setSessionCookie(adminUser, masterPass);
  saveLocalFileSession({
    unlocked: true,
    password: masterPass,
    currentUser: adminUser,
    lastActivity: Date.now(),
  });

  return initialData;
}

export async function unlockVault(
  password: string,
  username?: string
): Promise<{ success: boolean; message?: string; user?: UserAccount }> {
  const meta = await getAuthMeta();
  if (!meta.isSetup) {
    return { success: false, message: 'Vault is not set up yet' };
  }

  // 1. Verify password against master password (e.g. Basith 9090)
  const isMasterValid = verifyPasswordHash(password, meta.hash, meta.salt);
  if (isMasterValid) {
    try {
      const container = await getRawEncryptedContainer();
      const decrypted = decryptVaultData(container, password);

      decrypted.users = decrypted.users || [];
      let admin = decrypted.users.find((u) => u.username.toLowerCase() === 'basith' || u.role === 'ADMIN');
      if (!admin) {
        const adminHash = hashPassword(password);
        admin = {
          id: 'user_admin_basith',
          username: 'Basith',
          name: 'Basith (Administrator)',
          role: 'ADMIN',
          pinHash: adminHash.hash,
          pinSalt: adminHash.salt,
          createdAt: new Date().toISOString(),
          isActive: true,
        };
        decrypted.users.unshift(admin);
      }

      // Set cookie session for Vercel/Next.js
      setSessionCookie(admin, password);

      // Set local session for local offline development
      saveLocalFileSession({
        unlocked: true,
        password,
        currentUser: admin,
        lastActivity: Date.now(),
      });

      return { success: true, user: admin };
    } catch (err: any) {
      return { success: false, message: `Decryption failed: ${err.message}` };
    }
  }

  // 2. Secondary staff login
  const active = getActiveSession();
  if (active && username) {
    try {
      const container = await getRawEncryptedContainer();
      const decrypted = decryptVaultData(container, active.password);
      const user = (decrypted.users || []).find(
        (u) => u.username.toLowerCase() === username.toLowerCase() && u.isActive
      );
      if (user && verifyPasswordHash(password, user.pinHash, user.pinSalt)) {
        setSessionCookie(user, active.password);
        saveLocalFileSession({
          unlocked: true,
          password: active.password,
          currentUser: user,
          lastActivity: Date.now(),
        });
        return { success: true, user };
      }
    } catch {}
  }

  return { success: false, message: 'Incorrect username or password / PIN' };
}

export async function getVaultData(): Promise<ShopVaultData> {
  const session = getActiveSession();
  if (!session || !session.password) {
    throw new Error('Vault is locked. Please enter your master password to unlock.');
  }

  const container = await getRawEncryptedContainer();
  const decrypted = decryptVaultData(container, session.password);

  decrypted.users = decrypted.users || [];
  decrypted.purchaseBatches = decrypted.purchaseBatches || [];
  decrypted.transactions = decrypted.transactions || [];
  decrypted.suppliers = decrypted.suppliers || [];
  decrypted.customers = decrypted.customers || [];
  decrypted.fishVarieties = decrypted.fishVarieties || [];

  recomputeRegisterBalances(decrypted);
  return decrypted;
}

export async function saveVaultData(data: ShopVaultData): Promise<void> {
  const session = getActiveSession();
  if (!session || !session.password) {
    throw new Error('Vault is locked. Cannot save without active unlock session.');
  }

  recomputeRegisterBalances(data);
  data.lastModified = new Date().toISOString();

  const container = encryptVaultData(data, session.password);
  await saveRawEncryptedContainer(container);
}

/**
 * Recomputes Cash In Drawer and UPI Bank Balances by traversing all transactions
 */
export function recomputeRegisterBalances(data: ShopVaultData): void {
  let cash = data.cashRegister.initialCash || 0;
  let upi = data.cashRegister.initialUpi || 0;

  for (const tx of data.transactions) {
    if (tx.id === 'tx_init_1' || tx.id === 'tx_init_2') {
      continue;
    }

    if (tx.type === 'INFLOW') {
      if (tx.paymentMode === 'CASH') {
        cash += tx.amount;
      } else {
        upi += tx.amount;
      }
    } else if (tx.type === 'OUTFLOW') {
      if (tx.paymentMode === 'CASH') {
        cash -= tx.amount;
      } else {
        upi -= tx.amount;
      }
    }
  }

  data.cashRegister.cashInHand = Math.round(cash * 100) / 100;
  data.cashRegister.upiBalance = Math.round(upi * 100) / 100;
}

/**
 * Recalculates metrics for a purchase batch
 */
export function recomputeBatchMetrics(batch: PurchaseBatch): void {
  const salesSum = (batch.salesEntries || []).reduce((acc, s) => acc + s.amount, 0);
  batch.totalSalesAmount = Math.round(salesSum * 100) / 100;
  batch.totalCost = Math.round(((batch.purchaseAmount || 0) + (batch.additionalCost || 0)) * 100) / 100;
  batch.profitOrLossAmount = Math.round((batch.totalSalesAmount - batch.totalCost) * 100) / 100;
  batch.profitOrLossPercentage = batch.totalCost > 0
    ? Math.round(((batch.profitOrLossAmount / batch.totalCost) * 100) * 100) / 100
    : 0;

  if (batch.paymentStatus === 'UNPAID' || batch.paymentStatus === 'PARTIAL') {
    const paid = batch.paidAmount || 0;
    batch.supplierDues = Math.max(0, batch.totalCost - paid);
    if (batch.supplierDues === 0 && batch.totalCost > 0) {
      batch.paymentStatus = 'PAID';
    }
  }
}

/**
 * Calculates current KPI summaries for the dashboard
 */
export function getCashFlowSummary(data: ShopVaultData): CashFlowSummary {
  data.purchaseBatches = data.purchaseBatches || [];
  data.purchaseBatches.forEach(recomputeBatchMetrics);

  recomputeRegisterBalances(data);

  const todayStr = new Date().toISOString().split('T')[0];
  const currentMonthPrefix = todayStr.substring(0, 7); // YYYY-MM

  let todayInflow = 0;
  let todayOutflow = 0;
  let monthInflow = 0;
  let monthOutflow = 0;
  let todayCustomerCount = 0;
  let todaySalesRevenue = 0;

  for (const tx of data.transactions) {
    if (tx.id === 'tx_init_1' || tx.id === 'tx_init_2') {
      continue;
    }

    const txDate = tx.date;
    const isToday = txDate === todayStr;
    const isThisMonth = txDate.startsWith(currentMonthPrefix);

    if (tx.type === 'INFLOW') {
      if (isToday) {
        todayInflow += tx.amount;
        if (
          tx.category === 'DAILY_SALES_MORNING' ||
          tx.category === 'DAILY_SALES_EVENING' ||
          tx.category === 'DAILY_SALES_FULL'
        ) {
          todaySalesRevenue += tx.amount;
          if (tx.customerCount) {
            todayCustomerCount += tx.customerCount;
          }
        }
      }
      if (isThisMonth) monthInflow += tx.amount;
    } else if (tx.type === 'OUTFLOW') {
      if (isToday) todayOutflow += tx.amount;
      if (isThisMonth) monthOutflow += tx.amount;
    }
  }

  const totalCustomerUdhaar = data.customers.reduce((acc, c) => acc + (c.currentBalance > 0 ? c.currentBalance : 0), 0);
  const totalSupplierPayable = data.suppliers.reduce((acc, s) => acc + (s.currentBalance > 0 ? s.currentBalance : 0), 0);
  const todayAvgSpend = todayCustomerCount > 0 ? Math.round(todaySalesRevenue / todayCustomerCount) : 0;

  const activeBatches = data.purchaseBatches.filter((b) => b.status === 'ACTIVE');
  const activeBatchesCount = activeBatches.length;
  const totalActiveInvestment = activeBatches.reduce((acc, b) => acc + b.totalCost, 0);
  const totalActiveSales = activeBatches.reduce((acc, b) => acc + b.totalSalesAmount, 0);
  const totalRealizedProfit = data.purchaseBatches.reduce((acc, b) => acc + b.profitOrLossAmount, 0);

  return {
    cashInHand: data.cashRegister.cashInHand,
    upiBalance: data.cashRegister.upiBalance,
    totalLiquidFunds: data.cashRegister.cashInHand + data.cashRegister.upiBalance,
    todayInflow,
    todayOutflow,
    todayNet: todayInflow - todayOutflow,
    monthInflow,
    monthOutflow,
    monthNet: monthInflow - monthOutflow,
    totalCustomerUdhaar,
    totalSupplierPayable,
    todayCustomerCount,
    todayAvgSpend,
    activeBatchesCount,
    totalActiveInvestment,
    totalActiveSales,
    totalRealizedProfit,
  };
}

export async function getRawEncryptedFile(): Promise<string> {
  const container = await getRawEncryptedContainer();
  return JSON.stringify(container, null, 2);
}

export async function importEncryptedFile(content: string, passwordAttempt: string): Promise<void> {
  const container: EncryptedContainer = JSON.parse(content);
  const data = decryptVaultData(container, passwordAttempt);

  const { hash, salt } = hashPassword(passwordAttempt);
  await saveAuthMeta({
    isSetup: true,
    hash,
    salt,
    lastLogin: new Date().toISOString(),
  });

  await saveRawEncryptedContainer(container);

  const adminUser = (data.users || []).find((u) => u.role === 'ADMIN') || data.users?.[0];

  setSessionCookie(adminUser, passwordAttempt);
  saveLocalFileSession({
    unlocked: true,
    password: passwordAttempt,
    currentUser: adminUser,
    lastActivity: Date.now(),
  });
}

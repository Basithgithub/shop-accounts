export type PaymentMode = 'CASH' | 'UPI';

export type InflowCategory =
  | 'DAILY_SALES_MORNING'
  | 'DAILY_SALES_EVENING'
  | 'DAILY_SALES_FULL'
  | 'CUSTOMER_UDHAAR_SETTLE'
  | 'OWNER_CAPITAL'
  | 'OTHER_INFLOW';

export type OutflowCategory =
  | 'FISH_STOCK_PURCHASE'
  | 'PACKAGING_AND_POUCHES'
  | 'SALT_AND_PRESERVATIVES'
  | 'MARKETING_AND_SAMPLES'
  | 'TRANSPORT_AND_LABOR'
  | 'STALL_RENT_AND_POWER'
  | 'SUPPLIER_PAYMENT'
  | 'OWNER_DRAWING'
  | 'OTHER_EXPENSE';

export interface BatchSaleEntry {
  transactionId: string;
  date: string;
  amount: number;
  paymentMode: PaymentMode;
  notes?: string;
}

export type PurchasePaymentStatus = 'PAID' | 'UNPAID' | 'PARTIAL';

export interface PurchaseBatch {
  id: string;
  batchName: string;
  fishVariety: string;
  quantityKg?: number;
  purchaseAmount: number;         // Original purchase amount
  additionalCost?: number;        // Freight, salt, packing
  totalCost: number;              // purchaseAmount + additionalCost
  paymentMode: PaymentMode;       // How the purchase was paid
  paymentStatus?: PurchasePaymentStatus; // PAID, UNPAID (Pay after sales), PARTIAL
  paidAmount?: number;            // Amount paid upfront
  supplierDues?: number;          // Unpaid dues to supplier (to pay after sales)
  datePurchased: string;          // YYYY-MM-DD
  supplierName?: string;
  status: 'ACTIVE' | 'CLOSED';
  dateClosed?: string;
  totalSalesAmount: number;       // Accumulated daily sales
  profitOrLossAmount: number;     // totalSalesAmount - totalCost
  profitOrLossPercentage: number; // ((totalSalesAmount - totalCost) / totalCost) * 100
  salesEntries: BatchSaleEntry[];
  closureNotes?: string;
}

export interface Transaction {
  id: string;
  date: string; // YYYY-MM-DD
  timestamp: number;
  type: 'INFLOW' | 'OUTFLOW';
  category: InflowCategory | OutflowCategory;
  amount: number;
  paymentMode: PaymentMode;
  title: string;
  notes?: string;
  customerCount?: number; // Retail customer footfall for this batch
  fishVariety?: string;   // For fish stock purchases
  quantityKg?: number;    // Weight in kg if applicable
  customerKhataId?: string;
  supplierKhataId?: string;
  purchaseBatchId?: string; // Linked purchase batch
  costAmount?: number;      // Cost basis
  profitOrLoss?: number;    // Profit/Loss amount for this data
  profitPercentage?: number;// Profit percentage for this data
}


export interface KhataHistoryEntry {
  id: string;
  date: string;
  type: 'CREDIT_GIVEN' | 'PAYMENT_RECEIVED' | 'STOCK_INWARD' | 'PAYMENT_MADE';
  amount: number;
  paymentMode?: PaymentMode;
  notes?: string;
}

export interface CustomerKhata {
  id: string;
  name: string;
  phone: string;
  address?: string;
  totalCreditGiven: number;
  totalRepaid: number;
  currentBalance: number; // positive = customer owes money to shop
  notes?: string;
  lastUpdated: string;
  history: KhataHistoryEntry[];
}

export interface SupplierKhata {
  id: string;
  name: string;
  phone: string;
  location?: string; // Landing center, Harbor, Wholesale market
  totalBilled: number;
  totalPaid: number;
  currentBalance: number; // positive = shop owes supplier
  notes?: string;
  lastUpdated: string;
  history: KhataHistoryEntry[];
}

export interface ShopProfile {
  shopName: string;
  ownerName: string;
  phone: string;
  currencySymbol: string;
  tagline?: string;
  address?: string;
  createdAt: string;
}

export interface CashRegister {
  initialCash: number;
  initialUpi: number;
  cashInHand: number;
  upiBalance: number;
}

export type UserRole = 'ADMIN' | 'STAFF';

export interface UserAccount {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  pinHash: string;
  pinSalt: string;
  createdAt: string;
  isActive: boolean;
}

export interface ShopVaultData {
  version: number;
  profile: ShopProfile;
  cashRegister: CashRegister;
  transactions: Transaction[];
  customers: CustomerKhata[];
  suppliers: SupplierKhata[];
  purchaseBatches: PurchaseBatch[];
  users: UserAccount[];
  fishVarieties: string[];
  lastModified: string;
}

export interface EncryptedContainer {
  version: number;
  salt: string;    // hex
  iv: string;      // hex
  authTag: string; // hex
  data: string;    // hex ciphertext
  checksum?: string;
}

export interface CashFlowSummary {
  cashInHand: number;
  upiBalance: number;
  totalLiquidFunds: number;
  todayInflow: number;
  todayOutflow: number;
  todayNet: number;
  monthInflow: number;
  monthOutflow: number;
  monthNet: number;
  totalCustomerUdhaar: number;
  totalSupplierPayable: number;
  todayCustomerCount: number;
  todayAvgSpend: number;
  activeBatchesCount: number;
  totalActiveInvestment: number;
  totalActiveSales: number;
  totalRealizedProfit: number;
}


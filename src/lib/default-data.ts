import { ShopVaultData, UserAccount } from '@/types/accounts';
import { hashPassword } from './crypto';

export const INITIAL_FISH_VARIETIES = [
  'Anchovy / நெத்திலி கருவாடு (Nethili)',
  'Bombay Duck / பம்பாய் டக் (Bombil)',
  'Dry Prawns / இறால் கருவாடு (Prawns)',
  'Ribbon Fish / வாளை கருவாடு (Vaala)',
  'Dry Mackerel / மாசி / அயிலா (Mackerel)',
  'Seer Fish / வஞ்சிரம் கருவாடு (Vanjaram)',
  'Dry Squid / கணவா கருவாடு (Squid)',
  'Sardines / மத்தி கருவாடு (Mathi)',
  'Silver Belly / காரா பொடி (Kaara)',
  'Dry Shark / சுறா கருவாடு (Sura)',
  'Mixed Dry Fish / கலவை கருவாடு',
];

export function createInitialVaultData(
  shopName: string = 'KV Dryfish Kulumani, Trichy',
  ownerName: string = 'Basith',
  phone: string = '',
  initialCash: number = 0,
  initialUpi: number = 0
): ShopVaultData {
  const now = new Date().toISOString();
  const todayStr = now.split('T')[0];

  const adminAuth = hashPassword('9090');
  const defaultAdminUser: UserAccount = {
    id: 'user_admin_basith',
    username: 'Basith',
    name: 'Basith (Administrator)',
    role: 'ADMIN',
    pinHash: adminAuth.hash,
    pinSalt: adminAuth.salt,
    createdAt: now,
    isActive: true,
  };

  return {
    version: 1,
    profile: {
      shopName,
      ownerName,
      phone,
      currencySymbol: '₹',
      tagline: 'Retail Dry Fish Cash Flow & Profit Ledger - Kulumani, Trichy',
      address: 'Kulumani, Trichy',
      createdAt: now,
    },
    cashRegister: {
      initialCash,
      initialUpi,
      cashInHand: initialCash,
      upiBalance: initialUpi,
    },
    transactions: [], // Clean: No mock transactions
    customers: [],    // Clean: No customer credits (retail cash & UPI only)
    suppliers: [
      {
        id: 'supp_lot_16500',
        name: 'Dry Fish Wholesale Supplier',
        phone: '',
        location: 'Trichy / Harbor',
        totalBilled: 16500,
        totalPaid: 0,
        currentBalance: 16500,
        lastUpdated: todayStr,
        notes: 'Dry fish lot purchased for ₹16,500 on credit. Money to be paid after sales.',
        history: [
          {
            id: 'supp_hist_1',
            date: todayStr,
            type: 'STOCK_INWARD',
            amount: 16500,
            notes: 'Batch #1 dry fish stock received (₹16,500 payable after sales)',
          }
        ]
      }
    ],
    purchaseBatches: [
      {
        id: 'batch_initial_16500',
        batchName: 'Lot #1: Dry Fish Purchase (முதல் கொள்முதல்)',
        fishVariety: 'Mixed Dry Fish / கலவை கருவாடு',
        quantityKg: undefined,
        purchaseAmount: 16500,
        additionalCost: 0,
        totalCost: 16500,
        paymentMode: 'CASH',
        paymentStatus: 'UNPAID', // Unpaid: to pay after sales!
        paidAmount: 0,
        supplierDues: 16500,
        datePurchased: todayStr,
        supplierName: 'Dry Fish Wholesale Supplier',
        status: 'ACTIVE',
        totalSalesAmount: 0,
        profitOrLossAmount: -16500,
        profitOrLossPercentage: -100,
        salesEntries: [],
        closureNotes: 'Purchased for ₹16,500 on credit. Money will be paid to supplier after sales.',
      }
    ],
    users: [defaultAdminUser],
    fishVarieties: INITIAL_FISH_VARIETIES,
    lastModified: now,
  };
}

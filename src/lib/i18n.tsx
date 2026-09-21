'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'ta';

export interface Translations {
  // App & Branding
  shopTagline: string;
  adminTitle: string;
  staffTitle: string;
  lockVault: string;
  vaultLocked: string;
  unlockVault: string;
  enterPin: string;
  welcomeBack: string;

  // Navigation
  moneyInBtn: string;
  moneyOutBtn: string;
  reportsBtn: string;
  securityBtn: string;

  // Cash Flow Summary
  cashInHand: string;
  cashInHandSub: string;
  upiBalance: string;
  upiBalanceSub: string;
  totalFunds: string;
  todayInflow: string;
  todayOutflow: string;
  todayNet: string;
  supplierPayables: string;
  supplierPayablesSub: string;
  activeBatchInvestment: string;
  batchRecovery: string;

  // Batch Profit Tracker
  batchesHeading: string;
  batchesSubheading: string;
  addNewBatch: string;
  activeBatchesTab: string;
  closedBatchesTab: string;
  batchCost: string;
  salesRecovery: string;
  profitOrLoss: string;
  profitPercent: string;
  paidUpfront: string;
  unpaidSupplierCredit: string;
  payAfterSalesBadge: string;
  recordSaleForBatch: string;
  closeBatchBtn: string;
  reopenBatchBtn: string;
  recoveredOf: string;
  targetCovered: string;
  neededToBreakEven: string;
  netProfitRealized: string;
  netLossSoFar: string;
  noBatchesYet: string;
  fishVariety: string;
  quantityKg: string;
  datePurchased: string;

  // Daily Cash Book & Ledger
  cashBookHeading: string;
  filterAll: string;
  filterToday: string;
  filterYesterday: string;
  filter7Days: string;
  filterMonth: string;
  searchPlaceholder: string;
  inflowTotal: string;
  outflowTotal: string;
  noTransactions: string;
  cashOnly: string;
  upiOnly: string;
  allChannels: string;

  // Supplier Khata
  supplierHeading: string;
  supplierSubheading: string;
  addSupplier: string;
  totalOwedToSuppliers: string;
  supplierName: string;
  supplierLocation: string;
  paySupplierBtn: string;
  paymentHistory: string;
  noSuppliersYet: string;

  // Modals & Forms
  saveBtn: string;
  cancelBtn: string;
  amountLabel: string;
  paymentModeLabel: string;
  cashMode: string;
  upiMode: string;
  creditUnpaidMode: string;
  notesLabel: string;
  dateLabel: string;
  selectBatchLabel: string;
  categoryLabel: string;

  // Categories
  salesMorning: string;
  salesEvening: string;
  salesFull: string;
  ownerCapital: string;
  otherInflow: string;
  stockPurchase: string;
  packagingPouches: string;
  saltPreservatives: string;
  marketingSamples: string;
  transportLabor: string;
  stallRentPower: string;
  supplierPayment: string;
  ownerDrawing: string;
  otherExpense: string;
}

const translations: Record<Language, Translations> = {
  en: {
    shopTagline: 'Retail Dry Fish Cash Flow & Profit Ledger',
    adminTitle: 'Administrator',
    staffTitle: 'Staff',
    lockVault: 'Lock Vault',
    vaultLocked: 'Accounts Vault Locked',
    unlockVault: 'Unlock Vault',
    enterPin: 'Enter 4-Digit Password / PIN',
    welcomeBack: 'Welcome Back',

    moneyInBtn: 'Money In (+)',
    moneyOutBtn: 'Money Out (-)',
    reportsBtn: 'Reports',
    securityBtn: 'Security & Staff',

    cashInHand: 'Cash in Drawer',
    cashInHandSub: 'Counter physical cash',
    upiBalance: 'Bank / UPI Balance',
    upiBalanceSub: 'GPay, PhonePe, Paytm QR',
    totalFunds: 'Total Liquid Funds',
    todayInflow: "Today's Sales Inflow",
    todayOutflow: "Today's Outflow",
    todayNet: "Today's Net Flow",
    supplierPayables: 'Supplier Dues (Pay After Sales)',
    supplierPayablesSub: 'Pending payments for dry fish lots',
    activeBatchInvestment: 'Batch Stock Value',
    batchRecovery: 'Sales Recovery',

    batchesHeading: 'Dry Fish Batch Purchase & Profit/Loss',
    batchesSubheading: 'Track stock lots, daily sales recovery, profit amount, and profit percentage',
    addNewBatch: '+ New Purchase Batch',
    activeBatchesTab: 'Active Batches',
    closedBatchesTab: 'Closed & Archived',
    batchCost: 'Purchase Cost',
    salesRecovery: 'Daily Sales Recovery',
    profitOrLoss: 'Profit / Loss',
    profitPercent: 'Profit %',
    paidUpfront: 'Paid Upfront',
    unpaidSupplierCredit: 'Pay After Sales (Credit)',
    payAfterSalesBadge: 'Pay After Sales',
    recordSaleForBatch: '+ Add Daily Sale for this Lot',
    closeBatchBtn: 'Close Batch & Save Profit',
    reopenBatchBtn: 'Reopen Batch',
    recoveredOf: 'recovered of',
    targetCovered: '100% Purchase Cost Recovered!',
    neededToBreakEven: 'needed to break even',
    netProfitRealized: 'Net Profit Realized',
    netLossSoFar: 'Unrecovered Cost',
    noBatchesYet: 'No purchase batches recorded yet.',
    fishVariety: 'Fish Variety',
    quantityKg: 'Weight (kg)',
    datePurchased: 'Date Purchased',

    cashBookHeading: 'Daily Cash Book & Ledger',
    filterAll: 'All Time',
    filterToday: 'Today',
    filterYesterday: 'Yesterday',
    filter7Days: 'Last 7 Days',
    filterMonth: 'This Month',
    searchPlaceholder: 'Search transactions, fish varieties, notes...',
    inflowTotal: 'Total Inflow',
    outflowTotal: 'Total Outflow',
    noTransactions: 'No transactions recorded for this period.',
    cashOnly: 'Cash Only',
    upiOnly: 'UPI Only',
    allChannels: 'All Channels',

    supplierHeading: 'Dry Fish Suppliers & Payables',
    supplierSubheading: 'Manage debts owed to harbor fishermen, drying yards, and merchants',
    addSupplier: '+ Add Supplier',
    totalOwedToSuppliers: 'Total Dues to Suppliers',
    supplierName: 'Supplier / Fisherman Name',
    supplierLocation: 'Harbor / Wholesale Location',
    paySupplierBtn: 'Pay Supplier',
    paymentHistory: 'Payment History',
    noSuppliersYet: 'No supplier accounts recorded.',

    saveBtn: 'Save Entry',
    cancelBtn: 'Cancel',
    amountLabel: 'Amount (₹)',
    paymentModeLabel: 'Payment Channel',
    cashMode: 'Counter Cash',
    upiMode: 'Bank / UPI QR',
    creditUnpaidMode: 'Pay After Sales (Supplier Credit)',
    notesLabel: 'Notes / Remarks',
    dateLabel: 'Date',
    selectBatchLabel: 'Link to Dry Fish Batch',
    categoryLabel: 'Category',

    salesMorning: 'Morning Sales Session',
    salesEvening: 'Evening Rush Sales',
    salesFull: 'Full Day Sales',
    ownerCapital: 'Owner Starting Capital',
    otherInflow: 'Other Cash Inflow',
    stockPurchase: 'Dry Fish Stock Purchase',
    packagingPouches: 'Packaging Pouches & Covers',
    saltPreservatives: 'Coarse Salt & Processing',
    marketingSamples: 'Sample Packs & Promotion',
    transportLabor: 'Harbor Freight & Porter',
    stallRentPower: 'Stall Rent & Power',
    supplierPayment: 'Supplier Debt Settlement',
    ownerDrawing: 'Personal Drawings',
    otherExpense: 'Other Expense',
  },
  ta: {
    shopTagline: 'கருவாடு சில்லறை விற்பனை & லாப கணக்கு',
    adminTitle: 'நிர்வாகி',
    staffTitle: 'ஊழியர்',
    lockVault: 'பூட்டு',
    vaultLocked: 'கணக்கு பெட்டகம் பூட்டப்பட்டது',
    unlockVault: 'பூட்டை திறக்க',
    enterPin: '4-இலக்க கடவுச்சொல் / PIN ஐ உள்ளிடவும்',
    welcomeBack: 'வணக்கம்',

    moneyInBtn: 'வரவு (+)',
    moneyOutBtn: 'செலவு (-)',
    reportsBtn: 'அறிக்கைகள்',
    securityBtn: 'பாதுகாப்பு & ஊழியர்கள்',

    cashInHand: 'கல்லா பெட்டி ரொக்கம்',
    cashInHandSub: 'கடை ரொக்க இருப்பு',
    upiBalance: 'UPI / வங்கி இருப்பு',
    upiBalanceSub: 'GPay, PhonePe, Paytm QR',
    totalFunds: 'மொத்த பண இருப்பு',
    todayInflow: 'இன்றைய விற்பனை வரவு',
    todayOutflow: 'இன்றைய செலவு',
    todayNet: 'இன்றைய நிகர வரவு',
    supplierPayables: 'சப்ளையர் பாக்கி (விற்பனைக்கு பின் தரவேண்டியது)',
    supplierPayablesSub: 'கருவாடு கொள்முதலுக்கு தரவேண்டிய தொகை',
    activeBatchInvestment: 'கொள்முதல் சரக்கு மதிப்பு',
    batchRecovery: 'விற்பனை மீட்பு',

    batchesHeading: 'கருவாடு கொள்முதல் & லாப/நஷ்ட கணக்கீடு',
    batchesSubheading: 'ஒவ்வொரு கொள்முதல் பேட்ச், தினசரி விற்பனை, லாப தொகை மற்றும் லாப சதவீதத்தை கண்காணிக்கவும்',
    addNewBatch: '+ புதிய கொள்முதல் பேட்ச்',
    activeBatchesTab: 'விற்பனையிலுள்ள பேட்ச்கள்',
    closedBatchesTab: 'முடிக்கப்பட்ட பேட்ச்கள்',
    batchCost: 'கொள்முதல் அடக்கவிலை',
    salesRecovery: 'விற்பனை மூலம் மீண்டது',
    profitOrLoss: 'லாபம் / நஷ்டம்',
    profitPercent: 'லாப சதவீதம் (%)',
    paidUpfront: 'உடனடி செலுத்தியது',
    unpaidSupplierCredit: 'விற்பனைக்கு பின் தரவேண்டியது',
    payAfterSalesBadge: 'விற்பனைக்கு பின் கொடுப்பது',
    recordSaleForBatch: '+ இந்த பேட்சில் இன்றைய விற்பனையை சேர்',
    closeBatchBtn: 'பேட்சை முடித்து லாபத்தை பதிவு செய்',
    reopenBatchBtn: 'பேட்சை மீண்டும் திறக்க',
    recoveredOf: 'மீட்கப்பட்டது / மொத்தம்',
    targetCovered: '100% கொள்முதல் செலவு திரும்ப எடுக்கப்பட்டது!',
    neededToBreakEven: 'அடக்கவிலை அடைய மீதமுள்ள தொகை',
    netProfitRealized: 'நிகர லாபம்',
    netLossSoFar: 'மீட்கப்படாத தொகை',
    noBatchesYet: 'இதுவரை கொள்முதல் பேட்ச்கள் எதுவும் பதிவு செய்யப்படவில்லை.',
    fishVariety: 'கருவாடு வகை',
    quantityKg: 'எடை (கிலோ)',
    datePurchased: 'கொள்முதல் தேதி',

    cashBookHeading: 'தினசரி பண வரவு-செலவு புத்தகம் (Cash Book)',
    filterAll: 'அனைத்தும்',
    filterToday: 'இன்று',
    filterYesterday: 'நேற்று',
    filter7Days: 'கடந்த 7 நாட்கள்',
    filterMonth: 'இந்த மாதம்',
    searchPlaceholder: 'வரவு, செலவு, கருவாடு வகை தேடுக...',
    inflowTotal: 'மொத்த வரவு',
    outflowTotal: 'மொத்த செலவு',
    noTransactions: 'இந்த காலகட்டத்தில் பரிவர்த்தனைகள் எதுவும் இல்லை.',
    cashOnly: 'ரொக்கம் மட்டும்',
    upiOnly: 'UPI மட்டும்',
    allChannels: 'அனைத்து வழிகளும்',

    supplierHeading: 'கருவாடு சப்ளையர்கள் & பாக்கி கணக்கு',
    supplierSubheading: 'மீனவர்கள் மற்றும் மொத்த வியாபாரிகளுக்கு தரவேண்டிய தொகையை நிர்வகிக்கவும்',
    addSupplier: '+ சப்ளையரை சேர்',
    totalOwedToSuppliers: 'சப்ளையர்களுக்கு மொத்த பாக்கி',
    supplierName: 'சப்ளையர் பெயர்',
    supplierLocation: 'ஊர் / துறைமுகம்',
    paySupplierBtn: 'பாக்கி தொகை செலுத்து',
    paymentHistory: 'செலுத்திய வரலாறு',
    noSuppliersYet: 'சப்ளையர் கணக்குகள் எதுவும் இல்லை.',

    saveBtn: 'பதிவு செய்',
    cancelBtn: 'ரத்து',
    amountLabel: 'தொகை (₹)',
    paymentModeLabel: 'செலுத்தும் முறை',
    cashMode: 'கடை ரொக்கம்',
    upiMode: 'UPI / வங்கி',
    creditUnpaidMode: 'விற்பனைக்கு பின் பணம் (சப்ளையர் கடன்)',
    notesLabel: 'குறிப்பு',
    dateLabel: 'தேதி',
    selectBatchLabel: 'கருவாடு பேட்சை தேர்வு செய்க',
    categoryLabel: 'வகை',

    salesMorning: 'காலை விற்பனை',
    salesEvening: 'மாலை நேர விற்பனை',
    salesFull: 'முழு நாள் விற்பனை',
    ownerCapital: 'தொடக்க முதலீடு',
    otherInflow: 'இதர வரவு',
    stockPurchase: 'கருவாடு சரக்கு கொள்முதல்',
    packagingPouches: 'பேக்கிங் கவர் & பைகள்',
    saltPreservatives: 'கல் உப்பு & பதப்படுத்துதல்',
    marketingSamples: 'மாதிரி பொட்டலங்கள் & விளம்பரம்',
    transportLabor: 'போக்குவரத்து & ஆள் கூலி',
    stallRentPower: 'கடை வாடகை & மின்சாரம்',
    supplierPayment: 'சப்ளையர் கடன் அடைப்பு',
    ownerDrawing: 'வீட்டு செலவு எடுத்தது',
    otherExpense: 'இதர கடை செலவு',
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
  isTamil: boolean;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'ta',
  setLanguage: () => {},
  t: translations.ta,
  isTamil: true,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('ta');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('shop_lang');
      if (saved === 'en' || saved === 'ta') {
        setLanguageState(saved);
      }
    } catch {
      // ignore
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('shop_lang', lang);
    } catch {
      // ignore
    }
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t: translations[language],
        isTamil: language === 'ta',
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => useContext(LanguageContext);

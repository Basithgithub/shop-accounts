# 🐟 KV Dryfish Kulumani, Trichy - Cash Flow & Batch Profit Ledger
*(கே.வி கருவாடு குலுமணி, திருச்சி)*

A secure, private cash flow and dry fish batch profit/loss management application built specifically for **KV Dryfish Kulumani, Trichy**. Built with **Next.js (TypeScript) & Node.js**, featuring **English / தமிழ் (Tamil)** language switching, and zero database dependencies.

---

## 🔒 Security & Privacy Highlights (No Database Required)

- **Zero External Database**: No MongoDB, MySQL, Postgres, or SQLite.
- **Local Encrypted JSON File**: All financial transactions, cash registers, batch profits, and supplier dues are stored in `data/shop_vault.enc`.
- **Military-Grade AES-256-GCM Encryption**: Key derived from your Master Password using **PBKDF2** (100,000 rounds).
- **Single-User Access**: Only Administrator Basith holds the master password (PIN: `9090`).
- **Auto-Lock / Quick Lock**: Lock the vault with one click when stepping away from the counter.

---

## 🚀 How to Run the Application

### Option 1: One-Click Windows Launcher
Simply double-click the included `start-shop.bat` file in `d:\Tasks\ShopAccounts`. It will automatically open your web browser to `http://localhost:3000`.

### Option 2: Command Line
```powershell
# In PowerShell / Command Prompt:
cd d:\Tasks\ShopAccounts

# Run the production server:
npm.cmd run start

# Or run in development mode:
npm.cmd run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in Chrome, Edge, or Firefox.

---

## 👑 Administrator Login & User Management

- **Administrator**: **Basith**
- **Default PIN / Password**: **`9090`**
- **User Creation Privilege**: Only Administrator Basith has permissions to create, edit, or delete staff users (Cashier / Viewer).
- **Protected Master Account**: Basith's administrator account is safeguarded and cannot be deleted.

---

## 💡 Key Features Built for Your Dry Fish Retail Startup

### 1. 🐟 Dry Fish Batch Purchase & Profit/Loss Lifecycle
- **Purchase Batch Sourcing**: Record inward stock lots (variety, kg, purchase price, freight/salt cost).
- **Daily Sales Recovery Tracking**: Live visual progress bar showing `% of purchase cost recovered` and remaining amount to break even.
- **Dynamic Profit/Loss & Profit %**:
  - Automatically calculates real-time Profit or Loss in ₹ and Profit % ($$\frac{\text{Sales} - \text{Cost}}{\text{Cost}} \times 100\%$$).
- **"Close Batch & Lock Profit"**:
  - Once a lot is sold out, click **"Close Batch"** to permanently lock and archive the final profit amount and profit percentage into your protected vault.
  - Closed batches are preserved in an archived history view and can be reopened if needed.

### 2. Cash In Counter & UPI Balances
- Live tracking of **Physical Cash in Drawer** (for daily change and counter receipts).
- Live tracking of **Bank / UPI QR Balance** (GPay, PhonePe, Paytm).
- Automatic daily opening and closing balance calculation.

### 2. Money In (Cash Inflow)
- **Retail Daily Sales**: Record morning session, evening rush, or full day collections with one click.
- **Retail Shopper Footfall**: Record how many customers walked in (calculates your average ticket spend per buyer to track startup growth).
- **Customer Udhaar Repayment**: Automatically increments your cash register when regular buyers pay their dues.
- **Owner Capital**: Track startup funds introduced.

### 3. Money Out (Cash Outflow)
- **Fish Stock Batch Purchases**: Record inward batches from coastal fishermen, harbors, or wholesale merchants with dry fish variety (Bombil, Anchovy/Nethili, Dry Prawns, Vaala, Mackerel, Surmai, Squid, etc.) and weight in kg.
- **Packaging & Branding**: Track retail zip-lock pouches, vacuum seal bags, silica gel packs, and branding labels.
- **Retail Growth Expenses**: Free tasting sample packets, flyers, promotional banners.
- **Operational Overheads**: Stall rent, electricity, coarse salt & preservatives, harbor freight and tempo/porter transport.
- **Supplier Dues Settlements**: Payments made to boat owners/wholesalers.
- **Owner Personal Drawings**: Money taken home.

### 4. Daily Cash Book & Ledger
- Search and filter by Date (**Today**, **Yesterday**, **Last 7 Days**, **This Month**, **All Time**).
- Filter by channel (**Cash Only** vs **UPI Only**) and type (**Inflow** vs **Outflow**).
- Shows live filtered totals and net surplus/deficit.

### 5. Retail Customer & Supplier Khata
- **Retail Customer Udhaar**: Track friendly credit given to trusted regular buyers.
- **One-Click WhatsApp Reminder**: Generates a courteous payment reminder with balance and phone number ready to paste into WhatsApp.
- **Harbor Supplier Ledger**: Track batch credit taken from fish suppliers and log settlements.

### 6. Reports & Backup
- **Cash Flow Statement**: Print-ready daily/monthly financial report with category breakdowns.
- **Encrypted Backup**: Download your `.enc.json` vault file to safely email or keep on a USB drive without risk.
- **Plain JSON Inspection**: Download readable JSON for personal record-keeping.
- **Restore / Import**: Easily restore from previous backup.

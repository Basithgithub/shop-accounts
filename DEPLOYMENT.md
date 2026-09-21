# KV Dryfish Kulumani, Trichy - Vercel Deployment Guide

Deploy your private dry fish shop cash flow & profit tracking system to **Vercel** with free encrypted cloud persistence.

---

## ⚡ Architecture on Vercel

- **Single-User Privacy**: Protected by **AES-256-GCM** encryption. Only **Basith** with PIN **`9090`** can decrypt and view the accounts.
- **Zero Database Maintenance**: Uses **Vercel KV** (free key-value store) to store the single encrypted JSON string (`shop_vault`).
- **Encrypted HTTP-Only Cookies**: Automatically synchronizes your unlock session across all Vercel serverless functions without exposing keys to the browser.
- **Automatic Seed**: When first deployed, the system automatically detects your initial ₹16,500 Dry Fish purchase lot and Basith administrator account!

---

## 🚀 Step-by-Step Deployment (Recommended: 3 Minutes)

### Step 1: Push Code to a Private GitHub Repository
1. Open PowerShell in `d:\Tasks\ShopAccounts`:
   ```powershell
   git init
   git add .
   git commit -m "KV Dryfish Shop Accounts for Vercel"
   ```
2. Create a **Private Repository** on [GitHub](https://github.com/new) named `shop-accounts`.
3. Push your code:
   ```powershell
   git remote add origin https://github.com/<YOUR-USERNAME>/shop-accounts.git
   git branch -M main
   git push -u origin main
   ```

---

### Step 2: Import into Vercel
1. Log in to [Vercel](https://vercel.com).
2. Click **"Add New..."** $\rightarrow$ **"Project"**.
3. Select your **`shop-accounts`** GitHub repository and click **"Import"**.
4. Framework Preset: **Next.js** (detected automatically).
5. Click **"Deploy"**.

---

### Step 3: Connect Free Vercel KV Storage (1 Click)
To ensure your transactions, daily sales, and lot updates persist forever in the cloud:
1. In your project dashboard on Vercel, click on the **"Storage"** tab at the top.
2. Click **"Create Database"** and select **"KV"** (Key-Value Storage).
3. Choose a name (e.g. `kv-dryfish-store`) and pick the closest region (e.g. `ap-south-1` Mumbai / Singapore).
4. Click **"Create"**.
5. Once created, click **"Connect to Project"** and select your `shop-accounts` project.
6. Check **Production, Preview, and Development**, then click **"Connect"**.
7. Go to the **"Deployments"** tab, click the three dots `...` next to the latest deployment, and click **"Redeploy"** so the new KV credentials take effect.

---

### Step 4: Open Your Live Shop Accounts!
1. Open your live Vercel URL (e.g. `https://shop-accounts.vercel.app`) on your mobile phone or laptop.
2. Enter your PIN: **`9090`**.
3. Click **"கணக்கு பெட்டகத்தை திறக்க"** (*Unlock Accounts Vault*).
4. Your dashboard is immediately live with your ₹16,500 lot, ready to record daily sales and supplier payments anytime from anywhere!

---

## 🔒 Security & Backups

- **Local Offline Mode Still Works**: You can continue running the app locally on your computer at any time by double-clicking `start-shop.bat`. It will use your local files in `data/`.
- **Encrypted Backup Anytime**:
  - Click **"Security & Data (பாதுகாப்பு)"** in the top navigation bar.
  - Click **"Download Encrypted JSON (.enc)"** to save an encrypted backup to your phone or computer.
  - You can restore this backup anytime using **"Restore / Import Encrypted Vault"**.


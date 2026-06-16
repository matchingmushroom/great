# Great Pickle Taste (GPT) - Project Overview & Technical Manual

This manual provides the technical layout, folder tree descriptions, local installation steps, configuration guides, and details of the 10 internal dashboard modules.

---

## 1. Project Directory Structure

```txt
gpt/
├── .next/                   # Next.js build compilation outputs
├── public/                  # Static assets (icons, SVGs, design images)
├── src/
│   ├── app/                 # Next.js App Router tree
│   │   ├── dashboard/       # Internal Operations Console (10 modules)
│   │   │   ├── creditors/   # Supplier ledger and repayment logs
│   │   │   ├── debtors/     # Customer outstanding balance logs
│   │   │   ├── expenses/    # Cash outflows tracking
│   │   │   ├── hr/          # Roster, attendance register, advances
│   │   │   ├── inventory/   # Stock adjustment logs & levels
│   │   │   ├── orders/      # E-commerce website order processing
│   │   │   ├── products/    # Product CRUD catalog manager
│   │   │   ├── purchases/   # Supplier raw material logs
│   │   │   ├── reports/     # Financial Recharts analytics
│   │   │   ├── sales/       # Point of Sale terminal & invoicing
│   │   │   ├── layout.tsx   # Sidebar dashboard layout with role check
│   │   │   └── page.tsx     # Overview panel
│   │   ├── login/           # Authentication portal
│   │   ├── globals.css      # Custom Tailwind styling variables
│   │   ├── layout.tsx       # Root layout provider
│   │   └── page.tsx         # Customer storefront landing page
│   ├── components/
│   │   ├── ui/              # Reusable design primitives (Buttons, Cards, Dialogs, Inputs)
│   │   ├── CartDrawer.tsx   # Shopping cart slider & WhatsApp compiler
│   │   └── OrderPDF.tsx     # react-pdf models for POS Invoices & Executive reports
│   ├── context/
│   │   ├── AuthContext.tsx  # User sessions, permissions, and logout logic
│   │   └── CartContext.tsx  # Storefront shopping cart state management
│   ├── lib/
│   │   ├── db.ts            # Firebase client initializer & LocalStorage fail-safe layers
│   │   └── mockData.ts      # TypeScript interfaces and initial data seeds
│   └── next-env.d.ts
├── .env.local               # Environment variables (Firebase configs)
├── next.config.ts           # Next.js build configurations
├── package.json             # Package scripts and dependencies
├── tsconfig.json            # TypeScript configuration
└── README.md                # General readme
```

---

## 2. Core Setup & Operations

### A. Environment Configuration (`.env.local`)
Create a `.env.local` file at the root to enable live Firebase Authentication and Firestore features:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```
*Note: If these environment variables are absent, the application automatically runs in **Local Demo Mode** using `localStorage` fallbacks, allowing full CRUD interactions offline.*

### B. Command References
*   Install dependencies: `npm install`
*   Run local server: `npm run dev`
*   Production build: `npm run build`
*   Start compiled build: `npm run start`

---

## 3. Operational Dashboard Modules

The operational console inside `/dashboard` contains the following functional units:

1.  **Overview & Statistics Page**: Renders core financial balances (Gross Sales, Outflows, Net Profits, Low Stock warning alerts) and provides quick POS launch options.
2.  **Products Menu (`/dashboard/products`)**: Full catalog manager. Allows adding, editing description, setting unit prices, updating catalog pictures, and changing item visibility.
3.  **Sales Ledger & POS (`/dashboard/sales`)**: Point of Sale checkout dashboard. Log over-the-counter purchases, calculate discounts, print PDF invoices, and review outstanding sales records.
4.  **Supplier Purchases (`/dashboard/purchases`)**: Log raw green materials, packaging glass, or spice orders from farm wholesale vendors. Pushes updates directly to stock numbers.
5.  **Inventory Stock Control (`/dashboard/inventory`)**: Detailed register to adjust jar levels, log damaged/spilled stock, and set minimum inventory threshold warnings.
6.  **Administrative Expenses (`/dashboard/expenses`)**: Categorize office rent, utility costs, design stickers printing, or marketing expenditures.
7.  **Debtors Ledger (`/dashboard/debtors`)**: Track credit sales. Maintain lists of customers with pending balances and log installment payments.
8.  **Creditors Ledger (`/dashboard/creditors`)**: Keep records of suppliers owed. Track balance repayments for packaging jars or bulk mango shipments.
9.  **Web Catalog Orders (`/dashboard/orders`)**: Fulfill, update, and manage orders placed from the online storefront before delivery dispatch.
10. **Human Resources & Attendance (`/dashboard/hr`)**: Directory of workers, monthly basic salary configs, daily attendance register, and advance cash payouts tracker.
11. **Financial reports (`/dashboard/reports`)**: Graphical representation of income statements, expense allocations, and top-selling pickles. Includes one-click executive PDF report downloading.

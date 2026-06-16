'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/db';
import { Sale, Expense, Purchase, Debtor, Creditor, Product } from '@/lib/mockData';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button } from '@/components/ui';
import { LineChart, BarChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { TrendingUp, FileText, ArrowDownRight, ArrowUpRight, DollarSign, PieChart as PieIcon, BarChart2 } from 'lucide-react';
import dynamic from 'next/dynamic';

// Dynamically import PDF components to avoid SSR issue during Next.js builds
const PDFDownloadLink = dynamic(
  () => import('@react-pdf/renderer').then(mod => mod.PDFDownloadLink),
  { ssr: false }
);

const ReportPDF = dynamic(
  () => import('@/components/OrderPDF').then(mod => mod.ReportPDF),
  { ssr: false }
);

export default function ReportsModule() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [debtors, setDebtors] = useState<Debtor[]>([]);
  const [creditors, setCreditors] = useState<Creditor[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAllData() {
      setLoading(true);
      try {
        const [salesData, purchaseData, expenseData, debtorData, creditorData, prodData] = await Promise.all([
          db.getSales(),
          db.getPurchases(),
          db.getExpenses(),
          db.getDebtors(),
          db.getCreditors(),
          db.getProducts()
        ]);
        setSales(salesData);
        setPurchases(purchaseData);
        setExpenses(expenseData);
        setDebtors(debtorData);
        setCreditors(creditorData);
        setProducts(prodData);
      } catch (err) {
        console.error('Error loading reports details:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAllData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-stone-500 text-sm">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mr-3" />
        Generating graphic charts & compiling profit/loss ledger sheets...
      </div>
    );
  }

  // Calculate totals
  const totalSalesVal = sales.reduce((acc, curr) => acc + curr.total, 0);
  const totalPaidSalesVal = sales.reduce((acc, curr) => acc + curr.amountPaid, 0);
  const totalPurchasesVal = purchases.reduce((acc, curr) => acc + curr.total, 0);
  const totalPaidPurchasesVal = purchases.reduce((acc, curr) => acc + curr.amountPaid, 0);
  const totalExpensesVal = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  
  const totalOutflow = totalPurchasesVal + totalExpensesVal;
  const netProfit = totalSalesVal - totalOutflow;

  const totalDebts = debtors.reduce((acc, curr) => acc + curr.totalDebt, 0);
  const totalCredits = creditors.reduce((acc, curr) => acc + curr.totalCredit, 0);

  // Recharts Chart 1: Profit & Loss summary data
  const pnlChartData = [
    { name: 'Gross Sales', amount: totalSalesVal },
    { name: 'Vendor Purchases', amount: totalPurchasesVal },
    { name: 'Operational Exp', amount: totalExpensesVal },
    { name: 'Net Profit', amount: Math.max(0, netProfit) }
  ];

  // Recharts Chart 2: Expenses by category distribution
  const expenseMap: Record<string, number> = {};
  expenses.forEach(e => {
    expenseMap[e.category] = (expenseMap[e.category] || 0) + e.amount;
  });
  const expensePieData = Object.entries(expenseMap).map(([name, value]) => ({ name, value }));

  const COLORS = ['#2c4a21', '#d97706', '#c2410c', '#3b82f6', '#8b5cf6', '#ec4899', '#6b7280'];

  // Recharts Chart 3: Top selling pickles by quantity sold
  const productSalesMap: Record<string, number> = {};
  sales.forEach(sale => {
    sale.items.forEach(item => {
      productSalesMap[item.name] = (productSalesMap[item.name] || 0) + item.quantity;
    });
  });
  const productBarData = Object.entries(productSalesMap).map(([name, value]) => ({ name, qty: value })).sort((a,b) => b.qty - a.qty).slice(0, 5);

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Module Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-stone-800 tracking-tight flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-secondary" />
            10. Business Performance & Analytics Reports
          </h2>
          <p className="text-[10px] text-stone-400">View real-time profit and loss calculations, operational expense allocations, and export PDF summaries.</p>
        </div>
        
        {/* PDF Download Link */}
        <PDFDownloadLink
          document={
            <ReportPDF
              sales={sales}
              purchases={purchases}
              expenses={expenses}
              debtors={debtors}
              creditors={creditors}
              products={products}
            />
          }
          fileName={`gpt-business-report-${new Date().toISOString().split('T')[0]}.pdf`}
        >
          {({ loading: pdfLoading }) => (
            <Button disabled={pdfLoading} className="font-bold text-xs flex items-center gap-1.5 shadow-sm">
              <FileText className="w-4 h-4" />
              {pdfLoading ? 'Building PDF report...' : 'Download Executive PDF Report'}
            </Button>
          )}
        </PDFDownloadLink>
      </div>

      {/* P&L Statement Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <Card className="border border-stone-200 bg-white">
          <CardContent className="p-6 space-y-1">
            <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">Gross Sales Profitability</span>
            <p className="text-xl font-black text-primary font-display">Rs. {totalSalesVal}</p>
            <div className="flex justify-between items-center text-[10px] text-stone-400 pt-2 border-t border-stone-100 mt-2">
              <span>Collected Cash: Rs. {totalPaidSalesVal}</span>
              <span className="text-red-500 font-semibold flex items-center gap-0.5">
                <ArrowUpRight className="w-3 h-3 shrink-0" />
                Debts: Rs. {totalDebts}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-stone-200 bg-white">
          <CardContent className="p-6 space-y-1">
            <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">Operational Cost Outflows</span>
            <p className="text-xl font-black text-stone-800 font-display">Rs. {totalOutflow}</p>
            <div className="flex justify-between items-center text-[10px] text-stone-400 pt-2 border-t border-stone-100 mt-2">
              <span>Supplies Purchases: Rs. {totalPurchasesVal}</span>
              <span className="text-red-500 font-semibold flex items-center gap-0.5">
                <ArrowDownRight className="w-3 h-3 shrink-0" />
                Credit: Rs. {totalCredits}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-stone-200 bg-white">
          <CardContent className="p-6 space-y-1">
            <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">Net Profit / Loss Margins</span>
            <p className={`text-xl font-black font-display ${netProfit >= 0 ? 'text-primary' : 'text-red-650'}`}>
              Rs. {netProfit}
            </p>
            <div className="flex justify-between items-center text-[10px] text-stone-400 pt-2 border-t border-stone-100 mt-2">
              <span>Profit margin %:</span>
              <span className="font-bold text-stone-700">
                {totalSalesVal > 0 ? ((netProfit / totalSalesVal) * 100).toFixed(1) : 0}%
              </span>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Visual Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* P&L Bar Chart */}
        <Card className="lg:col-span-8 border border-stone-200 bg-white">
          <CardHeader>
            <CardTitle className="text-sm font-extrabold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-secondary" />
              Income Statement Summary
            </CardTitle>
            <CardDescription>Grand sum comparison of inflow revenues vs administrative outflow payments.</CardDescription>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pnlChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 'bold' }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v) => `Rs. ${v}`} contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
                <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                  {pnlChartData.map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={idx === 0 || idx === 3 ? '#2c4a21' : '#c2410c'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Expense distribution Pie Chart */}
        <Card className="lg:col-span-4 border border-stone-200 bg-white">
          <CardHeader>
            <CardTitle className="text-sm font-extrabold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
              <PieIcon className="w-4 h-4 text-secondary" />
              Category Expenses Split
            </CardTitle>
            <CardDescription>Allocations of operational spending categories.</CardDescription>
          </CardHeader>
          <CardContent className="h-64 flex flex-col justify-center items-center">
            {expensePieData.length === 0 ? (
              <p className="text-stone-400 text-xs py-20">No expense records found.</p>
            ) : (
              <>
                <div className="w-full h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={expensePieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {expensePieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v) => `Rs. ${v}`} contentStyle={{ fontSize: '10px', borderRadius: '8px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                {/* Custom Legend */}
                <div className="flex flex-wrap gap-2 text-[9px] font-bold text-stone-500 justify-center mt-2.5">
                  {expensePieData.map((entry, index) => (
                    <span key={entry.name} className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                      {entry.name}
                    </span>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Top-Selling Products Bar Chart */}
        <Card className="lg:col-span-12 border border-stone-200 bg-white">
          <CardHeader>
            <CardTitle className="text-sm font-extrabold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-secondary" />
              Top Pickle Flavors By Volume
            </CardTitle>
            <CardDescription>Product sales count volume indicators extracted from recorded counter sales.</CardDescription>
          </CardHeader>
          <CardContent className="h-64">
            {productBarData.length === 0 ? (
              <p className="text-stone-400 text-xs py-20 text-center">No sales registered yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={productBarData} layout="vertical" margin={{ top: 10, right: 10, left: 30, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10 }} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 9, fontWeight: 'bold' }} width={120} />
                  <Tooltip formatter={(v) => `${v} jars`} contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
                  <Bar dataKey="qty" fill="#d97706" radius={[0, 4, 4, 0]} maxBarSize={20} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

      </div>

    </div>
  );
}

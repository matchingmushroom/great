'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/db';
import { Sale, Expense, Purchase, Order, Product } from '@/lib/mockData';
import { Card, CardContent, CardHeader, CardTitle, Badge, TableContainer, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Button } from '@/components/ui';
import { TrendingUp, TrendingDown, Landmark, Package2, ArrowUpRight, MessageSquare, AlertCircle, ShoppingCart } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [salesData, purchaseData, expenseData, orderData, prodData] = await Promise.all([
          db.getSales(),
          db.getPurchases(),
          db.getExpenses(),
          db.getOrders(),
          db.getProducts()
        ]);
        setSales(salesData);
        setPurchases(purchaseData);
        setExpenses(expenseData);
        setOrders(orderData);
        setProducts(prodData);
      } catch (err) {
        console.error('Error loading overview data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-stone-500 text-sm">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mr-3" />
        Compiling dashboard data snapshot...
      </div>
    );
  }

  // Calculate totals
  const totalSales = sales.reduce((acc, curr) => acc + curr.total, 0);
  const totalPurchases = purchases.reduce((acc, curr) => acc + curr.total, 0);
  const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const totalOutflow = totalPurchases + totalExpenses;
  const netProfit = totalSales - totalOutflow;

  const lowStockCount = products.filter(p => p.stockQuantity <= p.minStockLevel).length;
  const pendingOrders = orders.filter(o => o.status === 'Pending');

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Welcome Banner */}
      <div className="bg-primary text-white p-6 md:p-8 rounded-2xl border border-primary-dark shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black font-display text-white">Namaste, Welcome to GPT Manager</h2>
          <p className="text-xs text-stone-300 mt-1 leading-relaxed">
            Monitor sales invoice logs, inventory thresholds, WhatsApp e-commerce orders, and staff advances.
          </p>
        </div>
        <div className="flex gap-3 shrink-0">
          <Link href="/dashboard/sales">
            <Button className="bg-secondary hover:bg-secondary-dark text-white font-bold text-xs py-2 px-4 shadow-sm">
              New POS Sale
            </Button>
          </Link>
          <Link href="/dashboard/orders">
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 font-bold text-xs py-2 px-4">
              View Website Orders
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Sales */}
        <Card className="border border-stone-200">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">Gross Sales</span>
              <p className="text-2xl font-black text-primary font-display">Rs. {totalSales}</p>
              <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5 mt-1">
                +12% vs last month
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shadow-2xs">
              <TrendingUp className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        {/* Expenses & Purchases */}
        <Card className="border border-stone-200">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">Outflows & Purchases</span>
              <p className="text-2xl font-black text-stone-800 font-display">Rs. {totalOutflow}</p>
              <p className="text-[10px] text-stone-500 font-medium mt-1">
                Purchases: Rs. {totalPurchases} | Exp: Rs. {totalExpenses}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-stone-100 text-stone-600 flex items-center justify-center border border-stone-200 shadow-2xs">
              <TrendingDown className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        {/* Net Profit */}
        <Card className="border border-stone-200">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">Net Profit / Loss</span>
              <p className={`text-2xl font-black font-display ${netProfit >= 0 ? 'text-primary' : 'text-red-600'}`}>
                Rs. {netProfit}
              </p>
              <p className="text-[10px] text-stone-500 font-semibold mt-1">
                Margin: {totalSales > 0 ? ((netProfit / totalSales) * 100).toFixed(1) : 0}%
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-secondary flex items-center justify-center border border-amber-100 shadow-2xs">
              <Landmark className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        {/* Stock Alert */}
        <Card className="border border-stone-200">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">Inventory Alerts</span>
              <p className="text-2xl font-black text-stone-900 font-display">{lowStockCount} Items</p>
              <p className="text-[10px] text-red-500 font-semibold flex items-center gap-0.5 mt-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                Under minimum threshold
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center border border-red-100 shadow-2xs">
              <Package2 className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Pending E-commerce Orders */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-stone-800 tracking-tight flex items-center gap-2">
                <ShoppingCart className="w-4.5 h-4.5 text-secondary" />
                Recent Web Orders Pending
              </h3>
              <p className="text-[10px] text-stone-400">Website orders awaiting staff verification & delivery confirmation.</p>
            </div>
            <Link href="/dashboard/orders" className="text-xs font-bold text-secondary hover:underline flex items-center gap-0.5">
              Manage Orders <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <TableContainer>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order No</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-stone-400 text-xs">
                      No pending orders left! Good job.
                    </TableCell>
                  </TableRow>
                ) : (
                  pendingOrders.slice(0, 5).map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-bold text-primary text-xs">{order.orderNumber}</TableCell>
                      <TableCell>
                        <p className="font-semibold text-stone-800 text-xs">{order.customerName}</p>
                        <span className="text-[10px] text-stone-400 block">{order.customerPhone}</span>
                      </TableCell>
                      <TableCell className="max-w-[150px] truncate text-xs">{order.deliveryAddress}</TableCell>
                      <TableCell className="font-bold text-xs">Rs. {order.total}</TableCell>
                      <TableCell>
                        <Badge variant="warning">{order.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <a 
                          href={`https://wa.me/${order.customerPhone}`} 
                          target="_blank" 
                          rel="noreferrer"
                        >
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Chat via WhatsApp">
                            <MessageSquare className="w-4 h-4 text-emerald-600" />
                          </Button>
                        </a>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </div>

        {/* Shortcuts Panel */}
        <div className="lg:col-span-4 space-y-4">
          <div>
            <h3 className="text-base font-extrabold text-stone-800 tracking-tight">Quick Actions</h3>
            <p className="text-[10px] text-stone-400">Shortcuts to perform daily operational actions.</p>
          </div>
          
          <Card className="border border-stone-200">
            <CardContent className="p-6 space-y-3">
              <Link href="/dashboard/sales" className="block">
                <button className="w-full text-left bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-xl p-3.5 flex items-center justify-between transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm">
                      P
                    </div>
                    <div>
                      <p className="text-xs font-bold text-stone-800">Launch POS Billing</p>
                      <p className="text-[9px] text-stone-400 mt-0.5">Process counter sales & print invoices</p>
                    </div>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-stone-400" />
                </button>
              </Link>

              <Link href="/dashboard/expenses" className="block">
                <button className="w-full text-left bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-xl p-3.5 flex items-center justify-between transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-50 text-secondary flex items-center justify-center font-bold text-sm">
                      E
                    </div>
                    <div>
                      <p className="text-xs font-bold text-stone-800">Record Expense</p>
                      <p className="text-[9px] text-stone-400 mt-0.5">Log rent, salaries, spices, jars</p>
                    </div>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-stone-400" />
                </button>
              </Link>

              <Link href="/dashboard/inventory" className="block">
                <button className="w-full text-left bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-xl p-3.5 flex items-center justify-between transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
                      I
                    </div>
                    <div>
                      <p className="text-xs font-bold text-stone-800">Adjust Stock Count</p>
                      <p className="text-[9px] text-stone-400 mt-0.5">Manage damage log, spillages, counts</p>
                    </div>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-stone-400" />
                </button>
              </Link>
            </CardContent>
          </Card>
        </div>

      </div>

    </div>
  );
}

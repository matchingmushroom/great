'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/db';
import { Sale, Product } from '@/lib/mockData';
import { useAuth } from '@/context/AuthContext';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label, Select, Badge, TableContainer, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Dialog, Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui';
import { FileSpreadsheet, Plus, Trash2, Printer, Search, Calculator, CheckCircle2 } from 'lucide-react';
import dynamic from 'next/dynamic';

// Dynamically import PDF components to avoid SSR issue during Next.js builds
const PDFDownloadLink = dynamic(
  () => import('@react-pdf/renderer').then(mod => mod.PDFDownloadLink),
  { ssr: false }
);

const InvoicePDF = dynamic(
  () => import('@/components/OrderPDF').then(mod => mod.InvoicePDF),
  { ssr: false }
);

export default function SalesModule() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('billing');
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Dialog state
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Billing Form State
  const [billingItems, setBillingItems] = useState<{ product: Product; quantity: number }[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [discount, setDiscount] = useState(0);
  const [amountPaid, setAmountPaid] = useState(0);
  const [paymentStatus, setPaymentStatus] = useState<'Paid' | 'Unpaid' | 'Partially Paid'>('Paid');
  const [searchTerm, setSearchTerm] = useState('');

  async function loadData() {
    setLoading(true);
    try {
      const [salesData, prodData] = await Promise.all([
        db.getSales(),
        db.getProducts()
      ]);
      setSales(salesData);
      setProducts(prodData.filter(p => p.isActive));
    } catch (err) {
      console.error('Error loading sales data:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  // Filter products based on search term in POS
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // POS Add item helper
  const addBillingItem = (prod: Product) => {
    if (prod.stockQuantity <= 0) {
      alert('Product is out of stock!');
      return;
    }
    
    setBillingItems(prev => {
      const existing = prev.find(item => item.product.id === prod.id);
      if (existing) {
        if (existing.quantity >= prod.stockQuantity) {
          alert('Cannot exceed available stock!');
          return prev;
        }
        return prev.map(item => 
          item.product.id === prod.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product: prod, quantity: 1 }];
    });
  };

  const removeBillingItem = (id: string) => {
    setBillingItems(prev => prev.filter(item => item.product.id !== id));
  };

  const updateBillingItemQty = (id: string, qty: number, stockQty: number) => {
    if (qty <= 0) {
      removeBillingItem(id);
      return;
    }
    if (qty > stockQty) {
      alert('Cannot exceed available stock!');
      return;
    }
    setBillingItems(prev => prev.map(item => 
      item.product.id === id ? { ...item, quantity: qty } : item
    ));
  };

  // Calculations
  const subtotal = billingItems.reduce((acc, curr) => acc + curr.product.price * curr.quantity, 0);
  const total = Math.max(0, subtotal - discount);
  const balanceDue = Math.max(0, total - amountPaid);

  // Set Payment Status automatically based on amount paid
  useEffect(() => {
    if (amountPaid >= total && total > 0) {
      setPaymentStatus('Paid');
    } else if (amountPaid === 0 && total > 0) {
      setPaymentStatus('Unpaid');
    } else if (amountPaid < total && amountPaid > 0) {
      setPaymentStatus('Partially Paid');
    }
  }, [amountPaid, total]);

  const handleCheckoutSale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (billingItems.length === 0) {
      alert('Please select at least one pickle product.');
      return;
    }
    if (!customerName.trim()) {
      alert('Customer name is required.');
      return;
    }

    const salePayload: Sale = {
      id: `sale-${Date.now()}`,
      invoiceNumber: `GPT-SALE-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName,
      customerPhone,
      items: billingItems.map(item => ({
        productId: item.product.id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        total: item.product.price * item.quantity
      })),
      subtotal,
      discount,
      total,
      paymentStatus,
      amountPaid,
      balanceDue,
      saleDate: Date.now(),
      recordedBy: user?.email || 'staff@gpt.com'
    };

    try {
      await db.saveSale(salePayload);
      alert('Sale invoice completed successfully! Inventory stock updated.');
      
      // Reset form
      setBillingItems([]);
      setCustomerName('');
      setCustomerPhone('');
      setDiscount(0);
      setAmountPaid(0);
      
      // Reload Data
      loadData();
      setActiveTab('history');
    } catch (err) {
      console.error(err);
      alert('Failed to save sale.');
    }
  };

  const showSaleDetails = (sale: Sale) => {
    setSelectedSale(sale);
    setIsDetailOpen(true);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Module Title Header */}
      <div>
        <h2 className="text-xl font-extrabold text-stone-800 tracking-tight flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5 text-secondary" />
          2. Sales Ledger & POS Terminal
        </h2>
        <p className="text-[10px] text-stone-400">Record customer purchases over the counter, sync outstanding balances, and print PDF invoices.</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="billing">POS Billing Terminal</TabsTrigger>
          <TabsTrigger value="history">Sales Invoices History</TabsTrigger>
        </TabsList>

        {/* 1. BILLING TERMINAL */}
        <TabsContent value="billing">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left side: Product catalog grid */}
            <div className="lg:col-span-7 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-stone-400" />
                <Input 
                  placeholder="Search pickles by name or category..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-11 bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-2">
                {filteredProducts.map((p) => {
                  const isOutOfStock = p.stockQuantity === 0;
                  return (
                    <div 
                      key={p.id}
                      onClick={() => !isOutOfStock && addBillingItem(p)}
                      className={`
                        p-4 rounded-xl border bg-white flex justify-between items-center gap-3 transition-all cursor-pointer select-none
                        ${isOutOfStock 
                          ? 'border-stone-200 opacity-50 cursor-not-allowed bg-stone-50/50' 
                          : 'border-stone-200/80 hover:border-primary hover:shadow-xs'
                        }
                      `}
                    >
                      <div className="min-w-0">
                        <p className="font-bold text-xs text-stone-900 leading-tight truncate">{p.name}</p>
                        <span className="text-[10px] uppercase font-bold text-stone-400 block mt-0.5">{p.category}</span>
                        <p className="text-xs font-black text-primary mt-1.5">Rs. {p.price}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className={`inline-block text-[9px] font-extrabold px-2 py-0.5 rounded-full ${isOutOfStock ? 'bg-red-50 text-red-600' : 'bg-stone-50 text-stone-500'}`}>
                          {isOutOfStock ? 'Out of stock' : `${p.stockQuantity} Left`}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right side: Invoice billing cart */}
            <Card className="lg:col-span-5 border border-stone-200 bg-white">
              <CardHeader className="pb-4">
                <CardTitle className="text-sm font-extrabold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                  <Calculator className="w-4 h-4 text-secondary" />
                  Active Invoice Builder
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                
                {/* Billing items */}
                {billingItems.length === 0 ? (
                  <div className="py-8 text-center text-stone-400 text-xs border border-dashed border-stone-200 rounded-xl">
                    Select pickles from left to add to invoice billing list.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                    {billingItems.map((item) => (
                      <div key={item.product.id} className="flex justify-between items-center bg-stone-50 p-2.5 rounded-lg border border-stone-100">
                        <div className="min-w-0 flex-1 pr-3">
                          <p className="text-xs font-bold text-stone-800 truncate leading-tight">{item.product.name}</p>
                          <span className="text-[9px] text-stone-400 block mt-0.5">Rs. {item.product.price} / jar</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center border border-stone-200 rounded bg-white">
                            <button
                              type="button"
                              onClick={() => updateBillingItemQty(item.product.id, item.quantity - 1, item.product.stockQuantity)}
                              className="px-1.5 py-0.5 text-xs text-stone-500 hover:text-stone-800"
                            >
                              -
                            </button>
                            <span className="text-[11px] font-extrabold text-stone-800 px-1.5">{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => updateBillingItemQty(item.product.id, item.quantity + 1, item.product.stockQuantity)}
                              className="px-1.5 py-0.5 text-xs text-stone-500 hover:text-stone-800"
                            >
                              +
                            </button>
                          </div>
                          <span className="text-xs font-bold text-primary min-w-[50px] text-right">
                            Rs. {item.product.price * item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeBillingItem(item.product.id)}
                            className="text-stone-300 hover:text-red-600 transition-colors p-0.5"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Form metadata */}
                <form onSubmit={handleCheckoutSale} className="space-y-3.5 border-t border-stone-100 pt-4">
                  <div>
                    <Label htmlFor="sal-cust">Customer Name *</Label>
                    <Input
                      id="sal-cust"
                      placeholder="e.g. Shyam Sharma"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="sal-phone">Customer Contact Phone</Label>
                    <Input
                      id="sal-phone"
                      placeholder="e.g. 984XXXXXXX"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="sal-disc">Discount (Rs.)</Label>
                      <Input
                        id="sal-disc"
                        type="number"
                        min="0"
                        placeholder="0"
                        value={discount || ''}
                        onChange={(e) => setDiscount(Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="sal-paid">Amount Paid (Rs.) *</Label>
                      <Input
                        id="sal-paid"
                        type="number"
                        min="0"
                        placeholder="0"
                        value={amountPaid || ''}
                        onChange={(e) => setAmountPaid(Number(e.target.value))}
                        required
                      />
                    </div>
                  </div>

                  {/* Calculations ledger display */}
                  <div className="bg-stone-50 rounded-xl p-4 border border-stone-200/50 space-y-2.5">
                    <div className="flex justify-between items-center text-xs text-stone-500">
                      <span>Subtotal</span>
                      <span className="font-semibold text-stone-700">Rs. {subtotal}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs text-stone-500">
                      <span>Discount Given</span>
                      <span className="font-semibold text-stone-700">- Rs. {discount}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs font-bold text-stone-700 pt-1.5 border-t border-stone-200">
                      <span>Invoice Grand Total</span>
                      <span className="text-primary text-sm font-black">Rs. {total}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs text-stone-500">
                      <span>Payment Status</span>
                      <Badge variant={paymentStatus === 'Paid' ? 'success' : 'warning'}>
                        {paymentStatus}
                      </Badge>
                    </div>
                    {balanceDue > 0 && (
                      <div className="flex justify-between items-center text-xs text-red-600 font-bold bg-red-50 p-2 rounded-lg border border-red-100">
                        <span>Owed Balance (To Debtors):</span>
                        <span className="font-black">Rs. {balanceDue}</span>
                      </div>
                    )}
                  </div>

                  <Button 
                    type="submit"
                    className="w-full flex justify-center py-3 font-extrabold text-sm"
                    disabled={billingItems.length === 0}
                  >
                    Check-Out Invoice & Print Bill
                  </Button>
                </form>

              </CardContent>
            </Card>

          </div>
        </TabsContent>

        {/* 2. SALES INVOICE HISTORY */}
        <TabsContent value="history">
          {loading ? (
            <div className="flex items-center justify-center py-20 text-stone-400 text-sm">
              Loading sales ledger history...
            </div>
          ) : sales.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white border border-stone-200 rounded-xl text-stone-400 text-xs">
              No sales recorded yet. Process one in the POS terminal tab.
            </div>
          ) : (
            <TableContainer>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice No</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Grand Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Staff Agent</TableHead>
                    <TableHead className="text-right">Invoice actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sales.map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell className="font-extrabold text-xs text-primary">{sale.invoiceNumber}</TableCell>
                      <TableCell>
                        <p className="font-bold text-xs text-stone-900 leading-none">{sale.customerName}</p>
                        {sale.customerPhone && (
                          <span className="text-[10px] text-stone-400 block mt-0.5">{sale.customerPhone}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs">{new Date(sale.saleDate).toLocaleDateString()}</TableCell>
                      <TableCell className="font-bold text-xs">Rs. {sale.total}</TableCell>
                      <TableCell>
                        <Badge variant={sale.paymentStatus === 'Paid' ? 'success' : 'warning'}>
                          {sale.paymentStatus}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-stone-500 font-semibold">{sale.recordedBy.split('@')[0]}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1.5">
                          <Button 
                            onClick={() => showSaleDetails(sale)} 
                            variant="ghost" 
                            size="sm" 
                            className="text-xs font-bold"
                          >
                            Details
                          </Button>
                          
                          {/* Client-side PDF downloader button */}
                          <PDFDownloadLink
                            document={<InvoicePDF sale={sale} />}
                            fileName={`invoice-${sale.invoiceNumber}.pdf`}
                          >
                            {({ loading: pdfLoading }) => (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-8 py-1.5 px-3 flex items-center gap-1 text-[10px] font-bold border-stone-200 bg-white"
                                disabled={pdfLoading}
                              >
                                <Printer className="w-3.5 h-3.5" />
                                {pdfLoading ? 'Gen...' : 'Bill'}
                              </Button>
                            )}
                          </PDFDownloadLink>

                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </TabsContent>
      </Tabs>

      {/* Sale Details Modal */}
      <Dialog
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title={`Invoice: ${selectedSale?.invoiceNumber}`}
      >
        {selectedSale && (
          <div className="space-y-6">
            
            {/* Meta fields */}
            <div className="grid grid-cols-2 gap-4 border-b border-stone-100 pb-4">
              <div>
                <p className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">Customer Details</p>
                <p className="text-xs font-bold text-stone-800 mt-1">{selectedSale.customerName}</p>
                <p className="text-xs text-stone-500">{selectedSale.customerPhone || 'No contact phone'}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">Invoice Date</p>
                <p className="text-xs font-semibold text-stone-800 mt-1">{new Date(selectedSale.saleDate).toLocaleString()}</p>
                <p className="text-xs text-stone-500">Staff: {selectedSale.recordedBy}</p>
              </div>
            </div>

            {/* Item list */}
            <div>
              <p className="text-[10px] uppercase font-bold text-stone-400 tracking-wider mb-2">Items Billed</p>
              <div className="space-y-2 border border-stone-100 rounded-xl p-3 bg-stone-50/50">
                {selectedSale.items.map((item, i) => (
                  <div key={i} className="flex justify-between items-center text-xs py-1.5 border-b border-stone-100/50 last:border-0">
                    <div>
                      <p className="font-bold text-stone-800">{item.name}</p>
                      <span className="text-[10px] text-stone-400">Rs. {item.price} x {item.quantity}</span>
                    </div>
                    <span className="font-bold text-primary">Rs. {item.total}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pricing ledger */}
            <div className="bg-stone-50 rounded-xl p-4 border border-stone-200/50 space-y-2.5">
              <div className="flex justify-between items-center text-xs text-stone-500">
                <span>Subtotal</span>
                <span>Rs. {selectedSale.subtotal}</span>
              </div>
              <div className="flex justify-between items-center text-xs text-stone-500">
                <span>Discount</span>
                <span>- Rs. {selectedSale.discount}</span>
              </div>
              <div className="flex justify-between items-center text-xs font-bold text-stone-700 pt-1.5 border-t border-stone-200">
                <span>Total Charge</span>
                <span className="text-primary text-sm font-black">Rs. {selectedSale.total}</span>
              </div>
              <div className="flex justify-between items-center text-xs text-stone-500">
                <span>Amount Paid</span>
                <span>Rs. {selectedSale.amountPaid}</span>
              </div>
              <div className="flex justify-between items-center text-xs text-stone-500">
                <span>Outstanding Balance</span>
                <span className={selectedSale.balanceDue > 0 ? 'text-red-500 font-bold' : 'text-stone-700 font-semibold'}>
                  Rs. {selectedSale.balanceDue}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs text-stone-500">
                <span>Payment Status</span>
                <Badge variant={selectedSale.paymentStatus === 'Paid' ? 'success' : 'warning'}>
                  {selectedSale.paymentStatus}
                </Badge>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
                Close Overlay
              </Button>
              
              <PDFDownloadLink
                document={<InvoicePDF sale={selectedSale} />}
                fileName={`invoice-${selectedSale.invoiceNumber}.pdf`}
              >
                {({ loading: pdfLoading }) => (
                  <Button disabled={pdfLoading} className="flex items-center gap-1 font-bold">
                    <Printer className="w-4 h-4" />
                    {pdfLoading ? 'Building PDF...' : 'Print Tax Invoice'}
                  </Button>
                )}
              </PDFDownloadLink>
            </div>

          </div>
        )}
      </Dialog>

    </div>
  );
}

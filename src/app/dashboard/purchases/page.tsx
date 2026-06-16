'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/db';
import { Purchase } from '@/lib/mockData';
import { Button, Card, CardContent, Input, Label, Select, Badge, TableContainer, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Dialog } from '@/components/ui';
import { Plus, ShoppingBag, Trash2, Search, Calendar, User, FileText } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function PurchaseModule() {
  const { user } = useAuth();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Form states
  const [vendorName, setVendorName] = useState('');
  const [vendorPhone, setVendorPhone] = useState('');
  const [itemName, setItemName] = useState('');
  const [unitPrice, setUnitPrice] = useState(0);
  const [quantity, setQuantity] = useState(0);
  const [amountPaid, setAmountPaid] = useState(0);
  const [paymentStatus, setPaymentStatus] = useState<'Paid' | 'Unpaid' | 'Partially Paid'>('Paid');

  async function loadPurchases() {
    setLoading(true);
    try {
      const data = await db.getPurchases();
      setPurchases(data);
    } catch (err) {
      console.error('Error loading purchases:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPurchases();
  }, []);

  const totalCost = unitPrice * quantity;
  const balanceDue = Math.max(0, totalCost - amountPaid);

  // Automatically update status based on amount paid
  useEffect(() => {
    if (amountPaid >= totalCost && totalCost > 0) {
      setPaymentStatus('Paid');
    } else if (amountPaid === 0 && totalCost > 0) {
      setPaymentStatus('Unpaid');
    } else if (amountPaid < totalCost && amountPaid > 0) {
      setPaymentStatus('Partially Paid');
    }
  }, [amountPaid, totalCost]);

  const openModal = () => {
    setVendorName('');
    setVendorPhone('');
    setItemName('');
    setUnitPrice(0);
    setQuantity(0);
    setAmountPaid(0);
    setPaymentStatus('Paid');
    setIsOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorName.trim() || !itemName.trim() || unitPrice <= 0 || quantity <= 0) {
      alert('Please fill in Supplier Name, Item Name, Unit Price, and Quantity.');
      return;
    }

    const purchasePayload: Purchase = {
      id: `pur-${Date.now()}`,
      purchaseNumber: `GPT-PUR-${Math.floor(1000 + Math.random() * 9000)}`,
      vendorName,
      vendorPhone,
      items: [
        {
          name: itemName,
          unitPrice: Number(unitPrice),
          quantity: Number(quantity),
          total: totalCost
        }
      ],
      total: totalCost,
      paymentStatus,
      amountPaid: Number(amountPaid),
      balanceDue,
      purchaseDate: Date.now(),
      recordedBy: user?.email || 'manager@gpt.com'
    };

    try {
      await db.savePurchase(purchasePayload);
      alert('Supplier purchase logged successfully! Stock levels updated & credit accounts adjusted.');
      setIsOpen(false);
      loadPurchases();
    } catch (err) {
      console.error(err);
      alert('Failed to log purchase.');
    }
  };

  const showDetails = (pur: Purchase) => {
    setSelectedPurchase(pur);
    setIsDetailOpen(true);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Module Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-stone-800 tracking-tight flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-secondary" />
            3. Supplier Purchases Ledger
          </h2>
          <p className="text-[10px] text-stone-400">Record raw materials, packaging supplies, and logistics costs from suppliers.</p>
        </div>
        <Button onClick={openModal} className="font-bold text-xs flex items-center gap-1.5 shadow-sm">
          <Plus className="w-4 h-4" /> Log Supplier Purchase
        </Button>
      </div>

      {/* Grid list of purchases */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-stone-400 text-sm">
          Loading purchases transactions...
        </div>
      ) : purchases.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white border border-stone-200 rounded-xl text-stone-400 text-xs">
          No purchases recorded yet. Click "Log Supplier Purchase" to enter supplier transactions.
        </div>
      ) : (
        <TableContainer>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Purchase ID</TableHead>
                <TableHead>Supplier Vendor</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Purchased Date</TableHead>
                <TableHead>Invoice Total</TableHead>
                <TableHead>Payment Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {purchases.map((pur) => (
                <TableRow key={pur.id}>
                  <TableCell className="font-extrabold text-xs text-primary">{pur.purchaseNumber}</TableCell>
                  <TableCell>
                    <p className="font-bold text-xs text-stone-800 leading-none">{pur.vendorName}</p>
                    <span className="text-[10px] text-stone-400 block mt-0.5">{pur.vendorPhone || 'No Contact'}</span>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate text-xs">
                    {pur.items.map(i => `${i.name} (Qty: ${i.quantity})`).join(', ')}
                  </TableCell>
                  <TableCell className="text-xs">{new Date(pur.purchaseDate).toLocaleDateString()}</TableCell>
                  <TableCell className="font-bold text-xs">Rs. {pur.total}</TableCell>
                  <TableCell>
                    <Badge variant={pur.paymentStatus === 'Paid' ? 'success' : 'warning'}>
                      {pur.paymentStatus}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      onClick={() => showDetails(pur)} 
                      variant="ghost" 
                      size="sm" 
                      className="text-xs font-bold"
                    >
                      Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Log Purchase Modal */}
      <Dialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Log Supplier Supply Purchase"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="pur-vendor">Supplier Vendor Name *</Label>
              <Input
                id="pur-vendor"
                placeholder="e.g. Janakpur Farms"
                value={vendorName}
                onChange={(e) => setVendorName(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="pur-phone">Vendor Contact Phone</Label>
              <Input
                id="pur-phone"
                placeholder="e.g. 98XXXXXXXX"
                value={vendorPhone}
                onChange={(e) => setVendorPhone(e.target.value)}
              />
            </div>
          </div>

          <div className="border-t border-stone-100 pt-3">
            <Label>Material Purchased Details</Label>
            <div className="space-y-3 mt-1.5">
              <div>
                <Label htmlFor="pur-item" className="text-[10px] text-stone-400">Material/Item Name *</Label>
                <Input
                  id="pur-item"
                  placeholder="e.g. Glass Jars 500ml or Spicy Mango Pickle (Achar)"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="pur-price" className="text-[10px] text-stone-400">Unit Price (Rs.) *</Label>
                  <Input
                    id="pur-price"
                    type="number"
                    min="1"
                    placeholder="35"
                    value={unitPrice || ''}
                    onChange={(e) => setUnitPrice(Number(e.target.value))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="pur-qty" className="text-[10px] text-stone-400">Quantity *</Label>
                  <Input
                    id="pur-qty"
                    type="number"
                    min="1"
                    placeholder="500"
                    value={quantity || ''}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-stone-100 pt-3 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="pur-paid">Amount Paid (Rs.) *</Label>
                <Input
                  id="pur-paid"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={amountPaid || ''}
                  onChange={(e) => setAmountPaid(Number(e.target.value))}
                  required
                />
              </div>
              <div>
                <Label>Payment Method status</Label>
                <div className="mt-2.5">
                  <Badge variant={paymentStatus === 'Paid' ? 'success' : 'warning'}>
                    {paymentStatus}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="bg-stone-50 rounded-xl p-4 border border-stone-200/50 space-y-1.5 text-xs">
              <div className="flex justify-between text-stone-500">
                <span>Invoice Total:</span>
                <span className="font-bold text-stone-700">Rs. {totalCost}</span>
              </div>
              {balanceDue > 0 && (
                <div className="flex justify-between text-red-600 font-bold">
                  <span>Balance Owed (To Creditors):</span>
                  <span>Rs. {balanceDue}</span>
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-stone-100 pt-4 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Log Purchase Invoice
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Details Dialog */}
      <Dialog
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title={`Purchase Invoice: ${selectedPurchase?.purchaseNumber}`}
      >
        {selectedPurchase && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4 border-b border-stone-100 pb-4">
              <div>
                <p className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">Supplier Details</p>
                <p className="text-xs font-bold text-stone-800 mt-1">{selectedPurchase.vendorName}</p>
                <p className="text-xs text-stone-500">{selectedPurchase.vendorPhone || 'No contact phone'}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">Transaction Info</p>
                <p className="text-xs font-semibold text-stone-800 mt-1">{new Date(selectedPurchase.purchaseDate).toLocaleString()}</p>
                <p className="text-xs text-stone-500">Agent: {selectedPurchase.recordedBy}</p>
              </div>
            </div>

            <div>
              <p className="text-[10px] uppercase font-bold text-stone-400 tracking-wider mb-2">Purchased Items</p>
              <div className="space-y-2 border border-stone-100 rounded-xl p-3 bg-stone-50/50">
                {selectedPurchase.items.map((item, i) => (
                  <div key={i} className="flex justify-between items-center text-xs py-1.5 border-b border-stone-100/50 last:border-0">
                    <div>
                      <p className="font-bold text-stone-800">{item.name}</p>
                      <span className="text-[10px] text-stone-400">Rs. {item.unitPrice} x {item.quantity}</span>
                    </div>
                    <span className="font-bold text-stone-900">Rs. {item.total}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-stone-50 rounded-xl p-4 border border-stone-200/50 space-y-2 text-xs">
              <div className="flex justify-between text-stone-500">
                <span>Grand Total</span>
                <span className="font-bold text-stone-800">Rs. {selectedPurchase.total}</span>
              </div>
              <div className="flex justify-between text-stone-500">
                <span>Amount Paid</span>
                <span className="font-bold text-stone-800">Rs. {selectedPurchase.amountPaid}</span>
              </div>
              <div className="flex justify-between text-stone-500">
                <span>Balance Owed</span>
                <span className={selectedPurchase.balanceDue > 0 ? 'text-red-500 font-bold' : 'text-stone-700 font-semibold'}>
                  Rs. {selectedPurchase.balanceDue}
                </span>
              </div>
              <div className="flex justify-between text-stone-500">
                <span>Payment Status</span>
                <Badge variant={selectedPurchase.paymentStatus === 'Paid' ? 'success' : 'warning'}>
                  {selectedPurchase.paymentStatus}
                </Badge>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
                Close Details
              </Button>
            </div>
          </div>
        )}
      </Dialog>

    </div>
  );
}

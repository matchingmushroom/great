'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/db';
import { Product } from '@/lib/mockData';
import { Button, Card, CardContent, Input, Label, Select, Badge, TableContainer, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Dialog, Tabs, TabsList, TabsTrigger, TabsContent, TextArea } from '@/components/ui';
import { Warehouse, Plus, AlertTriangle, ArrowDown, ArrowUp, RefreshCw, ClipboardList } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function InventoryModule() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('status');
  const [products, setProducts] = useState<Product[]>([]);
  const [adjustLogs, setAdjustLogs] = useState<{
    id: string;
    productName: string;
    changeQuantity: number;
    type: string;
    notes: string;
    date: number;
    recordedBy: string;
  }[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  // Form states
  const [selectedProductId, setSelectedProductId] = useState('');
  const [changeQty, setChangeQty] = useState(0);
  const [notes, setNotes] = useState('');

  async function loadData() {
    setLoading(true);
    try {
      const [prodData, savedLogs] = await Promise.all([
        db.getProducts(),
        // Get custom inventory logs from localStorage
        Promise.resolve(localStorage.getItem('gpt_inventory_logs'))
      ]);
      setProducts(prodData);
      
      if (savedLogs) {
        setAdjustLogs(JSON.parse(savedLogs));
      } else {
        // Build initial audit logs based on products creation or initial seeding
        const initialLogs = prodData.map((p, idx) => ({
          id: `log-seed-${idx}`,
          productName: p.name,
          changeQuantity: p.stockQuantity,
          type: 'initial_seed',
          notes: 'System seeded baseline quantities.',
          date: p.createdAt,
          recordedBy: 'system@gpt.com'
        }));
        setAdjustLogs(initialLogs);
        localStorage.setItem('gpt_inventory_logs', JSON.stringify(initialLogs));
      }
    } catch (err) {
      console.error('Error loading inventory:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const openModal = () => {
    if (products.length > 0) {
      setSelectedProductId(products[0].id);
    }
    setChangeQty(0);
    setNotes('');
    setIsOpen(true);
  };

  const handleAdjustStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId || changeQty === 0 || !notes.trim()) {
      alert('Please select a product, input a valid change amount (+ or -), and enter a reason/note.');
      return;
    }

    const prod = products.find(p => p.id === selectedProductId);
    if (!prod) return;

    const newStock = Math.max(0, prod.stockQuantity + changeQty);
    const updatedProd: Product = {
      ...prod,
      stockQuantity: newStock
    };

    try {
      // 1. Update product db
      await db.saveProduct(updatedProd);

      // 2. Add audit log
      const newLog = {
        id: `inv-log-${Date.now()}`,
        productName: prod.name,
        changeQuantity: changeQty,
        type: changeQty > 0 ? 'addition' : 'reduction',
        notes,
        date: Date.now(),
        recordedBy: user?.email || 'staff@gpt.com'
      };

      const currentLogs = [newLog, ...adjustLogs];
      setAdjustLogs(currentLogs);
      localStorage.setItem('gpt_inventory_logs', JSON.stringify(currentLogs));

      alert('Inventory quantity adjusted! Audit entry logged.');
      setIsOpen(false);
      loadData();
    } catch (err) {
      console.error(err);
      alert('Failed to adjust stock.');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Module Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-stone-800 tracking-tight flex items-center gap-2">
            <Warehouse className="w-5 h-5 text-secondary" />
            4. Inventory & Stock Auditing
          </h2>
          <p className="text-[10px] text-stone-400">Track real-time jar count stocks, register breakage/spillage wastage, and audit logs.</p>
        </div>
        <Button onClick={openModal} className="font-bold text-xs flex items-center gap-1.5 shadow-sm">
          <Plus className="w-4 h-4" /> Log Manual Stock Adjustment
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="status">Real-time Stock Levels</TabsTrigger>
          <TabsTrigger value="logs">Stock Movement Audit Trail</TabsTrigger>
        </TabsList>

        {/* 1. STOCK LEVEL STATUS GRID */}
        <TabsContent value="status">
          {loading ? (
            <div className="flex items-center justify-center py-20 text-stone-400 text-sm">
              Loading inventory grid...
            </div>
          ) : (
            <TableContainer>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Unit Price</TableHead>
                    <TableHead>Available Stock</TableHead>
                    <TableHead>Alert Limit</TableHead>
                    <TableHead>Stock Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((p) => {
                    const isLowStock = p.stockQuantity <= p.minStockLevel && p.stockQuantity > 0;
                    const isOutOfStock = p.stockQuantity === 0;

                    return (
                      <TableRow key={p.id}>
                        <TableCell className="font-bold text-stone-900 text-xs">{p.name}</TableCell>
                        <TableCell>
                          <Badge variant="neutral">{p.category}</Badge>
                        </TableCell>
                        <TableCell className="text-xs font-semibold text-stone-600">Rs. {p.price}</TableCell>
                        <TableCell className="font-bold text-xs">
                          {p.stockQuantity} jars
                        </TableCell>
                        <TableCell className="text-xs text-stone-400">{p.minStockLevel} jars</TableCell>
                        <TableCell>
                          {isOutOfStock ? (
                            <Badge variant="danger" className="animate-pulse">Out Of Stock</Badge>
                          ) : isLowStock ? (
                            <Badge variant="warning" className="flex items-center gap-1 w-max">
                              <AlertTriangle className="w-3.5 h-3.5" /> Low Stock
                            </Badge>
                          ) : (
                            <Badge variant="success">Healthy</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </TabsContent>

        {/* 2. AUDIT TRAIL LOGS */}
        <TabsContent value="logs">
          <TableContainer>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Product Name</TableHead>
                  <TableHead>Stock Variance</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Audit Remarks/Notes</TableHead>
                  <TableHead>Agent</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {adjustLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-stone-400 text-xs">
                      No stock movement audit records found.
                    </TableCell>
                  </TableRow>
                ) : (
                  adjustLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-xs text-stone-500">
                        {new Date(log.date).toLocaleString()}
                      </TableCell>
                      <TableCell className="font-bold text-xs text-stone-900">{log.productName}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center gap-0.5 font-black text-xs ${log.changeQuantity >= 0 ? 'text-primary' : 'text-red-500'}`}>
                          {log.changeQuantity >= 0 ? <ArrowUp className="w-3 h-3 shrink-0" /> : <ArrowDown className="w-3 h-3 shrink-0" />}
                          {Math.abs(log.changeQuantity)} jars
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={log.type === 'initial_seed' || log.type === 'addition' ? 'info' : 'danger'}>
                          {log.type.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-stone-600 max-w-[200px] truncate" title={log.notes}>
                        {log.notes}
                      </TableCell>
                      <TableCell className="text-xs font-semibold text-stone-400">{log.recordedBy.split('@')[0]}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabsContent>
      </Tabs>

      {/* Adjustment Modal Dialog */}
      <Dialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Adjust Inventory Stock Quantity"
      >
        <form onSubmit={handleAdjustStock} className="space-y-4">
          <div>
            <Select
              label="Select Pickle Product *"
              options={products.map(p => ({ value: p.id, label: `${p.name} (Current: ${p.stockQuantity} jars)` }))}
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="adj-qty">Stock Variance (Positive/Negative Amount) *</Label>
            <Input
              id="adj-qty"
              type="number"
              placeholder="e.g. -5 for damage, +15 for restock"
              value={changeQty || ''}
              onChange={(e) => setChangeQty(Number(e.target.value))}
              required
            />
            <span className="text-[10px] text-stone-400 mt-1 block">
              💡 Use negative sign (-) to represent wastage, damages, or shrinkage. Positive sign represent restock additions.
            </span>
          </div>

          <div>
            <Label htmlFor="adj-notes">Audit Notes & Justification *</Label>
            <TextArea
              id="adj-notes"
              placeholder="e.g. Found 3 jars broken in shelf delivery, or manual counting adjust"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              required
            />
          </div>

          <div className="border-t border-stone-100 pt-4 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Apply Adjustments
            </Button>
          </div>
        </form>
      </Dialog>

    </div>
  );
}

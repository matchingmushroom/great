'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/db';
import { Debtor } from '@/lib/mockData';
import { Button, Card, CardContent, Input, Label, Badge, TableContainer, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Dialog } from '@/components/ui';
import { Users, Plus, Landmark, Phone, Search, DollarSign, Calendar } from 'lucide-react';

export default function DebtorsModule() {
  const [debtors, setDebtors] = useState<Debtor[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Dialog states
  const [isOpen, setIsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [selectedDebtor, setSelectedDebtor] = useState<Debtor | null>(null);

  // Form states
  const [repaymentAmount, setRepaymentAmount] = useState(0);
  const [notes, setNotes] = useState('');

  // Manual Add Form States (for CRUD completeness)
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newDebt, setNewDebt] = useState(0);

  async function loadDebtors() {
    setLoading(true);
    try {
      const data = await db.getDebtors();
      setDebtors(data);
    } catch (err) {
      console.error('Error loading debtors:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDebtors();
  }, []);

  const openRepaymentModal = (debtor: Debtor) => {
    setSelectedDebtor(debtor);
    setRepaymentAmount(0);
    setNotes('');
    setIsOpen(true);
  };

  const openHistoryModal = (debtor: Debtor) => {
    setSelectedDebtor(debtor);
    setIsHistoryOpen(true);
  };

  const handleRepaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDebtor || repaymentAmount <= 0) {
      alert('Please enter a valid repayment amount.');
      return;
    }

    try {
      await db.recordDebtorPayment(
        selectedDebtor.id,
        Number(repaymentAmount),
        notes || 'Recorded over-the-counter collection repayment'
      );
      alert('Payment recorded! Customer balance updated.');
      setIsOpen(false);
      loadDebtors();
    } catch (err) {
      console.error(err);
      alert('Failed to record payment.');
    }
  };

  const handleAddDebtor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim() || newDebt < 0) {
      alert('Please fill in Name, Phone and initial outstanding debt.');
      return;
    }

    const payload: Debtor = {
      id: newPhone.trim(),
      customerName: newName,
      customerPhone: newPhone,
      totalDebt: Number(newDebt),
      payments: [],
      lastUpdated: Date.now()
    };

    try {
      await db.saveDebtor(payload);
      alert('New debtor profile registered successfully.');
      setIsAddOpen(false);
      setNewName('');
      setNewPhone('');
      setNewDebt(0);
      loadDebtors();
    } catch (err) {
      console.error(err);
      alert('Failed to register debtor.');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Module Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-stone-800 tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-secondary" />
            6. Debtors Ledger (Outstanding Receivables)
          </h2>
          <p className="text-[10px] text-stone-400">Manage accounts of credit customers who purchased pickles on partial/unpaid terms.</p>
        </div>
        <Button onClick={() => setIsAddOpen(true)} className="font-bold text-xs flex items-center gap-1.5 shadow-sm">
          <Plus className="w-4 h-4" /> Register Custom Debtor Account
        </Button>
      </div>

      {/* Debtors List */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-stone-400 text-sm">
          Loading debtors ledger...
        </div>
      ) : debtors.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white border border-stone-200 rounded-xl text-stone-400 text-xs">
          No active outstanding customer debts. Outstanding balances are synced from POS invoices auto-generated with unpaid status.
        </div>
      ) : (
        <TableContainer>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer Name</TableHead>
                <TableHead>Phone Number</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead>Total Debt Owed</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {debtors.map((d) => {
                const isCleared = d.totalDebt === 0;
                return (
                  <TableRow key={d.id}>
                    <TableCell className="font-bold text-stone-900 text-xs">{d.customerName}</TableCell>
                    <TableCell>
                      <span className="text-xs text-stone-500 font-semibold flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-stone-400" />
                        {d.customerPhone}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs">{new Date(d.lastUpdated).toLocaleDateString()}</TableCell>
                    <TableCell className="font-bold text-xs">
                      <span className={isCleared ? 'text-primary' : 'text-red-500'}>
                        Rs. {d.totalDebt}
                      </span>
                    </TableCell>
                    <TableCell>
                      {isCleared ? (
                        <Badge variant="success">Fully Cleared</Badge>
                      ) : (
                        <Badge variant="danger">Pending Repay</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1.5">
                        <Button
                          onClick={() => openHistoryModal(d)}
                          variant="ghost"
                          size="sm"
                          className="text-xs font-bold"
                        >
                          Logs
                        </Button>
                        <Button
                          onClick={() => openRepaymentModal(d)}
                          disabled={isCleared}
                          size="sm"
                          className="text-xs font-bold bg-emerald-600 hover:bg-emerald-700"
                        >
                          Collect
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Collect Repayment Modal */}
      <Dialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={`Record Debt Collection: ${selectedDebtor?.customerName}`}
      >
        <form onSubmit={handleRepaymentSubmit} className="space-y-4">
          <div>
            <Label>Outstanding Balance Owed</Label>
            <p className="text-xl font-black text-red-500 font-display">Rs. {selectedDebtor?.totalDebt}</p>
          </div>

          <div>
            <Label htmlFor="rep-amt">Amount Collected (NPR / Rs.) *</Label>
            <Input
              id="rep-amt"
              type="number"
              min="1"
              max={selectedDebtor?.totalDebt}
              placeholder="e.g. 500"
              value={repaymentAmount || ''}
              onChange={(e) => setRepaymentAmount(Number(e.target.value))}
              required
            />
          </div>

          <div>
            <Label htmlFor="rep-notes">Payment Remarks / Reference</Label>
            <Input
              id="rep-notes"
              placeholder="e.g. Paid in Cash, eSewa txn ID, etc."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="border-t border-stone-100 pt-4 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white">
              Confirm Receipt Payment
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Payment Logs History Dialog */}
      <Dialog
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        title={`Repayments Log: ${selectedDebtor?.customerName}`}
      >
        <div className="space-y-4">
          <div>
            <p className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">Remaining Balance Owed</p>
            <p className="text-base font-bold text-stone-800">Rs. {selectedDebtor?.totalDebt}</p>
          </div>

          <div className="border-t border-stone-100 pt-3">
            <p className="text-[10px] uppercase font-bold text-stone-400 tracking-wider mb-2">Logs History</p>
            {selectedDebtor?.payments.length === 0 ? (
              <div className="py-6 text-center text-stone-400 text-xs bg-stone-50 border border-stone-100 rounded-xl">
                No repayments logged. Still carrying initial invoice balances.
              </div>
            ) : (
              <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                {selectedDebtor?.payments.map((p, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-stone-50 p-2.5 rounded-lg border border-stone-100/50">
                    <div>
                      <p className="text-xs font-bold text-stone-800">Rs. {p.amount}</p>
                      <span className="text-[9px] text-stone-400 flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3" />
                        {new Date(p.date).toLocaleString()}
                      </span>
                    </div>
                    <span className="text-xs text-stone-500 font-semibold italic max-w-[150px] truncate">{p.notes}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end pt-3 border-t border-stone-100">
            <Button variant="outline" onClick={() => setIsHistoryOpen(false)}>
              Dismiss Panel
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Manual Registration Modal */}
      <Dialog
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Register Custom Debtor Account"
      >
        <form onSubmit={handleAddDebtor} className="space-y-4">
          <div>
            <Label htmlFor="deb-name">Customer Full Name *</Label>
            <Input
              id="deb-name"
              placeholder="e.g. Dinesh Karki"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="deb-phone">Phone Number (Account ID) *</Label>
            <Input
              id="deb-phone"
              placeholder="e.g. 98XXXXXXXX"
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="deb-bal">Outstanding Owed Balance (Rs.) *</Label>
            <Input
              id="deb-bal"
              type="number"
              min="0"
              placeholder="1200"
              value={newDebt || ''}
              onChange={(e) => setNewDebt(Number(e.target.value))}
              required
            />
          </div>

          <div className="border-t border-stone-100 pt-4 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Register Account
            </Button>
          </div>
        </form>
      </Dialog>

    </div>
  );
}

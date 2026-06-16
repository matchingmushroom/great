'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/db';
import { Creditor } from '@/lib/mockData';
import { Button, Card, CardContent, Input, Label, Badge, TableContainer, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Dialog } from '@/components/ui';
import { Briefcase, Plus, Landmark, Phone, Search, DollarSign, Calendar } from 'lucide-react';

export default function CreditorsModule() {
  const [creditors, setCreditors] = useState<Creditor[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Dialog states
  const [isOpen, setIsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [selectedCreditor, setSelectedCreditor] = useState<Creditor | null>(null);

  // Form states
  const [repaymentAmount, setRepaymentAmount] = useState(0);
  const [notes, setNotes] = useState('');

  // Manual Add Form States
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newCredit, setNewCredit] = useState(0);

  async function loadCreditors() {
    setLoading(true);
    try {
      const data = await db.getCreditors();
      setCreditors(data);
    } catch (err) {
      console.error('Error loading creditors:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCreditors();
  }, []);

  const openRepaymentModal = (creditor: Creditor) => {
    setSelectedCreditor(creditor);
    setRepaymentAmount(0);
    setNotes('');
    setIsOpen(true);
  };

  const openHistoryModal = (creditor: Creditor) => {
    setSelectedCreditor(creditor);
    setIsHistoryOpen(true);
  };

  const handleRepaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCreditor || repaymentAmount <= 0) {
      alert('Please enter a valid payout amount.');
      return;
    }

    try {
      await db.recordCreditorPayment(
        selectedCreditor.id,
        Number(repaymentAmount),
        notes || 'Logged outgoing supplier payout'
      );
      alert('Supplier payment recorded! Outstanding liability updated.');
      setIsOpen(false);
      loadCreditors();
    } catch (err) {
      console.error(err);
      alert('Failed to record supplier payment.');
    }
  };

  const handleAddCreditor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim() || newCredit < 0) {
      alert('Please fill in Supplier Name, Phone and initial outstanding liability.');
      return;
    }

    const payload: Creditor = {
      id: newPhone.trim(),
      vendorName: newName,
      vendorPhone: newPhone,
      totalCredit: Number(newCredit),
      payments: [],
      lastUpdated: Date.now()
    };

    try {
      await db.saveCreditor(payload);
      alert('New creditor account registered successfully.');
      setIsAddOpen(false);
      setNewName('');
      setNewPhone('');
      setNewCredit(0);
      loadCreditors();
    } catch (err) {
      console.error(err);
      alert('Failed to register creditor.');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Module Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-stone-800 tracking-tight flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-secondary" />
            7. Creditors Ledger (Supplier Liabilities)
          </h2>
          <p className="text-[10px] text-stone-400">Manage accounts of vendors and suppliers to whom the business owes unpaid supply balances.</p>
        </div>
        <Button onClick={() => setIsAddOpen(true)} className="font-bold text-xs flex items-center gap-1.5 shadow-sm">
          <Plus className="w-4 h-4" /> Register Custom Creditor Account
        </Button>
      </div>

      {/* Creditors List */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-stone-400 text-sm">
          Loading creditors ledger...
        </div>
      ) : creditors.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white border border-stone-200 rounded-xl text-stone-400 text-xs">
          No outstanding vendor liabilities. Credit accounts are automatically generated from Purchase invoices marked as partially paid or unpaid.
        </div>
      ) : (
        <TableContainer>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Supplier Vendor</TableHead>
                <TableHead>Phone Number</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead>Owed Balance</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {creditors.map((c) => {
                const isCleared = c.totalCredit === 0;
                return (
                  <TableRow key={c.id}>
                    <TableCell className="font-bold text-stone-900 text-xs">{c.vendorName}</TableCell>
                    <TableCell>
                      <span className="text-xs text-stone-500 font-semibold flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-stone-400" />
                        {c.vendorPhone}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs">{new Date(c.lastUpdated).toLocaleDateString()}</TableCell>
                    <TableCell className="font-bold text-xs">
                      <span className={isCleared ? 'text-primary' : 'text-red-500'}>
                        Rs. {c.totalCredit}
                      </span>
                    </TableCell>
                    <TableCell>
                      {isCleared ? (
                        <Badge variant="success">Settled</Badge>
                      ) : (
                        <Badge variant="danger">Liability</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1.5">
                        <Button
                          onClick={() => openHistoryModal(c)}
                          variant="ghost"
                          size="sm"
                          className="text-xs font-bold"
                        >
                          Logs
                        </Button>
                        <Button
                          onClick={() => openRepaymentModal(c)}
                          disabled={isCleared}
                          size="sm"
                          className="text-xs font-bold bg-emerald-600 hover:bg-emerald-700"
                        >
                          Settle Pay
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

      {/* Record Repayment Modal */}
      <Dialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={`Log Supplier Payout Settle: ${selectedCreditor?.vendorName}`}
      >
        <form onSubmit={handleRepaymentSubmit} className="space-y-4">
          <div>
            <Label>Outstanding Supply Balance Owed</Label>
            <p className="text-xl font-black text-red-500 font-display">Rs. {selectedCreditor?.totalCredit}</p>
          </div>

          <div>
            <Label htmlFor="rep-amt">Amount Paid Out (NPR / Rs.) *</Label>
            <Input
              id="rep-amt"
              type="number"
              min="1"
              max={selectedCreditor?.totalCredit}
              placeholder="e.g. 1500"
              value={repaymentAmount || ''}
              onChange={(e) => setRepaymentAmount(Number(e.target.value))}
              required
            />
          </div>

          <div>
            <Label htmlFor="rep-notes">Payout Remarks / Receipt Reference</Label>
            <Input
              id="rep-notes"
              placeholder="e.g. Cash paid, Bank Transfer txn reference"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="border-t border-stone-100 pt-4 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white">
              Confirm Outgoing Payment
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Payment Logs History Dialog */}
      <Dialog
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        title={`Payouts Log: ${selectedCreditor?.vendorName}`}
      >
        <div className="space-y-4">
          <div>
            <p className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">Remaining Balance Owed</p>
            <p className="text-base font-bold text-stone-800">Rs. {selectedCreditor?.totalCredit}</p>
          </div>

          <div className="border-t border-stone-100 pt-3">
            <p className="text-[10px] uppercase font-bold text-stone-400 tracking-wider mb-2">Payouts History</p>
            {selectedCreditor?.payments.length === 0 ? (
              <div className="py-6 text-center text-stone-400 text-xs bg-stone-50 border border-stone-100 rounded-xl">
                No outgoing payments recorded yet. Carrying original supply balances.
              </div>
            ) : (
              <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                {selectedCreditor?.payments.map((p, idx) => (
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
        title="Register Custom Creditor Account"
      >
        <form onSubmit={handleAddCreditor} className="space-y-4">
          <div>
            <Label htmlFor="deb-name">Supplier Name *</Label>
            <Input
              id="deb-name"
              placeholder="e.g. Kathmandu Spices Supplier"
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
            <Label htmlFor="deb-bal">Outstanding Owed Liability (Rs.) *</Label>
            <Input
              id="deb-bal"
              type="number"
              min="0"
              placeholder="5400"
              value={newCredit || ''}
              onChange={(e) => setNewCredit(Number(e.target.value))}
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

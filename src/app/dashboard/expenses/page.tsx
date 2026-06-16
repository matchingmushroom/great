'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/db';
import { Expense } from '@/lib/mockData';
import { Button, Card, CardContent, Input, Label, Select, Badge, TableContainer, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Dialog, TextArea } from '@/components/ui';
import { TrendingDown, Plus, Trash2, Edit2, Search, Calendar, Landmark, DollarSign } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function ExpenseModule() {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState(0);
  const [category, setCategory] = useState<'Raw Materials' | 'Packaging' | 'Rent' | 'Salaries' | 'Utilities' | 'Marketing' | 'Other'>('Raw Materials');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');

  const categories = [
    { value: 'Raw Materials', label: 'Raw Materials' },
    { value: 'Packaging', label: 'Packaging' },
    { value: 'Rent', label: 'Rent' },
    { value: 'Salaries', label: 'Salaries' },
    { value: 'Utilities', label: 'Utilities' },
    { value: 'Marketing', label: 'Marketing' },
    { value: 'Other', label: 'Other' }
  ];

  async function loadExpenses() {
    setLoading(true);
    try {
      const data = await db.getExpenses();
      setExpenses(data);
    } catch (err) {
      console.error('Error loading expenses:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadExpenses();
  }, []);

  const openModal = (exp: Expense | null = null) => {
    setSelectedExpense(exp);
    if (exp) {
      setTitle(exp.title);
      setAmount(exp.amount);
      setCategory(exp.category);
      // Format timestamp to YYYY-MM-DD for date input
      const d = new Date(exp.date);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      setDate(`${year}-${month}-${day}`);
      setDescription(exp.description);
    } else {
      setTitle('');
      setAmount(0);
      setCategory('Raw Materials');
      // Set to today's date
      const d = new Date();
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      setDate(`${year}-${month}-${day}`);
      setDescription('');
    }
    setIsOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || amount <= 0 || !date) {
      alert('Please fill in Title, Date, and enter a valid Expense Amount.');
      return;
    }

    const payload: Expense = {
      id: selectedExpense ? selectedExpense.id : `exp-${Date.now()}`,
      title,
      amount: Number(amount),
      category,
      date: new Date(date).getTime(),
      description,
      recordedBy: user?.email || 'staff@gpt.com'
    };

    try {
      await db.saveExpense(payload);
      setIsOpen(false);
      loadExpenses();
    } catch (err) {
      console.error(err);
      alert('Failed to save expense.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this expense record?')) return;
    try {
      await db.deleteExpense(id);
      loadExpenses();
    } catch (err) {
      console.error(err);
      alert('Failed to delete expense.');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Module Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-stone-800 tracking-tight flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-secondary" />
            5. Operational Expenses Ledger
          </h2>
          <p className="text-[10px] text-stone-400">Track and categorize administrative, logistics, raw material spices, and payroll outflows.</p>
        </div>
        <Button onClick={() => openModal()} className="font-bold text-xs flex items-center gap-1.5 shadow-sm">
          <Plus className="w-4 h-4" /> Log Operation Expense
        </Button>
      </div>

      {/* Loading state / Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-stone-400 text-sm">
          Loading expenses ledger...
        </div>
      ) : expenses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white border border-stone-200 rounded-xl text-stone-400 text-xs">
          No expenses logged yet. Click "Log Operation Expense" to register operational costs.
        </div>
      ) : (
        <TableContainer>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Expense Details</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount (NPR)</TableHead>
                <TableHead>Staff Agent</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.map((exp) => (
                <TableRow key={exp.id}>
                  <TableCell className="max-w-[200px]">
                    <p className="font-bold text-stone-900 text-xs leading-tight truncate">{exp.title}</p>
                    <p className="text-[10px] text-stone-400 truncate mt-0.5">{exp.description}</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="warning">{exp.category}</Badge>
                  </TableCell>
                  <TableCell className="text-xs">{new Date(exp.date).toLocaleDateString()}</TableCell>
                  <TableCell className="font-bold text-xs text-red-600">Rs. {exp.amount}</TableCell>
                  <TableCell className="text-xs text-stone-500 font-semibold">{exp.recordedBy.split('@')[0]}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1.5">
                      <Button 
                        onClick={() => openModal(exp)} 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0"
                        title="Edit Details"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-stone-500" />
                      </Button>
                      <Button 
                        onClick={() => handleDelete(exp.id)} 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 hover:bg-red-50"
                        title="Delete Record"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* CRUD Add/Edit Dialog modal */}
      <Dialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={selectedExpense ? 'Modify Expense Record' : 'Log Operation Expense'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <Label htmlFor="exp-title">Expense Title *</Label>
            <Input
              id="exp-title"
              placeholder="e.g. Mustard Spices purchase, Bottle packing"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="exp-amount">Amount (NPR / Rs.) *</Label>
              <Input
                id="exp-amount"
                type="number"
                min="1"
                placeholder="4500"
                value={amount || ''}
                onChange={(e) => setAmount(Number(e.target.value))}
                required
              />
            </div>

            <div>
              <Select
                label="Expense Category *"
                options={categories}
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="exp-date">Date *</Label>
            <Input
              id="exp-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="exp-desc">Remarks / Description</Label>
            <TextArea
              id="exp-desc"
              placeholder="Specify supplier, payment receipt notes..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="border-t border-stone-100 pt-4 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {selectedExpense ? 'Update Expense' : 'Log Expense'}
            </Button>
          </div>
        </form>
      </Dialog>

    </div>
  );
}

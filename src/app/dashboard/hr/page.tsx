'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/db';
import { Employee } from '@/lib/mockData';
import { Button, Card, CardContent, Input, Label, Select, Badge, TableContainer, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Dialog, Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui';
import { Users, Plus, Calendar, Landmark, CreditCard, Trash2, Edit2, Phone, CalendarCheck, CheckCircle2 } from 'lucide-react';

export default function HRModule() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('roster');
  
  // Roster CRUD dialog
  const [isOpen, setIsOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  // Salary advance dialog
  const [isAdvanceOpen, setIsAdvanceOpen] = useState(false);
  const [advanceAmt, setAdvanceAmt] = useState(0);
  const [advanceReason, setAdvanceReason] = useState('');

  // Roster form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'Staff' | 'Manager' | 'Admin'>('Staff');
  const [salary, setSalary] = useState(0);
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');

  // Attendance date
  const [attendanceDate, setAttendanceDate] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });

  const roles = [
    { value: 'Staff', label: 'Staff' },
    { value: 'Manager', label: 'Manager' },
    { value: 'Admin', label: 'Admin' }
  ];

  async function loadEmployees() {
    setLoading(true);
    try {
      const data = await db.getEmployees();
      setEmployees(data);
    } catch (err) {
      console.error('Error loading employees:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEmployees();
  }, []);

  const openRosterModal = (emp: Employee | null = null) => {
    setSelectedEmployee(emp);
    if (emp) {
      setName(emp.name);
      setEmail(emp.email);
      setPhone(emp.phone);
      setRole(emp.role);
      setSalary(emp.salary);
      setStatus(emp.status);
    } else {
      setName('');
      setEmail('');
      setPhone('');
      setRole('Staff');
      setSalary(15000);
      setStatus('Active');
    }
    setIsOpen(true);
  };

  const handleSaveRoster = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || salary <= 0) {
      alert('Please fill in Name, Email and a valid base monthly Salary.');
      return;
    }

    const payload: Employee = {
      id: selectedEmployee ? selectedEmployee.id : `emp-${Date.now()}`,
      name,
      email,
      phone,
      role,
      salary: Number(salary),
      joinDate: selectedEmployee ? selectedEmployee.joinDate : Date.now(),
      status,
      advances: selectedEmployee ? selectedEmployee.advances : [],
      attendance: selectedEmployee ? selectedEmployee.attendance : []
    };

    try {
      await db.saveEmployee(payload);
      setIsOpen(false);
      loadEmployees();
    } catch (err) {
      console.error(err);
      alert('Failed to save employee profile.');
    }
  };

  const handleDeleteEmployee = async (id: string) => {
    if (!confirm('Are you sure you want to delete this employee record?')) return;
    try {
      await db.deleteEmployee(id);
      loadEmployees();
    } catch (err) {
      console.error(err);
      alert('Failed to delete employee.');
    }
  };

  // Attendance helper
  const handleMarkAttendance = async (empId: string, status: 'Present' | 'Absent' | 'Leave') => {
    try {
      await db.recordAttendance(empId, attendanceDate, status);
      loadEmployees();
    } catch (err) {
      console.error(err);
    }
  };

  // Salary advance helper
  const openAdvanceModal = (emp: Employee) => {
    setSelectedEmployee(emp);
    setAdvanceAmt(0);
    setAdvanceReason('');
    setIsAdvanceOpen(true);
  };

  const handleAdvanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee || advanceAmt <= 0 || !advanceReason.trim()) {
      alert('Please enter a valid payout advance amount and reason.');
      return;
    }

    try {
      await db.recordAdvance(selectedEmployee.id, Number(advanceAmt), advanceReason);
      alert('Salary advance recorded successfully! Payout calculations adjusted.');
      setIsAdvanceOpen(false);
      loadEmployees();
    } catch (err) {
      console.error(err);
      alert('Failed to log advance.');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Module Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-stone-800 tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-secondary" />
            9. Human Resources & Payroll
          </h2>
          <p className="text-[10px] text-stone-400">Manage employee rosters, track daily attendance, and process salary advances.</p>
        </div>
        <Button onClick={() => openRosterModal()} className="font-bold text-xs flex items-center gap-1.5 shadow-sm">
          <Plus className="w-4 h-4" /> Add Employee Profile
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="roster">Staff Roster</TabsTrigger>
          <TabsTrigger value="attendance">Daily Attendance Log</TabsTrigger>
          <TabsTrigger value="payroll">Payroll & Advances</TabsTrigger>
        </TabsList>

        {/* 1. STAFF ROSTER TAB */}
        <TabsContent value="roster">
          {loading ? (
            <div className="flex items-center justify-center py-20 text-stone-400 text-sm">
              Loading employees roster...
            </div>
          ) : (
            <TableContainer>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee Name</TableHead>
                    <TableHead>System Role</TableHead>
                    <TableHead>Email Address</TableHead>
                    <TableHead>Phone Number</TableHead>
                    <TableHead>Base Salary</TableHead>
                    <TableHead>Work Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.map((emp) => (
                    <TableRow key={emp.id}>
                      <TableCell className="font-bold text-stone-900 text-xs">{emp.name}</TableCell>
                      <TableCell>
                        <Badge variant={emp.role === 'Admin' ? 'success' : 'info'}>{emp.role}</Badge>
                      </TableCell>
                      <TableCell className="text-xs">{emp.email}</TableCell>
                      <TableCell className="text-xs text-stone-500 font-semibold">{emp.phone}</TableCell>
                      <TableCell className="font-bold text-xs text-primary">Rs. {emp.salary}</TableCell>
                      <TableCell>
                        <Badge variant={emp.status === 'Active' ? 'success' : 'neutral'}>
                          {emp.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1.5">
                          <Button 
                            onClick={() => openRosterModal(emp)} 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0"
                            title="Edit Profile"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-stone-500" />
                          </Button>
                          <Button 
                            onClick={() => handleDeleteEmployee(emp.id)} 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0 hover:bg-red-50"
                            title="Delete Profile"
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
        </TabsContent>

        {/* 2. ATTENDANCE REGISTER TAB */}
        <TabsContent value="attendance">
          <div className="space-y-4">
            <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-stone-200/50 max-w-sm">
              <CalendarCheck className="w-5 h-5 text-secondary" />
              <div className="flex-1">
                <Label htmlFor="att-date" className="text-[9px]">Attendance Working Date</Label>
                <Input 
                  id="att-date"
                  type="date"
                  value={attendanceDate}
                  onChange={(e) => setAttendanceDate(e.target.value)}
                  className="h-9 mt-0.5 text-xs"
                />
              </div>
            </div>

            <TableContainer>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Staff Name</TableHead>
                    <TableHead>Designation Role</TableHead>
                    <TableHead>Status On {new Date(attendanceDate).toLocaleDateString()}</TableHead>
                    <TableHead className="text-right">Mark Attendance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.filter(e => e.status === 'Active').map((emp) => {
                    // Find attendance status for current selected date
                    const currentRecord = emp.attendance.find(a => a.date === attendanceDate);
                    const attStatus = currentRecord ? currentRecord.status : 'Unmarked';

                    return (
                      <TableRow key={emp.id}>
                        <TableCell className="font-bold text-stone-900 text-xs">{emp.name}</TableCell>
                        <TableCell className="text-xs text-stone-400 font-semibold">{emp.role}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              attStatus === 'Present' ? 'success' :
                              attStatus === 'Leave' ? 'warning' :
                              attStatus === 'Absent' ? 'danger' : 'neutral'
                            }
                          >
                            {attStatus.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              onClick={() => handleMarkAttendance(emp.id, 'Present')}
                              size="sm" 
                              variant={attStatus === 'Present' ? 'primary' : 'outline'}
                              className="text-[10px] py-1 px-2.5 h-7 font-bold border-stone-200 bg-white"
                            >
                              Present
                            </Button>
                            <Button 
                              onClick={() => handleMarkAttendance(emp.id, 'Absent')}
                              size="sm" 
                              variant={attStatus === 'Absent' ? 'danger' : 'outline'}
                              className="text-[10px] py-1 px-2.5 h-7 font-bold border-stone-200 bg-white"
                            >
                              Absent
                            </Button>
                            <Button 
                              onClick={() => handleMarkAttendance(emp.id, 'Leave')}
                              size="sm" 
                              variant={attStatus === 'Leave' ? 'secondary' : 'outline'}
                              className="text-[10px] py-1 px-2.5 h-7 font-bold border-stone-200 bg-white"
                            >
                              Leave
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </div>
        </TabsContent>

        {/* 3. PAYROLL & ADVANCES TAB */}
        <TabsContent value="payroll">
          <TableContainer>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Staff Name</TableHead>
                  <TableHead>Monthly Base Salary</TableHead>
                  <TableHead>Total Advances Drawn</TableHead>
                  <TableHead>Net Payable Amount</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.filter(e => e.status === 'Active').map((emp) => {
                  const totalAdvances = emp.advances.reduce((acc, curr) => acc + curr.amount, 0);
                  const netPayable = Math.max(0, emp.salary - totalAdvances);

                  return (
                    <TableRow key={emp.id}>
                      <TableCell className="font-bold text-stone-900 text-xs">{emp.name}</TableCell>
                      <TableCell className="text-xs font-semibold">Rs. {emp.salary}</TableCell>
                      <TableCell className="text-xs font-semibold text-red-500">
                        - Rs. {totalAdvances}
                      </TableCell>
                      <TableCell className="font-extrabold text-xs text-primary">Rs. {netPayable}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          onClick={() => openAdvanceModal(emp)}
                          size="sm"
                          className="text-xs font-bold bg-amber-600 hover:bg-amber-700"
                        >
                          Log Advance Payout
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </TabsContent>
      </Tabs>

      {/* CRUD Roster Modal */}
      <Dialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={selectedEmployee ? 'Modify Employee Profile' : 'Register New Employee'}
      >
        <form onSubmit={handleSaveRoster} className="space-y-4">
          <div>
            <Label htmlFor="emp-name">Employee Full Name *</Label>
            <Input
              id="emp-name"
              placeholder="e.g. Milan Shrestha"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="emp-email">Work Email *</Label>
              <Input
                id="emp-email"
                type="email"
                placeholder="staff@gpt.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="emp-phone">Contact Phone</Label>
              <Input
                id="emp-phone"
                placeholder="98XXXXXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="emp-salary">Base Monthly Salary (Rs.) *</Label>
              <Input
                id="emp-salary"
                type="number"
                min="1"
                placeholder="22000"
                value={salary || ''}
                onChange={(e) => setSalary(Number(e.target.value))}
                required
              />
            </div>

            <div>
              <Select
                label="System Designation Role *"
                options={roles}
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
              />
            </div>
          </div>

          <div>
            <Select
              label="Work Status *"
              options={[
                { value: 'Active', label: 'Active Roster' },
                { value: 'Inactive', label: 'Resigned/Inactive' }
              ]}
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
            />
          </div>

          <div className="border-t border-stone-100 pt-4 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {selectedEmployee ? 'Update Profile' : 'Register Profile'}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Salary Advance Payout Modal */}
      <Dialog
        isOpen={isAdvanceOpen}
        onClose={() => setIsAdvanceOpen(false)}
        title={`Log Salary Advance: ${selectedEmployee?.name}`}
      >
        <form onSubmit={handleAdvanceSubmit} className="space-y-4">
          <div>
            <Label>Monthly Base Salary</Label>
            <p className="text-base font-bold text-stone-700">Rs. {selectedEmployee?.salary}</p>
          </div>

          <div>
            <Label htmlFor="adv-amt">Advance Payout (NPR / Rs.) *</Label>
            <Input
              id="adv-amt"
              type="number"
              min="1"
              max={selectedEmployee?.salary}
              placeholder="e.g. 5000"
              value={advanceAmt || ''}
              onChange={(e) => setAdvanceAmt(Number(e.target.value))}
              required
            />
          </div>

          <div>
            <Label htmlFor="adv-reason">Advance Justification Reason *</Label>
            <Input
              id="adv-reason"
              placeholder="e.g. Medical emergency advance, Festival cash draw"
              value={advanceReason}
              onChange={(e) => setAdvanceReason(e.target.value)}
              required
            />
          </div>

          <div className="border-t border-stone-100 pt-4 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setIsAdvanceOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white">
              Approve Advance Payout
            </Button>
          </div>
        </form>
      </Dialog>

    </div>
  );
}

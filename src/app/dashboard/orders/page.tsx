'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/db';
import { Order } from '@/lib/mockData';
import { Button, Card, CardContent, Select, Badge, TableContainer, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Dialog, Label } from '@/components/ui';
import { UserCheck, Trash2, Calendar, Eye, MessageSquare, Phone, MapPin, ClipboardList } from 'lucide-react';

export default function OrderModule() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  async function loadOrders() {
    setLoading(true);
    try {
      const data = await db.getOrders();
      setOrders(data);
    } catch (err) {
      console.error('Error loading orders:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  const handleStatusChange = async (id: string, newStatus: Order['status']) => {
    try {
      await db.updateOrderStatus(id, newStatus);
      
      // Update local state if selected order is open
      if (selectedOrder && selectedOrder.id === id) {
        setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
      }
      
      loadOrders();
    } catch (err) {
      console.error('Error updating order status:', err);
      alert('Failed to update status.');
    }
  };

  const handleDeleteOrder = async (id: string) => {
    if (!confirm('Are you sure you want to delete this order record?')) return;
    try {
      await db.deleteOrder(id);
      setIsDetailOpen(false);
      loadOrders();
    } catch (err) {
      console.error(err);
      alert('Failed to delete order.');
    }
  };

  const showOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailOpen(true);
  };

  const triggerWhatsAppFollowUp = (order: Order) => {
    let msg = `Namaste ${order.customerName}! This is Great Pickle Taste (GPT).\n`;
    if (order.status === 'Pending') {
      msg += `We have received your order *${order.orderNumber}* (Total: Rs. ${order.total}). We are reviewing it and will prepare it for delivery shortly!`;
    } else if (order.status === 'Confirmed') {
      msg += `Good news! Your order *${order.orderNumber}* has been confirmed. We are packing your pickles currently.`;
    } else if (order.status === 'Shipped') {
      msg += `Your order *${order.orderNumber}* has been handed over to our delivery partner. It is on its way to your address: ${order.deliveryAddress}.`;
    } else if (order.status === 'Delivered') {
      msg += `Your order *${order.orderNumber}* has been delivered! We hope you love the taste. Please share your feedback!`;
    } else {
      msg += `Regarding your order *${order.orderNumber}*, we have updated its status to: ${order.status}.`;
    }
    
    const url = `https://wa.me/${order.customerPhone}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'Pending': return <Badge variant="warning">Pending</Badge>;
      case 'Confirmed': return <Badge variant="info">Confirmed</Badge>;
      case 'Shipped': return <Badge variant="neutral">Shipped</Badge>;
      case 'Delivered': return <Badge variant="success">Delivered</Badge>;
      case 'Cancelled': return <Badge variant="danger">Cancelled</Badge>;
      default: return <Badge variant="neutral">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Module Title Header */}
      <div>
        <h2 className="text-xl font-extrabold text-stone-800 tracking-tight flex items-center gap-2">
          <UserCheck className="w-5 h-5 text-secondary" />
          8. Website WhatsApp Orders Processor
        </h2>
        <p className="text-[10px] text-stone-400">Manage catalog orders, verify coordinates, and dispatch delivery status followups.</p>
      </div>

      {/* Orders List Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-stone-400 text-sm">
          Loading website orders...
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white border border-stone-200 rounded-xl text-stone-400 text-xs">
          No orders received from website yet. Try checking out on the storefront.
        </div>
      ) : (
        <TableContainer>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order No</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Delivery Coordinates</TableHead>
                <TableHead>Grand Total</TableHead>
                <TableHead>Placed Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-extrabold text-xs text-primary">{order.orderNumber}</TableCell>
                  <TableCell>
                    <p className="font-bold text-xs text-stone-850 leading-none">{order.customerName}</p>
                    <span className="text-[10px] text-stone-400 block mt-0.5">{order.customerPhone}</span>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate text-xs" title={order.deliveryAddress}>
                    {order.deliveryAddress}
                  </TableCell>
                  <TableCell className="font-bold text-xs">Rs. {order.total}</TableCell>
                  <TableCell className="text-xs">{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    {getStatusBadge(order.status)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1.5">
                      <Button
                        onClick={() => showOrderDetails(order)}
                        variant="ghost"
                        size="sm"
                        className="text-xs font-bold"
                      >
                        Review
                      </Button>
                      <Button
                        onClick={() => triggerWhatsAppFollowUp(order)}
                        variant="outline"
                        size="sm"
                        className="h-8 py-1.5 px-3 flex items-center gap-1 text-[10px] font-bold border-stone-200 bg-white hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                        Chat
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Order Details Dialog */}
      <Dialog
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title={`Order Details: ${selectedOrder?.orderNumber}`}
      >
        {selectedOrder && (
          <div className="space-y-6">
            
            {/* Customer coordinates metadata */}
            <div className="bg-stone-50 rounded-xl p-4 border border-stone-200/50 space-y-3">
              <h4 className="text-[10px] uppercase font-bold text-stone-400 tracking-wider flex items-center gap-1">
                <ClipboardList className="w-3.5 h-3.5 text-secondary" />
                Shipping & Delivery Metadata
              </h4>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-stone-400 block font-semibold">Customer</span>
                  <span className="font-bold text-stone-800">{selectedOrder.customerName}</span>
                </div>
                <div>
                  <span className="text-stone-400 block font-semibold">Contact Phone</span>
                  <span className="font-bold text-stone-800 flex items-center gap-1 mt-0.5">
                    <Phone className="w-3.5 h-3.5 text-stone-400" />
                    {selectedOrder.customerPhone}
                  </span>
                </div>
              </div>
              <div className="text-xs border-t border-stone-200/50 pt-2.5">
                <span className="text-stone-400 block font-semibold">Address</span>
                <span className="font-medium text-stone-700 flex items-start gap-1 mt-1 leading-relaxed">
                  <MapPin className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
                  {selectedOrder.deliveryAddress}
                </span>
              </div>
              {selectedOrder.notes && (
                <div className="text-xs bg-amber-50/50 border border-amber-100 p-2.5 rounded-lg">
                  <span className="text-amber-800 block font-bold">Delivery notes:</span>
                  <p className="text-amber-700 mt-0.5 italic">"{selectedOrder.notes}"</p>
                </div>
              )}
            </div>

            {/* Product items list */}
            <div>
              <h4 className="text-[10px] uppercase font-bold text-stone-400 tracking-wider mb-2">Items Ordered</h4>
              <div className="space-y-2 border border-stone-100 rounded-xl p-3 bg-stone-50/50">
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs py-1.5 border-b border-stone-100/50 last:border-0">
                    <div>
                      <p className="font-bold text-stone-800">{item.name}</p>
                      <span className="text-[10px] text-stone-400">Rs. {item.price} x {item.quantity}</span>
                    </div>
                    <span className="font-bold text-primary">Rs. {item.total}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center text-xs font-bold text-stone-850 pt-3 border-t border-stone-200">
                  <span>Grand Total</span>
                  <span className="text-sm font-black text-primary">Rs. {selectedOrder.total}</span>
                </div>
              </div>
            </div>

            {/* Status transitions control */}
            <div className="space-y-2">
              <Label>Fulfillment Pipeline Stage</Label>
              <div className="flex flex-wrap gap-2.5 pt-1">
                {(['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'] as Order['status'][]).map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => handleStatusChange(selectedOrder.id, status)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all border ${
                      selectedOrder.status === status
                        ? 'bg-primary border-primary text-white shadow-xs'
                        : 'bg-white border-stone-200 text-stone-500 hover:bg-stone-50'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="border-t border-stone-100 pt-4 flex justify-between items-center">
              <Button 
                onClick={() => handleDeleteOrder(selectedOrder.id)} 
                variant="outline" 
                className="text-red-500 hover:text-red-700 hover:bg-red-50 border-stone-200 bg-white"
              >
                Delete Order
              </Button>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
                  Close
                </Button>
                <Button 
                  onClick={() => triggerWhatsAppFollowUp(selectedOrder)}
                  className="bg-emerald-600 hover:bg-emerald-700 flex items-center gap-1 font-bold"
                >
                  <MessageSquare className="w-4 h-4" />
                  Chat via WhatsApp
                </Button>
              </div>
            </div>

          </div>
        )}
      </Dialog>

    </div>
  );
}

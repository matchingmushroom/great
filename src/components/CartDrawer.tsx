'use client';

import React, { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { db } from '@/lib/db';
import { Button, Input, Label, TextArea } from '@/components/ui';
import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const { cart, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();
  
  // Form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bizWhatsApp, setBizWhatsApp] = useState('9779800000000');

  useEffect(() => {
    // Fetch WhatsApp number configured in db
    db.getSettings().then(settings => {
      setBizWhatsApp(settings.whatsappNumber);
    });
  }, []);

  if (!isOpen) return null;

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    if (!name.trim() || !phone.trim() || !address.trim()) {
      alert('Please fill in Name, Phone Number, and Delivery Address.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Generate a unique order number
      const orderNumber = `GPT-ORD-${Math.floor(1000 + Math.random() * 9000)}`;
      const orderId = `ord-${Date.now()}`;
      
      const orderItems = cart.map(item => ({
        productId: item.product.id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        total: item.product.price * item.quantity
      }));

      const newOrder = {
        id: orderId,
        orderNumber,
        customerName: name,
        customerPhone: phone,
        deliveryAddress: address,
        notes: notes || undefined,
        items: orderItems,
        total: cartTotal,
        status: 'Pending' as const,
        createdAt: Date.now()
      };

      // 1. Record in DB
      await db.saveOrder(newOrder);

      // 2. Generate WhatsApp Text
      let waMessage = `🇳🇵 *Great Pickle Taste (GPT)* 🇳🇵\n`;
      waMessage += `*New Order placed via website!*\n`;
      waMessage += `----------------------------------------\n`;
      waMessage += `*Order No:* ${orderNumber}\n`;
      waMessage += `*Name:* ${name}\n`;
      waMessage += `*Phone:* ${phone}\n`;
      waMessage += `*Address:* ${address}\n`;
      if (notes.trim()) {
        waMessage += `*Instructions:* ${notes}\n`;
      }
      waMessage += `----------------------------------------\n`;
      waMessage += `*Items Ordered:*\n`;
      
      cart.forEach((item, index) => {
        waMessage += `${index + 1}. ${item.product.name} (Qty: ${item.quantity}) - Rs. ${item.product.price * item.quantity}\n`;
      });
      
      waMessage += `----------------------------------------\n`;
      waMessage += `*Total Amount:* Rs. ${cartTotal}\n`;
      waMessage += `----------------------------------------\n`;
      waMessage += `Please confirm my order. Thank you!`;

      // 3. Clear cart
      clearCart();
      onClose();

      // 4. Redirect to WhatsApp
      const encodedMsg = encodeURIComponent(waMessage);
      const waUrl = `https://wa.me/${bizWhatsApp}?text=${encodedMsg}`;
      
      // Open in a new window
      window.open(waUrl, '_blank');
      
      // Reset form
      setName('');
      setPhone('');
      setAddress('');
      setNotes('');
    } catch (err) {
      console.error('Checkout error:', err);
      alert('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/55 backdrop-blur-xs transition-opacity animate-fadeIn"
        onClick={onClose}
      />
      
      {/* Drawer Panel */}
      <div className="relative w-full max-w-md bg-cream h-full shadow-2xl flex flex-col z-10 animate-slideIn border-l border-stone-200">
        
        {/* Header */}
        <div className="p-5 border-b border-stone-200/60 bg-white flex items-center justify-between">
          <div className="flex items-center gap-2 text-primary">
            <ShoppingBag className="w-5 h-5" />
            <h2 className="text-lg font-bold">Your Pickle Cart</h2>
          </div>
          <button 
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 focus:outline-none p-1 bg-stone-50 rounded-lg hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Contents */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center text-stone-400">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <div>
                <p className="text-stone-700 font-semibold">Your cart is empty</p>
                <p className="text-stone-400 text-xs mt-1">Add some delicious homemade pickles from the catalog!</p>
              </div>
              <Button onClick={onClose} variant="outline" size="sm">
                Browse Products
              </Button>
            </div>
          ) : (
            <>
              {/* Item List */}
              <div className="space-y-4">
                {cart.map((item) => (
                  <div 
                    key={item.product.id} 
                    className="flex gap-3 bg-white p-3.5 rounded-xl border border-stone-200/70 shadow-2xs hover:shadow-xs transition-shadow"
                  >
                    <img 
                      src={item.product.imageUrl} 
                      alt={item.product.name} 
                      className="w-16 h-16 rounded-lg object-cover bg-stone-50 border border-stone-100"
                    />
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-stone-800 truncate">{item.product.name}</h4>
                      <p className="text-xs text-stone-400 mt-0.5">{item.product.category} Category</p>
                      
                      <div className="flex items-center justify-between mt-2.5">
                        {/* Quantity controls */}
                        <div className="flex items-center border border-stone-200 rounded-lg bg-stone-50/50">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="p-1 text-stone-500 hover:text-stone-800 disabled:opacity-30"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-xs font-bold text-stone-800 px-2 min-w-6 text-center">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            disabled={item.quantity >= item.product.stockQuantity}
                            className="p-1 text-stone-500 hover:text-stone-800 disabled:opacity-30"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        
                        <span className="text-sm font-bold text-primary">
                          Rs. {item.product.price * item.quantity}
                        </span>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-stone-300 hover:text-red-500 self-start p-1 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Delivery Details Form */}
              <div className="border-t border-stone-200/60 pt-6">
                <h3 className="text-sm font-bold text-stone-800 mb-4">Delivery & Checkout Details</h3>
                <form onSubmit={handleCheckout} className="space-y-4">
                  <div>
                    <Label htmlFor="cust-name">Full Name *</Label>
                    <Input 
                      id="cust-name"
                      placeholder="e.g. Raju Adhikari"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="cust-phone">WhatsApp Mobile Number *</Label>
                    <Input 
                      id="cust-phone"
                      type="tel"
                      placeholder="e.g. 98XXXXXXXX or +977..."
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="cust-address">Delivery Address *</Label>
                    <Input 
                      id="cust-address"
                      placeholder="e.g. New Baneshwor, Kathmandu (Near Post Office)"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="cust-notes">Special Instructions (Optional)</Label>
                    <TextArea 
                      id="cust-notes"
                      placeholder="e.g. Deliver after 3 PM, ring bell, make it spicy"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>

                  <div className="bg-amber-50 border border-amber-200/60 rounded-xl p-3 text-xs text-amber-800 leading-relaxed">
                    🌟 <strong>Order Processing:</strong> Clicking below will record your order in our database and redirect you to WhatsApp to complete details and arrange shipping. No payment gateway needed!
                  </div>

                  {/* Checkout Actions */}
                  <div className="border-t border-stone-200/60 pt-4 mt-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-semibold text-stone-600">Subtotal:</span>
                      <span className="text-xl font-black text-stone-900">Rs. {cartTotal}</span>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full flex justify-center py-3 text-sm font-bold bg-emerald-600 hover:bg-emerald-700"
                      disabled={isSubmitting || cart.length === 0}
                    >
                      {isSubmitting ? 'Processing Order...' : '💬 Order via WhatsApp (Rs. ' + cartTotal + ')'}
                    </Button>
                  </div>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

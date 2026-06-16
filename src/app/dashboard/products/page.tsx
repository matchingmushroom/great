'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/db';
import { Product } from '@/lib/mockData';
import { Button, Card, CardContent, Input, Label, TextArea, Select, Badge, TableContainer, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Dialog } from '@/components/ui';
import { Plus, Edit2, Trash2, PackageSearch, AlertTriangle, Eye, EyeOff } from 'lucide-react';

export default function ProductsModule() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(0);
  const [imageUrl, setImageUrl] = useState('');
  const [category, setCategory] = useState('Mango');
  const [stockQuantity, setStockQuantity] = useState(0);
  const [minStockLevel, setMinStockLevel] = useState(5);
  const [isActive, setIsActive] = useState(true);

  const categories = [
    { value: 'Mango', label: 'Mango' },
    { value: 'Garlic', label: 'Garlic' },
    { value: 'Lapsi', label: 'Lapsi' },
    { value: 'Chilli', label: 'Chilli' },
    { value: 'Mixed', label: 'Mixed' }
  ];

  async function loadProducts() {
    setLoading(true);
    try {
      const data = await db.getProducts();
      setProducts(data);
    } catch (err) {
      console.error('Error loading products:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  const openModal = (product: Product | null = null) => {
    setSelectedProduct(product);
    if (product) {
      setName(product.name);
      setDescription(product.description);
      setPrice(product.price);
      setImageUrl(product.imageUrl);
      setCategory(product.category);
      setStockQuantity(product.stockQuantity);
      setMinStockLevel(product.minStockLevel);
      setIsActive(product.isActive);
    } else {
      setName('');
      setDescription('');
      setPrice(0);
      setImageUrl('https://images.unsplash.com/photo-1601050690597-df056fb4ce78?w=600&auto=format&fit=crop&q=80');
      setCategory('Mango');
      setStockQuantity(20);
      setMinStockLevel(5);
      setIsActive(true);
    }
    setIsOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || price <= 0 || stockQuantity < 0) {
      alert('Please enter a valid product name, price, and stock quantity.');
      return;
    }

    const prodPayload: Product = {
      id: selectedProduct ? selectedProduct.id : `prod-${Date.now()}`,
      name,
      description,
      price: Number(price),
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?w=600&auto=format&fit=crop&q=80',
      category,
      stockQuantity: Number(stockQuantity),
      minStockLevel: Number(minStockLevel),
      isActive,
      createdAt: selectedProduct ? selectedProduct.createdAt : Date.now()
    };

    try {
      await db.saveProduct(prodPayload);
      setIsOpen(false);
      loadProducts();
    } catch (err) {
      console.error(err);
      alert('Failed to save product.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await db.deleteProduct(id);
      loadProducts();
    } catch (err) {
      console.error(err);
      alert('Failed to delete product.');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Module Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-stone-800 tracking-tight flex items-center gap-2">
            <PackageSearch className="w-5 h-5 text-secondary" />
            1. Product Catalog Administration
          </h2>
          <p className="text-[10px] text-stone-400">Add, edit, or delete products displayed on the homepage shopfront.</p>
        </div>
        <Button onClick={() => openModal()} className="font-bold text-xs flex items-center gap-1.5 shadow-sm">
          <Plus className="w-4 h-4" /> Add New Pickle Product
        </Button>
      </div>

      {/* Loading state / Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-stone-400 text-sm">
          Loading catalog database...
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white border border-stone-200 rounded-xl text-stone-400 text-xs">
          No products found. Click "Add New Pickle Product" to populate items.
        </div>
      ) : (
        <TableContainer>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Preview</TableHead>
                <TableHead>Product details</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price (NPR)</TableHead>
                <TableHead>Stock Level</TableHead>
                <TableHead>Visibility</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => {
                const isLowStock = product.stockQuantity <= product.minStockLevel;
                return (
                  <TableRow key={product.id}>
                    <TableCell>
                      <img 
                        src={product.imageUrl} 
                        alt={product.name} 
                        className="w-12 h-12 rounded-lg object-cover border border-stone-100 bg-stone-50"
                      />
                    </TableCell>
                    <TableCell className="max-w-[250px]">
                      <p className="font-bold text-stone-900 text-xs leading-tight truncate">{product.name}</p>
                      <p className="text-[10px] text-stone-400 truncate mt-0.5">{product.description}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="info">{product.category}</Badge>
                    </TableCell>
                    <TableCell className="font-bold text-xs text-primary">Rs. {product.price}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <span className={`font-bold text-xs ${isLowStock ? 'text-red-500 font-extrabold' : 'text-stone-700'}`}>
                          {product.stockQuantity} jars
                        </span>
                        {isLowStock && (
                          <span title="Low Stock Warning">
                            <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {product.isActive ? (
                        <Badge variant="success" className="flex items-center gap-1 w-max">
                          <Eye className="w-3 h-3" /> Live
                        </Badge>
                      ) : (
                        <Badge variant="neutral" className="flex items-center gap-1 w-max">
                          <EyeOff className="w-3 h-3 text-stone-400" /> Hidden
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1.5">
                        <Button 
                          onClick={() => openModal(product)} 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0"
                          title="Edit Details"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-stone-500" />
                        </Button>
                        <Button 
                          onClick={() => handleDelete(product.id)} 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0 hover:bg-red-50"
                          title="Delete Product"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-500" />
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

      {/* CRUD Add/Edit Dialog modal */}
      <Dialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={selectedProduct ? 'Modify Product Parameters' : 'Register New Product'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <Label htmlFor="prod-name">Product Name *</Label>
            <Input
              id="prod-name"
              placeholder="e.g. Traditional Spicy Mango Pickle"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="prod-desc">Description (Ingredients & Details)</Label>
            <TextArea
              id="prod-desc"
              placeholder="Provide clean instructions, ingredients, weight info..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="prod-price">Price (NPR / Rs.) *</Label>
              <Input
                id="prod-price"
                type="number"
                min="1"
                placeholder="350"
                value={price || ''}
                onChange={(e) => setPrice(Number(e.target.value))}
                required
              />
            </div>

            <div>
              <Select
                label="Product Category *"
                options={categories}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="prod-stock">Current Stock Qty *</Label>
              <Input
                id="prod-stock"
                type="number"
                min="0"
                placeholder="50"
                value={stockQuantity}
                onChange={(e) => setStockQuantity(Number(e.target.value))}
                required
              />
            </div>

            <div>
              <Label htmlFor="prod-min">Min stock for alerts *</Label>
              <Input
                id="prod-min"
                type="number"
                min="0"
                placeholder="5"
                value={minStockLevel}
                onChange={(e) => setMinStockLevel(Number(e.target.value))}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="prod-image">Image URL</Label>
            <Input
              id="prod-image"
              placeholder="URL of unsplash/image host"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              id="prod-active"
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="rounded-sm border-stone-300 text-primary focus:ring-primary h-4 w-4"
            />
            <Label htmlFor="prod-active" className="mb-0 cursor-pointer text-stone-700 font-bold">
              Show Product Live on Homepage Shop
            </Label>
          </div>

          <div className="border-t border-stone-100 pt-4 flex justify-end gap-3.5">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {selectedProduct ? 'Update Product' : 'Create Product'}
            </Button>
          </div>
        </form>
      </Dialog>

    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { db } from '@/lib/db';
import { Product } from '@/lib/mockData';
import { Button } from '@/components/ui';
import { CartDrawer } from '@/components/CartDrawer';
import { ShoppingBag, Flame, Sparkles, MapPin, Phone, ShieldCheck, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const { addToCart, cartCount, cart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await db.getProducts();
        // Only show active products in the store front
        setProducts(data.filter(p => p.isActive));
      } catch (err) {
        console.error('Error loading storefront products:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadProducts();
  }, []);

  const categories = ['All', 'Mango', 'Garlic', 'Lapsi', 'Chilli', 'Mixed'];

  const filteredProducts = categoryFilter === 'All' 
    ? products 
    : products.filter(p => p.category.toLowerCase() === categoryFilter.toLowerCase());

  return (
    <div className="min-h-screen bg-cream flex flex-col font-sans select-none">
      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200/50 py-4 px-6 md:px-12 flex justify-between items-center shadow-xs">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-secondary font-black text-xl shadow-md shadow-primary/10">
            G
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-black text-primary tracking-tight font-display">
              Great Pickle Taste
            </h1>
            <span className="text-[10px] uppercase font-bold text-secondary tracking-widest block -mt-1">
              Handcrafted in Nepal
            </span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-stone-600">
          <a href="#story" className="hover:text-primary transition-colors">Our Story</a>
          <a href="#products" className="hover:text-primary transition-colors">Pickle Menu</a>
          <a href="#testimonials" className="hover:text-primary transition-colors">Reviews</a>
          <Link href="/dashboard" className="text-secondary hover:text-secondary-dark flex items-center gap-1 transition-colors">
            Staff Portal <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative p-2.5 rounded-full border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700 transition-colors flex items-center gap-2"
          >
            <ShoppingBag className="w-5 h-5 text-primary" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-secondary text-white text-xs font-black w-5.5 h-5.5 rounded-full flex items-center justify-center border-2 border-white shadow-sm animate-scaleIn">
                {cartCount}
              </span>
            )}
            <span className="text-xs font-bold hidden sm:inline text-primary">Rs. {cart.reduce((t, c) => t + (c.product.price * c.quantity), 0)}</span>
          </button>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative overflow-hidden py-16 md:py-24 px-6 md:px-12 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-7 space-y-6 md:space-y-8 text-left z-10">
          <div className="inline-flex items-center gap-2 bg-secondary/15 border border-secondary/20 px-3.5 py-1.5 rounded-full text-secondary text-xs font-bold tracking-wide">
            <Sparkles className="w-3.5 h-3.5 fill-secondary" />
            100% Homemade, Sun-Aged, Pure Mustard Oil
          </div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-primary leading-[1.08] tracking-tight font-display">
            Taste the Authentic <br />
            <span className="text-secondary relative">
              Nepalese Pickle Heritage
            </span>
          </h2>
          
          <p className="text-stone-600 text-base md:text-lg leading-relaxed max-w-xl">
            Savor the perfect balance of sun-dried mountain herbs, fresh garlic, sweet & sour hog plums (Lapsi), and fiery Akabare chilies cooked in traditional wooden-pressed cold oils.
          </p>

          <div className="flex flex-wrap gap-4">
            <a href="#products">
              <Button size="lg" className="font-bold py-4 px-8 shadow-lg shadow-primary/20">
                Explore Flavors
              </Button>
            </a>
            <a href="#story">
              <Button variant="outline" size="lg" className="font-bold py-4 px-8">
                Our Recipe Secret
              </Button>
            </a>
          </div>

          <div className="grid grid-cols-3 gap-6 pt-6 border-t border-stone-200/70 max-w-md">
            <div>
              <p className="text-2xl font-black text-primary">0%</p>
              <p className="text-xs text-stone-500 font-medium">Preservatives</p>
            </div>
            <div>
              <p className="text-2xl font-black text-primary">20+</p>
              <p className="text-xs text-stone-500 font-medium">Authentic Spices</p>
            </div>
            <div>
              <p className="text-2xl font-black text-primary">10k+</p>
              <p className="text-xs text-stone-500 font-medium">Happy Customers</p>
            </div>
          </div>
        </div>

        {/* Hero Image */}
        <div className="lg:col-span-5 relative flex justify-center">
          <div className="absolute -inset-4 bg-secondary/10 rounded-3xl blur-2xl transform rotate-6 scale-95" />
          <div className="relative border-8 border-white rounded-3xl overflow-hidden shadow-2xl w-full max-w-sm aspect-square bg-stone-100">
            <img 
              src="https://images.unsplash.com/photo-1601050690597-df056fb4ce78?w=800&auto=format&fit=crop&q=80" 
              alt="Homemade Nepalese Pickles" 
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-xs p-3.5 rounded-xl border border-stone-200/50 shadow-md flex items-center gap-3">
              <Flame className="w-6 h-6 text-orange-600 fill-orange-600 animate-pulse" />
              <div>
                <p className="text-xs font-extrabold text-stone-900 leading-none">Best Seller</p>
                <p className="text-[10px] text-stone-500 mt-0.5">Spicy Mango Achar</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STORY SECTION */}
      <section id="story" className="bg-white py-20 border-y border-stone-200/40">
        <div className="max-w-4xl mx-auto text-center px-6 space-y-6">
          <span className="text-xs font-extrabold text-secondary uppercase tracking-widest">Our Secret Process</span>
          <h2 className="text-3xl md:text-4xl font-black text-primary font-display">Aged under the Himalayan Sun</h2>
          <div className="w-16 h-1 bg-secondary mx-auto rounded-full" />
          
          <p className="text-stone-600 text-base md:text-lg leading-relaxed max-w-2xl mx-auto">
            Unlike commercial factories, <strong>Great Pickle Taste</strong> pickles are made in micro-batches. We slice premium mangoes, Lapsi plums, and garlic cloves, mix them with hand-pounded spices, and sun-cure them in large glass jars for 21 days. This allows the spices to deep-infuse, locking in authentic Nepalese flavor.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-10 text-left">
            <div className="p-6 bg-cream rounded-2xl border border-stone-200/50 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">1</div>
              <h4 className="font-bold text-primary text-sm">Sun-Drying</h4>
              <p className="text-xs text-stone-500 leading-relaxed">Vegetables are slow dehydrated under direct sunlight to prevent mold and concentrate organic juices.</p>
            </div>
            <div className="p-6 bg-cream rounded-2xl border border-stone-200/50 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">2</div>
              <h4 className="font-bold text-primary text-sm">Cold Oil Sealing</h4>
              <p className="text-xs text-stone-500 leading-relaxed">Pure mustard oil acts as a natural preservative, keeping flavors rich without artificial chemicals.</p>
            </div>
            <div className="p-6 bg-cream rounded-2xl border border-stone-200/50 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">3</div>
              <h4 className="font-bold text-primary text-sm">Spiced Seasoning</h4>
              <p className="text-xs text-stone-500 leading-relaxed">Traditional Nepalese spices (Timmur, mustard seeds, asafoetida) create an unforgettable zing.</p>
            </div>
          </div>
        </div>
      </section>

      {/* PRODUCTS / CATALOG SECTION */}
      <section id="products" className="py-20 px-6 md:px-12 max-w-7xl mx-auto w-full space-y-12">
        <div className="text-center space-y-3">
          <span className="text-xs font-extrabold text-secondary uppercase tracking-widest">Pickle Catalog</span>
          <h2 className="text-3xl md:text-4xl font-black text-primary font-display">Choose Your Pickle Flavor</h2>
          <p className="text-stone-500 text-sm max-w-md mx-auto">Click Add to Cart and customize your order. Deliveries take 1-3 working days across Kathmandu Valley.</p>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center justify-center gap-2.5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-5 py-2 text-xs font-extrabold rounded-full transition-all border ${
                categoryFilter === cat 
                  ? 'bg-primary text-white border-primary shadow-xs' 
                  : 'bg-white text-stone-500 border-stone-200 hover:bg-stone-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Loading / Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-24 text-stone-400 text-sm">
            Loading fresh pickles catalog...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-stone-400 text-sm">
            <ShoppingBag className="w-8 h-8 mb-2" />
            No pickles available in this category currently.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredProducts.map((product) => {
              const isLowStock = product.stockQuantity <= product.minStockLevel && product.stockQuantity > 0;
              const isOutOfStock = product.stockQuantity === 0;

              return (
                <div 
                  key={product.id}
                  className="bg-white rounded-2xl border border-stone-200/70 overflow-hidden shadow-2xs hover:shadow-md hover:translate-y-[-4px] transition-all flex flex-col group"
                >
                  {/* Image wrapper */}
                  <div className="relative aspect-square bg-stone-50 overflow-hidden border-b border-stone-100">
                    <img 
                      src={product.imageUrl} 
                      alt={product.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    
                    {/* Badge notifications */}
                    <div className="absolute top-3.5 left-3.5 flex flex-col gap-2.5">
                      <span className="bg-primary/90 backdrop-blur-xs text-white text-[10px] font-extrabold px-3 py-1 rounded-full border border-primary/20">
                        {product.category}
                      </span>
                      {isOutOfStock && (
                        <span className="bg-red-600 text-white text-[9px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider">
                          Out of stock
                        </span>
                      )}
                      {isLowStock && (
                        <span className="bg-amber-600 text-white text-[9px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider animate-pulse">
                          Only {product.stockQuantity} Left
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Description Box */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-1">
                      <h3 className="font-bold text-stone-900 text-base leading-tight group-hover:text-primary transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-xs text-stone-500 line-clamp-3 leading-relaxed">
                        {product.description}
                      </p>
                    </div>

                    <div className="space-y-3 pt-3 border-t border-stone-100">
                      <div className="flex items-end justify-between">
                        <span className="text-stone-400 text-[10px] uppercase font-bold tracking-wider">Price</span>
                        <span className="text-lg font-black text-primary">Rs. {product.price}</span>
                      </div>
                      
                      <Button
                        onClick={() => {
                          addToCart(product);
                          setIsCartOpen(true);
                        }}
                        className="w-full py-2.5 text-xs font-bold"
                        variant={isOutOfStock ? 'outline' : 'primary'}
                        disabled={isOutOfStock}
                      >
                        {isOutOfStock ? 'Sold Out' : 'Add to Cart'}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* TESTIMONIALS */}
      <section id="testimonials" className="bg-stone-50/70 border-t border-stone-200/40 py-20 px-6 md:px-12">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <span className="text-xs font-extrabold text-secondary uppercase tracking-widest">Customer Reviews</span>
            <h2 className="text-3xl md:text-4xl font-black text-primary font-display">What Pickle Lovers Say</h2>
            <p className="text-stone-500 text-sm max-w-sm mx-auto">Real reviews from our community of food enthusiasts.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-2xl border border-stone-200/50 shadow-2xs space-y-4">
              <div className="flex text-amber-500 gap-1 font-bold text-lg">★★★★★</div>
              <p className="text-stone-600 text-sm leading-relaxed">
                "The Fiery Akabare chili pickle is legendary! It is incredibly spicy, but you can taste the herbs and mustard oil. Highly recommend for any Thakali meal!"
              </p>
              <div>
                <p className="text-xs font-black text-stone-900">Ayush Shrestha</p>
                <p className="text-[10px] text-stone-400">Kathmandu</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-stone-200/50 shadow-2xs space-y-4">
              <div className="flex text-amber-500 gap-1 font-bold text-lg">★★★★★</div>
              <p className="text-stone-600 text-sm leading-relaxed">
                "The Lapsi pickle is the perfect balance of sweet, sour, and heat. Reminds me of the pickle my grandmother used to make in Lapsiphedi. Exceptional quality!"
              </p>
              <div>
                <p className="text-xs font-black text-stone-900">Dr. Shruti KC</p>
                <p className="text-[10px] text-stone-400">Lalitpur</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-stone-200/50 shadow-2xs space-y-4">
              <div className="flex text-amber-500 gap-1 font-bold text-lg">★★★★★</div>
              <p className="text-stone-600 text-sm leading-relaxed">
                "We use their Spicy Mango Achar at our home dining table daily. It's clean, non-greasy, and doesn't have that artificial vinegar taste. Truly premium."
              </p>
              <div>
                <p className="text-xs font-black text-stone-900">Prabin Bahadur</p>
                <p className="text-[10px] text-stone-400">Bhaktapur</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="mt-auto bg-primary text-white py-12 px-6 md:px-12 border-t border-stone-900">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 pb-8 border-b border-primary-dark/80">
          <div className="space-y-4">
            <h3 className="text-lg font-black tracking-tight font-display text-secondary">Great Pickle Taste</h3>
            <p className="text-stone-300 text-xs leading-relaxed">
              Preserving traditional Nepalese recipe heritages, slow cured under the Himalayan sun, mixed with organic oils and mountain herbs.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs uppercase font-extrabold tracking-wider text-stone-300">Quick Links</h4>
            <ul className="text-stone-400 text-xs space-y-2 font-medium">
              <li><a href="#story" className="hover:text-white transition-colors">Our Brand Story</a></li>
              <li><a href="#products" className="hover:text-white transition-colors">Pickle Flavors Menu</a></li>
              <li><a href="#testimonials" className="hover:text-white transition-colors">Reviews & Testimonials</a></li>
              <li><Link href="/login" className="text-secondary hover:text-white transition-colors">Employee Log-in Portal</Link></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs uppercase font-extrabold tracking-wider text-stone-300">Our Location</h4>
            <p className="text-stone-400 text-xs flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-secondary shrink-0" />
              Chakupat, Lalitpur, Nepal
            </p>
            <p className="text-stone-400 text-xs flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-secondary shrink-0" />
              +977-9841000000 / +977-9800000000
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs uppercase font-extrabold tracking-wider text-stone-300">Trust & Hygiene</h4>
            <p className="text-stone-400 text-xs flex items-start gap-2 leading-relaxed">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ISO 22000 Certified processes, zero preservatives, 100% glass jar storage for ultimate freshness.
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between text-[11px] text-stone-400">
          <p>© {new Date().getFullYear()} Great Pickle Taste (GPT). All rights reserved.</p>
          <div className="flex gap-4 mt-4 md:mt-0 font-medium">
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <Link href="/login" className="hover:text-white transition-colors text-secondary font-bold">Admin Dashboard</Link>
          </div>
        </div>
      </footer>

      {/* Cart Drawer */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
}

import type { Metadata } from 'next';
import { Poppins, Outfit } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';

const poppins = Poppins({
  variable: '--font-poppins',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

const outfit = Outfit({
  variable: '--font-outfit',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Great Pickle Taste (GPT) — Authentic Nepalese Pickles',
  description: 'Handcrafted, traditional pickles made with fresh ingredients and authentic spices. Order via WhatsApp today!',
  keywords: 'Pickles, Achar, Nepal, Kathmandu, Nepalese Pickle, Organic Achar, Mango Pickle, Garlic Pickle',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${poppins.variable} ${outfit.variable} h-full antialiased`}>
      <body className="min-h-full font-sans bg-cream text-stone-800 flex flex-col">
        <AuthProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

# Great Pickle Taste (GPT) - Design System & UI/UX Specification

This document details the branding guidelines, design system, component layouts, and user experience flows implemented in the **Great Pickle Taste (GPT)** platform.

---

## 1. Branding & Typography

**Branding Concept:**  
*Great Pickle Taste* celebrates traditional, sun-aged Nepalese pickle heritage (*Achar*). The brand identity reflects organic, handcrafted, premium culinary craftsmanship, emphasizing Himalayan spices, wooden-pressed cold oils, and zero preservatives.

*   **Primary Brand Font:** `Geist Sans` & custom display typography.
*   **Aesthetics Tone:** Warm, rustic, clean, food-centric, modern e-commerce.

---

## 2. Design Tokens (Color Palette)

The application implements a tailored natural color palette via CSS variables mapped to custom utility styles:

| Token | HSL / Hex Code | Usage |
| :--- | :--- | :--- |
| `--color-cream` | `hsl(36, 33%, 97%)` | Base page background for rustic, organic feel. |
| `--color-primary` | `hsl(100, 37%, 21%)` | Forest Green (`#2c4a21`) - primary actions, headers, and footer. |
| `--color-primary-dark` | `hsl(100, 42%, 14%)` | Dark Forest Green - hover state and mobile overlays. |
| `--color-secondary` | `hsl(38, 92%, 50%)` | Rich Gold/Amber (`#d97706`) - accents, best-seller highlight. |
| `--color-secondary-dark` | `hsl(38, 95%, 40%)` | Dark Amber - hover states, secondary highlights. |
| `--color-stone` | Neutral scales | Body text (`stone-600`), borders (`stone-200`), and clean backgrounds. |

---

## 3. UI/UX Layout Architecture

### A. Customer Storefront
The storefront is configured as a single-page landing page featuring:
*   **Sticky Header:** Persistent navbar showing logo, story link, menu link, and the persistent Cart Drawer trigger displaying real-time total cart value.
*   **Hero Section:** Dual-column grid presenting brand hook ("Taste the Authentic Nepalese Pickle Heritage"), visual unsplash mockups, key USP cards (0% Preservatives, 20+ Spices), and action buttons.
*   **Sun-Aged Story Section:** Multi-step timeline cards explaining solar curing, cold oil preservation, and Himalayan spice infusing.
*   **Interactive Catalog:** Tabbed filters by category (*Mango, Garlic, Lapsi, Chilli, Mixed, All*), rendering product cards with live inventory threshold badges (e.g., "Only 3 Left").
*   **Testimonials Grid:** Three-column cards highlighting authentic reviews from food lovers in Kathmandu, Lalitpur, and Bhaktapur.
*   **Footer:** Clear site navigation, app portal route, Chakupat location pins, and trust certifications.

### B. Cart Drawer & WhatsApp Order Flow
*   **Slide-over Panel:** Renders from the right on both desktop and mobile screens.
*   **Quantities Manager:** Quick increment/decrement buttons that respect live inventory levels.
*   **Checkout Form:** Simple, lightweight checkout interface collecting name, contact number, and delivery address.
*   **WhatsApp Generation:** Compiles order items, totals, delivery address, and metadata into a formatted Markdown text, then redirects the client to `wa.me` API.

### C. Admin & Operations Dashboard
*   **Sidebar Navigation:** Role-restricted sidebar that dynamically renders modules depending on the logged-in user's role (*Admin, Manager, Staff*).
*   **Overview Panel:** High-level executive statistics (Gross Sales, Outflows, Net Profit, Stock Warnings) combined with recent web orders and quick-action shortcuts.
*   **POS Billing Terminal:** A split billing panel that maps the search-enabled product catalog on the left to an active invoice compiler on the right, calculating discounts and printing invoices on the fly.
*   **Recharts Financial Analytics:** Beautiful interactive line, bar, and pie charts that visually breakdown profit structures, top-selling items, and category expenses.

---

## 4. Technical UI Features & Safeguards

*   **Dynamic Client SSR Safeties:** Utilizes React dynamic imports with `ssr: false` for PDF printing modules, ensuring Next.js static builds do not crash on window-dependent rendering APIs.
*   **Clean Table Container Wrapper:** Multi-device friendly horizontal scrolling table layout with clean borders, status badges, and inline actions.

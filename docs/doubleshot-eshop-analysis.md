# Doubleshot.cz E-shop Structure Analysis

**Date:** 2026-08-22  
**Source:** https://www.doubleshot.cz  
**Purpose:** Reference for building a similar ceramics online store

---

## 1. Site Overview

Doubleshot is a Czech specialty coffee roastery e-shop built on **Sylius** (PHP e-commerce platform). The site is bilingual (Czech/English) with currency in CZK. It features a clean, minimalist design with a warm beige color palette and dark navy accents.

---

## 2. Page Structure / Sitemap

### Main Navigation (Header)

| Menu Item                   | URL                        | Description                  |
| --------------------------- | -------------------------- | ---------------------------- |
| KÁVY (Coffees)              | `/cs/taxons/kavy`          | Product category - coffee    |
| PŘÍSLUŠENSTVÍ (Accessories) | `/cs/taxons/prislusenstvi` | Product category - equipment |
| PŘEDPLATNÉ (Subscription)   | `/cs/pages/predplatne`     | Coffee subscription service  |
| KURZY (Courses)             | `/cs/pages/kavove-kurzy`   | Coffee courses/workshops     |
| LOKALITY (Locations)        | `/cs/cafe/`                | Cafe locations               |

### Utility Navigation (Header Right)

- Search (magnifying glass icon)
- User account / Login (`/cs/login`)
- Cart (`/cs/cart/`)
- Language switch (ENGLISH / CZK)

### Footer Pages

| Page                              | URL                                        | Description                |
| --------------------------------- | ------------------------------------------ | -------------------------- |
| Blog                              | `/cs/blog`                                 | Articles/news              |
| Kavárny (Cafes)                   | `/cs/cafe`                                 | Cafe locations             |
| Kontakt (Contact)                 | `/cs/contact`                              | Contact info               |
| Příběh (Story)                    | `/cs/pages/pribeh`                         | Brand story / About        |
| Kariéra (Careers)                 | `/cs/pages/kariera`                        | Job openings               |
| Klub (Club)                       | `/cs/pages/klub`                           | Loyalty program            |
| Dárkové poukazy (Gift vouchers)   | `/cs/pages/darkove-poukazy`                | Gift cards                 |
| Káva do kanceláře (Office coffee) | `/cs/pages/kava-nejen-do-kancelare`        | B2B office supply          |
| Kávový catering                   | `/cs/pages/kavovy-catering`                | Catering services          |
| DS do kavárny (Wholesale)         | `/cs/pages/chci-doubleshot-do-sve-kavarny` | Wholesale for cafes        |
| FAQ                               | `/cs/pages/nejcastejsi-dotazy`             | Frequently asked questions |
| Reklamace (Returns)               | `/cs/pages/jak-reklamovat-zbozi`           | Returns policy             |
| Obchodní podmínky (T&C)           | `/cs/pages/obchodni-podminky`              | Terms & conditions         |
| Cookies                           | `/cs/pages/cookies`                        | Cookie policy              |

### User Account Pages

- Login: `/cs/login`
- Register: `/cs/register`
- Cart: `/cs/cart/`

---

## 3. Homepage Structure

The homepage consists of these sections (top to bottom):

1. **Announcement Bar** - Rotating promotional messages (e.g., "2+ bags = free shipping to pickup points")
2. **Header** - Logo, main nav, utility icons
3. **Hero Section** - Full-width product spotlight with large typography, CTA button ("KOUPIT" = Buy)
4. **Value Propositions** - 3-column grid:
   - Etika & ekologie (Ethics & ecology)
   - Snadný výběr (Easy selection)
   - Skvělá hodnota (Great value)
5. **Hot Products Grid** - "Žhavé produkty" - 4-column product grid (8 products, 2 rows)
6. **"All Products" CTA Button** - Links to full catalog
7. **Footer** - Brand logo, navigation links, social media (Facebook, Instagram)

---

## 4. Category Page Structure

### Coffee Category (`/cs/taxons/kavy`)

- **Title**: "Kávy dle chuti" (Coffees by taste)
- **Flavor Filter Buttons** (colored pills):
  - Všechny chutě (All flavors) - dark/default
  - Sladké a krémové (Sweet & creamy) - coral/orange
  - Ovocné a elegantní (Fruity & elegant) - teal/green
  - Šťavnaté a exotické (Juicy & exotic) - yellow-green
- **Type Filter Tabs** (text tabs):
  - VŠE (All), ESPRESSO, FILTROVANÁ (Filter), KAPSLE (Capsules), SÁČKOVÁ (Steeped bags)
- **Product Grid**: 4 columns

### Accessories Category (`/cs/taxons/prislusenstvi`)

- **Title**: "Příslušenství"
- **Description**: Introductory text about home brewing
- **Subcategory Tabs**:
  - PŘÍPRAVA KÁVY (Coffee preparation/brewers)
  - MLÝNKY (Grinders)
  - MERCH (Merchandise)
  - BARISTICKÉ POMŮCKY (Barista tools)
  - DOPLŇKY A FILTRY (Accessories & filters)
  - NÁHRADNÍ DÍLY (Spare parts)
- **Product Grid**: 4 columns

---

## 5. Product Card (Grid Item) Structure

Each product in the grid has:

```
productBox
├── productBox-image (product photo)
├── productBox-tags (badges/labels)
├── productBox-coffeeSubscriptionIcon (subscription badge if applicable)
└── productBox-content
    └── productBox-inner
        ├── productBox-title (h3 - product name)
        ├── productBox-subtitle (description line)
        └── productBox-price (price in CZK)
```

CSS classes also carry taste metadata: `is-productTaste-sweet-and-creamy`

---

## 6. Product Detail Page Structure

Based on the "Tričko DS" product page observed:

1. **Header** (same as all pages)
2. **Product Title** - Large centered heading (custom serif font)
3. **Description Section**:
   - Subtitle/tagline
   - Body text description
4. **Expandable Accordion Sections** (collapsed by default, with + icon):
   - Custom content sections (e.g., collaboration details, manufacturing info, size chart)
5. **Image Carousel** - Left/right navigation arrows, product photos
6. **Price** - Displayed below images
7. **Add to Cart** - Purchase controls (size/variant selector, quantity, add button)

---

## 7. Product Catalog

### Coffees (18 products)

| Product              | Type                       |
| -------------------- | -------------------------- |
| Start                | Espresso blend             |
| Era                  | Flagship espresso (365 Kč) |
| Extra                | Espresso                   |
| Decaf Espresso       | Decaf espresso             |
| Flirt                | Filter blend               |
| Flirt • sáčková káva | Steeped bags (210 Kč)      |
| Imbachi Reserve      | DS x Standart Collab       |
| Fun • Rumudamo       | Ethiopia (335 Kč)          |
| Farm • Medina Espejo | Colombia single origin     |
| Farm • Emporium      | Panama single origin       |
| Farm • Rumudamo      | Ethiopia (480 Kč)          |
| Farm • Joao Hamilton | Brazil single origin       |
| Farm • Imbachi       | Colombia single origin     |
| Decaf Filtr          | Decaf filter               |
| Start • kapsle       | Capsules                   |
| Extra • kapsle       | Capsules (190 Kč)          |
| Fun • kapsle         | Capsules                   |
| Decaf • kapsle       | Capsules                   |

### Accessories (18 products)

| Product                       | Category         |
| ----------------------------- | ---------------- |
| NextLevel Pulsar              | Brewer           |
| NextLevel LVL-10              | Brewer           |
| Tricolate                     | Brewer           |
| Aeropress Original            | Brewer           |
| Aeropress Go                  | Brewer           |
| AeroPress GO Plus             | Brewer           |
| Hario V60 Drip Dekanter       | Pour over        |
| Hario V60-01 (keramika)       | Pour over        |
| Hario V60-02 (keramika)       | Pour over        |
| Clever Dripper Chytráček      | Immersion brewer |
| Espro Bloom                   | Pour over        |
| French Press Frieling Ultimo  | French press     |
| Moccamaster Cup One           | Drip machine     |
| Moccamaster KBG Select        | Drip machine     |
| Moccamaster KBGT-741          | Drip machine     |
| Moccamaster Thermoserve       | Drip machine     |
| Morning kávovar na kapsle     | Capsule machine  |
| Morning Dream napěňovač mléka | Milk frother     |

### Other Products

| Product                       | Price        |
| ----------------------------- | ------------ |
| Dárkový poukaz do kaváren     | Gift voucher |
| Tričko DS (x Juliana Chomová) | 700 Kč       |
| Kšiltovka Juicy & Exotic      | 390 Kč       |

---

## 8. Design & UX Patterns

### Color Palette

- **Background**: Warm beige (`#f0e8dc` / similar)
- **Primary dark**: Navy/charcoal (`#2a2d34` / similar)
- **Accent**: Coral/salmon for highlights and links
- **Taste colors**: Coral (sweet), Teal (fruity), Yellow-green (juicy)

### Typography

- **Custom fonts loaded**:
  - DINNextLTPro (Regular, Bold, Italic, BoldItalic) - body text
  - DS-Documan - display headings
  - DS-Loka - accent/decorative
  - DS-Pantograph - UI elements

### Key UX Features

- Rotating announcement bar at top
- Sticky navigation header
- Product taste color-coding system
- Coffee subscription badges on eligible products
- Tab-based filtering (no page reload)
- Accordion sections on product pages
- Image carousels for products
- Cookie consent banner

### E-commerce Features

- Shopping cart
- User accounts (login/register)
- Coffee subscription service
- Gift vouchers
- Multi-language (CS/EN)
- Currency display (CZK)
- Free shipping promotions

---

## 9. Technical Stack

- **Platform**: Sylius (PHP-based e-commerce)
- **URL structure**: `/{locale}/taxons/{category}` for categories, `/{locale}/products/{slug}` for products
- **Channels**: Czech (`doubleshot_cz`) and World (`doubleshot_world`)
- **CSS**: Custom BEM-style classes (`productBox-title`, `productGrid-product`, etc.)
- **SVG sprites**: Icons served as SVG sprite sheet (`shapes.svg#shape-*`)
- **Responsive**: Grid adapts columns based on viewport

---

## 10. Recommendations for Ceramics Store Adaptation

Based on this analysis, a ceramics e-shop should include:

### Must-Have Pages

1. **Homepage** - Hero + featured products + value propositions
2. **Category pages** - With filter tabs (e.g., by type: mugs, bowls, plates, vases)
3. **Product detail pages** - Images, description, expandable details, price, add to cart
4. **About/Story page** - Artisan/brand story
5. **Contact page** - Contact form + studio location
6. **Cart & Checkout** - Standard e-commerce flow
7. **Terms & Conditions** - Legal pages

### Nice-to-Have

- Blog (behind-the-scenes, process posts)
- Workshop/courses page
- Gift vouchers
- Subscription box (seasonal ceramics)
- Wholesale/B2B page

### Suggested Category Structure for Ceramics

- **Hrnky & šálky** (Mugs & cups)
- **Misky & mísy** (Bowls)
- **Talíře** (Plates)
- **Vázy & květináče** (Vases & planters)
- **Dekorace** (Decorative pieces)
- **Sety** (Sets/collections)

### Filter Ideas

- By color/glaze
- By collection/series
- By use (everyday, special occasion, decorative)
- By size

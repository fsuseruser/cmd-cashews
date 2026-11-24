# CMD Cashews: online store

A Next.js shop for CMD Cashews (Negombo, since 1996): product catalogue, cart, checkout with **bank transfer only**, orders confirmed on **WhatsApp**, a Postgres order database and an admin page.

## Deploy to Vercel

1. Push this folder to a GitHub repository.
2. In Vercel, click **Add New → Project** and import the repo. No build settings are needed.
3. Under **Settings → Environment Variables**, add:

| Variable | Example | What it does |
|---|---|---|
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | `94771234567` | WhatsApp number that receives orders. Use international format, digits only. |
| `NEXT_PUBLIC_SITE_URL` | `https://cmdcashews.lk` | Your domain, used for SEO and the sitemap. |
| `ADMIN_PASSWORD` | a long password | Signs you in at `/admin`. |

4. **Database (recommended):** go to **Storage → Create Database → Neon (Postgres)** and connect it to the project. Vercel adds `DATABASE_URL` for you. The tables and all 11 products are created automatically on the first visit.
5. Redeploy.

The site also runs without a database. In that case orders still reach you on WhatsApp but aren't saved, and prices come from `src/lib/catalog.ts`.

## How ordering works

1. The customer adds cashews to the cart. The cart is saved in their browser.
2. At checkout they enter delivery details and choose **Negombo (free delivery)** or **Rest of Sri Lanka** (courier charge confirmed on WhatsApp).
3. The server re-checks every price, saves the order with a number like `CMD-261124-QZQ7`, and shows the bank details.
4. The customer taps **Send order on WhatsApp**. A message with the full order is pre-filled. They send their payment slip in the same chat.
5. In `/admin` you move the order through *Awaiting payment → Paid → Dispatched → Delivered*.

## Prices, pack sizes and bulk discounts

- Each product has one **price per kg**. The 250 g and 500 g packs are calculated from it automatically. By default they carry a +10% and +5% premium, rounded to the nearest Rs. 50.
- **Bulk discounts** depend on the total weight of the order: 3 kg+ gets 3% off, 5 kg+ 5% and 10 kg+ 8%. The cart shows customers how much more they need to add to reach the next discount.
- All of this can be changed in `/admin` and updates on the site straight away, with no redeploy needed. The server always recalculates the total, so customers can't change prices in their browser.

| Product | Per kg | 500 g | 250 g |
|---|---|---|---|
| Devilled / Burnt / Salted / Extra Spicy | 7,300 | 3,850 | 2,000 |
| Garlic / Garlic & Pepper | 7,550 | 3,950 | 2,100 |
| Ghee-Fried | 8,300 | 4,350 | 2,300 |
| Raw Whole | 6,250 | 3,300 | 1,700 |
| Raw Half | 5,850 | 3,050 | 1,600 |
| Oven-Roasted Pieces | 5,000 | 2,650 | 1,400 |
| Raw Pieces | 4,200 | 2,200 | 1,150 |

## Product photos

The starting photos are free stock images from Unsplash, used under the Unsplash License (free for commercial use). They show cashews in general, not your own products. Replace them with real photos of your products as soon as you can: in `/admin → Products & prices`, paste a photo URL for each product. If a photo ever fails to load, the site shows the illustrated tile instead.

Photographers: Kischmisch, Naveena V, Emma Miller, Sanjay Dosajh, Amit Kumar Jain, Maja Vujic and Caroline Badran (hero), all on unsplash.com.

## Admin (`/admin`)

- **Orders:** totals, filters by status, a status changer, and a link to WhatsApp each customer.
- **Products & prices:** change the price per kg and photo URL, mark items in or out of stock, and pick which ones show as *Signature* on the home page.
- **Packs & bulk discounts:** set the 250 g and 500 g premiums and up to five discount tiers.

## Editing

- **Bank details, delivery text:** `src/lib/config.ts`
- **Product names and descriptions:** `src/lib/catalog.ts`. Once a database is connected, change prices and photos in `/admin` instead.
- **Your own photo files:** put them in `public/products/` and use `/products/devilled.jpg` as the photo URL. Square or 4:5 photos work best.
- **Colours and fonts:** the variables at the top of `src/app/globals.css`.

## SEO

The site includes per-page titles and descriptions, Open Graph tags, a `sitemap.xml`, `robots.txt`, structured data for the Store and each Product (price, LKR, stock), statically generated product pages and semantic HTML. After launch, submit `https://your-domain/sitemap.xml` in Google Search Console.

## Local development

```bash
npm install
cp .env.example .env.local   # fill in the values
npm run dev
```

export type Category = "roasted" | "raw" | "pieces";

export type Product = {
  slug: string;
  name: string;
  short: string;
  description: string;
  price: number; // LKR per 1 kg (smaller packs are priced from this)
  category: Category;
  inStock: boolean;
  featured?: boolean;
  tone: { bg: string; ink: string }; // colours for the product illustration
  image?: string; // optional: put a photo in /public/products and set "/products/<file>.jpg"
  sort: number;
};

export const CATEGORIES: Record<Category, string> = {
  roasted: "Roasted & flavoured",
  raw: "Raw cashews",
  pieces: "Pieces",
};

/** Default catalogue. When a database is connected this is used to seed it once. */
/** Free photos from Unsplash (Unsplash License). Replace with your own product photos any time in /admin. */
export function unsplash(id: string) {
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1400&q=80`;
}

export const HERO_IMAGE = unsplash("1764607080323-f9c760408cd3");

/** Price list before the November 2026 increase, used once to migrate untouched database prices. */
export const PREVIOUS_PRICES: Record<string, number> = {
  "devilled-cashews": 7000, "burnt-cashews": 7000, "salted-cashews": 7000, "extra-spicy-garlic-curry-leaf": 7000,
  "garlic-cashews": 7250, "garlic-pepper-cashews": 7250, "ghee-fried-cashews": 8000, "raw-whole-cashews": 6000,
  "raw-half-cashews": 5600, "oven-roasted-pieces": 4800, "raw-pieces": 4000,
};

export const CATALOG: Product[] = [
  {
    slug: "devilled-cashews",
    name: "Devilled Cashews",
    short: "Chilli-spiced, the Sri Lankan way",
    description:
      "Whole cashews roasted and tossed in our devilled spice blend: warm chilli heat, a little sweetness and plenty of crunch. The one everyone asks for.",
    price: 7300,
    image: unsplash("1729796350013-ebb27f079c76"),
    category: "roasted",
    inStock: true,
    featured: true,
    tone: { bg: "#F3E2D3", ink: "#9C3D24" },
    sort: 1,
  },
  {
    slug: "burnt-cashews",
    name: "Burnt Cashews",
    short: "Deep-roasted, dark and toasty",
    description:
      "Taken well past golden for a dark, deeply toasted cashew with a satisfying snap. Simple, rich and hard to stop eating.",
    price: 7300,
    image: unsplash("1769255484239-2f2f7278e233"),
    category: "roasted",
    inStock: true,
    featured: true,
    tone: { bg: "#E9DFD3", ink: "#5A3A22" },
    sort: 2,
  },
  {
    slug: "salted-cashews",
    name: "Salted Cashews",
    short: "Golden roast, lightly salted",
    description:
      "Classic golden-roasted cashews with just enough salt to bring out their natural creaminess. A crowd-pleaser for every table.",
    price: 7300,
    image: unsplash("1769255484443-50e4e3e2bbdb"),
    category: "roasted",
    inStock: true,
    tone: { bg: "#F1EADB", ink: "#8A6A3C" },
    sort: 3,
  },
  {
    slug: "extra-spicy-garlic-curry-leaf",
    name: "Extra Spicy",
    short: "Garlic & curry leaf, turned up",
    description:
      "Our hottest cashew. Fried garlic and crisp curry leaves with a serious chilli kick, for those who like it fiery.",
    price: 7300,
    image: unsplash("1729514256038-c489695f4d79"),
    category: "roasted",
    inStock: true,
    featured: true,
    tone: { bg: "#F0DCD2", ink: "#8E2F1F" },
    sort: 4,
  },
  {
    slug: "garlic-cashews",
    name: "Garlic Cashews",
    short: "Savoury, fragrant garlic",
    description:
      "Golden cashews roasted with garlic for a savoury, aromatic snack that pairs well with tea or a cold drink.",
    price: 7550,
    image: unsplash("1723466998040-78d7e2ef6d72"),
    category: "roasted",
    inStock: true,
    tone: { bg: "#EEEAD9", ink: "#6B6233" },
    sort: 5,
  },
  {
    slug: "garlic-pepper-cashews",
    name: "Garlic & Pepper",
    short: "Garlic with cracked black pepper",
    description:
      "Garlic-roasted cashews finished with cracked Sri Lankan black pepper. Gentle heat, big flavour.",
    price: 7550,
    image: unsplash("1726771517475-e7acdd34cd8a"),
    category: "roasted",
    inStock: true,
    tone: { bg: "#E6E4DA", ink: "#3F4A3A" },
    sort: 6,
  },
  {
    slug: "ghee-fried-cashews",
    name: "Ghee-Fried Cashews",
    short: "Fried in pure ghee",
    description:
      "Our most indulgent cashew, fried in original ghee for a rich, buttery flavour and a melt-in-the-mouth crunch. Perfect for gifting.",
    price: 8300,
    image: unsplash("1780494092679-5978bd163184"),
    category: "roasted",
    inStock: true,
    featured: true,
    tone: { bg: "#F4E7C9", ink: "#8C6420" },
    sort: 7,
  },
  {
    slug: "raw-whole-cashews",
    name: "Raw Whole Cashews",
    short: "Full nuts, unroasted",
    description:
      "Whole, unroasted Sri Lankan cashews. Creamy and mild, for cooking, baking or roasting your own way.",
    price: 6250,
    image: unsplash("1641718087616-859c6754efb9"),
    category: "raw",
    inStock: true,
    tone: { bg: "#F5F0E4", ink: "#A08660" },
    sort: 8,
  },
  {
    slug: "raw-half-cashews",
    name: "Raw Half Cashews",
    short: "Split halves, unroasted",
    description:
      "Naturally split cashew halves, unroasted. The same flavour as whole nuts at a better price for curries, rice and desserts.",
    price: 5850,
    image: unsplash("1641718111847-7e509a4dd208"),
    category: "raw",
    inStock: true,
    tone: { bg: "#F2EEE3", ink: "#97805C" },
    sort: 9,
  },
  {
    slug: "oven-roasted-pieces",
    name: "Oven-Roasted Pieces",
    short: "Roasted pieces for cooking & baking",
    description:
      "Oven-roasted cashew pieces, ready to sprinkle on rice, desserts and bakes. A favourite with home bakers and caterers.",
    price: 5000,
    image: unsplash("1573555657105-47a0bb37c3ea"),
    category: "pieces",
    inStock: true,
    tone: { bg: "#EFE4D2", ink: "#7E5B32" },
    sort: 10,
  },
  {
    slug: "raw-pieces",
    name: "Raw Pieces",
    short: "Unroasted pieces, best value",
    description:
      "Unroasted cashew pieces: our best-value option for kitchens, cooking and baking in bulk.",
    price: 4200,
    image: unsplash("1509912760195-4f6cfd8cce2c"),
    category: "pieces",
    inStock: true,
    tone: { bg: "#F3EFE6", ink: "#9A8A6E" },
    sort: 11,
  },
];

export const MAX_QTY = 25; // max packs per line

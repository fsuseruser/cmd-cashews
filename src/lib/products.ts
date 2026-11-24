import "server-only";
import { CATALOG, type Product, type Category } from "./catalog";
import { db, hasDatabase } from "./db";

const DEFAULT_TONE = { bg: "#F1EADB", ink: "#8A6A3C" };

type Row = {
  slug: string;
  name: string;
  short: string;
  description: string;
  price: number;
  category: string;
  in_stock: boolean;
  featured: boolean;
  image: string | null;
  sort: number;
};

function fromRow(r: Row): Product {
  const base = CATALOG.find((p) => p.slug === r.slug);
  return {
    slug: r.slug,
    name: r.name,
    short: r.short,
    description: r.description,
    price: Number(r.price),
    category: r.category as Category,
    inStock: r.in_stock,
    featured: r.featured,
    image: r.image ?? base?.image,
    sort: r.sort,
    tone: base?.tone ?? DEFAULT_TONE,
  };
}

export async function getProducts(): Promise<Product[]> {
  if (!hasDatabase) return [...CATALOG].sort((a, b) => a.sort - b.sort);
  try {
    const sql = await db();
    const rows = (await sql`SELECT * FROM products ORDER BY sort ASC, name ASC`) as Row[];
    return rows.map(fromRow);
  } catch (e) {
    console.error("[products] database unavailable, using built-in catalogue", e);
    return [...CATALOG].sort((a, b) => a.sort - b.sort);
  }
}

export async function getProduct(slug: string): Promise<Product | undefined> {
  const all = await getProducts();
  return all.find((p) => p.slug === slug);
}

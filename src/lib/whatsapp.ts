import { BANK, DELIVERY, WHATSAPP_NUMBER } from "./config";
import { lkr } from "./format";
import { formatKg } from "./pricing";

type MsgOrder = {
  id: string;
  customerName: string;
  phone: string;
  address: string;
  city: string;
  zone: keyof typeof DELIVERY;
  notes: string;
  items: { name: string; packLabel: string; qty: number; total: number }[];
  subtotal: number;
  discount: number;
  discountPct: number;
  total: number;
  weightGrams: number;
};

export function orderMessage(o: MsgOrder) {
  const lines = [
    `Hello CMD Cashews! I'd like to place an order.`,
    ``,
    `*Order ${o.id}*`,
    ...o.items.map((i) => `• ${i.name} (${i.packLabel}) × ${i.qty}: ${lkr(i.total)}`),
    ``,
    `Total weight: ${formatKg(o.weightGrams)}`,
    `Subtotal: ${lkr(o.subtotal)}`,
    o.discount > 0 ? `Bulk discount (${o.discountPct}%): −${lkr(o.discount)}` : null,
    `*Total: ${lkr(o.total)}*${DELIVERY[o.zone].fee === null ? " + delivery" : ""}`,
    `Delivery: ${DELIVERY[o.zone].label} (${DELIVERY[o.zone].note})`,
    ``,
    `Name: ${o.customerName}`,
    `Phone: ${o.phone}`,
    `Address: ${o.address}, ${o.city}`,
    o.notes ? `Notes: ${o.notes}` : null,
    ``,
    `Payment: bank transfer to ${BANK.bank} ${BANK.accountNumber}. I will send the payment slip here.`,
  ];
  return lines.filter((l): l is string => l !== null).join("\n");
}

export function whatsappLink(text: string) {
  if (!WHATSAPP_NUMBER) return null;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

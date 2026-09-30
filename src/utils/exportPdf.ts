import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Store, Transaction } from '../types';
import { formatNumber, summarize } from './calculations';

const ascii = (text: string) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D');
const storeName = (stores: Store[], id: string) => stores.find((s) => s.id === id)?.name || id;

export function exportPdf(txs: Transaction[], stores: Store[], label: string) {
  const doc = new jsPDF({ orientation: 'landscape' });
  const summary = summarize(txs);
  doc.setFillColor(11, 31, 51); doc.roundedRect(12, 10, 20, 20, 4, 4, 'F');
  doc.setTextColor(214, 179, 106); doc.setFontSize(15); doc.text('TG', 18, 23);
  doc.setTextColor(11, 31, 51); doc.setFontSize(18); doc.text('TravisGold', 38, 18);
  doc.setFontSize(11); doc.text(ascii('Bao cao quan ly mua - ban'), 38, 25);
  doc.setFontSize(10); doc.text(ascii(`Pham vi: ${label}`), 12, 38); doc.text(ascii(`Ngay xuat: ${new Date().toLocaleString('vi-VN')}`), 12, 44);
  doc.text(ascii(`Giao dich: ${summary.transactionCount} | Mua: ${formatNumber(summary.purchaseTotal)} VND | Ban: ${formatNumber(summary.saleTotal)} VND | Loi nhuan: ${formatNumber(summary.profit)} VND | Ton: ${summary.remainingQuantity}`), 12, 51);
  autoTable(doc, {
    startY: 58,
    head: [[ascii('Ma GD'), ascii('Ngay'), ascii('Cua hang'), ascii('SL mua'), ascii('Gia mua'), ascii('Tien mua'), ascii('SL ban'), ascii('Gia ban'), ascii('Tien ban'), ascii('Loi nhuan'), ascii('Ton')]],
    body: txs.map((t) => [t.id, t.date, ascii(storeName(stores, t.storeId)), t.purchaseQuantity, formatNumber(t.purchaseUnitPrice), formatNumber(t.purchaseTotal), t.saleQuantity, formatNumber(t.saleUnitPrice), formatNumber(t.saleTotal), formatNumber(t.profit), t.remainingQuantity]),
    styles: { fontSize: 8 }, headStyles: { fillColor: [11, 31, 51] },
  });
  const date = new Date().toLocaleDateString('sv-SE');
  doc.save(`TravisGold_${ascii(label).replace(/\s+/g, '')}_${date}.pdf`);
}

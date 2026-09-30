import * as XLSX from 'xlsx';
import type { Store, Transaction } from '../types';
import { summarize } from './calculations';

const storeName = (stores: Store[], id: string) => stores.find((s) => s.id === id)?.name || id;
const detailRows = (txs: Transaction[], stores: Store[]) => txs.map((t) => ({
  'Mã giao dịch': t.id, 'Ngày': t.date, 'Cửa hàng': storeName(stores, t.storeId),
  'Số lượng mua vào': t.purchaseQuantity, 'Giá mua/cái': t.purchaseUnitPrice, 'Thành tiền mua vào': t.purchaseTotal,
  'Số lượng bán ra': t.saleQuantity, 'Giá bán/cái': t.saleUnitPrice, 'Thành tiền bán ra': t.saleTotal,
  'Lợi nhuận': t.profit, 'Số lượng tồn': t.remainingQuantity, 'Ghi chú': t.note || '',
}));

export function exportExcel(txs: Transaction[], stores: Store[], label: string) {
  const wb = XLSX.utils.book_new();
  const summary = summarize(txs);
  const summaryRows = [
    ['TRAVISGOLD - BÁO CÁO TỔNG HỢP', ''], ['Phạm vi', label], ['Ngày xuất', new Date().toLocaleString('vi-VN')],
    ['Tổng số giao dịch', summary.transactionCount], ['Tổng tiền mua vào', summary.purchaseTotal], ['Tổng tiền bán ra', summary.saleTotal],
    ['Tổng lợi nhuận', summary.profit], ['Tổng số lượng tồn', summary.remainingQuantity],
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(summaryRows), 'Tổng quan');
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(detailRows(txs, stores)), 'Chi tiết giao dịch');
  stores.forEach((s) => XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(detailRows(txs.filter((t) => t.storeId === s.id), stores)), s.name.slice(0, 31)));
  const date = new Date().toLocaleDateString('sv-SE');
  XLSX.writeFile(wb, `TravisGold_BaoCao_${label.replace(/\s+/g, '')}_${date}.xlsx`);
}

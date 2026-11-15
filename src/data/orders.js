export const ORDERS_STORAGE_KEY = "videobelajar-orders";

function isOrder(order) {
  return (
    order &&
    typeof order === "object" &&
    typeof order.invoice === "string" &&
    order.invoice.length > 0 &&
    Number.isInteger(order.courseId) &&
    Number.isFinite(order.coursePrice) &&
    Number.isFinite(order.adminFee) &&
    Number.isFinite(order.total) &&
    typeof order.method === "string" &&
    order.method.length > 0 &&
    typeof order.createdAt === "string" &&
    !Number.isNaN(Date.parse(order.createdAt)) &&
    ["menunggu", "berhasil", "gagal"].includes(order.status)
  );
}

export function readOrders() {
  const savedOrders = window.localStorage.getItem(ORDERS_STORAGE_KEY);
  if (!savedOrders) return [];

  const orders = JSON.parse(savedOrders);
  if (!Array.isArray(orders) || !orders.every(isOrder)) {
    throw new Error("Format data pesanan tidak valid.");
  }
  return orders;
}

export function saveOrder(order) {
  const orders = readOrders();
  window.localStorage.setItem(
    ORDERS_STORAGE_KEY,
    JSON.stringify([order, ...orders]),
  );
}

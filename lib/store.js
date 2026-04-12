import fs from "fs/promises";
import path from "path";

const root = process.cwd();
const storeDir = path.join(root, "data", "store");

const files = {
  products: path.join(storeDir, "products.json"),
  orders: path.join(storeDir, "orders.json"),
  mpesa: path.join(storeDir, "mpesa-transactions.json"),
};

async function readJson(file) {
  const raw = await fs.readFile(file, "utf8");
  return JSON.parse(raw);
}

async function writeJson(file, value) {
  await fs.writeFile(file, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

export async function readProducts() {
  return readJson(files.products);
}

export async function writeProducts(products) {
  return writeJson(files.products, products);
}

export async function readOrders() {
  return readJson(files.orders);
}

export async function writeOrders(orders) {
  return writeJson(files.orders, orders);
}

export async function readMpesaTransactions() {
  return readJson(files.mpesa);
}

export async function writeMpesaTransactions(transactions) {
  return writeJson(files.mpesa, transactions);
}

export async function getDashboardSnapshot() {
  const [products, orders, mpesa] = await Promise.all([
    readProducts(),
    readOrders(),
    readMpesaTransactions(),
  ]);

  return { products, orders, mpesa };
}

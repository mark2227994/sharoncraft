import { readMpesaTransactions } from "../../../../lib/store";

export default async function handler(req, res) {
  return res.status(200).json(await readMpesaTransactions());
}

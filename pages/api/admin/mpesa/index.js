import { isAuthorizedRequest } from "../../../../lib/admin-auth";
import { readMpesaTransactions } from "../../../../lib/store";

export default async function handler(req, res) {
  if (!isAuthorizedRequest(req)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  return res.status(200).json(await readMpesaTransactions());
}

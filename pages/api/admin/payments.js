import { isAuthorizedRequest } from "../../../lib/admin-auth";
import { getDashboardSnapshot } from "../../../lib/store";
import { subDays, isWithinInterval, startOfDay, endOfDay } from "date-fns";

export default async function handler(req, res) {
  if (!isAuthorizedRequest(req)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const status = req.query.status || "all";
  const { mpesa = [] } = await getDashboardSnapshot();

  // Calculate stats for all payments
  const now = new Date();
  const thirtyDaysAgo = subDays(now, 30);

  const allPayments = mpesa.map((payment) => ({
    id: payment.id || payment.CheckoutRequestID,
    transactionId: payment.transactionId || payment.TransactionDesc,
    amount: Number(payment.amount_kes || payment.amount || 0),
    status: payment.status || "unknown",
    timestamp: payment.timestamp || payment.createdAt || new Date().toISOString(),
    phone: payment.phone || payment.PhoneNumber || "",
    orderId: payment.orderId || "",
  }));

  // Filter by date range
  const recentPayments = allPayments.filter((p) => {
    const date = new Date(p.timestamp);
    return isWithinInterval(date, { start: thirtyDaysAgo, end: now });
  });

  // Calculate stats
  const totalPending = recentPayments
    .filter((p) => p.status === "pending" || p.status === "Processing")
    .reduce((sum, p) => sum + p.amount, 0);

  const totalVerified = recentPayments
    .filter((p) => p.status === "verified" || p.status === "Success")
    .reduce((sum, p) => sum + p.amount, 0);

  const totalFailed = recentPayments
    .filter((p) => p.status === "failed" || p.status === "Failed")
    .reduce((sum, p) => sum + p.amount, 0);

  const dailyAverage = recentPayments.length > 0 ? totalVerified / 30 : 0;

  // Filter payments by status
  let filteredPayments = recentPayments;
  if (status !== "all") {
    if (status === "pending") {
      filteredPayments = recentPayments.filter((p) => p.status === "pending" || p.status === "Processing");
    } else if (status === "verified") {
      filteredPayments = recentPayments.filter((p) => p.status === "verified" || p.status === "Success");
    } else if (status === "failed") {
      filteredPayments = recentPayments.filter((p) => p.status === "failed" || p.status === "Failed");
    }
  }

  // Sort by date (newest first)
  filteredPayments.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  res.status(200).json({
    payments: filteredPayments,
    stats: {
      totalPending,
      totalVerified,
      totalFailed,
      dailyAverage,
    },
  });
}

export function extractMpesaCallback(rawPayload) {
  const stk = rawPayload?.Body?.stkCallback || {};
  const items = stk.CallbackMetadata?.Item || [];
  const getValue = (name) => items.find((item) => item?.Name === name)?.Value;

  return {
    resultCode: Number(stk.ResultCode ?? -1),
    resultDesc: stk.ResultDesc || "",
    mpesaReceipt: getValue("MpesaReceiptNumber") || "",
    transactionDate: String(getValue("TransactionDate") || ""),
    amount: Number(getValue("Amount") || 0),
    phoneNumber: String(getValue("PhoneNumber") || ""),
    accountReference: String(getValue("AccountReference") || rawPayload?.AccountReference || ""),
  };
}

export function buildMpesaTransaction(parsed, rawPayload, matchedOrderId = null) {
  return {
    id: `${parsed.mpesaReceipt || `mpesa-${Date.now()}`}`.toLowerCase(),
    mpesa_receipt: parsed.mpesaReceipt,
    phone: parsed.phoneNumber,
    amount_kes: parsed.amount,
    order_ref: parsed.accountReference,
    status: parsed.resultCode === 0 ? "Success" : "Failed",
    timestamp: parsed.transactionDate || new Date().toISOString(),
    matched_order_id: matchedOrderId,
    payload: rawPayload,
  };
}

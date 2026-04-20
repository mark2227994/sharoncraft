import { supabase } from "../../../lib/supabase-server";

/**
 * Import history table structure:
 * - id: unique identifier
 * - timestamp: when import happened
 * - userId: admin who did the import (from session)
 * - totalCount: how many products imported
 * - successCount: how many succeeded
 * - failureCount: how many failed
 * - productIds: array of imported product IDs
 * - errorDetails: any errors that occurred
 */

export async function logImport(session, totalCount, successCount, failureCount, productIds, errorDetails = null) {
  try {
    const { error } = await supabase
      .from("import_history")
      .insert([
        {
          timestamp: new Date().toISOString(),
          userId: session?.user?.id || "unknown",
          userEmail: session?.user?.email || "unknown",
          totalCount,
          successCount,
          failureCount,
          productIds: JSON.stringify(productIds),
          errorDetails: errorDetails ? JSON.stringify(errorDetails) : null,
        },
      ]);

    if (error) {
      console.error("Failed to log import:", error);
      // Don't fail the import if logging fails
      return false;
    }
    return true;
  } catch (error) {
    console.error("Import history logging error:", error);
    return false;
  }
}

export async function getImportHistory(limit = 20) {
  try {
    const { data, error } = await supabase
      .from("import_history")
      .select("*")
      .order("timestamp", { ascending: false })
      .limit(limit);

    if (error) throw error;

    // Parse JSON fields
    return data.map((record) => ({
      ...record,
      productIds: record.productIds ? JSON.parse(record.productIds) : [],
      errorDetails: record.errorDetails ? JSON.parse(record.errorDetails) : null,
    }));
  } catch (error) {
    console.error("Failed to fetch import history:", error);
    return [];
  }
}

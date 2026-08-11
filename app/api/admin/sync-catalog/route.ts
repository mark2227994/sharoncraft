import { NextResponse } from 'next/server';
import { syncCatalogFromDatabase } from '@/lib/store';

export async function POST() {
  try {
    const products = await syncCatalogFromDatabase();
    return NextResponse.json({
      ok: true,
      count: products.length,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Sync failed';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Status = 'idle' | 'loading' | 'success' | 'error';

export default function MigrationPage() {
  const router = useRouter();
  const [categoriesStatus, setCategoriesStatus] = useState<Status>('idle');
  const [productsStatus, setProductsStatus] = useState<Status>('idle');
  const [categoriesMessage, setCategoriesMessage] = useState('');
  const [productsMessage, setProductsMessage] = useState('');

  async function migrateCategories() {
    setCategoriesStatus('loading');
    setCategoriesMessage('Migrating categories...');
    try {
      const response = await fetch('/api/admin/migrate-categories', {
        method: 'POST',
      });
      const data = await response.json();

      if (!response.ok) {
        setCategoriesStatus('error');
        setCategoriesMessage(`Error: ${data.error}`);
        return;
      }

      setCategoriesStatus('success');
      setCategoriesMessage(
        `✅ Categories migrated: ${data.summary.successful} successful, ${data.summary.failed} failed`
      );
    } catch (err: any) {
      setCategoriesStatus('error');
      setCategoriesMessage(`Error: ${err.message}`);
    }
  }

  async function migrateProducts() {
    setProductsStatus('loading');
    setProductsMessage('Migrating products (this may take a few minutes)...');
    try {
      const response = await fetch('/api/admin/migrate-products', {
        method: 'POST',
      });
      const data = await response.json();

      if (!response.ok) {
        setProductsStatus('error');
        setProductsMessage(`Error: ${data.error}`);
        return;
      }

      setProductsStatus('success');
      setProductsMessage(
        `✅ Products migrated: ${data.summary.successful} successful, ${data.summary.failed} failed`
      );
    } catch (err: any) {
      setProductsStatus('error');
      setProductsMessage(`Error: ${err.message}`);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium mb-4">Data Migration</h2>
        <p className="text-sm text-gray-600 mb-6">
          Migrate products and categories from legacy data to Supabase.
        </p>
      </div>

      {/* Categories Migration */}
      <div
        className="border p-6 rounded-sm"
        style={{ borderColor: '#f0f0f0', backgroundColor: '#fafafa' }}
      >
        <h3 className="text-sm font-medium mb-2">Step 1: Migrate Categories</h3>
        <p className="text-xs text-gray-500 mb-4">
          Create category structure (Jewellery, African Wear, Accessories, Art & Craft, Home & Living, Gifted Carry)
        </p>
        <button
          onClick={migrateCategories}
          disabled={categoriesStatus === 'loading'}
          className="text-xs tracking-wider uppercase px-4 py-2 rounded-sm transition-opacity disabled:opacity-50"
          style={{
            backgroundColor: '#1c1c1c',
            color: '#fff',
            letterSpacing: '2px',
          }}
        >
          {categoriesStatus === 'loading' ? 'Migrating...' : 'Start Categories'}
        </button>
        {categoriesMessage && (
          <div
            className="text-xs mt-3 p-2 rounded-sm"
            style={{
              backgroundColor: categoriesStatus === 'error' ? '#fee' : '#efe',
              color: categoriesStatus === 'error' ? '#c33' : '#3c3',
            }}
          >
            {categoriesMessage}
          </div>
        )}
      </div>

      {/* Products Migration */}
      <div
        className="border p-6 rounded-sm"
        style={{ borderColor: '#f0f0f0', backgroundColor: '#fafafa' }}
      >
        <h3 className="text-sm font-medium mb-2">Step 2: Migrate Products</h3>
        <p className="text-xs text-gray-500 mb-4">
          Migrate 100+ products from data/products.json to Supabase (defaults to 10 stock per item)
        </p>
        <button
          onClick={migrateProducts}
          disabled={
            productsStatus === 'loading' ||
            (categoriesStatus !== 'success' && categoriesStatus !== 'idle')
          }
          className="text-xs tracking-wider uppercase px-4 py-2 rounded-sm transition-opacity disabled:opacity-50"
          style={{
            backgroundColor: '#1c1c1c',
            color: '#fff',
            letterSpacing: '2px',
          }}
        >
          {productsStatus === 'loading' ? 'Migrating...' : 'Start Products'}
        </button>
        {productsMessage && (
          <div
            className="text-xs mt-3 p-2 rounded-sm"
            style={{
              backgroundColor: productsStatus === 'error' ? '#fee' : '#efe',
              color: productsStatus === 'error' ? '#c33' : '#3c3',
            }}
          >
            {productsMessage}
          </div>
        )}
      </div>

      {/* Completion Status */}
      {categoriesStatus === 'success' && productsStatus === 'success' && (
        <div
          className="border p-4 rounded-sm text-xs"
          style={{ borderColor: '#8B5E3C', backgroundColor: '#fff9f5' }}
        >
          <p style={{ color: '#8B5E3C' }}>
            ✅ Migration complete! Your products are now in Supabase. Visit the Products page to
            review inventory and adjust stock levels as needed.
          </p>
        </div>
      )}
    </div>
  );
}

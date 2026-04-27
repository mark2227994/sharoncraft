'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

interface Product {
  id: string;
  name: string;
  stock_quantity: number;
  low_stock_alert: number;
  category: string;
}

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterLow, setFilterLow] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, [filterLow]);

  async function fetchProducts() {
    setLoading(true);
    try {
      let query = supabase
        .from('products')
        .select('id, name, stock_quantity, low_stock_alert, category')
        .order('stock_quantity');

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching products:', error);
        return;
      }

      let filtered = data || [];
      if (filterLow) {
        filtered = filtered.filter((p) => p.stock_quantity <= p.low_stock_alert);
      }

      setProducts(filtered);
    } finally {
      setLoading(false);
    }
  }

  async function updateStock(id: string, newQuantity: number) {
    const { error } = await supabase
      .from('products')
      .update({ stock_quantity: newQuantity })
      .eq('id', id);

    if (!error) {
      setProducts(
        products.map((p) => (p.id === id ? { ...p, stock_quantity: newQuantity } : p))
      );
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-medium">Inventory</h2>
        <p className="text-xs text-gray-500 mt-1">Manage product stock levels</p>
      </div>

      {/* Filter */}
      <label className="flex items-center gap-2 text-xs cursor-pointer">
        <input
          type="checkbox"
          checked={filterLow}
          onChange={(e) => setFilterLow(e.target.checked)}
        />
        <span>Show low stock only</span>
      </label>

      {/* Inventory Table */}
      {loading ? (
        <div className="text-xs text-gray-500">Loading...</div>
      ) : products.length === 0 ? (
        <div className="text-xs text-gray-500">No products found</div>
      ) : (
        <div className="border overflow-x-auto" style={{ borderColor: '#f0f0f0' }}>
          <table className="w-full text-xs">
            <thead>
              <tr style={{ backgroundColor: '#fafafa', borderBottom: '1px solid #f0f0f0' }}>
                <th className="px-4 py-3 text-left font-medium">Product</th>
                <th className="px-4 py-3 text-left font-medium">Category</th>
                <th className="px-4 py-3 text-left font-medium">Current Stock</th>
                <th className="px-4 py-3 text-left font-medium">Low Alert</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const isLow = product.stock_quantity <= product.low_stock_alert;
                return (
                  <tr
                    key={product.id}
                    style={{ borderBottom: '1px solid #f0f0f0' }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-4 py-3">{product.name}</td>
                    <td className="px-4 py-3 text-gray-600">{product.category}</td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        value={product.stock_quantity}
                        onChange={(e) =>
                          updateStock(product.id, parseInt(e.target.value))
                        }
                        className="w-16 text-xs px-2 py-1 border"
                        style={{ borderColor: '#e0e0e0' }}
                      />
                    </td>
                    <td className="px-4 py-3">{product.low_stock_alert}</td>
                    <td className="px-4 py-3">
                      <span
                        className="text-xs px-2 py-1 rounded-sm"
                        style={{
                          backgroundColor: isLow ? '#fee' : '#efe',
                          color: isLow ? '#c33' : '#3c3',
                        }}
                      >
                        {isLow ? 'LOW' : 'OK'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => updateStock(product.id, product.stock_quantity + 1)}
                        className="text-xs px-2 py-1 border rounded-sm hover:bg-gray-50"
                        style={{ borderColor: '#e0e0e0' }}
                      >
                        +1
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

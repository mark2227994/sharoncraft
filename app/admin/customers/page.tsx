'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  whatsapp: string;
  location: string;
  total_orders: number;
  total_spent: number;
  created_at: string;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  async function fetchCustomers() {
    setLoading(true);
    try {
      let query = supabase.from('customers').select('*').order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching customers:', error);
        return;
      }

      setCustomers(data || []);
    } finally {
      setLoading(false);
    }
  }

  async function deleteCustomer(id: string) {
    if (!confirm('Delete this customer?')) return;

    const { error } = await supabase.from('customers').delete().eq('id', id);

    if (!error) {
      setCustomers(customers.filter((c) => c.id !== id));
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-medium">Customers</h2>
        <p className="text-xs text-gray-500 mt-1">{customers.length} total</p>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search by name, email, or phone..."
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setTimeout(() => fetchCustomers(), 300);
        }}
        className="text-xs px-3 py-2 border w-full"
        style={{ borderColor: '#e0e0e0' }}
      />

      {/* Customers Table */}
      {loading ? (
        <div className="text-xs text-gray-500">Loading...</div>
      ) : customers.length === 0 ? (
        <div className="text-xs text-gray-500">No customers found</div>
      ) : (
        <div className="border overflow-x-auto" style={{ borderColor: '#f0f0f0' }}>
          <table className="w-full text-xs">
            <thead>
              <tr style={{ backgroundColor: '#fafafa', borderBottom: '1px solid #f0f0f0' }}>
                <th className="px-4 py-3 text-left font-medium">Name</th>
                <th className="px-4 py-3 text-left font-medium">Email</th>
                <th className="px-4 py-3 text-left font-medium">Phone</th>
                <th className="px-4 py-3 text-left font-medium">Location</th>
                <th className="px-4 py-3 text-left font-medium">Orders</th>
                <th className="px-4 py-3 text-left font-medium">Total Spent</th>
                <th className="px-4 py-3 text-left font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr
                  key={customer.id}
                  style={{ borderBottom: '1px solid #f0f0f0' }}
                  className="hover:bg-gray-50"
                >
                  <td className="px-4 py-3">{customer.name}</td>
                  <td className="px-4 py-3 text-gray-600">{customer.email || '-'}</td>
                  <td className="px-4 py-3">{customer.phone || '-'}</td>
                  <td className="px-4 py-3 text-gray-600">{customer.location || '-'}</td>
                  <td className="px-4 py-3">{customer.total_orders}</td>
                  <td className="px-4 py-3">KES {customer.total_spent}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => deleteCustomer(customer.id)}
                      className="text-xs hover:underline"
                      style={{ color: '#c33' }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium mb-4">Welcome to Admin Dashboard</h2>
        <p className="text-sm text-gray-600">Dashboard is coming soon. Use the navigation menu to manage products, orders, and more.</p>
      </div>

      {/* Placeholder Stats */}
      <div className="grid grid-cols-4 gap-4">
        {['Today\'s Revenue', 'New Orders', 'Low Stock', 'Pending Orders'].map((label) => (
          <div
            key={label}
            className="bg-white border p-4 rounded-sm"
            style={{ borderColor: '#f0f0f0' }}
          >
            <p className="text-xs uppercase tracking-wider mb-2" style={{ letterSpacing: '2px', color: '#999' }}>
              {label}
            </p>
            <p className="text-2xl font-light">-</p>
          </div>
        ))}
      </div>
    </div>
  );
}

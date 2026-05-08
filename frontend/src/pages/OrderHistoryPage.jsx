import { useState, useEffect } from 'react';
import { getOrders } from '../api/orders';
import EmptyState from '../components/EmptyState';

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getOrders()
      .then(res => {
        setOrders(res.data.results || res.data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.response?.data?.detail || 'Failed to load orders.');
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="text-center py-8">Loading orders...</p>;

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Order History</h1>
        <div className="bg-red-50 p-6 rounded-md text-red-700">
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="mt-2 text-indigo-600 hover:underline">
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Order History</h1>
      {orders.length === 0 ? (
        <EmptyState
          title="No orders yet"
          message="Start shopping and come back to see your orders."
          actionText="Browse products"
          actionLink="/"
        />
      ) : (
        <div className="space-y-6">
          {orders.map(order => (
            <div key={order.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between mb-4">
                <span className="text-lg font-semibold">Order #{order.id}</span>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                  order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>{order.status}</span>
              </div>
              <p className="text-sm text-gray-500 mb-4">Placed on {new Date(order.created_at).toLocaleDateString()}</p>
              <div className="space-y-2">
                {order.items.map(item => (
                  <div key={item.id} className="flex justify-between border-b py-2">
                    <div className="flex items-center gap-3">
                      {item.image && <img src={item.image} alt={item.product_title} className="w-10 h-10 object-cover rounded" />}
                      <span>{item.product_title} x {item.quantity}</span>
                    </div>
                    <span>ZMW {item.price * item.quantity}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between font-bold mt-4">
                <span>Total</span>
                <span>ZMW {order.total_price}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

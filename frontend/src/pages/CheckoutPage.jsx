import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createOrder } from '../api/orders';
import { fetchCart } from '../store/cartSlice';
import toast from 'react-hot-toast';

export default function CheckoutPage() {
  const { items } = useSelector(state => state.cart);
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const handlePlaceOrder = async () => {
    setIsLoading(true);
    try {
      await createOrder({ shipping_address: address, phone });
      toast.success('Order placed successfully!');
      dispatch(fetchCart()); // refresh cart (should be empty)
      navigate('/orders');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to place order');
    } finally {
      setIsLoading(false);
    }
  };

  if (items.length === 0) {
    return <div className="max-w-2xl mx-auto px-4 py-8"><p>Your cart is empty. Add items first.</p></div>;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
        {items.map(item => (
          <div key={item.id} className="flex justify-between border-b py-2">
            <div>
              <span className="font-medium">{item.product.title}</span>
              <span className="text-gray-600 ml-2">x {item.quantity}</span>
            </div>
            <span>ZMW {item.product.price * item.quantity}</span>
          </div>
        ))}
        <div className="flex justify-between font-bold text-lg mt-4">
          <span>Total</span>
          <span>ZMW {total}</span>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mt-6 space-y-4">
        <h2 className="text-xl font-semibold">Shipping Details</h2>
        <textarea
          placeholder="Delivery address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="w-full border rounded px-3 py-2"
          rows={3}
        />
        <input
          type="tel"
          placeholder="Phone number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full border rounded px-3 py-2"
        />
        <button
          onClick={handlePlaceOrder}
          disabled={isLoading}
          className="w-full bg-indigo-600 text-white py-3 rounded-md hover:bg-indigo-700 disabled:opacity-50"
        >
          {isLoading ? 'Placing Order...' : 'Place Order'}
        </button>
      </div>
    </div>
  );
}

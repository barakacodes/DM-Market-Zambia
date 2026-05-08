import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchWishlist, toggleWishlist } from '../store/wishlistSlice';
import { Link } from 'react-router-dom';
import { FaTrash } from 'react-icons/fa';
import EmptyState from '../components/EmptyState';

export default function WishlistPage() {
  const dispatch = useDispatch();
  const { items, loading } = useSelector(state => state.wishlist);

  useEffect(() => {
    dispatch(fetchWishlist());
  }, [dispatch]);

  const handleRemove = (productId) => {
    dispatch(toggleWishlist(productId));
  };

  if (loading) return <p className="text-center py-8">Loading wishlist...</p>;

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">My Wishlist</h1>
        <EmptyState
          title="Your wishlist is empty"
          message="Save items you love for later."
          actionText="Discover products"
          actionLink="/"
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Wishlist</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {items.map(item => (
          <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden relative">
            <button
              onClick={() => handleRemove(item.product.id)}
              className="absolute top-2 right-2 p-1 bg-white rounded-full shadow hover:bg-gray-100"
            >
              <FaTrash color="#ef4444" size={16} />
            </button>
            <Link to={`/products/${item.product.slug}`}>
              <img
                src={item.product.primary_image || 'https://via.placeholder.com/300'}
                alt={item.product.title}
                className="w-full h-48 object-cover"
              />
            </Link>
            <div className="p-4">
              <h3 className="font-semibold text-lg truncate">{item.product.title}</h3>
              <p className="text-gray-600">ZMW {item.product.price}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

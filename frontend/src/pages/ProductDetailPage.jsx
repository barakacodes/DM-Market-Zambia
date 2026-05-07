import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getProduct } from '../api/products';
import { useDispatch } from 'react-redux';
import { addItemToCart } from '../store/cartSlice';
import toast from 'react-hot-toast';

export default function ProductDetailPage() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const dispatch = useDispatch();

  useEffect(() => {
    getProduct(slug).then(res => setProduct(res.data));
  }, [slug]);

  const handleAddToCart = async () => {
    try {
      await dispatch(addItemToCart({ productId: product.id, quantity })).unwrap();
      toast.success('Added to cart!');
    } catch (err) {
      toast.error('Could not add to cart');
    }
  };

  if (!product) return <p>Loading...</p>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          {product.images?.[0]?.image ? (
            <img src={product.images[0].image} alt={product.title} className="w-full rounded-lg" />
          ) : (
            <img src="https://via.placeholder.com/500" alt="placeholder" className="w-full rounded-lg" />
          )}
        </div>
        <div>
          <h1 className="text-3xl font-bold mb-4">{product.title}</h1>
          <p className="text-2xl text-indigo-600 mb-4">ZMW {product.price}</p>
          <p className="text-gray-700 mb-6">{product.description}</p>
          <p className="text-sm text-gray-500 mb-2">Seller: {product.seller_name}</p>
          <p className="text-sm text-gray-500 mb-4">Category: {product.category_name}</p>
          <div className="flex items-center gap-4 mb-6">
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value))}
              className="border rounded-md w-20 px-2 py-1"
            />
            <button
              onClick={handleAddToCart}
              className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700"
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

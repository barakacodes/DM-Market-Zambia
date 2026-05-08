import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getProduct, getProductReviews, createReview } from '../api/products';
import { useDispatch, useSelector } from 'react-redux';
import { addItemToCart } from '../store/cartSlice';
import { fetchWishlist } from '../store/wishlistSlice';
import toast from 'react-hot-toast';
import StarRating from '../components/StarRating';
import HeartButton from '../components/HeartButton';
import { FaStar, FaTimes, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { getMediaUrl } from '../utils/mediaUrl';

export default function ProductDetailPage() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [mainImage, setMainImage] = useState(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const dispatch = useDispatch();
  const { user, token, retailer } = useSelector(state => state.auth);
  const isRetailer = retailer?.is_approved || user?.role === 'wholesaler';

  useEffect(() => {
    getProduct(slug).then(res => {
      setProduct(res.data);
      if (res.data.images?.length > 0) {
        setMainImage(getMediaUrl(res.data.images[0].image));
      }
    });
    getProductReviews(slug).then(res => setReviews(res.data.results || res.data));
    if (token) dispatch(fetchWishlist());
  }, [slug, token, dispatch]);

  const handleAddToCart = async () => {
    try {
      await dispatch(addItemToCart({ productId: product.id, quantity })).unwrap();
      toast.success('Added to cart!');
    } catch (err) {
      toast.error('Could not add to cart');
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    try {
      await createReview({ product: product.id, rating: newRating, comment: newComment });
      toast.success('Review submitted!');
      setShowReviewForm(false);
      const res = await getProductReviews(slug);
      setReviews(res.data.results || res.data);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to submit review');
    }
  };

  const openLightbox = (index) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => setLightboxOpen(false);
  const nextImage = () => {
    if (product?.images) setLightboxIndex((lightboxIndex + 1) % product.images.length);
  };
  const prevImage = () => {
    if (product?.images) setLightboxIndex((lightboxIndex - 1 + product.images.length) % product.images.length);
  };

  if (!product) return <p className="text-center py-8">Loading...</p>;

  const galleryImages = product.images || [];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <div className="relative">
            <img
              src={mainImage || 'https://via.placeholder.com/500'}
              alt={product.title}
              className="w-full rounded-lg cursor-pointer"
              loading="lazy"
              onClick={() => galleryImages.length > 1 && openLightbox(galleryImages.findIndex(img => getMediaUrl(img.image) === mainImage))}
            />
          </div>
          {galleryImages.length > 1 && (
            <div className="flex gap-2 mt-2 overflow-x-auto">
              {galleryImages.map((img, idx) => (
                <img
                  key={img.id}
                  src={getMediaUrl(img.image)}
                  alt={`${product.title} ${idx+1}`}
                  className={`w-16 h-16 object-cover rounded cursor-pointer border-2 ${mainImage === getMediaUrl(img.image) ? 'border-indigo-600' : 'border-gray-300'}`}
                  loading="lazy"
                  onClick={() => setMainImage(getMediaUrl(img.image))}
                />
              ))}
            </div>
          )}
          {lightboxOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
              <button onClick={closeLightbox} className="absolute top-4 right-4 text-white text-3xl"><FaTimes /></button>
              {galleryImages.length > 1 && (
                <>
                  <button onClick={prevImage} className="absolute left-4 text-white text-3xl"><FaChevronLeft /></button>
                  <button onClick={nextImage} className="absolute right-4 text-white text-3xl"><FaChevronRight /></button>
                </>
              )}
              <img
                src={galleryImages[lightboxIndex] ? getMediaUrl(galleryImages[lightboxIndex].image) : mainImage}
                alt="Product"
                className="max-w-full max-h-full"
              />
            </div>
          )}
        </div>
        <div>
          <div className="flex justify-between items-start">
            <h1 className="text-3xl font-bold mb-4">{product.title}</h1>
            {token && <HeartButton productId={product.id} size={24} />}
          </div>
          <StarRating rating={product.avg_rating || 0} reviewCount={product.review_count} size={20} />
          
          {isRetailer && product.wholesale_price ? (
            <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-2xl text-green-700 font-bold">Wholesale: ZMW {product.wholesale_price}</p>
              {product.moq > 1 && <p className="text-sm text-green-600">Minimum order: {product.moq} units</p>}
            </div>
          ) : (
            <p className="text-2xl text-indigo-600 mb-4">ZMW {product.price}</p>
          )}
          
          <p className="text-gray-700 mb-6 mt-4">{product.description}</p>
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

      {/* Reviews Section */}
      <div className="mt-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Customer Reviews</h2>
          {token && !showReviewForm && (
            <button onClick={() => setShowReviewForm(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
              Write a Review
            </button>
          )}
        </div>
        {showReviewForm && (
          <form onSubmit={handleSubmitReview} className="bg-white p-6 rounded-lg shadow-md mb-8">
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Rating</label>
              <div className="flex gap-1">
                {[1,2,3,4,5].map(rating => (
                  <button type="button" key={rating} onClick={() => setNewRating(rating)} className="text-2xl focus:outline-none">
                    <FaStar color={rating <= newRating ? '#faca15' : '#d1d5db'} />
                  </button>
                ))}
              </div>
            </div>
            <textarea className="w-full border rounded px-3 py-2 mb-4" rows="4" placeholder="Write your comment..." value={newComment} onChange={(e) => setNewComment(e.target.value)} required />
            <div className="flex gap-2">
              <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">Submit Review</button>
              <button type="button" onClick={() => setShowReviewForm(false)} className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400">Cancel</button>
            </div>
          </form>
        )}
        {reviews.length === 0 ? (
          <p>No reviews yet. Be the first to review!</p>
        ) : (
          <div className="space-y-4">
            {reviews.map(review => (
              <div key={review.id} className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">{review.user_email}</span>
                  <span className="text-sm text-gray-500">{new Date(review.created_at).toLocaleDateString()}</span>
                </div>
                <StarRating rating={review.rating} size={16} />
                <p className="mt-2 text-gray-700">{review.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

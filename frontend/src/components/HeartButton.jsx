import { useDispatch, useSelector } from 'react-redux';
import { toggleWishlist } from '../store/wishlistSlice';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

export default function HeartButton({ productId, size = 20 }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items } = useSelector(state => state.wishlist);
  const { token } = useSelector(state => state.auth);
  const isLiked = items.some(item => item.product?.id === productId);

  const handleToggle = (e) => {
    e.preventDefault(); // prevent link navigation if inside a Link
    e.stopPropagation();
    if (!token) {
      navigate('/login');
      return;
    }
    dispatch(toggleWishlist(productId));
  };

  return (
    <button onClick={handleToggle} className="focus:outline-none">
      {isLiked ? <FaHeart color="#ef4444" size={size} /> : <FaRegHeart color="#6b7280" size={size} />}
    </button>
  );
}

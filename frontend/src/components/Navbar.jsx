import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/authSlice';
import { useEffect } from 'react';
import { fetchCart } from '../store/cartSlice';
import { fetchWishlist } from '../store/wishlistSlice';
import { FiShoppingCart, FiUser, FiLogOut, FiHeart, FiBriefcase, FiSettings } from 'react-icons/fi';

export default function Navbar() {
  const { user, token, retailer } = useSelector(state => state.auth);
  const { items } = useSelector(state => state.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      dispatch(fetchCart());
      dispatch(fetchWishlist());
    }
  }, [token, dispatch]);

  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold text-indigo-600">DM Market</Link>
        <div className="flex items-center gap-4">
          <Link to="/wishlist" className="relative">
            <FiHeart className="text-2xl" />
          </Link>
          <Link to="/cart" className="relative">
            <FiShoppingCart className="text-2xl" />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>
          {user && user.role === 'buyer' && !retailer?.is_approved && (
            <Link to="/apply" className="text-sm font-medium text-green-600 flex items-center gap-1">
              <FiBriefcase /> Apply as Retailer
            </Link>
          )}
          {user ? (
            <>
              <Link to="/profile" className="text-sm font-medium flex items-center gap-1"><FiSettings className="inline" /></Link>
              <Link to="/dashboard" className="text-sm font-medium"><FiUser className="inline mr-1" />{user.email}</Link>
              <button onClick={handleLogout} className="text-sm text-red-600"><FiLogOut className="inline" /></button>
            </>
          ) : (
            <Link to="/login" className="text-sm font-medium text-indigo-600">Sign in</Link>
          )}
        </div>
      </div>
    </nav>
  );
}

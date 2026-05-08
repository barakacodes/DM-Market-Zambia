import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getProducts, getCategories } from '../api/products';
import StarRating from '../components/StarRating';
import HeartButton from '../components/HeartButton';
import { useDispatch, useSelector } from 'react-redux';
import { fetchWishlist } from '../store/wishlistSlice';
import { FiSearch, FiX } from 'react-icons/fi';
import debounce from 'lodash.debounce';

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const dispatch = useDispatch();
  const { user, retailer } = useSelector(state => state.auth);
  const isRetailer = retailer?.is_approved || user?.role === 'wholesaler';

  useEffect(() => {
    getCategories().then(res => {
      const data = Array.isArray(res.data) ? res.data : (res.data.results || []);
      setCategories(data);
    });
    dispatch(fetchWishlist());
  }, [dispatch]);

  const debouncedSearch = useMemo(
    () => debounce((search, cat, pageNum) => {
      setLoading(true);
      const params = { page: pageNum };
      if (search) params.search = search;
      if (cat) params.category__slug = cat;
      getProducts(params)
        .then(res => {
          const productsData = res.data.results || res.data;
          setProducts(productsData);
          setTotalPages(Math.ceil((res.data.count || productsData.length) / 12));
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }, 300),
    []
  );

  useEffect(() => {
    debouncedSearch(searchTerm, category, page);
    return () => debouncedSearch.cancel();
  }, [searchTerm, category, page, debouncedSearch]);

  const handleSearchChange = (e) => { setSearchTerm(e.target.value); setPage(1); };
  const clearSearch = () => { setSearchTerm(''); setPage(1); };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-grow">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search for products..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-10 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {searchTerm && (
            <button onClick={clearSearch} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <FiX />
            </button>
          )}
        </div>
        <select
          value={category}
          onChange={(e) => { setCategory(e.target.value); setPage(1); }}
          className="border rounded-md px-4 py-2 focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Categories</option>
          {categories.map(cat => (
            <option key={cat.slug} value={cat.slug}>{cat.name}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
              <div className="w-full h-48 bg-gray-300" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-gray-300 rounded w-3/4" />
                <div className="h-4 bg-gray-300 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-xl text-gray-500 mb-2">No products found</p>
          {searchTerm && <p className="text-gray-400">We couldn't find anything for "{searchTerm}". Try a different term or browse categories.</p>}
          <button onClick={clearSearch} className="mt-4 text-indigo-600 hover:underline">Clear search</button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map(product => (
              <Link to={`/products/${product.slug}`} key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition relative">
                <img
                  src={product.primary_image || 'https://via.placeholder.com/300'}
                  alt={product.title}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-2 right-2">
                  <HeartButton productId={product.id} size={20} />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg truncate">{product.title}</h3>
                  <p className="text-gray-600">ZMW {product.price}</p>
                  {isRetailer && product.wholesale_price && (
                    <p className="text-sm text-green-700 font-medium">
                      Wholesale: ZMW {product.wholesale_price} {product.moq > 1 && `(min. ${product.moq})`}
                    </p>
                  )}
                  <StarRating rating={product.avg_rating || 0} reviewCount={product.review_count} size={14} />
                  <span className="text-sm text-gray-500">{product.condition}</span>
                </div>
              </Link>
            ))}
          </div>
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 border rounded-md disabled:opacity-50">Previous</button>
              <span className="px-3 py-1">Page {page} of {totalPages}</span>
              <button onClick={() => setPage(p => p + 1)} disabled={page === totalPages} className="px-3 py-1 border rounded-md disabled:opacity-50">Next</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

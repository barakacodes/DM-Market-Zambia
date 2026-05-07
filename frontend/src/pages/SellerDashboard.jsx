import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function SellerDashboard() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', price: '', stock: '', condition: 'new', category: '', images: []
  });
  const [categories, setCategories] = useState([]);

  const fetchSellerProducts = () => {
    setLoading(true);
    api.get('/products/seller/').then(res => {
      setProducts(res.data.results || res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchSellerProducts();
    api.get('/products/categories/').then(res => setCategories(res.data));
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    setForm({ ...form, images: e.target.files });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', form.title);
    formData.append('description', form.description);
    formData.append('price', form.price);
    formData.append('stock', form.stock);
    formData.append('condition', form.condition);
    formData.append('category', form.category);
    for (let i = 0; i < form.images.length; i++) {
      formData.append('images', form.images[i]);
    }
    try {
      await api.post('/products/seller/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Product added!');
      setShowForm(false);
      fetchSellerProducts();
    } catch (err) {
      toast.error('Failed to add product');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Seller Dashboard</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
        >
          {showForm ? 'Cancel' : 'Add Product'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md mb-8 space-y-4">
          <input name="title" placeholder="Title" value={form.title} onChange={handleChange} required className="w-full border px-3 py-2 rounded" />
          <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} className="w-full border px-3 py-2 rounded" />
          <div className="grid grid-cols-2 gap-4">
            <input name="price" type="number" placeholder="Price" value={form.price} onChange={handleChange} required className="border px-3 py-2 rounded" />
            <input name="stock" type="number" placeholder="Stock" value={form.stock} onChange={handleChange} required className="border px-3 py-2 rounded" />
          </div>
          <select name="condition" value={form.condition} onChange={handleChange} className="w-full border px-3 py-2 rounded">
            <option value="new">New</option>
            <option value="used">Used</option>
          </select>
          <select name="category" value={form.category} onChange={handleChange} required className="w-full border px-3 py-2 rounded">
            <option value="">Select Category</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          <input type="file" multiple onChange={handleImageChange} className="w-full" />
          <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700">Create Product</button>
        </form>
      )}

      {loading ? (
        <p>Loading products...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {products.map(product => (
            <div key={product.id} className="bg-white rounded-lg shadow-md p-4 flex justify-between">
              <div>
                <h3 className="font-semibold">{product.title}</h3>
                <p className="text-gray-600">ZMW {product.price}</p>
                <p className="text-sm">Stock: {product.stock}</p>
              </div>
              <div className="flex items-center">
                <Link to={`/products/${product.slug}`} className="text-indigo-600 hover:underline">View</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

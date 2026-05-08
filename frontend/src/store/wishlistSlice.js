import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { addToWishlist, removeFromWishlist } from '../api/products';
import api from '../api/axios';

export const fetchWishlist = createAsyncThunk('wishlist/fetch', async () => {
  const response = await api.get('/products/wishlist/');
  return response.data.results || response.data;
});

export const toggleWishlist = createAsyncThunk('wishlist/toggle', async (productId, { getState }) => {
  const { wishlist } = getState();
  const exists = wishlist.items.find(item => item.product.id === productId);
  if (exists) {
    await removeFromWishlist(productId);
    return { productId, action: 'remove' };
  } else {
    const response = await addToWishlist(productId);
    return { item: response.data, action: 'add' };
  }
});

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: { items: [], loading: false },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlist.pending, (state) => { state.loading = true; })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.loading = false;
        // Ensure items is array of {id, product: {...}, added_at}
        state.items = action.payload;
      })
      .addCase(fetchWishlist.rejected, (state) => { state.loading = false; })
      .addCase(toggleWishlist.fulfilled, (state, action) => {
        if (action.payload.action === 'add') {
          state.items.push(action.payload.item);
        } else {
          state.items = state.items.filter(item => item.product?.id !== action.payload.productId);
        }
      });
  },
});

export default wishlistSlice.reducer;

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getCart, addToCart, updateCartItem, removeCartItem } from '../api/products';

export const fetchCart = createAsyncThunk('cart/fetch', async () => {
  const response = await getCart();
  return response.data;
});

export const addItemToCart = createAsyncThunk('cart/addItem', async ({ productId, quantity }) => {
  const response = await addToCart(productId, quantity);
  return response.data;
});

export const updateItemQuantity = createAsyncThunk('cart/updateQuantity', async ({ itemId, quantity }) => {
  const response = await updateCartItem(itemId, quantity);
  return response.data;
});

export const deleteItem = createAsyncThunk('cart/deleteItem', async (itemId) => {
  await removeCartItem(itemId);
  return itemId;
});

const cartSlice = createSlice({
  name: 'cart',
  initialState: { items: [], isLoading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => { state.isLoading = true; })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.items;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      .addCase(addItemToCart.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateItemQuantity.fulfilled, (state, action) => {
        const index = state.items.findIndex(item => item.id === action.payload.id);
        if (index !== -1) state.items[index] = action.payload;
      })
      .addCase(deleteItem.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item.id !== action.payload);
      });
  },
});

export default cartSlice.reducer;

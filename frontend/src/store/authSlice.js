import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { loginUser, registerUser, fetchUser } from '../api/auth';
import { getRetailerStatus } from '../api/wholesale';

export const login = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const response = await loginUser(credentials);
    const { access, refresh } = response.data;
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
    const userResponse = await fetchUser();
    let retailer = null;
    try {
      const retailerRes = await getRetailerStatus();
      retailer = retailerRes.data;
    } catch {}
    return { user: userResponse.data, access, refresh, retailer };
  } catch (err) {
    return rejectWithValue(err.response?.data || 'Login failed');
  }
});

export const register = createAsyncThunk('auth/register', async (data, { rejectWithValue }) => {
  try {
    await registerUser(data);
    const response = await loginUser({ email: data.email, password: data.password });
    const { access, refresh } = response.data;
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
    const userResponse = await fetchUser();
    return { user: userResponse.data, access, refresh, retailer: null };
  } catch (err) {
    return rejectWithValue(err.response?.data || 'Registration failed');
  }
});

export const loadUser = createAsyncThunk('auth/loadUser', async (_, { rejectWithValue }) => {
  try {
    const userResponse = await fetchUser();
    let retailer = null;
    try {
      const retailerRes = await getRetailerStatus();
      retailer = retailerRes.data;
    } catch {}
    return { user: userResponse.data, retailer };
  } catch (err) {
    return rejectWithValue(err.response?.data || 'Not authenticated');
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: localStorage.getItem('access_token') || null,
    isLoading: false,
    error: null,
    retailer: null, // { is_approved, ... }
  },
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      state.retailer = null;
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.access;
        state.retailer = action.payload.retailer;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(register.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.access;
        state.retailer = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(loadUser.pending, (state) => { state.isLoading = true; })
      .addCase(loadUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.retailer = action.payload.retailer;
      })
      .addCase(loadUser.rejected, (state) => {
        state.isLoading = false;
        state.token = null;
        state.user = null;
        state.retailer = null;
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;

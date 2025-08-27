// Redux/Slices/AuthSlice.js
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import toast from 'react-hot-toast';

// Configure API base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

// Create axios instance
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 10000,
});

// Initial state
const initialState = {
  isLoggedIn: JSON.parse(localStorage.getItem('isLoggedIn')) || false,
  data: JSON.parse(localStorage.getItem('userData')) || {},
  loading: false,
  error: null,
};

// Create Account Action with better error handling
export const createAccount = createAsyncThunk(
  'auth/signup',
  async (formData, { rejectWithValue }) => {
    try {
      console.log('Making registration request...');
      
      // Debug FormData
      for (let [key, value] of formData.entries()) {
        console.log(`FormData - ${key}:`, value);
      }

      const response = await axiosInstance.post('/user/register', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000, // 30 second timeout
        // Add these for debugging
        validateStatus: function (status) {
          return status >= 200 && status < 300; // Default
        },
      });

      console.log('Raw axios response:', response);
      console.log('Response data:', response.data);
      console.log('Response status:', response.status);

      // Check if response is valid
      if (!response.data) {
        throw new Error('No data received from server');
      }

      if (!response.data.success) {
        throw new Error(response.data.message || 'Registration failed');
      }

      toast.success(response.data.message || 'Account created successfully!');
      return response.data;

    } catch (error) {
      console.error('Registration error in slice:', error);
      
      // Handle different types of errors
      let errorMessage = 'Registration failed. Please try again.';
      
      if (error.response) {
        // Server responded with error status
        console.error('Error response:', error.response);
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        
        errorMessage = error.response.data?.message || 
                      `Server error: ${error.response.status}`;
      } else if (error.request) {
        // Request was made but no response
        console.error('No response received:', error.request);
        errorMessage = 'No response from server. Please check your connection.';
      } else {
        // Something else happened
        console.error('Request setup error:', error.message);
        errorMessage = error.message;
      }

      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

// Login Action
export const login = createAsyncThunk(
  'auth/login',
  async (loginData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/user/login', loginData);
      toast.success(response.data.message || 'Login successful!');
      return response.data;
    } catch (error) {
      const errorMessage = 
        error.response?.data?.message || 
        'Login failed. Please try again.';
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

// Logout Action
export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/user/logout');
      toast.success(response.data.message || 'Logged out successfully!');
      return response.data;
    } catch (error) {
      const errorMessage = 
        error.response?.data?.message || 
        'Logout failed. Please try again.';
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

export const updateProfile = createAsyncThunk("/user/update/profile", async (data) => {
    try {
        const res = axiosInstance.put(`user/update/${data[0]}`, data[1]);
        toast.promise(res, {
            loading: "Wait! profile update in progress...",
            success: (data) => {
                return data?.data?.message;
            },
            error: "Failed to update profile"
        });
        return (await res).data;
    } catch(error) {
        toast.error(error?.response?.data?.message);
    }
})

// Get User Profile Action
export const getUserData = createAsyncThunk(
  'auth/getUserProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/user/me');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user data');
    }
  }
);

// Auth Slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Clear error
    clearError: (state) => {
      state.error = null;
    },
    // Manual logout (for client-side logout)
    manualLogout: (state) => {
      state.isLoggedIn = false;
      state.data = {};
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('userData');
    },
  },
  extraReducers: (builder) => {
    builder
      // Register User
      .addCase(createAccount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAccount.fulfilled, (state, action) => {
        state.loading = false;
        state.isLoggedIn = true;
        state.data = action.payload.user;
        state.error = null;
        
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userData', JSON.stringify(action.payload.user));
      })
      .addCase(createAccount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Login User - Fixed to use 'login' instead of 'loginUser'
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isLoggedIn = true;
        state.data = action.payload.user;
        state.error = null;
        
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userData', JSON.stringify(action.payload.user));
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Logout User - Fixed to use 'logout' instead of 'logoutUser'
      .addCase(logout.pending, (state) => {
        state.loading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.loading = false;
        state.isLoggedIn = false;
        state.data = {};
        state.error = null;
        
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userData');
      })
      .addCase(logout.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update Profile
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload?.user || state.data;
        localStorage.setItem('userData', JSON.stringify(action.payload?.user || state.data));
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get User Profile - Fixed to use 'getUserData' instead of 'getUserProfile'
      .addCase(getUserData.pending, (state) => {
        state.loading = true;
      })
      .addCase(getUserData.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.user;
        state.error = null;
        
        localStorage.setItem('userData', JSON.stringify(action.payload.user));
      })
      .addCase(getUserData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, manualLogout } = authSlice.actions;
export default authSlice.reducer;
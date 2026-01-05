// frontend/src/redux/slices/userSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as userService from "../../services/userService";

export const getUserStats = createAsyncThunk(
  "user/getStats",
  async (_, { rejectWithValue }) => {
    try {
      const response = await userService.getUserStats();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateProfile = createAsyncThunk(
  "user/updateProfile",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await userService.updateProfile(userData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const initialState = {
  stats: null,
  recentActivity: null,
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    clearUserData: (state) => {
      state.stats = null;
      state.recentActivity = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getUserStats.pending, (state) => {
        state.loading = true;
      })
      .addCase(getUserStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload.stats;
        state.recentActivity = action.payload.recentActivity;
      })
      .addCase(getUserStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to load stats";
      })
      .addCase(updateProfile.fulfilled, (state) => {
        state.loading = false;
      });
  },
});

export const { clearUserData } = userSlice.actions;
export default userSlice.reducer;
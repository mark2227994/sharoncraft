import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  products: [],
  categories: [],
  featuredProducts: [],
  newArrivals: [],
  isLoading: false,
  error: null,
  filters: {
    category: null,
    priceRange: null,
    searchQuery: '',
  },
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
  },
};

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    fetchProductsStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchProductsSuccess: (state, action) => {
      state.isLoading = false;
      state.products = action.payload.products;
      state.pagination = action.payload.pagination;
    },
    fetchProductsFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    setCategories: (state, action) => {
      state.categories = action.payload;
    },
    setFeaturedProducts: (state, action) => {
      state.featuredProducts = action.payload;
    },
    setNewArrivals: (state, action) => {
      state.newArrivals = action.payload;
    },
    setFilter: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        category: null,
        priceRange: null,
        searchQuery: '',
      };
    },
    setPage: (state, action) => {
      state.pagination.page = action.payload;
    },
  },
});

export const {
  fetchProductsStart,
  fetchProductsSuccess,
  fetchProductsFailure,
  setCategories,
  setFeaturedProducts,
  setNewArrivals,
  setFilter,
  clearFilters,
  setPage,
} = productSlice.actions;

export default productSlice.reducer;

// Selectors
export const selectProducts = (state) => state.products.products;
export const selectCategories = (state) => state.products.categories;
export const selectFeaturedProducts = (state) => state.products.featuredProducts;
export const selectNewArrivals = (state) => state.products.newArrivals;
export const selectFilters = (state) => state.products.filters;
export const selectPagination = (state) => state.products.pagination;
export const selectIsLoading = (state) => state.products.isLoading;

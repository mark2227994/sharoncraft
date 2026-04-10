import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  ids: [],
  activeTab: "home",
  selectedProductId: null,
};

const favoritesSlice = createSlice({
  name: "favorites",
  initialState,
  reducers: {
    hydrateFavorites(state, action) {
      state.ids = action.payload.ids;
    },
    toggleFavorite(state, action) {
      const productId = action.payload;
      const isSaved = state.ids.includes(productId);

      if (isSaved) {
        state.ids = state.ids.filter((id) => id !== productId);
        return;
      }

      state.ids.push(productId);
    },
    setActiveTab(state, action) {
      state.activeTab = action.payload;
    },
    openProduct(state, action) {
      state.selectedProductId = action.payload;
      state.activeTab = "product";
    },
  },
});

export const { hydrateFavorites, openProduct, setActiveTab, toggleFavorite } =
  favoritesSlice.actions;

export default favoritesSlice.reducer;

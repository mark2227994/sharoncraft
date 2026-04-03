import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  orders: [],
  currentOrder: null,
  isLoading: false,
  error: null,
  orderStatus: {
    new: 'Order received',
    confirmed: 'Order confirmed',
    paid: 'Payment received',
    delivered: 'Order delivered',
    cancelled: 'Order cancelled',
  },
};

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    fetchOrdersStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchOrdersSuccess: (state, action) => {
      state.isLoading = false;
      state.orders = action.payload;
    },
    fetchOrdersFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    createOrderStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    createOrderSuccess: (state, action) => {
      state.isLoading = false;
      state.currentOrder = action.payload;
      state.orders.unshift(action.payload);
    },
    createOrderFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    updateOrderStatus: (state, action) => {
      const order = state.orders.find(o => o.id === action.payload.orderId);
      if (order) {
        order.status = action.payload.status;
      }
      if (state.currentOrder && state.currentOrder.id === action.payload.orderId) {
        state.currentOrder.status = action.payload.status;
      }
    },
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
    },
  },
});

export const {
  fetchOrdersStart,
  fetchOrdersSuccess,
  fetchOrdersFailure,
  createOrderStart,
  createOrderSuccess,
  createOrderFailure,
  updateOrderStatus,
  clearCurrentOrder,
} = orderSlice.actions;

export default orderSlice.reducer;

// Selectors
export const selectOrders = (state) => state.orders.orders;
export const selectCurrentOrder = (state) => state.orders.currentOrder;
export const selectOrderStatus = (state) => state.orders.orderStatus;
export const selectIsLoading = (state) => state.orders.isLoading;

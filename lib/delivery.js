export const DELIVERY_OPTIONS = {
  home: {
    fee: 300,
    icon: "truck",
    label: "Home delivery",
    short: "Home",
    available: true,
  },
  pickup: {
    fee: 250,
    icon: "pin",
    label: "Pickup at station",
    short: "Pickup",
    available: false,
  },
};

export const DEFAULT_DELIVERY_METHOD = "home";

export function normalizeDeliveryMethod(value) {
  return value && DELIVERY_OPTIONS[value] ? value : DEFAULT_DELIVERY_METHOD;
}

export function getDeliveryFee(method) {
  const key = normalizeDeliveryMethod(method);
  return DELIVERY_OPTIONS[key].fee;
}

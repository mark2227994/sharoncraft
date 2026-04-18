export const DELIVERY_OPTIONS = {
  nairobi: {
    fee: 300,
    icon: "truck",
    label: "Nairobi Home Delivery",
    short: "Nairobi",
    available: true,
    description: "Deliver to your Nairobi address (2-3 business days)",
  },
  restOfKenya: {
    fee: 600,
    icon: "truck",
    label: "Rest of Kenya Delivery",
    short: "Rest of Kenya",
    available: true,
    description: "Deliver to any location in Kenya outside Nairobi (3-5 business days)",
  },
  pickup: {
    fee: 0,
    icon: "pin",
    label: "Pickup at Shop",
    short: "Pickup",
    available: false,
    description: "Pick up at our Nairobi shop (free)",
  },
};

export const DEFAULT_DELIVERY_METHOD = "nairobi";

export function normalizeDeliveryMethod(value) {
  return value && DELIVERY_OPTIONS[value] ? value : DEFAULT_DELIVERY_METHOD;
}

export function getDeliveryFee(method) {
  const key = normalizeDeliveryMethod(method);
  return DELIVERY_OPTIONS[key].fee;
}

/**
 * WhatsApp Message Templates for Admin Use
 * Professional, friendly, detailed messages without emojis
 * Copy and customize with specific order/customer details
 */

export const WHATSAPP_TEMPLATES = {
  // Custom Order - Initial Acknowledgment
  customOrderReceived: (customerName) => `Hello ${customerName},

Thank you for submitting your custom design request to SharonCraft. We have received all your design details and preferences.

Our team will review your request and create a personalized quote for you within 24 hours. This quote will include:
- Final design specifications
- Total project cost
- Deposit amount required (typically 50% of total)
- Production timeline

We will send you the payment link via WhatsApp as soon as the quote is ready.

If you have any questions in the meantime, please let us know.

Best regards,
Sharon`,

  // Custom Order - Quote Ready
  quoteReady: (customerName, productLink) => `Hello ${customerName},

Your custom design quote is ready! I have reviewed your request carefully and put together a personalized proposal for your piece.

Please click the link below to view your order details and deposit payment information:

${productLink}

On that page you will find:
- Your custom design specifications
- Final project cost
- Deposit amount required
- Step-by-step M-Pesa payment instructions
- Timeline for your project

Once you submit your deposit payment proof on the payment page, we will begin production immediately.

Please review and let me know if you have any questions.

Best regards,
Sharon`,

  // Deposit Payment - Submitted & Verified
  depositReceived: (customerName, orderRef) => `Hello ${customerName},

Your deposit payment for order ${orderRef} has been verified and received. Thank you!

Production on your custom piece will start immediately. Here is what happens next:

1. Our artisan will begin crafting your design
2. You will receive progress photos and updates on WhatsApp every 2-3 days
3. Once the piece is complete and you approve it, we will request the final 50% payment
4. Your finished piece will ship to you via courier with tracking

The entire process typically takes 2-3 weeks depending on complexity.

We are excited to create this special piece for you. You can expect your first progress update within 48 hours.

Thank you for choosing SharonCraft!

Best regards,
Sharon`,

  // Production Update
  productionUpdate: (customerName, progressDetails) => `Hello ${customerName},

Great news! Your custom piece is coming along beautifully. Here is your progress update:

${progressDetails}

We will have more progress photos for you in 2 days. If you see anything you would like adjusted at this stage, please let me know now so we can make changes before final completion.

Thank you for your patience.

Best regards,
Sharon`,

  // Ready for Final Approval
  readyForApproval: (customerName, orderRef) => `Hello ${customerName},

Exciting news! Your custom piece is complete and we are very happy with how it turned out.

I am attaching high-quality photos of your finished piece. Please review carefully and let me know:
- Do you approve the design and quality?
- Are you ready to proceed with the final 50% payment?

Once you approve and submit the final payment, we will prepare your piece for dispatch and provide you with tracking details.

Please take your time to review the photos and let me know your thoughts.

Best regards,
Sharon`,

  // Final Payment Due
  finalPaymentDue: (customerName, orderRef, finalAmount, paymentLink) => `Hello ${customerName},

Thank you for approving your custom piece! It looks wonderful and we cannot wait for you to receive it.

The final 50% payment is now due. Here are the details:

Order Reference: ${orderRef}
Remaining Balance: KES ${finalAmount}

Please use this link to submit your final payment proof:
${paymentLink}

Or you can pay directly via M-Pesa to 0112222572 with reference: ${orderRef}-FINAL

Once we verify your payment, we will immediately dispatch your piece via courier with full tracking details.

Best regards,
Sharon`,

  // Dispatch Notification
  dispatchNotification: (customerName, orderRef, trackingInfo) => `Hello ${customerName},

Your custom SharonCraft piece is on the way to you!

Order Reference: ${orderRef}

Shipping Details:
${trackingInfo}

You can track your package using the tracking number provided above. Typical delivery times:
- Nairobi: 2-3 business days
- Other areas: 5-7 business days

We have taken extra care in packaging to ensure your piece arrives in perfect condition. 

Thank you so much for choosing SharonCraft. We hope you absolutely love your custom creation!

Best regards,
Sharon`,

  // Delivery Confirmation & Follow-up
  deliveryConfirmed: (customerName) => `Hello ${customerName},

We hope your custom SharonCraft piece has arrived safely and that you absolutely love it!

We would be incredibly grateful if you could:
1. Share a photo of your piece (we love featuring customer photos!)
2. Send a short review of your experience with us

Your feedback helps us continue creating beautiful handmade pieces and improving our service.

Also, if you ever need another custom design or any of our ready-made pieces, you know where to find us on WhatsApp.

Thank you for choosing SharonCraft!

Best regards,
Sharon`,

  // Follow-up on Incomplete Order
  orderFollowUp: (customerName, orderRef, daysWaiting) => `Hello ${customerName},

I wanted to reach out regarding your custom order request (Reference: ${orderRef}). 

We sent you a quote and payment link ${daysWaiting} days ago, but we have not heard back from you. I wanted to make sure everything is still of interest to you.

If you have any questions about the design, pricing, or payment process, I am here to help. We can also adjust the quote if needed.

Please let me know:
- Are you ready to proceed with the deposit?
- Do you have any concerns about the design or price?
- Can I answer any questions for you?

I look forward to hearing from you.

Best regards,
Sharon`,

  // Welcome - New Customer First Contact
  welcomeNewCustomer: (customerName) => `Hello ${customerName},

Welcome to SharonCraft! Thank you for your interest in our handmade Kenyan pieces.

I am here to help you with:
- Finding the perfect piece from our collection
- Answering questions about materials, colors, and customization
- Providing quotes for custom design requests
- Guiding you through the ordering and payment process
- Tracking your order and delivery

Feel free to ask me anything about our products or services. I typically respond within a few hours.

What can I help you with today?

Best regards,
Sharon`,

  // General Inquiry Response
  inquiryResponse: (customerName, response) => `Hello ${customerName},

Thank you for your question. Here is the information you requested:

${response}

Please let me know if you need any additional details or have other questions.

Best regards,
Sharon`,

  // Delivery Issue Resolution
  deliveryIssueResolution: (customerName, solution) => `Hello ${customerName},

Thank you for bringing this to our attention. I sincerely apologize for the inconvenience.

Here is how we will resolve this:

${solution}

We value your business and your satisfaction is important to us. Please let me know if this resolves the issue or if you need further assistance.

Best regards,
Sharon`,

  // Product Recommendation
  productRecommendation: (customerName, productName, reason) => `Hello ${customerName},

Based on what you told me about your preferences, I think you would love this piece:

Product: ${productName}
Why I recommend it: ${reason}

You can view it on our website or I can send you more details and photos. 

Would you like to know more about this piece?

Best regards,
Sharon`,

  // Seasonal/Promotional Offer
  promotionalOffer: (customerName, offer) => `Hello ${customerName},

I wanted to share a special opportunity with you as a valued SharonCraft customer.

${offer}

This offer is only available for a limited time. If you are interested or would like to know more details, please let me know right away.

Best regards,
Sharon`,
};

// Helper function to create custom templates
export function createCustomTemplate(baseTemplate, variables) {
  let message = baseTemplate;
  Object.entries(variables).forEach(([key, value]) => {
    message = message.replace(new RegExp(`\\$\\{${key}\\}`, 'g'), value);
  });
  return message;
}

// Get template by key
export function getTemplate(templateKey) {
  return WHATSAPP_TEMPLATES[templateKey] || null;
}

// List all available templates
export function listAvailableTemplates() {
  return Object.keys(WHATSAPP_TEMPLATES).map(key => ({
    key,
    description: key.replace(/([A-Z])/g, ' $1').trim(),
  }));
}

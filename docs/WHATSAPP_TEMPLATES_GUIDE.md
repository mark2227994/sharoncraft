# WhatsApp Message Templates for Admins

A complete set of professional, friendly WhatsApp message templates for all common customer interactions. No emojis - just clear, detailed, helpful communication.

## Access the Templates

Admin page: `/admin/whatsapp-templates`

The interactive manager lets you:
- Select a template
- Fill in customer details
- Preview the message
- Copy to clipboard in one click

## Template Categories

### Custom Orders (6 Templates)

#### 1. Custom Order - Acknowledgment
**Use when:** Customer submits a custom design request
**Customizes:** Customer name
**Tells customer:** That you received their request and will send a quote soon

#### 2. Custom Order - Quote Ready
**Use when:** You've prepared a pricing quote and payment link
**Customizes:** Customer name, payment link URL
**Tells customer:** Here's your quote with deposit amount and payment instructions

#### 3. Custom Order - Deposit Received
**Use when:** Customer has submitted deposit payment proof
**Customizes:** Customer name, order reference
**Tells customer:** Payment verified, production starts now, what to expect

#### 4. Custom Order - Production Update
**Use when:** Sending progress photos or updates during production
**Customizes:** Customer name, production details/progress
**Tells customer:** Project is on track with specific progress details

#### 5. Custom Order - Ready for Final Approval
**Use when:** Piece is complete and ready for customer to approve before final payment
**Customizes:** Customer name, order reference
**Tells customer:** Piece is done, review photos, and approve to proceed

#### 6. Custom Order - Final Payment Due
**Use when:** Customer approved the piece, now requesting final 50% payment
**Customizes:** Customer name, order ref, final amount, payment link
**Tells customer:** How much to pay, payment link, what happens next

### Shipping & Delivery (3 Templates)

#### 7. Dispatch Notification
**Use when:** Piece is dispatched and on its way
**Customizes:** Customer name, order ref, tracking info
**Tells customer:** Package is shipped with tracking details and delivery timeline

#### 8. Delivery Confirmed & Follow-up
**Use when:** Customer has received their package
**Customizes:** Customer name
**Asks for:** Review/testimonial and photo

#### 9. Delivery Issue Resolution
**Use when:** Something went wrong with delivery or product
**Customizes:** Customer name, solution details
**Shows:** You take problems seriously and have a fix

### Customer Communication (5 Templates)

#### 10. Welcome New Customer
**Use when:** New customer first contacts you
**Customizes:** Customer name
**Sets expectations:** What you help with, how responsive you are

#### 11. Order Follow-up (Incomplete)
**Use when:** You sent a quote but customer hasn't responded in a few days
**Customizes:** Customer name, order ref, days waiting
**Reminds them:** You're here to help if they have questions

#### 12. General Inquiry Response
**Use when:** Answering questions about products, delivery, customization, etc.
**Customizes:** Customer name, your answer
**Provides:** Helpful information in professional format

#### 13. Product Recommendation
**Use when:** Suggesting a specific product based on their needs
**Customizes:** Customer name, product name, why you recommend it
**Encourages:** Interest in a specific piece

#### 14. Promotional Offer
**Use when:** Sharing special deals or seasonal offers
**Customizes:** Customer name, offer details
**Creates:** Urgency with "limited time" messaging

## How to Use

### Step 1: Go to Admin Templates Page
Visit `/admin/whatsapp-templates` (accessible from admin dashboard)

### Step 2: Select Your Template
Choose from the dropdown the template that matches your situation

### Step 3: Fill in Details
Enter the customer name, order reference, amounts, links, or specific details

### Step 4: Review the Preview
Read the complete message in the right panel to make sure it looks right

### Step 5: Copy to Clipboard
Click "Copy to Clipboard" button - message is ready to paste

### Step 6: Paste into WhatsApp
Open the customer's WhatsApp chat and paste the message

### Step 7: (Optional) Customize
Add personal touches, extra details, or emojis if you want (templates don't have them)

### Step 8: Send!
Hit send and you've delivered professional communication

## Template Writing Style

All templates follow these principles:

✓ **Professional** - Formal but approachable
✓ **Friendly** - Warm tone, not robotic
✓ **Detailed** - Explains what's happening and what to do next
✓ **Clear** - Easy to understand, well-structured
✓ **No emojis** - Just good writing
✓ **Action-oriented** - Tells customer what comes next or what to do

## Customization Tips

Feel free to:
- Add more specific details from orders
- Include personal greetings if you know the customer
- Add phone numbers or links specific to an order
- Shorten if needed for quicker responses
- Add extra explanation if customer is confused

Don't:
- Change the professional tone
- Add slang or informal language
- Make promises you can't keep about timelines
- Send without personalizing (always use customer name)

## Template Functions (Developers)

Access templates programmatically:

```javascript
import { WHATSAPP_TEMPLATES, getTemplate, listAvailableTemplates } from "@/lib/whatsapp-templates";

// Get all templates
const allTemplates = Object.keys(WHATSAPP_TEMPLATES);

// Get a specific template
const orderAckTemplate = WHATSAPP_TEMPLATES.customOrderReceived;
const message = orderAckTemplate("John");

// List all with descriptions
const list = listAvailableTemplates();
// Returns: [{ key: "customOrderReceived", description: "Custom Order Received" }, ...]

// Get a template by key
const template = getTemplate("quoteReady");
const message = template("Alice", "https://sharoncraft.com/order/123");
```

## Common Scenarios & Recommended Templates

| Situation | Template |
|-----------|----------|
| Customer submits custom order form | Custom Order - Acknowledgment |
| Finished creating quote | Custom Order - Quote Ready |
| Customer paid deposit | Custom Order - Deposit Received |
| Sending production photos | Custom Order - Production Update |
| Piece is finished | Custom Order - Ready for Final Approval |
| Waiting for final payment | Custom Order - Final Payment Due |
| Shipping the order | Dispatch Notification |
| Package delivered | Delivery Confirmed & Follow-up |
| Delivery problem | Delivery Issue Resolution |
| New customer inquiry | Welcome New Customer |
| No response to quote | Order Follow-up (Incomplete) |
| Customer asks a question | General Inquiry Response |
| Customer seems interested in specific product | Product Recommendation |
| New offer or seasonal deal | Promotional Offer |

## Stats About These Templates

- **14 complete templates** covering all major customer interactions
- **0 emojis** - pure professional communication
- **Fully customizable** with variables for names, amounts, links
- **Pre-written** - save hours on message crafting
- **Tested** - based on real successful customer interactions
- **Friendly** - approachable while maintaining professionalism

---

**Last Updated:** April 20, 2026
**Created for:** SharonCraft Admin Team

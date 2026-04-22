import { isAuthorizedRequest } from "../../../lib/admin-auth";
import { readAdminContentField, writeAdminContentField } from "../../../lib/admin-content";

const defaultPageContent = {
  about: {
    title: 'About SharonCraft',
    heroSubtitle: 'Connecting hands with hearts',
    heroDescription: '47 Kenyan artisans crafting stories into every piece. No shortcuts. Just hands. Just heart.',
    sections: [
      {
        id: 1,
        title: 'Our Founder\'s Story',
        content: 'Sharon started this journey to amplify artisan voices...',
        image: ''
      },
      {
        id: 2,
        title: 'Why Handmade?',
        content: 'In a world of mass production, handmade means intention...',
        image: ''
      }
    ],
    impactStats: {
      artisanCount: 47,
      piecesCreated: 15240,
      kesToArtisans: '₹45.2M'
    }
  },
  faq: {
    title: 'Frequently Asked Questions',
    subtitle: 'Everything you need to know about SharonCraft'
  },
  privacy: {
    title: 'Privacy Policy',
    lastUpdated: '2026-04-20',
    sections: [
      {
        title: 'Introduction',
        content: 'At SharonCraft, your privacy is important to us. This policy explains how we collect, use, and protect your personal information.'
      },
      {
        title: 'Information We Collect',
        content: 'We collect information you provide directly (name, email, phone, address) and information from your interactions with our site (browsing, purchases, preferences).'
      },
      {
        title: 'How We Use Your Information',
        content: 'We use your information to process orders, communicate with you, improve our services, and send you updates (which you can opt out of).'
      },
      {
        title: 'Data Sharing',
        content: 'We do not sell your data. We share information only with service providers (payment processors, shipping) under strict confidentiality agreements.'
      },
      {
        title: 'Data Security',
        content: 'We use industry-standard security measures to protect your information. However, no method is 100% secure, so we cannot guarantee absolute security.'
      },
      {
        title: 'Your Rights',
        content: 'You have the right to access, update, or delete your personal information. Contact us at kelvinmark.services@gmail.com to exercise these rights.'
      },
      {
        title: 'Cookies',
        content: 'We use cookies to enhance your experience. You can disable cookies in your browser settings, though some features may not work properly.'
      },
      {
        title: 'Third-Party Links',
        content: 'Our site may contain links to third-party websites. We are not responsible for their privacy practices.'
      },
      {
        title: 'Contact Us',
        content: 'Questions about this policy? Email us at kelvinmark.services@gmail.com or WhatsApp +254 112 222 572.'
      }
    ]
  },
  terms: {
    title: 'Terms of Service',
    lastUpdated: '2026-04-20',
    sections: [
      {
        title: 'Agreement to Terms',
        content: 'By purchasing from SharonCraft, you agree to these terms and conditions. If you do not agree, please do not use our services.'
      },
      {
        title: 'Use License',
        content: 'SharonCraft grants you a limited license to browse and purchase products. You may not reproduce, distribute, or transmit content without permission.'
      },
      {
        title: 'Product Information',
        content: 'All product descriptions, images, prices, and availability are subject to change without notice. We strive for accuracy but do not guarantee completeness.'
      },
      {
        title: 'Pricing & Availability',
        content: 'Prices are subject to change without notice. We reserve the right to limit quantities and refuse orders. All sales are final unless items are defective.'
      },
      {
        title: 'Custom Orders',
        content: 'Custom orders are non-refundable once production begins. Customers are responsible for approving designs before payment is made. Lead time is 5-10 business days.'
      },
      {
        title: 'Payment & Refunds',
        content: 'We accept M-Pesa, bank transfer, and cash on delivery. Approved refunds are processed within 5-7 business days to the original payment method.'
      },
      {
        title: 'Limitation of Liability',
        content: 'SharonCraft is not liable for indirect, incidental, special, or consequential damages arising from your purchase or use of our products.'
      },
      {
        title: 'Governing Law',
        content: 'These terms are governed by the laws of Kenya. Any disputes shall be resolved in Kenyan courts.'
      },
      {
        title: 'Changes to Terms',
        content: 'We may update these terms at any time. Your continued use of our site constitutes acceptance of modified terms.'
      },
      {
        title: 'Contact Information',
        content: 'Questions? Email kelvinmark.services@gmail.com or WhatsApp +254 112 222 572. Mon-Sat, 9am-6pm EAT.'
      }
    ]
  },
  shipping: {
    title: 'Shipping & Returns',
    lastUpdated: '2026-04-20',
    domestic: {
      standardRate: 300,
      expressRate: 500,
      freeShippingThreshold: 5000,
      standardDelivery: '3-5 business days',
      expressDelivery: '1-2 business days'
    },
    international: {
      enabled: false,
      note: 'International shipping available upon request. Contact support for rates.'
    },
    returns: {
      window: 14,
      conditions: [
        'Items must be returned within 14 days of delivery',
        'Items must be in original condition with no signs of wear',
        'Items must include all original packaging and documentation',
        'Custom orders are generally non-returnable'
      ],
      defectiveReturn: 'Free return shipping for defective items',
      refundTime: '5-7 business days'
    }
  },
  contact: {
    title: 'Contact Us',
    email: 'kelvinmark.services@gmail.com',
    phone: '+254 112 222 572',
    whatsapp: '+254112222572',
    address: 'Nairobi, Kenya',
    hours: 'Mon-Sat, 9am-6pm EAT',
    supportChannels: [
      { name: 'WhatsApp', value: '+254 112 222 572', type: 'whatsapp' },
      { name: 'Email', value: 'kelvinmark.services@gmail.com', type: 'email' },
      { name: 'Contact Form', value: '/contact', type: 'form' }
    ]
  }
};

export default async function handler(req, res) {
  if (req.method === "GET") {
    const data = await readAdminContentField("pageContent", defaultPageContent);
    return res.status(200).json(data);
  }

  if (req.method === "POST") {
    if (!isAuthorizedRequest(req)) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    try {
      const payload = req.body && typeof req.body === "object" ? req.body : defaultPageContent;
      await writeAdminContentField("pageContent", payload);
      return res.status(200).json({ success: true, data: payload });
    } catch (error) {
      console.error("Error saving page content:", error);
      return res.status(500).json({ error: "Failed to save page content" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}

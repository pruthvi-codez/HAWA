export interface FAQItem {
  q: string;
  a: string;
}

export interface Testimonial {
  name: string;
  quote: string;
  rating: number;
}

export const CONTENT_DEFAULTS = {
  store_name: 'HAWA',
  store_tagline: 'Wear the weather.',
  hero_headline: 'Clothes cut for how Indian summers actually feel.',
  hero_subtext:
    'Breathable cottons and easy silhouettes, designed in Bengaluru for humid commutes, late monsoon evenings, and everything between.',
  hero_cta_label: 'Shop the new drop',
  about_content:
    "HAWA started in 2021 with one complaint: most \"summer wear\" in India is designed for a summer that isn't ours.\n\nWe make everyday clothing from breathable cotton and linen blends, cut generously and dyed in small batches using low-impact processes inspired by traditional Indian indigo dyeing. Every piece is tested through an actual Chennai August before it ships.\n\nWe're a small team based out of Bengaluru, and we ship anywhere in India.",
  contact_content:
    "Have a question about an order, a size, or anything else? We usually reply within one business day.",
  shipping_policy:
    'We ship across India from our Bengaluru warehouse.\n\nStandard shipping takes 4-7 business days and costs ₹79, free on orders over ₹1,499. Express shipping takes 1-3 business days for ₹199, available in most metro pincodes.\n\nOrders are packed within 24 hours on business days. You will receive a tracking link by email and SMS once your order ships. We are not able to redirect a shipment once it has left our warehouse, so please double-check your address at checkout.',
  returns_policy:
    'If something isn\'t right, you can return it within 14 days of delivery for a full refund, or exchange it for a different size at no extra cost.\n\nItems must be unworn, unwashed, and have their original tags attached. Innerwear, socks, and sale items marked "final sale" cannot be returned.\n\nTo start a return or exchange, go to Order History in your account and select "Return / Exchange" on the relevant order. Refunds are processed to the original payment method within 5-7 business days of us receiving the item. Cash on Delivery orders are refunded via bank transfer or store credit.',
  privacy_policy:
    'We collect the information you give us at checkout (name, address, phone, email) to process and deliver your order, and your account details if you choose to register.\n\nWe never sell your personal data. Payment details are handled directly by our payment gateway partners; we do not store your card number on our servers.\n\nWe use cookies to keep your cart and session working correctly. You can ask us to delete your account and associated data at any time by writing to us from the Contact page.',
  terms_content:
    'By placing an order on this site, you agree to pay the listed price in Indian Rupees (INR) inclusive of applicable taxes, plus any shipping charge shown at checkout.\n\nProduct images are for illustration; actual colour may vary slightly due to screen settings and dye-batch variation, which is normal for naturally dyed fabric.\n\nWe reserve the right to cancel an order in cases of pricing errors, suspected fraud, or stock unavailability, in which case you will be refunded in full.',
  faqs: [
    { q: 'How do I know my size?', a: 'Check the size chart on each product page — it lists chest, length, and shoulder measurements in centimetres.' },
    { q: 'Do you offer Cash on Delivery?', a: 'Yes, COD is available on all orders under ₹5,000 across most Indian pincodes.' },
    { q: 'Can I exchange for a different size?', a: 'Yes, free size exchanges are available within 14 days of delivery from your Order History page.' },
    { q: 'How long does shipping take?', a: 'Standard shipping takes 4-7 business days; express shipping takes 1-3 business days in most metros.' },
  ] as FAQItem[],
  testimonials: [
    { name: 'Ananya R., Bengaluru', quote: 'The only t-shirts that actually survive a Chennai summer. Ordering three more.', rating: 5 },
    { name: 'Kabir S., Mumbai', quote: 'Fit is true to size and the cotton feels genuinely heavier-duty than brands twice the price.', rating: 5 },
    { name: 'Meher P., Delhi', quote: 'Returns were painless when a size didn\'t work out. Will keep buying.', rating: 4 },
  ] as Testimonial[],
};

export const STORE_SETTINGS_DEFAULTS = {
  contact_email: 'hello@hawa.example',
  contact_phone: '+91 80000 00000',
  contact_address: 'HAWA Studio, Indiranagar, Bengaluru, Karnataka 560038',
  logo_text: 'HAWA',
  instagram_url: 'https://instagram.com',
  twitter_url: 'https://twitter.com',
  facebook_url: 'https://facebook.com',
};

export const SHIPPING_SETTINGS_DEFAULTS = {
  standard_charge: 79,
  standard_days: '4-7 business days',
  express_charge: 199,
  express_days: '1-3 business days',
  free_shipping_threshold: 1499,
};

export const PAYMENT_SETTINGS_DEFAULTS = {
  enable_upi: true,
  enable_card: true,
  enable_netbanking: true,
  enable_wallet: true,
  enable_cod: true,
  cod_limit: 5000,
};

/**
 * Run with: npm run seed
 * Safe to re-run — it checks for existing data and exits early if the store
 * already has products, so it will never duplicate demo data.
 */
import { db } from './index';
import { createCategory, getCategoryBySlug } from '@/lib/models/categories';
import { createProduct, getVariant, setVariantStock } from '@/lib/models/products';
import { createUser, getUserByEmail } from '@/lib/models/users';
import { hashPassword } from '@/lib/password';
import { createAddress } from '@/lib/models/addresses';
import { createCoupon } from '@/lib/models/coupons';
import { createOrder, updateOrderStatus, updatePaymentStatus } from '@/lib/models/orders';
import { createReview, setReviewApproval } from '@/lib/models/reviews';
import { slugify } from '@/lib/utils';

async function main() {
  const existing = db.prepare('SELECT COUNT(*) as c FROM products').get() as { c: number };
  if (existing.c > 0) {
    console.log('Database already has products — skipping seed. Delete data.db to reseed from scratch.');
    return;
  }

  console.log('Seeding categories...');
  const categoryDefs = [
    { name: 'Men', slug: 'men' },
    { name: 'Women', slug: 'women' },
    { name: 'T-Shirts', slug: 't-shirts' },
    { name: 'Shirts', slug: 'shirts' },
    { name: 'Jeans', slug: 'jeans' },
    { name: 'Hoodies', slug: 'hoodies' },
    { name: 'Dresses', slug: 'dresses' },
  ];
  categoryDefs.forEach((c, i) => createCategory({ ...c, sort_order: i }));
  const cat = (slug: string) => getCategoryBySlug(slug)!.id;

  console.log('Seeding products...');
  const STANDARD_SIZES = ['S', 'M', 'L', 'XL', 'XXL'];
  const DRESS_SIZES = ['XS', 'S', 'M', 'L', 'XL'];

  type ProductSeed = {
    name: string;
    category: string;
    basePrice: number;
    discountPrice?: number;
    sizes: string[];
    colors: string[];
    material: string;
    care: string;
    description: string;
    featured?: boolean;
    imgSeed: string;
  };

  const products: ProductSeed[] = [
    {
      name: 'Essential Crew Tee',
      category: 't-shirts',
      basePrice: 799,
      discountPrice: 649,
      sizes: STANDARD_SIZES,
      colors: ['Black', 'White', 'Sand'],
      material: '100% combed cotton, 180 GSM',
      care: 'Machine wash cold with like colours. Do not bleach. Tumble dry low.',
      description:
        'The one tee that fits into everything else in your wardrobe. Cut from breathable combed cotton with a slightly boxy fit through the body and a clean crew neck that keeps its shape wash after wash.',
      featured: true,
      imgSeed: 'crew-tee',
    },
    {
      name: 'Oversized Graphic Tee',
      category: 't-shirts',
      basePrice: 999,
      sizes: STANDARD_SIZES,
      colors: ['Black', 'Washed Grey'],
      material: '100% cotton, 220 GSM heavyweight jersey',
      care: 'Machine wash inside-out in cold water. Do not iron print.',
      description:
        'A drop-shoulder, oversized tee in heavyweight jersey with a small back-print. Built loose on purpose — size down if you want it closer to regular fit.',
      featured: true,
      imgSeed: 'graphic-tee',
    },
    {
      name: 'Pocket Henley Tee',
      category: 't-shirts',
      basePrice: 899,
      sizes: STANDARD_SIZES,
      colors: ['Olive', 'Black', 'Rust'],
      material: '95% cotton, 5% elastane',
      care: 'Machine wash cold. Line dry recommended.',
      description: 'Three-button henley placket, a slub cotton hand-feel, and a genuine chest pocket. Layers well under the Zip-Up Hoodie.',
      imgSeed: 'henley-tee',
    },
    {
      name: 'Ribbed Tank Tee',
      category: 't-shirts',
      basePrice: 699,
      sizes: STANDARD_SIZES,
      colors: ['White', 'Black', 'Sand'],
      material: '95% cotton, 5% elastane rib knit',
      care: 'Machine wash cold, gentle cycle.',
      description: 'A close-ribbed tank built for peak-heat days — under a shirt or on its own.',
      imgSeed: 'tank-tee',
    },
    {
      name: 'Linen Casual Shirt',
      category: 'shirts',
      basePrice: 1599,
      discountPrice: 1349,
      sizes: STANDARD_SIZES,
      colors: ['Sand', 'White', 'Sage'],
      material: '100% pure linen',
      care: 'Hand wash or gentle machine cycle. Iron on medium heat while slightly damp.',
      description:
        'An airy linen shirt cut for humid weather — full breathability, natural texture, and a relaxed fit that only gets better with wear and wash.',
      featured: true,
      imgSeed: 'linen-shirt',
    },
    {
      name: 'Denim Overshirt',
      category: 'shirts',
      basePrice: 1799,
      sizes: STANDARD_SIZES,
      colors: ['Indigo Blue', 'Black'],
      material: '100% cotton denim, 8oz',
      care: 'Machine wash cold, inside-out. Wash separately for the first few washes.',
      description: 'A mid-weight denim overshirt that works buttoned as a shirt or open as a light jacket over a tee.',
      imgSeed: 'denim-overshirt',
    },
    {
      name: 'Corduroy Shirt',
      category: 'shirts',
      basePrice: 1699,
      sizes: STANDARD_SIZES,
      colors: ['Rust', 'Olive'],
      material: '100% cotton corduroy, fine wale',
      care: 'Machine wash cold inside-out. Do not tumble dry.',
      description: 'Fine-wale corduroy with a soft brushed hand-feel — built for the first cool evenings of the season.',
      imgSeed: 'corduroy-shirt',
    },
    {
      name: 'Straight Fit Jeans',
      category: 'jeans',
      basePrice: 2199,
      discountPrice: 1799,
      sizes: ['28', '30', '32', '34', '36', '38'],
      colors: ['Indigo Blue', 'Black'],
      material: '98% cotton, 2% elastane denim',
      care: 'Machine wash cold, inside-out, with similar colours.',
      description: 'A straight leg from hip to hem in rigid-feel stretch denim. The everyday jean that goes with everything above the waist.',
      featured: true,
      imgSeed: 'straight-jeans',
    },
    {
      name: 'Relaxed Wide-Leg Jeans',
      category: 'jeans',
      basePrice: 2299,
      sizes: ['28', '30', '32', '34', '36'],
      colors: ['Light Wash', 'Indigo Blue'],
      material: '100% cotton rigid denim',
      care: 'Machine wash cold inside-out. Line dry to preserve shape.',
      description: 'A dropped-crotch, wide-leg cut in rigid cotton denim for a fit that softens and shapes to you over time.',
      imgSeed: 'wide-jeans',
    },
    {
      name: 'Slim Tapered Jeans',
      category: 'jeans',
      basePrice: 1999,
      sizes: ['28', '30', '32', '34', '36', '38'],
      colors: ['Black', 'Indigo Blue'],
      material: '97% cotton, 3% elastane',
      care: 'Machine wash cold inside-out.',
      description: 'Slim through the thigh and tapered at the ankle, with just enough stretch to move with you all day.',
      imgSeed: 'slim-jeans',
    },
    {
      name: 'Fleece Pullover Hoodie',
      category: 'hoodies',
      basePrice: 1899,
      discountPrice: 1599,
      sizes: STANDARD_SIZES,
      colors: ['Charcoal', 'Sand', 'Indigo Blue'],
      material: '80% cotton, 20% polyester fleece, 320 GSM',
      care: 'Machine wash cold inside-out. Do not iron print.',
      description: 'Heavyweight brushed fleece with a lined hood and kangaroo pocket — the one hoodie that survives an entire monsoon of wear.',
      featured: true,
      imgSeed: 'fleece-hoodie',
    },
    {
      name: 'Zip-Up Hoodie',
      category: 'hoodies',
      basePrice: 2099,
      sizes: STANDARD_SIZES,
      colors: ['Black', 'Olive'],
      material: '80% cotton, 20% polyester fleece',
      care: 'Machine wash cold inside-out.',
      description: 'A full-zip hoodie in mid-weight fleece with ribbed cuffs and hem — easy to layer on and off.',
      imgSeed: 'zip-hoodie',
    },
    {
      name: 'Oversized Hoodie',
      category: 'hoodies',
      basePrice: 2199,
      sizes: STANDARD_SIZES,
      colors: ['Washed Grey', 'Black'],
      material: '100% cotton fleece, 340 GSM',
      care: 'Machine wash cold inside-out. Line dry recommended.',
      description: 'Dropped shoulders, a longer body, and a deep front pocket — sized to be worn oversized from the start.',
      featured: true,
      imgSeed: 'oversized-hoodie',
    },
    {
      name: 'Wrap Midi Dress',
      category: 'dresses',
      basePrice: 2199,
      discountPrice: 1899,
      sizes: DRESS_SIZES,
      colors: ['Rust', 'Sage', 'Black'],
      material: '100% viscose crepe',
      care: 'Hand wash cold. Do not wring. Iron on low heat.',
      description: 'A wrap midi with a flattering V-neckline and a tie waist, cut in a soft, fluid crepe that moves easily.',
      featured: true,
      imgSeed: 'wrap-dress',
    },
    {
      name: 'Shirt Dress',
      category: 'dresses',
      basePrice: 1999,
      sizes: DRESS_SIZES,
      colors: ['White', 'Sand'],
      material: '100% cotton poplin',
      care: 'Machine wash cold. Iron on medium heat.',
      description: 'A classic collared shirt dress in crisp cotton poplin, with a self-tie belt to cinch the waist.',
      imgSeed: 'shirt-dress',
    },
    {
      name: 'Tiered Sundress',
      category: 'dresses',
      basePrice: 1899,
      sizes: DRESS_SIZES,
      colors: ['Sage', 'Rust'],
      material: '100% cotton voile',
      care: 'Hand wash cold. Line dry in shade.',
      description: 'Lightweight tiered cotton voile with adjustable straps — built for the hottest weeks of the year.',
      imgSeed: 'sundress',
    },
    {
      name: 'Cargo Utility Pants',
      category: 'men',
      basePrice: 1799,
      sizes: ['28', '30', '32', '34', '36'],
      colors: ['Olive', 'Black', 'Sand'],
      material: '98% cotton, 2% elastane ripstop',
      care: 'Machine wash cold inside-out.',
      description: 'Six-pocket utility cargos in ripstop cotton with a tapered leg so they don\'t read baggy.',
      imgSeed: 'cargo-pants',
    },
    {
      name: 'Relaxed Joggers',
      category: 'men',
      basePrice: 1499,
      sizes: STANDARD_SIZES,
      colors: ['Charcoal', 'Black', 'Sand'],
      material: '100% cotton fleece',
      care: 'Machine wash cold inside-out.',
      description: 'Brushed-back fleece joggers with an elastic, drawcord waist and tapered ankle cuffs.',
      imgSeed: 'joggers',
    },
    {
      name: 'Relaxed Palazzo Pants',
      category: 'women',
      basePrice: 1599,
      sizes: ['XS', 'S', 'M', 'L', 'XL'],
      colors: ['Black', 'Sand', 'Sage'],
      material: '100% rayon crepe',
      care: 'Hand wash cold. Iron on low heat.',
      description: 'Wide-leg palazzo pants in fluid crepe with a comfortable elasticated waistband — dress up or down.',
      imgSeed: 'palazzo-pants',
    },
    {
      name: 'Co-ord Set (Top + Skirt)',
      category: 'women',
      basePrice: 2499,
      discountPrice: 2099,
      sizes: ['XS', 'S', 'M', 'L', 'XL'],
      colors: ['Rust', 'Black'],
      material: '100% cotton slub',
      care: 'Machine wash cold, gentle cycle.',
      description: 'A matching cropped top and midi skirt set in textured cotton slub — sold together, styled endlessly.',
      featured: true,
      imgSeed: 'coord-set',
    },
  ];

  const createdProducts = products.map((p, i) => {
    const slug = slugify(p.name);
    const product = createProduct({
      name: p.name,
      slug,
      description: p.description,
      category_id: cat(p.category),
      base_price: p.basePrice,
      discount_price: p.discountPrice ?? null,
      images: [0, 1, 2].map((n) => `https://picsum.photos/seed/${p.imgSeed}-${n}/900/1125`),
      sizes: p.sizes,
      colors: p.colors,
      material: p.material,
      care_instructions: p.care,
      sku_prefix: `HW${(i + 1).toString().padStart(3, '0')}`,
      is_featured: !!p.featured,
      is_published: true,
    });
    // Stock each variant with a pseudo-random but deterministic quantity.
    p.sizes.forEach((size, si) => {
      p.colors.forEach((color, ci) => {
        const variant = getVariant(product.id, size, color)!;
        const base = ((si + 1) * 7 + (ci + 1) * 3) % 35;
        const stock = base < 4 ? base + 2 : base; // keep a few intentionally low-stock for the admin demo
        setVariantStock(variant.id, stock);
      });
    });
    return product;
  });

  console.log('Seeding users...');
  const adminPasswordHash = await hashPassword('Admin@12345');
  const admin =
    getUserByEmail('admin@hawa.example') ||
    createUser({ name: 'Store Admin', email: 'admin@hawa.example', passwordHash: adminPasswordHash, role: 'admin' });

  const customerPasswordHash = await hashPassword('Customer@12345');
  const customer =
    getUserByEmail('customer@example.com') ||
    createUser({
      name: 'Ananya Rao',
      email: 'customer@example.com',
      phone: '9876543210',
      passwordHash: customerPasswordHash,
      role: 'customer',
    });

  console.log('Seeding address...');
  const address = createAddress({
    user_id: customer.id,
    name: 'Ananya Rao',
    phone: '9876543210',
    address_line: '221, 12th Main, Indiranagar',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560038',
    is_default: true,
  });

  console.log('Seeding coupons...');
  createCoupon({
    code: 'WELCOME10',
    type: 'percentage',
    value: 10,
    min_order_amount: 999,
    usage_limit: 500,
    is_active: true,
  });
  createCoupon({
    code: 'FLAT200',
    type: 'fixed',
    value: 200,
    min_order_amount: 1999,
    usage_limit: 200,
    is_active: true,
  });
  createCoupon({
    code: 'EXPIRED50',
    type: 'percentage',
    value: 50,
    min_order_amount: 0,
    expiry_date: '2024-01-01',
    is_active: true,
  });

  console.log('Seeding demo orders...');
  const teeVariant = createdProducts[0];
  const hoodieProduct = createdProducts[10];
  const jeansProduct = createdProducts[7];

  const order1 = createOrder({
    userId: customer.id,
    guestEmail: null,
    items: [
      { productId: teeVariant.id, size: teeVariant.sizes[1], color: teeVariant.colors[0], quantity: 2 },
      { productId: hoodieProduct.id, size: hoodieProduct.sizes[2], color: hoodieProduct.colors[0], quantity: 1 },
    ],
    shipping: {
      name: address.name,
      phone: address.phone,
      addressLine: address.address_line,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
    },
    shippingMethod: 'Standard',
    shippingCharge: 0,
    paymentMethod: 'UPI',
  });
  if (order1.order) {
    updateOrderStatus(order1.order.id, 'Delivered');
    updatePaymentStatus(order1.order.id, 'Paid');
  }

  const order2 = createOrder({
    userId: customer.id,
    guestEmail: null,
    items: [{ productId: jeansProduct.id, size: jeansProduct.sizes[2], color: jeansProduct.colors[0], quantity: 1 }],
    shipping: {
      name: address.name,
      phone: address.phone,
      addressLine: address.address_line,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
    },
    shippingMethod: 'Express',
    shippingCharge: 199,
    paymentMethod: 'COD',
  });
  if (order2.order) {
    updateOrderStatus(order2.order.id, 'Shipped');
  }

  const order3 = createOrder({
    userId: customer.id,
    guestEmail: null,
    items: [{ productId: teeVariant.id, size: teeVariant.sizes[0], color: teeVariant.colors[1], quantity: 1 }],
    shipping: {
      name: address.name,
      phone: address.phone,
      addressLine: address.address_line,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
    },
    shippingMethod: 'Standard',
    shippingCharge: 0,
    paymentMethod: 'Card',
  });
  if (order3.order) {
    updateOrderStatus(order3.order.id, 'Pending');
  }

  console.log('Seeding reviews...');
  const r1 = createReview({ productId: teeVariant.id, userId: customer.id, rating: 5, comment: 'Fits great and the cotton feels much heavier than the price suggests. Ordering more colours.' });
  setReviewApproval(r1.id, true);
  const r2 = createReview({ productId: hoodieProduct.id, userId: customer.id, rating: 4, comment: 'Warm and well stitched, runs slightly large so consider sizing down.' });
  setReviewApproval(r2.id, true);

  console.log('\nSeed complete.');
  console.log('Admin login: admin@hawa.example / Admin@12345');
  console.log('Customer login: customer@example.com / Customer@12345');
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });



import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
  }),
});

// Direct Unsplash image URLs
const MEN_IMAGES = [
  'https://images.unsplash.com/photo-1639006570490-79c0c53f1080?auto=format&fit=crop&w=900&q=85',
  'https://images.unsplash.com/photo-1627860284764-c92502f39afb?auto=format&fit=crop&w=900&q=85',
  'https://images.unsplash.com/photo-1611353384046-8a02bac0f14d?auto=format&fit=crop&w=900&q=85',
  'https://images.unsplash.com/photo-1780721653236-22b53a1ed0e0?auto=format&fit=crop&w=900&q=85',
  'https://images.unsplash.com/photo-1786284684790-8313a9ce79c8?auto=format&fit=crop&w=900&q=85',
  'https://images.unsplash.com/photo-1786052346139-16e28d0dc7ff?auto=format&fit=crop&w=900&q=85',
  'https://images.unsplash.com/photo-1780679192494-930c40e60529?auto=format&fit=crop&w=900&q=85',
  'https://images.unsplash.com/photo-1786052346139-16e28d0dc7ff?auto=format&fit=crop&w=900&q=85',
];

const WOMEN_IMAGES = [
  'https://images.unsplash.com/photo-1768062251754-8a56c9fe938c?auto=format&fit=crop&w=900&q=85',
  'https://images.unsplash.com/photo-1770216533493-a25ce4224123?auto=format&fit=crop&w=900&q=85',
  'https://images.unsplash.com/photo-1786052352125-f2cc5f4f4eee?auto=format&fit=crop&w=900&q=85',
  'https://images.unsplash.com/photo-1786052346139-16e28d0dc7ff?auto=format&fit=crop&w=900&q=85',
  'https://images.unsplash.com/photo-1786284684790-8313a9ce79c8?auto=format&fit=crop&w=900&q=85',
  'https://images.unsplash.com/photo-1786052352125-f2cc5f4f4eee?auto=format&fit=crop&w=900&q=85',
  'https://images.unsplash.com/photo-1770216533493-a25ce4224123?auto=format&fit=crop&w=900&q=85',
  'https://images.unsplash.com/photo-1786052346139-16e28d0dc7ff?auto=format&fit=crop&w=900&q=85',
];

const collections = [
  'Royal Gold',
  'Chronograph',
  'Sport Luxury',
  'Classic Heritage',
  'Executive',
  'Limited Edition',
];

const menWatches = [
  { name: 'MIRZA Royal Gold', color: 'Gold', price: 18000 },
  { name: 'MIRZA Midnight Black', color: 'Black', price: 16500 },
  { name: 'MIRZA Silver Classic', color: 'Silver', price: 14500 },
  { name: 'MIRZA White Prestige', color: 'White', price: 15500 },
  { name: 'MIRZA Royal Blue', color: 'Blue', price: 17500 },
  { name: 'MIRZA Two Tone Luxury', color: 'Gold & Silver', price: 19500 },
  { name: 'MIRZA Black Executive', color: 'Black & Gold', price: 18500 },
  { name: 'MIRZA Heritage Gold', color: 'Gold', price: 21000 },
  { name: 'MIRZA Silver Chronograph', color: 'Silver', price: 19000 },
  { name: 'MIRZA Ocean Blue', color: 'Blue & Silver', price: 17000 },
  { name: 'MIRZA Carbon Edition', color: 'Black', price: 20000 },
  { name: 'MIRZA White Royal', color: 'White & Gold', price: 18000 },
  { name: 'MIRZA Platinum Elite', color: 'Silver', price: 22000 },
  { name: 'MIRZA Golden Heritage', color: 'Gold & Black', price: 23000 },
  { name: 'MIRZA Sport Black', color: 'Black', price: 16000 },
  { name: 'MIRZA Blue Sapphire', color: 'Blue', price: 20500 },
  { name: 'MIRZA Classic Silver', color: 'Silver', price: 15000 },
  { name: 'MIRZA Royal White', color: 'White', price: 17500 },
  { name: 'MIRZA Gold Reserve', color: 'Gold', price: 24000 },
  { name: 'MIRZA Black Diamond', color: 'Black & Silver', price: 22500 },
  { name: 'MIRZA Imperial Two Tone', color: 'Gold & Silver', price: 25000 },
  { name: 'MIRZA Navy Executive', color: 'Navy Blue', price: 19500 },
  { name: 'MIRZA Silver Prestige', color: 'Silver & Black', price: 18500 },
  { name: 'MIRZA Grand Gold', color: 'Gold', price: 26000 },
];

const womenWatches = [
  { name: 'MIRZA Rose Gold Elegance', color: 'Rose Gold', price: 12500 },
  { name: 'MIRZA Diamond Classic', color: 'Silver & Diamond', price: 14500 },
  { name: 'MIRZA Golden Pearl', color: 'Gold & White', price: 15500 },
  { name: 'MIRZA Midnight Lady', color: 'Black & Gold', price: 13500 },
  { name: 'MIRZA Silver Charm', color: 'Silver', price: 11500 },
  { name: 'MIRZA Royal Pink', color: 'Rose Gold & Pink', price: 16500 },
  { name: 'MIRZA Two Tone Grace', color: 'Gold & Silver', price: 17500 },
  { name: 'MIRZA Emerald Beauty', color: 'Gold & Green', price: 18500 },
];

async function main() {
  // Admin account
  const admin = await prisma.user.upsert({
    where: { email: 'admin@mirza.dev' },
    update: {},
    create: {
      name: 'MIRZA Admin',
      email: 'admin@mirza.dev',
      password: await bcrypt.hash('Admin@12345', 12),
      role: 'SUPER_ADMIN',
      verified: true,
    },
  });

  // Welcome coupon
  await prisma.coupon.upsert({
    where: { code: 'WELCOME10' },
    update: {},
    create: {
      code: 'WELCOME10',
      type: 'PERCENT',
      value: 10,
      minOrder: 100,
    },
  });

  // Men's collections
  const menCollections = [];

  for (const c of collections) {
    const slug = c.toLowerCase().replace(/ /g, '-');

    const collection = await prisma.collection.upsert({
      where: { slug },
      update: {},
      create: {
        name: `${c} Collection`,
        slug,
        blurb: 'Precision, crafted to last generations.',
      },
    });

    menCollections.push(collection);
  }

  // Men's products: update existing SKUs
  for (const [i, watch] of menWatches.entries()) {
    const collection = menCollections[i % menCollections.length];
    const sku = `MZ-${Math.floor(i / 4)}${i % 4}`;

    const data = {
      name: watch.name,
      slug: watch.name.toLowerCase().replace(/ /g, '-'),
      brand: 'MIRZA',
      description: `Premium ${watch.color} men's luxury analog wristwatch with elegant finishing.`,
      price: watch.price,
      salePrice: watch.price - 1000,
      stock: 10,
      gender: 'MEN',
      featured: i < 8,
      published: true,
      collectionId: collection.id,
      images: [MEN_IMAGES[i % MEN_IMAGES.length]],
      specs: {
        Movement: 'Automatic',
        Color: watch.color,
        Case: '316L Stainless Steel',
        Diameter: '41mm',
        Glass: 'Sapphire Crystal',
        WaterResistance: '100m',
        Warranty: '2 years',
      },
    };

    await prisma.product.upsert({
      where: { sku },
      update: data,
      create: {
        ...data,
        sku,
      },
    });
  }

  // Women's collection
  const womenCollection = await prisma.collection.upsert({
    where: { slug: 'womens-luxury' },
    update: {},
    create: {
      name: "Women's Luxury Collection",
      slug: 'womens-luxury',
      blurb: 'Elegant timepieces crafted for women.',
    },
  });

  // Women's products
  for (const [i, watch] of womenWatches.entries()) {
    const sku = `MZ-W00${i + 1}`;

    const data = {
      name: watch.name,
      slug: watch.name.toLowerCase().replace(/ /g, '-'),
      brand: 'MIRZA',
      description: `Elegant ${watch.color} women's luxury analog wristwatch with premium finishing.`,
      price: watch.price,
      salePrice: watch.price - 1000,
      stock: 10,
      gender: 'WOMEN',
      featured: true,
      published: true,
      collectionId: womenCollection.id,
      images: [WOMEN_IMAGES[i]],
      specs: {
        Movement: 'Quartz',
        Color: watch.color,
        Case: 'Premium Stainless Steel',
        Diameter: '32mm',
        Glass: 'Sapphire Crystal',
        WaterResistance: '50m',
        Warranty: '2 years',
      },
    };

    await prisma.product.upsert({
      where: { sku },
      update: data,
      create: {
        ...data,
        sku,
      },
    });
  }

  // Demo reviews
  const demo = [
    'Superb finish and very accurate.',
    'Looks even better in person.',
    'Great gift, arrived well packed.',
  ];

  const featuredProducts = await prisma.product.findMany({
    where: { featured: true },
    take: 20,
  });

  for (const p of featuredProducts) {
    await prisma.review.upsert({
      where: {
        userId_productId: {
          userId: admin.id,
          productId: p.id,
        },
      },
      update: {},
      create: {
        userId: admin.id,
        productId: p.id,
        rating: 5,
        title: 'Excellent',
        body: demo[p.sku.length % 3],
        approved: true,
      },
    });
  }

  console.log('MIRZA seed completed successfully!');
  console.log('24 Men watches and 8 Women watches are ready.');
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "../config/database.js";
import { categoryModal } from "../models/category.model.js";
import { subcategoryModel } from "../models/subcategory.model.js";
import Product from "../models/product.model.js";
import { Blog } from "../models/blog.model.js";
import { User } from "../models/user.model.js";
import Testimonial from "../models/testimonial.model.js";
import Reel from "../models/reel.model.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.resolve(__dirname, "../.env"),
});

await connectDB();

const categories = [
  "Vastu Correction Oils",
  "Astrology Oils",
  "Yoga & Healing Oils",
  "Aroma Medicines",
  "Aark Ayurveda",
];

const subcategories = [
  "Home Energy",
  "Planetary Remedies",
  "Meditation Support",
  "Stress Relief",
  "Herbal Wellness",
];

const products = [
  {
    name: "Pitra Dosh Nivaran Oil",
    type: "product",
    description:
      "A vastu support oil designed for spaces where ancestral imbalance is believed to affect harmony and wellbeing.",
    category: "Vastu Correction Oils",
    sub_category: "Home Energy",
    brand: "Vedant Aroma",
    tags: ["vastu", "ancestral", "energy"],
    price: 300,
    sale_price: 250,
    stock_quantity: 75,
    images: ["/images/best-seller.jpg"],
    volume: 15,
  },
  {
    name: "Planetary Harmony Oil",
    type: "product",
    description:
      "A calming aroma blend inspired by Navagraha balancing practices for spiritual focus and planetary remedy rituals.",
    category: "Astrology Oils",
    sub_category: "Planetary Remedies",
    brand: "Vedant Gurukul",
    tags: ["astrology", "navagraha", "meditation"],
    price: 350,
    sale_price: 325,
    stock_quantity: 50,
    images: ["/images/slider-1.jpg"],
    volume: 10,
  },
  {
    name: "Chakra Balancing Oil",
    type: "product",
    description:
      "A wellness blend crafted for meditation and yoga sessions, helping create a centered and grounded atmosphere.",
    category: "Yoga & Healing Oils",
    sub_category: "Meditation Support",
    brand: "Vedant Healing",
    tags: ["chakra", "healing", "yoga"],
    price: 450,
    sale_price: 399,
    stock_quantity: 40,
    images: ["/images/slider-2.jpg"],
    volume: 20,
  },
  {
    name: "Stress Relief Inhalant",
    type: "product",
    description:
      "An aromatic inhalant intended for moments of stress, with a soothing profile for quick calming support.",
    category: "Aroma Medicines",
    sub_category: "Stress Relief",
    brand: "Vedant Aroma",
    tags: ["stress", "calm", "aroma"],
    price: 250,
    sale_price: 225,
    stock_quantity: 120,
    images: ["/images/slider-3.jpg"],
    volume: 5,
  },
  {
    name: "Triphala Herbal Ark",
    type: "product",
    description:
      "A sample ayurvedic wellness product for development and storefront testing with realistic pricing and metadata.",
    category: "Aark Ayurveda",
    sub_category: "Herbal Wellness",
    brand: "Aark Ayurveda",
    tags: ["ayurveda", "triphala", "wellness"],
    price: 499,
    sale_price: 449,
    stock_quantity: 60,
    images: ["/images/slider-4.jpg"],
    volume: 50,
  },
];

const blogSeed = [
  {
    title: "Balancing Home Energy with Traditional Aroma Rituals",
    slug: "balancing-home-energy-with-traditional-aroma-rituals",
    excerpt:
      "A practical introduction to using aroma rituals for calmer living spaces and more intentional daily routines.",
    content:
      "<p>Traditional aroma practices are often used to create a calmer atmosphere at home. In modern life, they can support mindful routines, reflective pauses, and a stronger sense of balance in shared spaces.</p>",
    category: "Wellness",
    tags: ["wellness", "aroma", "rituals"],
    featuredImage: "/images/blog-bg.jpg",
    status: "published",
  },
  {
    title: "How Vedic Wellness Practices Fit into Modern Daily Life",
    slug: "how-vedic-wellness-practices-fit-into-modern-daily-life",
    excerpt:
      "Simple ways to bring mindful Vedic wellness habits into a busy schedule without overcomplicating your routine.",
    content:
      "<p>Modern routines can still hold space for older wellness traditions. Small daily rituals, breathwork, and intentional rest can make these practices approachable and sustainable.</p>",
    category: "Vedic Wisdom",
    tags: ["vedic", "lifestyle", "wellness"],
    featuredImage: "/images/vedic-tradition.jpg",
    status: "published",
  },
];

const testimonials = [
  {
    name: "Anjali Sharma",
    productName: "Pitra Dosh Nivaran Oil",
    youtubeLink: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  },
  {
    name: "Rohan Mehta",
    productName: "Chakra Balancing Oil",
    youtubeLink: "https://www.youtube.com/watch?v=ysz5S6PUM-U",
  },
];

const reels = [
  {
    title: "Aroma Ritual Essentials",
    productName: "Stress Relief Inhalant",
    youtubeLink: "https://www.youtube.com/watch?v=jNQXAC9IVRw",
  },
  {
    title: "Vedic Wellness Quick Guide",
    productName: "Planetary Harmony Oil",
    youtubeLink: "https://www.youtube.com/watch?v=aqz-KE-bpKQ",
  },
];

await Promise.all(
  categories.map((name) =>
    categoryModal.updateOne({ name }, { $setOnInsert: { name } }, { upsert: true })
  )
);

await Promise.all(
  subcategories.map((name) =>
    subcategoryModel.updateOne({ name }, { $setOnInsert: { name } }, { upsert: true })
  )
);

await Promise.all(
  products.map((product) =>
    Product.updateOne(
      { slug: product.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") },
      {
        $setOnInsert: {
          ...product,
          slug: product.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""),
          variants: [],
        },
      },
      { upsert: true }
    )
  )
);

const author = await User.findOne().select("_id");

if (author) {
  await Promise.all(
    blogSeed.map((blog) =>
      Blog.updateOne(
        { slug: blog.slug },
        {
          $setOnInsert: {
            ...blog,
            author: author._id,
          },
        },
        { upsert: true }
      )
    )
  );
}

await Promise.all(
  testimonials.map((testimonial) =>
    Testimonial.updateOne(
      { name: testimonial.name, productName: testimonial.productName },
      { $setOnInsert: testimonial },
      { upsert: true }
    )
  )
);

await Promise.all(
  reels.map((reel) =>
    Reel.updateOne(
      { title: reel.title },
      { $setOnInsert: reel },
      { upsert: true }
    )
  )
);

console.log("Seed complete.");
console.log("Categories:", await categoryModal.countDocuments());
console.log("Subcategories:", await subcategoryModel.countDocuments());
console.log("Products:", await Product.countDocuments());
console.log("Blogs:", await Blog.countDocuments());
console.log("Published blogs:", await Blog.countDocuments({ status: "published" }));
console.log("Testimonials:", await Testimonial.countDocuments());
console.log("Reels:", await Reel.countDocuments());

process.exit(0);

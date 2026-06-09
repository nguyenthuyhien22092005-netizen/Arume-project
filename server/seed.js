require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Product = require('./models/Product');
const Coupon = require('./models/Coupon');

const MONGO_URI = process.env.MONGO_URI?.replace('localhost', '127.0.0.1') || 'mongodb://127.0.0.1:27017/arume_db';

// ─── DATA ────────────────────────────────────────────────────────────────────

const ADMIN = {
  name: 'Admin Arume',
  email: 'admin@arume.com',
  password: 'adminpassword123',
  isAdmin: true,
};

const PRODUCTS = [
  // ── Nhẫn ──
  {
    name: 'Nhẫn Kim Cương Solitaire Vàng 18K',
    price: 1250,
    originalPrice: 1480,
    collectionName: 'Nhẫn Kim Cương',
    jewelleryType: 'Nhẫn solitaire',
    category: 'Nhẫn',
    stock: 8,
    material: 'Vàng',
    goldType: 'Vàng 18K',
    gemstone: 'Kim cương',
    certification: 'GIA',
    weight: '3.5g',
    size: ['5', '6', '7', '8', '9'],
    isNewProduct: false,
    isBestSeller: true,
    isLimitedEdition: false,
    description: 'Nhẫn kim cương solitaire 0.5ct GIA cắt tròn brilliant, đặt trên vàng 18K vàng chanh. Thiết kế kinh điển, sang trọng và tinh tế.',
    image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&q=80',
      'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&q=80',
    ],
    tags: ['kim cương', 'nhẫn', 'solitaire', 'bestseller'],
  },
  {
    name: 'Nhẫn Vàng Hồng Pavé Halo',
    price: 890,
    originalPrice: 1050,
    collectionName: 'Nhẫn Kim Cương',
    jewelleryType: 'Nhẫn halo',
    category: 'Nhẫn',
    stock: 12,
    material: 'Vàng',
    goldType: 'Vàng hồng 18K',
    gemstone: 'Kim cương',
    certification: 'IGI',
    weight: '4.2g',
    size: ['5', '6', '7', '8'],
    isNewProduct: true,
    isBestSeller: false,
    isLimitedEdition: false,
    description: 'Nhẫn halo kiêu sa với viên trung tâm 0.3ct bao quanh bởi đám mây kim cương nhỏ pavé, vàng hồng 18K.',
    image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&q=80',
    images: ['https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&q=80'],
    tags: ['nhẫn', 'halo', 'vàng hồng'],
  },
  {
    name: 'Nhẫn Đính Hôn The Promise',
    price: 2100,
    originalPrice: null,
    collectionName: 'The Promise',
    jewelleryType: 'Nhẫn đính hôn',
    category: 'Nhẫn',
    stock: 5,
    material: 'Vàng',
    goldType: 'Vàng trắng 18K',
    gemstone: 'Kim cương',
    certification: 'GIA',
    weight: '5.1g',
    size: ['5', '6', '7', '8', '9'],
    isNewProduct: false,
    isBestSeller: true,
    isLimitedEdition: true,
    description: 'Nhẫn đính hôn cao cấp từ bộ sưu tập The Promise. Kim cương 1.0ct GIA D-VS1 đặt trên khung vàng trắng 18K, hai bên đính kim cương nhỏ.',
    image: 'https://images.unsplash.com/photo-1589674781759-c21c37956a44?w=600&q=80',
    images: ['https://images.unsplash.com/photo-1589674781759-c21c37956a44?w=600&q=80'],
    tags: ['đính hôn', 'kim cương', 'limited'],
  },
  // ── Dây chuyền ──
  {
    name: 'Dây Chuyền Ngọc Trai Ocean Whisper',
    price: 420,
    originalPrice: 520,
    collectionName: 'Ocean Whisper',
    jewelleryType: 'Dây chuyền ngọc trai',
    category: 'Dây chuyền',
    stock: 20,
    material: 'Ngọc trai',
    goldType: 'Vàng 18K',
    gemstone: 'Ngọc trai',
    certification: null,
    weight: '8g',
    size: ['40cm', '45cm', '50cm'],
    isNewProduct: true,
    isBestSeller: false,
    isLimitedEdition: false,
    description: 'Chuỗi ngọc trai Akoya 8mm lấp lánh ánh biển xanh, khóa vàng 18K hình sóng nước. Thêu dệt từ đại dương – tặng cho người bạn yêu.',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&q=80',
    images: ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&q=80'],
    tags: ['ngọc trai', 'dây chuyền', 'ocean'],
  },
  {
    name: 'Dây Chuyền Vàng Classic Chain 18K',
    price: 680,
    originalPrice: null,
    collectionName: 'Dây Chuyền Cổ Điển',
    jewelleryType: 'Dây chuyền vàng',
    category: 'Dây chuyền',
    stock: 15,
    material: 'Vàng',
    goldType: 'Vàng 18K',
    gemstone: null,
    certification: 'SJC',
    weight: '6.8g',
    size: ['42cm', '45cm', '50cm'],
    isNewProduct: false,
    isBestSeller: true,
    isLimitedEdition: false,
    description: 'Dây chuyền vàng 18K kiểu dệt figaro cổ điển, bề mặt mịn bóng. Vàng nhập khẩu Italy, chứng nhận SJC.',
    image: 'https://images.unsplash.com/photo-1631982690223-8aa4d8e1ab34?w=600&q=80',
    images: ['https://images.unsplash.com/photo-1631982690223-8aa4d8e1ab34?w=600&q=80'],
    tags: ['dây chuyền', 'vàng', 'classic'],
  },
  // ── Khuyên tai ──
  {
    name: 'Khuyên Tai Kim Cương Drop Sculpt',
    price: 760,
    originalPrice: 900,
    collectionName: 'The Sculpt',
    jewelleryType: 'Khuyên tai',
    category: 'Khuyên tai',
    stock: 10,
    material: 'Vàng',
    goldType: 'Vàng trắng 18K',
    gemstone: 'Kim cương',
    certification: 'IGI',
    weight: '3.2g',
    size: null,
    isNewProduct: false,
    isBestSeller: false,
    isLimitedEdition: false,
    description: 'Khuyên tai thả hình giọt nước, kim cương 0.2ct mỗi bên, vàng trắng 18K. Đường cong điêu khắc từ bộ sưu tập The Sculpt.',
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&q=80',
    images: ['https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&q=80'],
    tags: ['khuyên tai', 'kim cương', 'drop'],
  },
  {
    name: 'Khuyên Tai Vàng Hồng Mùa Xuân',
    price: 310,
    originalPrice: 380,
    collectionName: 'Bộ Sưu Tập Mùa Xuân',
    jewelleryType: 'Khuyên tai bấm',
    category: 'Khuyên tai',
    stock: 25,
    material: 'Vàng',
    goldType: 'Vàng hồng 18K',
    gemstone: 'Đá ruby',
    certification: null,
    weight: '2.1g',
    size: null,
    isNewProduct: true,
    isBestSeller: false,
    isLimitedEdition: false,
    description: 'Khuyên tai bấm hình hoa anh đào, đính đá ruby nhỏ, vàng hồng 18K. Nữ tính, trẻ trung từ bộ sưu tập Mùa Xuân.',
    image: 'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=600&q=80',
    images: ['https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=600&q=80'],
    tags: ['khuyên tai', 'mùa xuân', 'ruby'],
  },
  // ── Vòng tay ──
  {
    name: 'Vòng Tay Kim Cương Tennis',
    price: 1800,
    originalPrice: 2100,
    collectionName: 'Vòng Tay Thanh Lịch',
    jewelleryType: 'Vòng tay vàng',
    category: 'Vòng tay',
    stock: 6,
    material: 'Vàng',
    goldType: 'Vàng trắng 18K',
    gemstone: 'Kim cương',
    certification: 'GIA',
    weight: '12g',
    size: ['16cm', '17cm', '18cm', '19cm'],
    isNewProduct: false,
    isBestSeller: true,
    isLimitedEdition: false,
    description: 'Vòng tennis classic với 32 viên kim cương E-VS1 tổng 2.0ct, vàng trắng 18K 4-prong setting. Biểu tượng của sự sang trọng.',
    image: 'https://images.unsplash.com/photo-1573408301185-9519f94816b5?w=600&q=80',
    images: ['https://images.unsplash.com/photo-1573408301185-9519f94816b5?w=600&q=80'],
    tags: ['vòng tay', 'tennis', 'kim cương', 'bestseller'],
  },
  {
    name: 'Vòng Tay Ngọc Trai Mùa Thu',
    price: 290,
    originalPrice: null,
    collectionName: 'Bộ Sưu Tập Mùa Thu',
    jewelleryType: 'Vòng tay',
    category: 'Vòng tay',
    stock: 18,
    material: 'Ngọc trai',
    goldType: 'Vàng 14K',
    gemstone: 'Ngọc trai',
    certification: null,
    weight: '5g',
    size: ['16cm', '17cm', '18cm'],
    isNewProduct: true,
    isBestSeller: false,
    isLimitedEdition: false,
    description: 'Vòng tay ngọc trai Freshwater 7mm màu kem golden, khóa toggle vàng 14K. Tinh tế như ánh nắng mùa thu.',
    image: 'https://images.unsplash.com/photo-1575377427642-087cf684f29d?w=600&q=80',
    images: ['https://images.unsplash.com/photo-1575377427642-087cf684f29d?w=600&q=80'],
    tags: ['vòng tay', 'ngọc trai', 'mùa thu'],
  },
  // ── Bộ trang sức ──
  {
    name: 'Bộ Trang Sức Cưới The Promise Set',
    price: 3800,
    originalPrice: 4500,
    collectionName: 'The Promise',
    jewelleryType: 'Bộ trang sức cưới',
    category: 'Bộ trang sức',
    stock: 3,
    material: 'Vàng',
    goldType: 'Vàng trắng 18K',
    gemstone: 'Kim cương',
    certification: 'GIA',
    weight: '18g',
    size: ['6', '7', '8'],
    isNewProduct: false,
    isBestSeller: false,
    isLimitedEdition: true,
    description: 'Bộ trang sức cưới đầy đủ gồm nhẫn đính hôn 1.0ct, nhẫn cưới đôi và dây chuyền kim cương. Vàng trắng 18K, GIA certified.',
    image: 'https://images.unsplash.com/photo-1606503153255-59d5e417e0df?w=600&q=80',
    images: ['https://images.unsplash.com/photo-1606503153255-59d5e417e0df?w=600&q=80'],
    tags: ['bộ trang sức', 'cưới', 'kim cương', 'limited'],
  },
  // ── Đồng hồ ──
  {
    name: 'Đồng Hồ Nữ Vỏ Vàng Hồng 34mm',
    price: 1650,
    originalPrice: 1900,
    collectionName: 'Đồng hồ',
    jewelleryType: 'Đồng hồ nữ',
    category: 'Đồng hồ',
    stock: 7,
    material: 'Vàng',
    goldType: 'Vàng hồng 18K',
    gemstone: 'Kim cương',
    certification: null,
    weight: '52g',
    size: null,
    isNewProduct: true,
    isBestSeller: false,
    isLimitedEdition: false,
    description: 'Đồng hồ nữ vỏ vàng hồng 34mm, bezel đính 60 viên kim cương nhỏ, mặt số xà cừ trắng. Máy Swiss automatic.',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80',
    images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80'],
    tags: ['đồng hồ', 'nữ', 'vàng hồng'],
  },
  // ── Quà tặng ──
  {
    name: 'Mặt Dây Chuyền Trái Tim Sapphire',
    price: 480,
    originalPrice: 580,
    collectionName: 'Quà Tặng Tình Yêu',
    jewelleryType: 'Dây chuyền',
    category: 'Dây chuyền',
    stock: 14,
    material: 'Vàng',
    goldType: 'Vàng 18K',
    gemstone: 'Đá sapphire',
    certification: 'HRD',
    weight: '2.8g',
    size: ['40cm', '45cm'],
    isNewProduct: false,
    isBestSeller: false,
    isLimitedEdition: false,
    description: 'Mặt dây chuyền trái tim đính đá sapphire xanh hoàng gia 1.2ct, viền kim cương pavé, dây vàng 18K 45cm.',
    image: 'https://images.unsplash.com/photo-1586325194227-7625ed4e2c7b?w=600&q=80',
    images: ['https://images.unsplash.com/photo-1586325194227-7625ed4e2c7b?w=600&q=80'],
    tags: ['mặt dây', 'sapphire', 'trái tim', 'quà tặng'],
  },
];

const COUPONS = [
  {
    code: 'WELCOME30',
    type: 'percent',
    value: 30,
    maxDiscount: 50,
    minOrderValue: 0,
    newCustomerOnly: true,
    description: 'Giảm 30% cho khách hàng đặt lần đầu (tối đa $50)',
    isActive: true,
    endDate: null,
  },
  {
    code: 'FREESHIP200',
    type: 'freeship',
    value: 3,
    minOrderValue: 200,
    newCustomerOnly: false,
    description: 'Miễn phí vận chuyển nhanh (+$3) cho đơn từ $200',
    isActive: true,
    endDate: null,
  },
  {
    code: 'ARUME10',
    type: 'percent',
    value: 10,
    maxDiscount: 20,
    minOrderValue: 50,
    newCustomerOnly: false,
    description: 'Giảm 10% cho đơn từ $50 (tối đa $20)',
    isActive: true,
    endDate: null,
  },
  {
    code: 'FLASH50',
    type: 'fixed',
    value: 50,
    minOrderValue: 300,
    newCustomerOnly: false,
    description: 'Giảm thẳng $50 cho đơn từ $300',
    isActive: true,
    endDate: null,
  },
];

// ─── SEED ─────────────────────────────────────────────────────────────────────

async function seed() {
  console.log('\n🌱 ARUME Seed Script\n' + '─'.repeat(40));

  await mongoose.connect(MONGO_URI);
  console.log('✅ Kết nối MongoDB thành công\n');

  // ── Admin ──
  console.log('👤 Tạo tài khoản admin...');
  let admin = await User.findOne({ email: ADMIN.email });
  if (admin) {
    if (!admin.isAdmin) { admin.isAdmin = true; await admin.save(); }
    console.log('   → Admin đã tồn tại, bỏ qua');
  } else {
    admin = await User.create(ADMIN);
    console.log('   → Tạo mới thành công');
  }

  // ── Products ──
  console.log('\n💎 Seed sản phẩm...');
  let productCreated = 0, productSkipped = 0;
  for (const p of PRODUCTS) {
    const exists = await Product.findOne({ name: p.name });
    if (exists) { productSkipped++; continue; }
    await Product.create(p);
    productCreated++;
  }
  console.log(`   → Tạo ${productCreated} sản phẩm, bỏ qua ${productSkipped} sản phẩm đã có`);

  // ── Coupons ──
  console.log('\n🏷  Seed mã giảm giá...');
  let couponCreated = 0, couponSkipped = 0;
  for (const c of COUPONS) {
    try {
      await Coupon.create(c);
      couponCreated++;
    } catch (e) {
      if (e.code === 11000) couponSkipped++;
      else throw e;
    }
  }
  console.log(`   → Tạo ${couponCreated} mã, bỏ qua ${couponSkipped} mã đã có`);

  // ── Summary ──
  const totalProducts = await Product.countDocuments();
  const totalCoupons = await Coupon.countDocuments();
  const totalUsers = await User.countDocuments();

  console.log('\n' + '─'.repeat(40));
  console.log('✨ Seed hoàn tất!\n');
  console.log(`   Sản phẩm : ${totalProducts}`);
  console.log(`   Mã giảm  : ${totalCoupons}`);
  console.log(`   Người dùng: ${totalUsers}`);
  console.log('\n📋 Tài khoản Admin:');
  console.log(`   Email    : admin@arume.com`);
  console.log(`   Password : adminpassword123`);
  console.log(`   URL Admin: http://localhost:5173/admin`);
  console.log('─'.repeat(40) + '\n');

  await mongoose.disconnect();
}

seed().catch(err => {
  console.error('❌ Lỗi:', err.message);
  process.exit(1);
});

import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, X, Save, AlertCircle, Tag, Package, Star, ChevronDown, ChevronUp, Image, Gem } from 'lucide-react';
import axios from 'axios';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../../api';



const EMPTY_FORM = {
  name: '',
  price: '',
  originalPrice: '',
  collectionName: '',
  jewelleryType: '',
  category: '',
  stock: '',
  image: '',
  images: '',
  description: '',
  material: '',
  goldType: '',
  size: '',
  weight: '',
  gemstone: '',
  certification: '',
  isNewProduct: false,
  isBestSeller: false,
  isLimitedEdition: false,
  tags: '',
};

// Cấu trúc danh mục: Bộ sưu tập → các loại trang sức
const COLLECTIONS = [
  {
    label: 'Bộ Sưu Tập Mùa Thu',
    value: 'Bộ Sưu Tập Mùa Thu',
    types: ['Nhẫn', 'Dây chuyền', 'Khuyên tai', 'Vòng tay', 'Bộ trang sức'],
  },
  {
    label: 'Bộ Sưu Tập Mùa Xuân',
    value: 'Bộ Sưu Tập Mùa Xuân',
    types: ['Nhẫn', 'Dây chuyền', 'Khuyên tai', 'Vòng tay', 'Bộ trang sức'],
  },
  {
    label: 'The Promise',
    value: 'The Promise',
    types: ['Nhẫn đính hôn', 'Nhẫn cưới', 'Dây chuyền', 'Bộ trang sức cưới'],
  },
  {
    label: 'The Sculpt',
    value: 'The Sculpt',
    types: ['Nhẫn điêu khắc', 'Khuyên tai', 'Vòng tay', 'Dây chuyền'],
  },
  {
    label: 'Ocean Whisper',
    value: 'Ocean Whisper',
    types: ['Nhẫn', 'Dây chuyền ngọc trai', 'Khuyên tai', 'Vòng tay'],
  },
  {
    label: 'Dây Chuyền Cổ Điển',
    value: 'Dây Chuyền Cổ Điển',
    types: ['Dây chuyền vàng', 'Dây chuyền bạc', 'Mặt dây chuyền'],
  },
  {
    label: 'Nhẫn Kim Cương',
    value: 'Nhẫn Kim Cương',
    types: ['Nhẫn solitaire', 'Nhẫn pavé', 'Nhẫn halo', 'Nhẫn ba viên'],
  },
  {
    label: 'Quà Tặng Tình Yêu',
    value: 'Quà Tặng Tình Yêu',
    types: ['Nhẫn', 'Dây chuyền', 'Vòng tay', 'Hộp quà'],
  },
  {
    label: 'Khuyên tai',
    value: 'Khuyên tai',
    types: ['Khuyên tai thả', 'Khuyên tai bấm', 'Khuyên tai vòng'],
  },
  {
    label: 'Vòng Tay Thanh Lịch',
    value: 'Vòng Tay Thanh Lịch',
    types: ['Vòng tay vàng', 'Vòng tay bạc', 'Vòng tay đá quý', 'Lắc tay'],
  },
  {
    label: 'Đồng hồ',
    value: 'Đồng hồ',
    types: ['Đồng hồ nam', 'Đồng hồ nữ', 'Đồng hồ đeo tay'],
  },
];

const GOLD_TYPES = ['Vàng 18K', 'Vàng 14K', 'Vàng 24K', 'Vàng trắng 18K', 'Vàng hồng 18K', 'Bạc 925', 'Bạch kim'];
const MATERIALS = ['Vàng', 'Bạc', 'Bạch kim', 'Kim cương', 'Ngọc trai', 'Đá ruby', 'Đá sapphire', 'Đá emerald'];
const CERTIFICATIONS = ['GIA', 'IGI', 'HRD', 'SJC', 'DOJI', 'PNJ'];

// Section trong form (collapsible)
const FormSection = ({ title, icon, children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          {icon}
          {title}
        </div>
        {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>
      {open && <div className="p-4 space-y-4">{children}</div>}
    </div>
  );
};

const Label = ({ children, required }) => (
  <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5 text-gray-500">
    {children} {required && <span className="text-red-500">*</span>}
  </label>
);

const Input = ({ ...props }) => (
  <input
    {...props}
    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all bg-white"
  />
);

const Select = ({ children, ...props }) => (
  <select
    {...props}
    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all bg-white"
  >
    {children}
  </select>
);

export const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCollection, setFilterCollection] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  const fetchProducts = () => {
    setLoading(true);
    getProducts()
      .then(res => { setProducts(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchProducts(); }, []);

  // Khi đổi bộ sưu tập, reset jewelleryType
  const handleCollectionChange = (val) => {
    const cat = COLLECTIONS.find(c => c.value === val);
    setForm(f => ({
      ...f,
      collectionName: val,
      jewelleryType: '',
      category: val, // category = tên collection để tương thích ngược
    }));
  };

  const handleJewelleryTypeChange = (val) => {
    setForm(f => ({
      ...f,
      jewelleryType: val,
      category: f.collectionName ? `${f.collectionName} - ${val}` : val,
    }));
  };

  const openAdd = () => {
    setEditProduct(null);
    setForm(EMPTY_FORM);
    setError('');
    setShowModal(true);
  };

  const openEdit = (product) => {
    setEditProduct(product);
    setForm({
      name: product.name || '',
      price: product.price || '',
      originalPrice: product.originalPrice || '',
      collectionName: product.collectionName || '',
      jewelleryType: product.jewelleryType || '',
      category: product.category || '',
      stock: product.stock || '',
      image: product.image || '',
      images: (product.images || []).join(', '),
      description: product.description || '',
      material: product.material || '',
      goldType: product.goldType || '',
      size: (product.size || []).join(', '),
      weight: product.weight || '',
      gemstone: product.gemstone || '',
      certification: product.certification || '',
      isNewProduct: product.isNewProduct || false,
      isBestSeller: product.isBestSeller || false,
      isLimitedEdition: product.isLimitedEdition || false,
      tags: (product.tags || []).join(', '),
    });
    setError('');
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...form,
        price: parseFloat(form.price),
        originalPrice: form.originalPrice ? parseFloat(form.originalPrice) : undefined,
        stock: parseInt(form.stock),
        size: form.size ? form.size.split(',').map(s => s.trim()).filter(Boolean) : [],
        images: form.images ? form.images.split(',').map(s => s.trim()).filter(Boolean) : [],
        tags: form.tags ? form.tags.split(',').map(s => s.trim()).filter(Boolean) : [],
      };
      if (editProduct) {
        await updateProduct(editProduct._id, payload);
      } else {
        await createProduct(payload);
      }
      setShowModal(false);
      fetchProducts();
    } catch (err) {
      setError(err.response?.data?.message || 'Lưu thất bại, vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteProduct(id);
      setProducts(prev => prev.filter(p => p._id !== id));
      setDeleteConfirm(null);
    } catch {
      alert('Xóa thất bại!');
    }
  };

  const filtered = products.filter(p => {
    const matchSearch = search === '' ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.category || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.collectionName || '').toLowerCase().includes(search.toLowerCase());
    const matchCollection = filterCollection === '' ||
      (p.collectionName || '') === filterCollection ||
      (p.category || '') === filterCollection ||
      (p.category || '').includes(filterCollection);
    return matchSearch && matchCollection;
  });

  const selectedCollection = COLLECTIONS.find(c => c.value === form.collectionName);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 min-h-[500px]">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Quản lý Sản phẩm
            <span className="ml-2 text-sm font-normal text-gray-400">({products.length} sản phẩm)</span>
          </h2>
          <button onClick={openAdd} className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-gray-800 transition-colors">
            <Plus size={18} /> Thêm sản phẩm
          </button>
        </div>

        {/* Search + Filter */}
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Tìm kiếm sản phẩm..."
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-black"
            />
          </div>
          <select
            value={filterCollection}
            onChange={e => setFilterCollection(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-black bg-white min-w-[180px]"
          >
            <option value="">Tất cả bộ sưu tập</option>
            {COLLECTIONS.map(c => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-[10px] uppercase tracking-wider">
              <th className="p-4 font-semibold">Sản phẩm</th>
              <th className="p-4 font-semibold">Bộ sưu tập</th>
              <th className="p-4 font-semibold">Loại</th>
              <th className="p-4 font-semibold">Giá</th>
              <th className="p-4 font-semibold">Tồn kho</th>
              <th className="p-4 font-semibold">Badges</th>
              <th className="p-4 font-semibold text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan="7" className="p-8 text-center text-gray-400">Đang tải dữ liệu...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan="7" className="p-8 text-center text-gray-400">Không có sản phẩm nào.</td></tr>
            ) : filtered.map((product) => (
              <tr key={product._id} className="hover:bg-gray-50 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-14 rounded-lg bg-[#F4F2EE] flex-shrink-0 overflow-hidden">
                      {product.image
                        ? <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center"><Package size={16} className="text-gray-300" /></div>
                      }
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 line-clamp-1">{product.name}</p>
                      {product.material && <p className="text-[10px] text-gray-400 mt-0.5">{product.material}{product.goldType ? ` · ${product.goldType}` : ''}</p>}
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <span className="text-xs text-[#C9A96E] font-medium">{product.collectionName || product.category || '—'}</span>
                </td>
                <td className="p-4 text-xs text-gray-500">{product.jewelleryType || '—'}</td>
                <td className="p-4">
                  <div>
                    <span className="font-serif italic text-gray-900">${product.price?.toFixed(2)}</span>
                    {product.originalPrice > product.price && (
                      <p className="text-[10px] text-gray-400 line-through">${product.originalPrice?.toFixed(2)}</p>
                    )}
                  </div>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${product.stock > 5 ? 'bg-green-100 text-green-700' : product.stock > 0 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                    {product.stock > 0 ? `${product.stock} sp` : 'Hết'}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex flex-wrap gap-1">
                    {product.isNewProduct && <span className="text-[9px] bg-black text-white px-1.5 py-0.5 rounded-sm font-bold">MỚI</span>}
                    {product.isBestSeller && <span className="text-[9px] bg-[#C9A96E] text-white px-1.5 py-0.5 rounded-sm font-bold">HOT</span>}
                    {product.isLimitedEdition && <span className="text-[9px] bg-purple-600 text-white px-1.5 py-0.5 rounded-sm font-bold">LIMITED</span>}
                  </div>
                </td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => openEdit(product)} className="p-2 text-gray-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50">
                      <Edit2 size={15} />
                    </button>
                    <button onClick={() => setDeleteConfirm(product)} className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ─── Modal Thêm/Sửa ─────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl my-8">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white rounded-t-2xl z-10">
              <div>
                <h3 className="text-lg font-semibold">{editProduct ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}</h3>
                <p className="text-xs text-gray-400 mt-0.5">{editProduct ? editProduct.name : 'Điền đầy đủ thông tin bên dưới'}</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-lg transition-colors">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              {error && (
                <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-100 p-3 rounded-lg text-sm">
                  <AlertCircle size={16} className="flex-shrink-0" /> {error}
                </div>
              )}

              {/* ── Phần 1: Thông tin cơ bản ── */}
              <FormSection title="Thông tin cơ bản" icon={<Package size={15} className="text-gray-400" />}>
                <div>
                  <Label required>Tên sản phẩm</Label>
                  <Input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                    placeholder="Ví dụ: Nhẫn Kim Cương Solitaire Eternal" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label required>Giá bán ($)</Label>
                    <Input required type="number" step="0.01" min="0" value={form.price}
                      onChange={e => setForm({ ...form, price: e.target.value })} placeholder="0.00" />
                  </div>
                  <div>
                    <Label>Giá gốc ($) <span className="normal-case text-[9px] text-gray-400 font-normal">(nếu có sale)</span></Label>
                    <Input type="number" step="0.01" min="0" value={form.originalPrice}
                      onChange={e => setForm({ ...form, originalPrice: e.target.value })} placeholder="0.00" />
                  </div>
                </div>

                <div>
                  <Label required>Tồn kho (số lượng)</Label>
                  <Input required type="number" min="0" value={form.stock}
                    onChange={e => setForm({ ...form, stock: e.target.value })} placeholder="0" />
                </div>

                <div>
                  <Label>Mô tả</Label>
                  <textarea rows={3} value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    placeholder="Mô tả chi tiết về sản phẩm, điểm đặc biệt, câu chuyện..."
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-black resize-none"
                  />
                </div>
              </FormSection>

              {/* ── Phần 2: Danh mục ── */}
              <FormSection title="Danh mục & Phân loại" icon={<Tag size={15} className="text-gray-400" />}>
                <div>
                  <Label>Bộ sưu tập</Label>
                  <Select value={form.collectionName} onChange={e => handleCollectionChange(e.target.value)}>
                    <option value="">-- Chọn bộ sưu tập --</option>
                    {COLLECTIONS.map(c => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </Select>
                </div>

                {selectedCollection && (
                  <div>
                    <Label>Loại trang sức trong bộ sưu tập</Label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {selectedCollection.types.map(type => (
                        <button
                          type="button"
                          key={type}
                          onClick={() => handleJewelleryTypeChange(type)}
                          className={`px-3 py-1.5 text-xs font-medium border rounded-full transition-all ${form.jewelleryType === type
                              ? 'bg-black text-white border-black'
                              : 'border-gray-300 text-gray-600 hover:border-black hover:text-black'
                            }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Danh mục text tổng hợp (đọc only) */}
                {form.category && (
                  <div>
                    <Label>Danh mục đã chọn</Label>
                    <div className="px-3 py-2 bg-[#F9F7F2] border border-[#C9A96E]/30 rounded-lg text-xs text-[#C9A96E] font-medium">
                      {form.category}
                    </div>
                  </div>
                )}
              </FormSection>

              {/* ── Phần 3: Chất liệu & Đặc tính ── */}
              <FormSection title="Chất liệu & Đặc tính" icon={<Gem size={15} className="text-gray-400" />}>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Chất liệu chính</Label>
                    <Select value={form.material} onChange={e => setForm({ ...form, material: e.target.value })}>
                      <option value="">-- Chọn --</option>
                      {MATERIALS.map(m => <option key={m} value={m}>{m}</option>)}
                      <option value="Khác">Khác</option>
                    </Select>
                  </div>
                  <div>
                    <Label>Loại vàng</Label>
                    <Select value={form.goldType} onChange={e => setForm({ ...form, goldType: e.target.value })}>
                      <option value="">-- Chọn --</option>
                      {GOLD_TYPES.map(g => <option key={g} value={g}>{g}</option>)}
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Đá quý</Label>
                    <Input value={form.gemstone} onChange={e => setForm({ ...form, gemstone: e.target.value })}
                      placeholder="Kim cương, Ruby, Ngọc trai..." />
                  </div>
                  <div>
                    <Label>Trọng lượng</Label>
                    <Input value={form.weight} onChange={e => setForm({ ...form, weight: e.target.value })}
                      placeholder="Ví dụ: 3.5g" />
                  </div>
                </div>

                <div>
                  <Label>Kích thước / Size <span className="normal-case text-[9px] text-gray-400 font-normal">(cách nhau bằng dấu phẩy)</span></Label>
                  <Input value={form.size} onChange={e => setForm({ ...form, size: e.target.value })}
                    placeholder="Ví dụ: 6, 7, 8, 9, 10 hoặc S, M, L, XL" />
                </div>

                <div>
                  <Label>Chứng nhận</Label>
                  <Select value={form.certification} onChange={e => setForm({ ...form, certification: e.target.value })}>
                    <option value="">-- Chứng nhận --</option>
                    {CERTIFICATIONS.map(c => <option key={c} value={c}>{c}</option>)}
                  </Select>
                </div>
              </FormSection>

              {/* ── Phần 4: Hình ảnh ── */}
              <FormSection title="Hình ảnh" icon={<Image size={15} className="text-gray-400" />}>
                <div>
                  <Label>Ảnh chính (URL)</Label>
                  <Input value={form.image} onChange={e => setForm({ ...form, image: e.target.value })}
                    placeholder="https://..." />
                  {form.image && (
                    <div className="mt-2 w-20 h-24 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                      <img src={form.image} alt="preview" className="w-full h-full object-cover"
                        onError={e => e.target.style.display = 'none'} />
                    </div>
                  )}
                </div>
                <div>
                  <Label>Ảnh phụ <span className="normal-case text-[9px] text-gray-400 font-normal">(URL, cách nhau bằng dấu phẩy)</span></Label>
                  <textarea rows={2} value={form.images}
                    onChange={e => setForm({ ...form, images: e.target.value })}
                    placeholder="https://img1.com, https://img2.com, https://img3.com"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-black resize-none"
                  />
                </div>
              </FormSection>

              {/* ── Phần 5: Nhãn & Badge ── */}
              <FormSection title="Nhãn & Trạng thái" icon={<Star size={15} className="text-gray-400" />} defaultOpen={false}>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { key: 'isNewProduct', label: 'Sản phẩm Mới', color: 'bg-black text-white', badge: 'NEW' },
                    { key: 'isBestSeller', label: 'Bán chạy', color: 'bg-[#C9A96E] text-white', badge: 'HOT' },
                    { key: 'isLimitedEdition', label: 'Giới hạn', color: 'bg-purple-600 text-white', badge: 'LIMITED' },
                  ].map(({ key, label, color, badge }) => (
                    <label key={key}
                      className={`flex flex-col items-center justify-center gap-2 p-3 border-2 rounded-xl cursor-pointer transition-all ${form[key] ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}>
                      <input type="checkbox" className="hidden" checked={form[key]}
                        onChange={e => setForm({ ...form, [key]: e.target.checked })} />
                      <span className={`text-[9px] font-black px-2 py-1 rounded-sm ${color}`}>{badge}</span>
                      <span className="text-[10px] text-gray-600 text-center font-medium">{label}</span>
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${form[key] ? 'border-black bg-black' : 'border-gray-300'}`}>
                        {form[key] && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                    </label>
                  ))}
                </div>

                <div>
                  <Label>Tags <span className="normal-case text-[9px] text-gray-400 font-normal">(cách nhau bằng dấu phẩy)</span></Label>
                  <Input value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })}
                    placeholder="quà tặng, tình yêu, sinh nhật, đính hôn..." />
                </div>
              </FormSection>

              {/* Buttons */}
              <div className="flex gap-3 pt-2 sticky bottom-0 bg-white pb-1">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
                  Hủy
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 bg-black text-white px-4 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors disabled:opacity-50">
                  <Save size={16} /> {saving ? 'Đang lưu...' : editProduct ? 'Cập nhật' : 'Thêm sản phẩm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Xác nhận xóa */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={24} className="text-red-600" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Xóa sản phẩm?</h3>
            <p className="text-gray-500 text-sm mb-6">
              Bạn có chắc muốn xóa <strong>"{deleteConfirm.name}"</strong>?<br />
              <span className="text-red-400 text-xs">Hành động này không thể hoàn tác.</span>
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">Hủy</button>
              <button onClick={() => handleDelete(deleteConfirm._id)} className="flex-1 bg-red-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-red-700 transition-colors">Xóa</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

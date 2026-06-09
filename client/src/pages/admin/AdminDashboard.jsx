import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  DollarSign, Package, ShoppingCart, Users,
  ArrowUpRight, BarChart2, Clock, CheckCircle, XCircle,
  Truck, TrendingUp, TrendingDown, FileText, Download,
  Star, Tag, RefreshCw, AlertTriangle, Percent, Award,
  CreditCard, MapPin, Calendar, ChevronDown
} from 'lucide-react';
import { getAllOrders, getProducts, getUsers } from '../../api';

// ─── Colour palette ───────────────────────────────────────────────────────────
const C = {
  gold: '#C9A96E', goldDark: '#a07d4a',
  emerald: '#10b981', blue: '#3b82f6',
  amber: '#f59e0b', red: '#ef4444',
  purple: '#8b5cf6', pink: '#ec4899',
  gray: '#6b7280',
};

// ─── SVG Bar Chart ────────────────────────────────────────────────────────────
const BarChart = ({ data, color = '#111', label = '' }) => {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data.map(d => d.value), 1);
  const W = 520, H = 150, PADL = 52, PADR = 16, PADT = 20, PADB = 36;
  const chartW = W - PADL - PADR;
  const bW = Math.floor(chartW / data.length) - 6;
  const labelStep = data.length > 8 ? 2 : 1;
  return (
    <svg viewBox={`0 0 ${W} ${PADT + H + PADB}`} className="w-full" style={{ overflow: 'visible' }}>
      {[0, 0.25, 0.5, 0.75, 1].map(t => {
        const y = PADT + (1 - t) * H;
        const val = max * t;
        return (
          <g key={t}>
            <line x1={PADL} x2={W - PADR} y1={y} y2={y} stroke="#f0f0f0" strokeWidth="1" strokeDasharray={t > 0 ? '4 4' : ''} />
            <text x={PADL - 6} y={y + 4} textAnchor="end" fontSize="8" fill="#bbb">
              {label === '$' ? (val >= 1000 ? `$${(val/1000).toFixed(0)}k` : `$${Math.round(val)}`) : Math.round(val)}
            </text>
          </g>
        );
      })}
      {data.map((d, i) => {
        const bH = Math.max((d.value / max) * H, 2);
        const x = PADL + i * (chartW / data.length) + 3;
        const y = PADT + H - bH;
        return (
          <g key={i}>
            <rect x={x} y={PADT} width={bW} height={H} fill="#f9f9f9" rx="3" />
            <rect x={x} y={y} width={bW} height={bH} fill={color} rx="3" opacity="0.9" />
            {(i % labelStep === 0 || i === data.length - 1) && (
              <text x={x + bW / 2} y={PADT + H + 18} textAnchor="middle" fontSize="9" fill="#999">{d.label}</text>
            )}
            {d.value > 0 && (
              <text x={x + bW / 2} y={y - 5} textAnchor="middle" fontSize="8" fill="#555" fontWeight="600">
                {d.value >= 1000 ? `${(d.value/1000).toFixed(1)}k` : d.value}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
};

// ─── SVG Line Chart ───────────────────────────────────────────────────────────
const LineChart = ({ data, color = '#C9A96E', label = '' }) => {
  if (!data || data.length < 2) return null;
  const nonZero = data.filter(d => d.value > 0);
  const max = Math.max(...data.map(d => d.value), 1);
  const W = 520, H = 150, PADL = 52, PADR = 16, PADT = 20, PADB = 36;
  const chartW = W - PADL - PADR;
  const pts = data.map((d, i) => {
    const x = PADL + (i / (data.length - 1)) * chartW;
    const y = PADT + (1 - d.value / max) * H;
    return { x, y, ...d };
  });
  const polyline = pts.map(p => `${p.x},${p.y}`).join(' ');
  const area = `M ${pts[0].x} ${PADT + H} L ${pts.map(p => `${p.x} ${p.y}`).join(' L ')} L ${pts[pts.length - 1].x} ${PADT + H} Z`;
  // Skip some labels when there are many points to avoid overlap
  const labelStep = data.length > 8 ? 2 : 1;
  return (
    <svg viewBox={`0 0 ${W} ${PADT + H + PADB}`} className="w-full" style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id="lgFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.15" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 0.25, 0.5, 0.75, 1].map(t => {
        const y = PADT + (1 - t) * H;
        const val = max * t;
        return (
          <g key={t}>
            <line x1={PADL} x2={W - PADR} y1={y} y2={y} stroke="#f0f0f0" strokeWidth="1" strokeDasharray={t > 0 ? '4 4' : ''} />
            <text x={PADL - 6} y={y + 4} textAnchor="end" fontSize="8" fill="#bbb">
              {label === '$'
                ? (val >= 1000000 ? `$${(val/1000000).toFixed(1)}M` : val >= 1000 ? `$${(val/1000).toFixed(0)}k` : `$${Math.round(val)}`)
                : Math.round(val)}
            </text>
          </g>
        );
      })}
      <path d={area} fill="url(#lgFill)" />
      <polyline points={polyline} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      {pts.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="4" fill="white" stroke={color} strokeWidth="2" />
          {p.value > 0 && (
            <text x={p.x} y={p.y - 10} textAnchor="middle" fontSize="8" fill="#555" fontWeight="600">
              {label === '$'
                ? (p.value >= 1000000 ? `$${(p.value/1000000).toFixed(1)}M` : p.value >= 1000 ? `$${(p.value/1000).toFixed(0)}k` : `$${Math.round(p.value)}`)
                : p.value}
            </text>
          )}
          {(i % labelStep === 0 || i === data.length - 1) && (
            <text x={p.x} y={PADT + H + 18} textAnchor="middle" fontSize="9" fill="#999">{p.label}</text>
          )}
        </g>
      ))}
    </svg>
  );
};

// ─── Donut Chart ──────────────────────────────────────────────────────────────
const DonutChart = ({ slices, centerLabel, centerSub }) => {
  const total = slices.reduce((s, x) => s + x.value, 0);
  if (total === 0) return (
    <div className="w-36 h-36 rounded-full border-[14px] border-gray-100 flex items-center justify-center text-xs text-gray-400">Trống</div>
  );
  let cum = 0;
  const R = 44, cx = 56, cy = 56, sw = 24;
  const paths = slices.map((s, i) => {
    const pct = s.value / total;
    const start = cum * 2 * Math.PI - Math.PI / 2;
    cum += pct;
    const end = cum * 2 * Math.PI - Math.PI / 2;
    const x1 = cx + R * Math.cos(start), y1 = cy + R * Math.sin(start);
    const x2 = cx + R * Math.cos(end), y2 = cy + R * Math.sin(end);
    const large = pct > 0.5 ? 1 : 0;
    return <path key={i} d={`M ${x1} ${y1} A ${R} ${R} 0 ${large} 1 ${x2} ${y2}`}
      fill="none" stroke={s.color} strokeWidth={sw} strokeLinecap="butt" />;
  });
  return (
    <svg viewBox="0 0 112 112" className="w-36 h-36">
      <circle cx={cx} cy={cy} r={R} fill="none" stroke="#f3f4f6" strokeWidth={sw} />
      {paths}
      <text x={cx} y={cy - 6} textAnchor="middle" fontSize="14" fontWeight="bold" fill="#111">{centerLabel}</text>
      <text x={cx} y={cy + 10} textAnchor="middle" fontSize="8" fill="#999">{centerSub}</text>
    </svg>
  );
};

// ─── Sparkline (tiny) ─────────────────────────────────────────────────────────
const Sparkline = ({ data, color }) => {
  if (!data || data.length < 2) return null;
  const max = Math.max(...data, 1);
  const W = 80, H = 28;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * W},${H - (v / max) * H}`).join(' ');
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" opacity="0.7" />
    </svg>
  );
};

// ─── KPI Card ─────────────────────────────────────────────────────────────────
const KpiCard = ({ title, value, sub, icon, bg, iconColor, trend, sparkData, sparkColor, loading }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow group">
    <div className="flex items-start justify-between mb-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bg}`}>
        <span className={iconColor}>{icon}</span>
      </div>
      {sparkData && <Sparkline data={sparkData} color={sparkColor || '#C9A96E'} />}
    </div>
    <div className="text-2xl font-bold text-gray-900 mb-0.5">
      {loading ? <span className="animate-pulse bg-gray-200 rounded inline-block w-20 h-7" /> : value}
    </div>
    <div className="text-xs text-gray-500 font-medium mb-1">{title}</div>
    <div className="flex items-center gap-1">
      {trend !== undefined && (
        trend >= 0
          ? <TrendingUp size={11} className="text-emerald-500" />
          : <TrendingDown size={11} className="text-red-400" />
      )}
      <span className={`text-[11px] ${trend >= 0 ? 'text-emerald-600' : 'text-red-400'}`}>
        {sub}
      </span>
    </div>
  </div>
);

// ─── Section title ────────────────────────────────────────────────────────────
const Section = ({ title, sub, children, action, className = '' }) => (
  <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden ${className}`}>
    <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
      <div>
        <h3 className="font-semibold text-gray-800 text-sm">{title}</h3>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
      {action}
    </div>
    {children}
  </div>
);

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtMoney = v => `$${(v || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmtPct = (a, b) => b > 0 ? `${((a / b) * 100).toFixed(1)}%` : '0%';

const statusColor = s => {
  if (s === 'Đã giao') return 'bg-emerald-100 text-emerald-700';
  if (s === 'Đang giao') return 'bg-blue-100 text-blue-700';
  if (s === 'Đã hủy') return 'bg-red-100 text-red-700';
  if (s === 'Đã xác nhận') return 'bg-purple-100 text-purple-700';
  return 'bg-amber-100 text-amber-700';
};

const monthRange = (n) => {
  const out = [];
  for (let i = n - 1; i >= 0; i--) {
    const now = new Date();
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    out.push({ month: d.getMonth(), year: d.getFullYear(), label: d.toLocaleDateString('vi-VN', { month: 'short', year: '2-digit' }) });
  }
  return out;
};

// ─── Vietnamese normalizer (full tone + vowel mapping) ────────────────────────
const vn = (str) => {
  if (!str && str !== 0) return '';
  return String(str)
    .replace(/[àáâãäåāăąǎ]/gi, m => /[ÀÁÂÃÄÅĀĂĄǍ]/.test(m) ? 'A' : 'a')
    .replace(/[èéêëēĕęě]/gi, m => /[ÈÉÊËĒĔĘĚ]/.test(m) ? 'E' : 'e')
    .replace(/[ìíîïīĭįǐ]/gi, m => /[ÌÍÎÏĪĬĮǏ]/.test(m) ? 'I' : 'i')
    .replace(/[òóôõöøōŏőǒ]/gi, m => /[ÒÓÔÕÖØŌŎŐǑ]/.test(m) ? 'O' : 'o')
    .replace(/[ùúûüūŭůűǔ]/gi, m => /[ÙÚÛÜŪŬŮŰǓ]/.test(m) ? 'U' : 'u')
    .replace(/[ýÿ]/gi, m => /[ÝŸ]/.test(m) ? 'Y' : 'y')
    // Vietnamese specific
    .replace(/[ắặằẳẵăấậầẩẫâáàảãạ]/g, 'a').replace(/[ẮẶẰẲẴĂẤẬẦẨẪÂÁÀẢÃẠ]/g, 'A')
    .replace(/[ếệềểễêéèẻẽẹ]/g, 'e').replace(/[ẾỆỀỂỄÊÉÈẺẼẸ]/g, 'E')
    .replace(/[ốộồổỗôớợờởỡơíìỉĩị]/g, m => 'ioou'.includes(m) ? m : /[ốộồổỗô]/.test(m) ? 'o' : /[ớợờởỡơ]/.test(m) ? 'o' : 'i')
    .replace(/[ỐỘỒỔỖÔỚỢỜỞỠƠ]/g, 'O')
    .replace(/[ÍÌỈĨỊ]/g, 'I')
    .replace(/[ứựừửữưúùủũụ]/g, 'u').replace(/[ỨỰỪỬỮƯÚÙỦŨỤ]/g, 'U')
    .replace(/[ýỳỷỹỵ]/g, 'y').replace(/[ÝỲỶỸỴ]/g, 'Y')
    .replace(/[đ]/g, 'd').replace(/[Đ]/g, 'D')
    // Catch-all: replace remaining non-ASCII with closest ASCII via NFD decomposition
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\x00-\x7F]/g, '?');
};

// ─── PDF Generator (client-side, no backend) ──────────────────────────────────
const generatePDF = async (periodOrders, monthly, topProducts, allOrders, products, users, period, chartPeriod) => {
  const { jsPDF } = await import('jspdf');
  await import('jspdf-autotable');
  const autoTable = (doc, options) => doc.autoTable(options);

  // ── Compute stats for the selected period only ──────────────────────────
  const delivered = periodOrders.filter(o => o.status === 'Đã giao');
  const revenue = delivered.reduce((s, o) => s + (o.totalPrice || 0), 0);
  const stats = {
    revenue,
    total: periodOrders.length,
    delivered: delivered.length,
    pending: periodOrders.filter(o => o.status === 'Đang xử lý').length,
    shipping: periodOrders.filter(o => o.status === 'Đang giao').length,
    cancelled: periodOrders.filter(o => o.status === 'Đã hủy').length,
    aov: delivered.length ? revenue / delivered.length : 0,
    totalDiscount: periodOrders.filter(o => o.discountAmount > 0 || o.shippingDiscount > 0)
      .reduce((s, o) => s + (o.discountAmount || 0) + (o.shippingDiscount || 0), 0),
    discountOrders: periodOrders.filter(o => o.discountAmount > 0 || o.shippingDiscount > 0).length,
    cancelledRevenue: periodOrders.filter(o => o.status === 'Đã hủy').reduce((s, o) => s + (o.totalPrice || 0), 0),
    paymentMethods: (() => {
      const pm = {};
      periodOrders.forEach(o => {
        const k = o.paymentMethod || 'cod';
        if (!pm[k]) pm[k] = { count: 0, revenue: 0 };
        pm[k].count++;
        if (o.status === 'Đã giao') pm[k].revenue += (o.totalPrice || 0);
      });
      return pm;
    })(),
    provinces: (() => {
      const pv = {};
      periodOrders.forEach(o => {
        const k = o.shippingAddress?.province || 'Khac';
        if (!pv[k]) pv[k] = { count: 0, revenue: 0 };
        pv[k].count++;
        if (o.status === 'Đã giao') pv[k].revenue += (o.totalPrice || 0);
      });
      return pv;
    })(),
    topBuyer: (() => {
      const m = {};
      periodOrders.forEach(o => {
        const uid = o.user?._id || o.user; if (!uid) return;
        if (!m[uid]) m[uid] = { name: o.user?.name || 'Khach', orders: 0, total: 0 };
        m[uid].orders++;
        if (o.status === 'Đã giao') m[uid].total += (o.totalPrice || 0);
      });
      return Object.values(m).sort((a, b) => b.orders - a.orders)[0];
    })(),
    topSpender: (() => {
      const m = {};
      periodOrders.forEach(o => {
        const uid = o.user?._id || o.user; if (!uid) return;
        if (!m[uid]) m[uid] = { name: o.user?.name || 'Khach', orders: 0, total: 0 };
        m[uid].orders++;
        if (o.status === 'Đã giao') m[uid].total += (o.totalPrice || 0);
      });
      return Object.values(m).sort((a, b) => b.total - a.total)[0];
    })(),
    usersWithOrders: new Set(periodOrders.map(o => o.user?._id || o.user).filter(Boolean)).size,
    newUsers: users.filter(u => {
      const d = new Date(u.createdAt);
      const cutoff = new Date(); cutoff.setMonth(cutoff.getMonth() - chartPeriod);
      return d >= cutoff;
    }).length,
  };

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();
  const now = new Date();
  const genDate = now.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  // ── Colour helpers ──
  const gold = [201, 169, 110];
  const dark = [30, 30, 30];
  const mid = [100, 100, 100];
  const light = [240, 240, 240];
  const white = [255, 255, 255];

  // ── Cover header ──────────────────────────────────────────────────────────
  doc.setFillColor(...gold);
  doc.rect(0, 0, W, 42, 'F');
  doc.setFillColor(160, 125, 74);
  doc.rect(0, 38, W, 4, 'F');

  doc.setTextColor(...white);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('ARUME', 14, 16);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Jewelry & Accessories', 14, 23);

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('BAO CAO THONG KE CHI TIET', W - 14, 14, { align: 'right' });
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(vn(`Ky bao cao: ${period}`), W - 14, 21, { align: 'right' });
  doc.text(vn(`Tao luc: ${genDate}`), W - 14, 27, { align: 'right' });

  let y = 52;

  // ── Section helper ────────────────────────────────────────────────────────
  const sectionTitle = (title, yPos) => {
    doc.setFillColor(...gold);
    doc.roundedRect(14, yPos, W - 28, 8, 1, 1, 'F');
    doc.setTextColor(...white);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(title.toUpperCase(), 18, yPos + 5.5);
    doc.setTextColor(...dark);
    return yPos + 13;
  };

  const kpiBox = (label, value, x, bY, bW) => {
    doc.setFillColor(248, 247, 244);
    doc.roundedRect(x, bY, bW, 18, 2, 2, 'F');
    doc.setDrawColor(...light);
    doc.roundedRect(x, bY, bW, 18, 2, 2, 'S');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(...dark);
    doc.text(String(value), x + bW / 2, bY + 10, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...mid);
    doc.text(label, x + bW / 2, bY + 15.5, { align: 'center' });
  };

  // ── 1. Tong quan ─────────────────────────────────────────────────────────
  y = sectionTitle('1. TONG QUAN KINH DOANH', y);

  const bW = (W - 28 - 9) / 4;
  const boxes = [
    ['Doanh Thu', fmtMoney(stats.revenue)],
    ['Don Hang', stats.total],
    ['San Pham', products.length],
    ['Khach Hang', users.length],
  ];
  boxes.forEach((b, i) => kpiBox(b[0], b[1], 14 + i * (bW + 3), y, bW));
  y += 24;

  const bW2 = (W - 28 - 9) / 4;
  const boxes2 = [
    ['Da Giao', stats.delivered],
    ['Dang Giao', stats.shipping],
    ['Cho XL', stats.pending],
    ['Da Huy', stats.cancelled],
  ];
  boxes2.forEach((b, i) => kpiBox(b[0], b[1], 14 + i * (bW2 + 3), y, bW2));
  y += 26;

  // ── 2. Chi tiet tai chinh ─────────────────────────────────────────────────
  y = sectionTitle('2. CHI TIET TAI CHINH', y);

  const finData = [
    ['Chi tieu', 'Gia tri', 'Ghi chu'],
    ['Tong doanh thu (da giao)', fmtMoney(stats.revenue), `${stats.delivered} don thanh cong`],
    ['Doanh thu TB / don (AOV)', fmtMoney(stats.aov), 'Average Order Value'],
    ['Giam gia da cap', fmtMoney(stats.totalDiscount), `${stats.discountOrders} don co coupon`],
    ['Giam gia TB / don', fmtMoney(stats.discountOrders ? stats.totalDiscount / stats.discountOrders : 0), ''],
    ['Don hang bi huy', `${stats.cancelled} don`, fmtMoney(stats.cancelledRevenue) + ' mat di'],
    ['Ti le huy don', fmtPct(stats.cancelled, stats.total), 'Cancellation rate'],
    ['Ti le giao thanh cong', fmtPct(stats.delivered, stats.total), 'Delivery rate'],
  ];

  autoTable(doc, {
    startY: y,
    head: [finData[0].map(vn)],
    body: finData.slice(1).map(row => row.map(vn)),
    margin: { left: 14, right: 14 },
    styles: { fontSize: 8.5, cellPadding: 3 },
    headStyles: { fillColor: dark, textColor: white, fontStyle: 'bold', fontSize: 8 },
    alternateRowStyles: { fillColor: [250, 249, 247] },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 80 }, 1: { cellWidth: 50 }, 2: { cellWidth: 'auto' } },
  });
  y = doc.lastAutoTable.finalY + 10;

  // ── 3. Doanh thu theo thang ───────────────────────────────────────────────
  if (y > 230) { doc.addPage(); y = 20; }
  y = sectionTitle('3. DOANH THU THEO THANG', y);

  const monthlyRows = monthly.map(m => [
    vn(m.label), m.orders, fmtMoney(m.revenue),
    fmtMoney(m.orders > 0 ? m.revenue / m.orders : 0),
    m.cancelled,
    fmtPct(m.delivered, m.orders),
  ]);
  autoTable(doc, {
    startY: y,
    head: [['Thang', 'So don', 'Doanh thu', 'AOV', 'Huy', 'Ti le giao']],
    body: monthlyRows,
    margin: { left: 14, right: 14 },
    styles: { fontSize: 8.5, cellPadding: 3, halign: 'center' },
    headStyles: { fillColor: dark, textColor: white, fontStyle: 'bold', fontSize: 8 },
    alternateRowStyles: { fillColor: [250, 249, 247] },
    columnStyles: { 0: { halign: 'left' }, 2: { fontStyle: 'bold' } },
  });
  y = doc.lastAutoTable.finalY + 10;

  // ── 4. Top san pham ───────────────────────────────────────────────────────
  if (y > 220) { doc.addPage(); y = 20; }
  y = sectionTitle('4. TOP SAN PHAM BAN CHAY', y);

  const topRows = topProducts.slice(0, 10).map((p, i) => [
    i + 1,
    vn(p.name.length > 35 ? p.name.slice(0, 35) + '...' : p.name),
    vn(p.category || '-'), fmtMoney(p.price), p.sold, fmtMoney(p.revenue),
    p.stock, p.stock <= 5 ? 'Sap het' : 'OK',
  ]);
  autoTable(doc, {
    startY: y,
    head: [['#', 'Ten san pham', 'Loai', 'Gia', 'Da ban', 'Doanh thu', 'Ton kho', 'Trang thai']],
    body: topRows,
    margin: { left: 14, right: 14 },
    styles: { fontSize: 7.5, cellPadding: 2.5 },
    headStyles: { fillColor: dark, textColor: white, fontStyle: 'bold', fontSize: 7.5 },
    alternateRowStyles: { fillColor: [250, 249, 247] },
    columnStyles: { 0: { cellWidth: 8, halign: 'center' }, 4: { halign: 'center' }, 5: { fontStyle: 'bold' }, 6: { halign: 'center' }, 7: { halign: 'center' } },
    didParseCell: (data) => {
      if (data.column.index === 7 && data.row.index >= 0 && data.section === 'body') {
        const v = data.cell.raw;
        if (v && v.includes('Sap')) { data.cell.styles.textColor = [220, 60, 60]; data.cell.styles.fontStyle = 'bold'; }
        else { data.cell.styles.textColor = [16, 185, 129]; }
      }
    },
  });
  y = doc.lastAutoTable.finalY + 10;

  // ── 5. Phuong thuc thanh toan ─────────────────────────────────────────────
  if (y > 220) { doc.addPage(); y = 20; }
  y = sectionTitle('5. PHUONG THUC THANH TOAN & PHAN PHOI DON HANG', y);

  const pmRows = Object.entries(stats.paymentMethods).map(([k, v]) => [
    k === 'cod' ? 'Tien mat (COD)' : k === 'momo' ? 'MoMo' : k === 'bank' ? 'Chuyen khoan' : k,
    v.count, fmtMoney(v.revenue), fmtPct(v.count, stats.total),
  ]);
  autoTable(doc, {
    startY: y,
    head: [['Phuong thuc', 'So don', 'Doanh thu', 'Ti le']],
    body: pmRows,
    margin: { left: 14, right: 14 },
    styles: { fontSize: 8.5, cellPadding: 3 },
    headStyles: { fillColor: dark, textColor: white, fontStyle: 'bold', fontSize: 8 },
    alternateRowStyles: { fillColor: [250, 249, 247] },
    tableWidth: (W - 28) / 2 - 3,
  });

  const prvRows = Object.entries(stats.provinces).slice(0, 8).map(([k, v]) => [
    vn(k || 'Khac'), v.count, fmtMoney(v.revenue), fmtPct(v.count, stats.total),
  ]);
  autoTable(doc, {
    startY: y,
    head: [['Tinh / Thanh pho', 'Don', 'Doanh thu', 'Ti le']],
    body: prvRows,
    margin: { left: 14 + (W - 28) / 2 + 3, right: 14 },
    styles: { fontSize: 8.5, cellPadding: 3 },
    headStyles: { fillColor: [80, 80, 80], textColor: white, fontStyle: 'bold', fontSize: 8 },
    alternateRowStyles: { fillColor: [250, 249, 247] },
    tableWidth: (W - 28) / 2 - 3,
  });
  y = Math.max(doc.lastAutoTable.finalY + 10, doc.lastAutoTable.finalY + 10);

  // ── 6. Khach hang ─────────────────────────────────────────────────────────
  if (y > 220) { doc.addPage(); y = 20; }
  y = sectionTitle('6. THONG KE KHACH HANG', y);

  const cRows = [
    ['Tong khach hang', users.length, ''],
    [`Khach hang moi (${chartPeriod} thang)`, stats.newUsers, ''],
    ['Khach co don hang', stats.usersWithOrders, fmtPct(stats.usersWithOrders, users.length)],
    ['Khach mua nhieu nhat', vn(stats.topBuyer?.name || '-'), `${stats.topBuyer?.orders || 0} don`],
    ['Khach chi tieu nhieu nhat', vn(stats.topSpender?.name || '-'), fmtMoney(stats.topSpender?.total || 0)],
  ];
  autoTable(doc, {
    startY: y,
    head: [['Chi tieu', 'Gia tri', 'Ghi chu']],
    body: cRows,
    margin: { left: 14, right: 14 },
    styles: { fontSize: 8.5, cellPadding: 3 },
    headStyles: { fillColor: dark, textColor: white, fontStyle: 'bold', fontSize: 8 },
    alternateRowStyles: { fillColor: [250, 249, 247] },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 80 } },
  });
  y = doc.lastAutoTable.finalY + 10;

  // ── Footer on each page ───────────────────────────────────────────────────
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    const pH = doc.internal.pageSize.getHeight();
    doc.setFillColor(...light);
    doc.rect(0, pH - 12, W, 12, 'F');
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...mid);
    doc.text('ARUME Jewelry - Bao cao noi bo, khong phan phoi', 14, pH - 4.5);
    doc.text(`Trang ${i} / ${totalPages}`, W - 14, pH - 4.5, { align: 'right' });
  }

  const filename = `ARUME_BaoCao_${now.toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
};

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export const AdminDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartMode, setChartMode] = useState('revenue');
  const [chartPeriod, setChartPeriod] = useState(6);
  const [exporting, setExporting] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([getAllOrders(), getProducts(), getUsers()])
      .then(([o, p, u]) => { setOrders(o.data); setProducts(p.data); setUsers(u.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  // ── Stats ──────────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const delivered = orders.filter(o => o.status === 'Đã giao');
    const revenue = delivered.reduce((s, o) => s + (o.totalPrice || 0), 0);
    const pending = orders.filter(o => o.status === 'Đang xử lý').length;
    const shipping = orders.filter(o => o.status === 'Đang giao').length;
    const cancelled = orders.filter(o => o.status === 'Đã hủy').length;
    const confirmed = orders.filter(o => o.status === 'Đã xác nhận').length;
    const lowStock = products.filter(p => p.stock <= 5).length;
    const outOfStock = products.filter(p => p.stock === 0).length;

    const now = new Date();
    const newUsers = users.filter(u => {
      const d = new Date(u.createdAt);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;

    const thisMonth = orders.filter(o => {
      const d = new Date(o.createdAt);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    const lastMonthOrders = orders.filter(o => {
      const d = new Date(o.createdAt);
      const lm = new Date(); lm.setMonth(lm.getMonth() - 1);
      return d.getMonth() === lm.getMonth() && d.getFullYear() === lm.getFullYear();
    });
    const thisMonthRevenue = thisMonth.filter(o => o.status === 'Đã giao').reduce((s, o) => s + (o.totalPrice || 0), 0);
    const lastMonthRevenue = lastMonthOrders.filter(o => o.status === 'Đã giao').reduce((s, o) => s + (o.totalPrice || 0), 0);

    // Discount stats
    const discountOrders = orders.filter(o => o.discountAmount > 0 || o.shippingDiscount > 0);
    const totalDiscount = discountOrders.reduce((s, o) => s + (o.discountAmount || 0) + (o.shippingDiscount || 0), 0);

    // Cancelled revenue loss
    const cancelledRevenue = orders.filter(o => o.status === 'Đã hủy').reduce((s, o) => s + (o.totalPrice || 0), 0);

    // Payment methods
    const paymentMethods = {};
    orders.forEach(o => {
      const pm = o.paymentMethod || 'cod';
      if (!paymentMethods[pm]) paymentMethods[pm] = { count: 0, revenue: 0 };
      paymentMethods[pm].count++;
      if (o.status === 'Đã giao') paymentMethods[pm].revenue += (o.totalPrice || 0);
    });

    // Provinces
    const provinces = {};
    orders.forEach(o => {
      const pv = o.shippingAddress?.province || 'Khác';
      if (!provinces[pv]) provinces[pv] = { count: 0, revenue: 0 };
      provinces[pv].count++;
      if (o.status === 'Đã giao') provinces[pv].revenue += (o.totalPrice || 0);
    });

    // User order stats
    const userOrderMap = {};
    orders.forEach(o => {
      const uid = o.user?._id || o.user;
      if (!uid) return;
      const uname = o.user?.name || 'Khách';
      if (!userOrderMap[uid]) userOrderMap[uid] = { name: uname, orders: 0, total: 0 };
      userOrderMap[uid].orders++;
      if (o.status === 'Đã giao') userOrderMap[uid].total += (o.totalPrice || 0);
    });
    const userList = Object.values(userOrderMap);
    const topBuyer = userList.sort((a, b) => b.orders - a.orders)[0];
    const topSpender = userList.sort((a, b) => b.total - a.total)[0];
    const usersWithOrders = Object.keys(userOrderMap).length;

    const aov = delivered.length ? revenue / delivered.length : 0;

    // Category breakdown
    const categories = {};
    orders.forEach(o => (o.items || []).forEach(item => {
      const prod = products.find(p => p._id === (item.product?._id || item.product));
      const cat = prod?.category || 'Khác';
      if (!categories[cat]) categories[cat] = { count: 0, revenue: 0 };
      categories[cat].count += item.quantity || 1;
      if (o.status === 'Đã giao') categories[cat].revenue += (item.price || 0) * (item.quantity || 1);
    }));

    return {
      revenue, total: orders.length, delivered: delivered.length,
      pending, shipping, cancelled, confirmed, lowStock, outOfStock,
      users: users.length, newUsers, aov,
      thisMonthRevenue, lastMonthRevenue,
      revenueTrend: lastMonthRevenue > 0 ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0,
      discountOrders: discountOrders.length, totalDiscount, cancelledRevenue,
      paymentMethods, provinces, categories,
      topBuyer, topSpender, usersWithOrders,
    };
  }, [orders, products, users]);

  // ── Monthly data ───────────────────────────────────────────────────────────
  const monthly = useMemo(() => {
    return monthRange(chartPeriod).map(m => {
      const mo = orders.filter(o => {
        const d = new Date(o.createdAt);
        return d.getMonth() === m.month && d.getFullYear() === m.year;
      });
      const del = mo.filter(o => o.status === 'Đã giao');
      const can = mo.filter(o => o.status === 'Đã hủy');
      return {
        label: m.label,
        orders: mo.length,
        revenue: del.reduce((s, o) => s + (o.totalPrice || 0), 0),
        delivered: del.length,
        cancelled: can.length,
      };
    });
  }, [orders, chartPeriod]);

  // ── Top products ───────────────────────────────────────────────────────────
  const topProducts = useMemo(() => {
    const count = {}, rev = {};
    orders.forEach(o => (o.items || []).forEach(item => {
      const id = item.product?._id || item.product;
      if (!id) return;
      count[id] = (count[id] || 0) + (item.quantity || 1);
      if (o.status === 'Đã giao') rev[id] = (rev[id] || 0) + (item.price || 0) * (item.quantity || 1);
    }));
    return products
      .map(p => ({ ...p, sold: count[p._id] || 0, revenue: rev[p._id] || 0 }))
      .sort((a, b) => b.sold - a.sold);
  }, [orders, products]);

  // ── Sparklines (daily 14d) ─────────────────────────────────────────────────
  const sparklines = useMemo(() => {
    const days = Array.from({ length: 14 }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (13 - i));
      return { y: d.getFullYear(), m: d.getMonth(), d: d.getDate() };
    });
    const rev = days.map(day =>
      orders.filter(o => { const d = new Date(o.createdAt); return d.getFullYear() === day.y && d.getMonth() === day.m && d.getDate() === day.d && o.status === 'Đã giao'; })
        .reduce((s, o) => s + (o.totalPrice || 0), 0)
    );
    const ord = days.map(day =>
      orders.filter(o => { const d = new Date(o.createdAt); return d.getFullYear() === day.y && d.getMonth() === day.m && d.getDate() === day.d; }).length
    );
    return { rev, ord };
  }, [orders]);

  // ── Export ─────────────────────────────────────────────────────────────────
  const handleExport = async () => {
    setExporting(true);
    try {
      // Filter orders to the selected period
      const cutoff = new Date();
      cutoff.setDate(1);
      cutoff.setMonth(cutoff.getMonth() - (chartPeriod - 1));
      cutoff.setHours(0, 0, 0, 0);
      const periodOrders = orders.filter(o => new Date(o.createdAt) >= cutoff);
      const periodLabel = chartPeriod === 1 ? 'Thang nay' : `${chartPeriod} thang gan nhat`;
      await generatePDF(periodOrders, monthly, topProducts, orders, products, users, periodLabel, chartPeriod);
    } catch (e) { console.error(e); alert('Loi xuat PDF: ' + e.message); }
    setExporting(false);
  };

  const TABS = [
    { id: 'overview', label: 'Tổng quan' },
    { id: 'revenue', label: 'Doanh thu' },
    { id: 'products', label: 'Sản phẩm' },
    { id: 'customers', label: 'Khách hàng' },
  ];

  return (
    <div className="space-y-5">

      {/* ── Header bar ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Dashboard</h2>
          <p className="text-xs text-gray-400 mt-0.5">Cập nhật lúc {new Date().toLocaleTimeString('vi-VN')}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load} disabled={loading} className="flex items-center gap-1.5 px-3 py-2 text-xs border border-gray-200 rounded-xl text-gray-500 hover:text-black transition-colors">
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Làm mới
          </button>
          <button
            onClick={handleExport}
            disabled={exporting || loading}
            className="flex items-center gap-2 px-4 py-2 bg-[#C9A96E] text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-[#a07d4a] transition-colors disabled:opacity-60 shadow-sm"
          >
            {exporting ? <RefreshCw size={13} className="animate-spin" /> : <Download size={13} />}
            {exporting ? 'Đang xuất...' : 'Xuất báo cáo PDF'}
          </button>
        </div>
      </div>

      {/* ── Tabs ───────────────────────────────────────────────────────────── */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-all ${activeTab === t.id ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-black'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* TAB: TỔNG QUAN                                                      */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'overview' && (
        <>
          {/* KPI row 1 */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard title="Tổng Doanh Thu" icon={<DollarSign size={20} />} bg="bg-emerald-50" iconColor="text-emerald-600"
              value={loading ? null : fmtMoney(stats.revenue)}
              sub={`${stats.delivered} đơn thành công`}
              trend={stats.revenueTrend}
              sparkData={sparklines.rev} sparkColor={C.emerald} loading={loading} />
            <KpiCard title="Đơn Hàng" icon={<ShoppingCart size={20} />} bg="bg-blue-50" iconColor="text-blue-600"
              value={loading ? null : stats.total}
              sub={`${stats.pending} chờ xử lý`}
              trend={0}
              sparkData={sparklines.ord} sparkColor={C.blue} loading={loading} />
            <KpiCard title="AOV (Trung bình / đơn)" icon={<TrendingUp size={20} />} bg="bg-gold-50 bg-amber-50" iconColor="text-[#C9A96E]"
              value={loading ? null : fmtMoney(stats.aov)}
              sub="Average Order Value"
              trend={0} loading={loading} />
            <KpiCard title="Khách Hàng" icon={<Users size={20} />} bg="bg-purple-50" iconColor="text-purple-600"
              value={loading ? null : stats.users}
              sub={`+${stats.newUsers} mới tháng này`}
              trend={stats.newUsers > 0 ? 1 : 0} loading={loading} />
          </div>

          {/* Status quick row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Chờ xử lý', v: stats.pending, icon: <Clock size={15} />, bg: 'bg-amber-50', color: 'text-amber-600' },
              { label: 'Đang giao', v: stats.shipping, icon: <Truck size={15} />, bg: 'bg-blue-50', color: 'text-blue-600' },
              { label: 'Đã giao', v: stats.delivered, icon: <CheckCircle size={15} />, bg: 'bg-emerald-50', color: 'text-emerald-600' },
              { label: 'Đã hủy', v: stats.cancelled, icon: <XCircle size={15} />, bg: 'bg-red-50', color: 'text-red-500' },
            ].map((s, i) => (
              <div key={i} className={`${s.bg} rounded-2xl p-4 flex items-center gap-3`}>
                <div className={`w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-sm ${s.color}`}>{s.icon}</div>
                <div>
                  <div className={`text-2xl font-bold ${s.color}`}>{loading ? '–' : s.v}</div>
                  <div className="text-xs text-gray-500">{s.label}</div>
                  <div className="text-[11px] text-gray-400">{stats.total > 0 ? fmtPct(s.v, stats.total) : '0%'}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Chart + Donut */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2">
            <Section title="Biểu đồ thống kê" sub="Dựa trên dữ liệu thực tế"
              action={
                <div className="flex items-center gap-2">
                  <select value={chartPeriod} onChange={e => setChartPeriod(+e.target.value)}
                    className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none">
                    <option value={3}>3 tháng</option>
                    <option value={6}>6 tháng</option>
                    <option value={12}>12 tháng</option>
                  </select>
                  <div className="flex gap-1 bg-gray-100 rounded-lg p-0.5">
                    {['revenue', 'orders'].map(m => (
                      <button key={m} onClick={() => setChartMode(m)}
                        className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${chartMode === m ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-black'}`}>
                        {m === 'revenue' ? 'Doanh thu' : 'Đơn hàng'}
                      </button>
                    ))}
                  </div>
                </div>
              }
              className="col-span-2">
              <div className="p-5 col-span-2">
                {loading ? <div className="h-44 animate-pulse bg-gray-50 rounded-xl" /> :
                  chartMode === 'revenue'
                    ? <LineChart data={monthly.map(m => ({ label: m.label, value: m.revenue }))} color={C.emerald} label="$" />
                    : <BarChart data={monthly.map(m => ({ label: m.label, value: m.orders }))} color={C.blue} />
                }
              </div>
            </Section>
            </div>

            <Section title="Trạng thái đơn hàng">
              <div className="p-5 flex flex-col items-center gap-4">
                {loading ? <div className="h-36 w-36 animate-pulse bg-gray-100 rounded-full" /> : (
                  <>
                    <DonutChart
                      centerLabel={stats.total}
                      centerSub="đơn hàng"
                      slices={[
                        { label: 'Đã giao', value: stats.delivered, color: C.emerald },
                        { label: 'Đang giao', value: stats.shipping, color: C.blue },
                        { label: 'Chờ xử lý', value: stats.pending, color: C.amber },
                        { label: 'Đã hủy', value: stats.cancelled, color: C.red },
                      ]}
                    />
                    <div className="w-full space-y-2">
                      {[
                        { label: 'Đã giao', value: stats.delivered, color: 'bg-emerald-500' },
                        { label: 'Đang giao', value: stats.shipping, color: 'bg-blue-500' },
                        { label: 'Chờ xử lý', value: stats.pending, color: 'bg-amber-400' },
                        { label: 'Đã hủy', value: stats.cancelled, color: 'bg-red-400' },
                      ].map((s, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`w-2.5 h-2.5 rounded-full ${s.color}`} />
                            <span className="text-xs text-gray-600">{s.label}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-gray-900">{s.value}</span>
                            <span className="text-[11px] text-gray-400 w-10 text-right">{fmtPct(s.value, stats.total)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </Section>
          </div>

          {/* Recent orders + top products */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2">
            <Section title="Đơn hàng gần đây" action={<a href="/admin/orders" className="flex items-center gap-1 text-xs text-blue-600 hover:underline">Xem tất cả <ArrowUpRight size={12} /></a>}>
              <div className="overflow-x-auto">
                {loading ? <div className="p-8 animate-pulse text-center text-gray-300">Đang tải...</div> :
                  orders.length === 0 ? <div className="p-10 text-center text-gray-400 text-sm">Chưa có đơn hàng</div> :
                    <table className="w-full text-left">
                      <thead><tr className="bg-gray-50 text-gray-400 text-[11px] uppercase tracking-wider">
                        <th className="p-3">Mã ĐH</th><th className="p-3">Khách</th><th className="p-3">Tiền</th><th className="p-3">Trạng thái</th>
                      </tr></thead>
                      <tbody className="divide-y divide-gray-50">
                        {orders.slice(0, 6).map(o => (
                          <tr key={o._id} className="hover:bg-gray-50 transition-colors">
                            <td className="p-3 font-mono text-xs font-bold text-gray-700">#{o._id.slice(-6).toUpperCase()}</td>
                            <td className="p-3 text-xs text-gray-600 max-w-[80px] truncate">{o.user?.name || 'Khách'}</td>
                            <td className="p-3 text-xs font-bold">{fmtMoney(o.totalPrice)}</td>
                            <td className="p-3"><span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${statusColor(o.status)}`}>{o.status || 'Xử lý'}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                }
              </div>
            </Section>
            </div>

            <Section title="Top sản phẩm bán chạy" action={<BarChart2 size={15} className="text-gray-300" />}>
              <div className="p-5 space-y-4">
                {loading ? <div className="animate-pulse space-y-4">{[1,2,3,4,5].map(i => <div key={i} className="h-10 bg-gray-100 rounded-lg" />)}</div> :
                  topProducts.slice(0, 5).map((p, idx) => {
                    const maxSold = Math.max(...topProducts.slice(0,5).map(x => x.sold), 1);
                    return (
                      <div key={p._id}>
                        <div className="flex items-center gap-2 mb-1.5">
                          <div className="w-8 h-8 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                            <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-gray-900 truncate">{p.name}</p>
                            <p className="text-[11px] text-gray-400">{p.sold} bán · {fmtMoney(p.revenue)}</p>
                          </div>
                          <span className="text-[11px] font-bold text-gray-300">#{idx+1}</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-[#C9A96E] rounded-full" style={{ width: `${(p.sold / maxSold) * 100}%` }} />
                        </div>
                      </div>
                    );
                  })
                }
              </div>
            </Section>
          </div>
        </>
      )}

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* TAB: DOANH THU                                                      */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'revenue' && (
        <>
          {/* KPI tài chính */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: 'Tổng doanh thu', value: fmtMoney(stats.revenue), sub: `${stats.delivered} đơn đã giao`, icon: <DollarSign size={18} />, bg: 'bg-emerald-50', color: 'text-emerald-600' },
              { title: 'Trung bình / đơn (AOV)', value: fmtMoney(stats.aov), sub: 'Average Order Value', icon: <TrendingUp size={18} />, bg: 'bg-blue-50', color: 'text-blue-600' },
              { title: 'Tổng giảm giá', value: fmtMoney(stats.totalDiscount), sub: `${stats.discountOrders} đơn có coupon`, icon: <Tag size={18} />, bg: 'bg-amber-50', color: 'text-amber-600' },
              { title: 'Doanh thu mất (huỷ)', value: fmtMoney(stats.cancelledRevenue), sub: `${stats.cancelled} đơn đã huỷ`, icon: <XCircle size={18} />, bg: 'bg-red-50', color: 'text-red-500' },
            ].map((c, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className={`w-9 h-9 rounded-xl ${c.bg} flex items-center justify-center mb-3 ${c.color}`}>{c.icon}</div>
                <div className="text-xl font-bold text-gray-900">{loading ? '…' : c.value}</div>
                <div className="text-xs text-gray-500 mt-0.5">{c.title}</div>
                <div className="text-[11px] text-gray-400 mt-0.5">{c.sub}</div>
              </div>
            ))}
          </div>

          {/* Monthly table */}
          <Section title={`Doanh thu ${chartPeriod} tháng gần nhất`}
            action={
              <select value={chartPeriod} onChange={e => setChartPeriod(+e.target.value)}
                className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none">
                <option value={3}>3 tháng</option><option value={6}>6 tháng</option><option value={12}>12 tháng</option>
              </select>
            }>
            <div className="px-5 pt-4 pb-2">
              {loading ? <div className="h-44 animate-pulse bg-gray-50 rounded-xl" /> :
                <LineChart data={monthly.map(m => ({ label: m.label, value: m.revenue }))} color={C.emerald} label="$" />
              }
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead><tr className="bg-gray-50 text-gray-400 uppercase tracking-wider">
                  {['Tháng', 'Tổng đơn', 'Đã giao', 'Đã huỷ', 'Doanh thu', 'AOV', 'Tỉ lệ giao'].map(h => (
                    <th key={h} className="px-4 py-3 font-medium">{h}</th>
                  ))}
                </tr></thead>
                <tbody className="divide-y divide-gray-50">
                  {monthly.map((m, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-semibold text-gray-700">{m.label}</td>
                      <td className="px-4 py-3 text-gray-600">{m.orders}</td>
                      <td className="px-4 py-3 text-emerald-600 font-medium">{m.delivered}</td>
                      <td className="px-4 py-3 text-red-400">{m.cancelled}</td>
                      <td className="px-4 py-3 font-bold text-gray-900">{fmtMoney(m.revenue)}</td>
                      <td className="px-4 py-3 text-gray-600">{fmtMoney(m.orders > 0 ? m.revenue / m.orders : 0)}</td>
                      <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${m.orders > 0 && m.delivered / m.orders > 0.7 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{fmtPct(m.delivered, m.orders)}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          {/* Payment methods + Provinces */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <Section title="Phương thức thanh toán" sub="Doanh thu theo từng kênh">
              <div className="p-5 space-y-3">
                {Object.entries(stats.paymentMethods || {}).sort((a,b)=>b[1].revenue-a[1].revenue).map(([pm, d]) => {
                  const labels = { cod: 'Tiền mặt (COD)', momo: 'MoMo', bank: 'Chuyển khoản', ewallet: 'Ví điện tử' };
                  const maxRev = Math.max(...Object.values(stats.paymentMethods).map(x=>x.revenue),1);
                  return (
                    <div key={pm}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <CreditCard size={13} className="text-[#C9A96E]" />
                          <span className="text-xs font-medium text-gray-700">{labels[pm] || pm}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-bold text-gray-900">{fmtMoney(d.revenue)}</span>
                          <span className="text-[11px] text-gray-400 ml-2">({d.count} đơn)</span>
                        </div>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#C9A96E] rounded-full" style={{ width: `${(d.revenue/maxRev)*100}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Section>

            <Section title="Phân phối theo tỉnh/thành" sub="Top 8 khu vực">
              <div className="p-5 space-y-3">
                {Object.entries(stats.provinces || {}).sort((a,b)=>b[1].count-a[1].count).slice(0,8).map(([pv, d]) => {
                  const maxC = Math.max(...Object.values(stats.provinces).map(x=>x.count),1);
                  return (
                    <div key={pv}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <MapPin size={13} className="text-blue-400" />
                          <span className="text-xs font-medium text-gray-700">{pv}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-bold text-gray-900">{d.count} đơn</span>
                          <span className="text-[11px] text-gray-400 ml-2">{fmtPct(d.count, stats.total)}</span>
                        </div>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-400 rounded-full" style={{ width: `${(d.count/maxC)*100}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Section>
          </div>
        </>
      )}

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* TAB: SẢN PHẨM                                                       */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'products' && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: 'Tổng sản phẩm', value: products.length, sub: 'Đang trong kho', icon: <Package size={18} />, bg: 'bg-blue-50', color: 'text-blue-600' },
              { title: 'Sắp hết hàng', value: stats.lowStock, sub: 'Tồn kho ≤ 5', icon: <AlertTriangle size={18} />, bg: 'bg-amber-50', color: 'text-amber-600' },
              { title: 'Hết hàng', value: stats.outOfStock, sub: 'Cần nhập thêm', icon: <XCircle size={18} />, bg: 'bg-red-50', color: 'text-red-500' },
              { title: 'SP có doanh thu', value: topProducts.filter(p=>p.sold>0).length, sub: 'Đã bán ít nhất 1', icon: <Award size={18} />, bg: 'bg-emerald-50', color: 'text-emerald-600' },
            ].map((c, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className={`w-9 h-9 rounded-xl ${c.bg} flex items-center justify-center mb-3 ${c.color}`}>{c.icon}</div>
                <div className="text-2xl font-bold text-gray-900">{loading ? '…' : c.value}</div>
                <div className="text-xs text-gray-500 mt-0.5">{c.title}</div>
                <div className="text-[11px] text-gray-400 mt-0.5">{c.sub}</div>
              </div>
            ))}
          </div>

          {/* Category breakdown */}
          <Section title="Doanh thu theo danh mục" sub="Tất cả danh mục">
            <div className="p-5 space-y-3">
              {Object.entries(stats.categories || {}).sort((a,b)=>b[1].revenue-a[1].revenue).map(([cat, d]) => {
                const maxR = Math.max(...Object.values(stats.categories).map(x=>x.revenue),1);
                return (
                  <div key={cat}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-gray-700">{cat}</span>
                      <div>
                        <span className="text-xs font-bold text-gray-900">{fmtMoney(d.revenue)}</span>
                        <span className="text-[11px] text-gray-400 ml-2">({d.count} sp bán)</span>
                      </div>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#C9A96E] rounded-full" style={{ width: `${(d.revenue/maxR)*100}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </Section>

          {/* Full product table */}
          <Section title="Bảng sản phẩm chi tiết" sub={`${topProducts.length} sản phẩm`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead><tr className="bg-gray-50 text-gray-400 uppercase tracking-wider">
                  {['#', 'Sản phẩm', 'Danh mục', 'Giá', 'Đã bán', 'Doanh thu', 'Tồn kho', 'Trạng thái'].map(h=>(
                    <th key={h} className="px-4 py-3 font-medium">{h}</th>
                  ))}
                </tr></thead>
                <tbody className="divide-y divide-gray-50">
                  {topProducts.map((p, idx) => (
                    <tr key={p._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-400 font-bold">#{idx+1}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                            <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                          </div>
                          <span className="font-medium text-gray-900 max-w-[160px] truncate">{p.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{p.category || '—'}</td>
                      <td className="px-4 py-3 font-semibold">{fmtMoney(p.price)}</td>
                      <td className="px-4 py-3 text-center font-bold text-gray-700">{p.sold}</td>
                      <td className="px-4 py-3 font-bold text-emerald-600">{fmtMoney(p.revenue)}</td>
                      <td className="px-4 py-3 text-center">{p.stock}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${p.stock === 0 ? 'bg-red-100 text-red-600' : p.stock <= 5 ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>
                          {p.stock === 0 ? 'Hết hàng' : p.stock <= 5 ? 'Sắp hết' : 'Còn hàng'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>
        </>
      )}

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* TAB: KHÁCH HÀNG                                                     */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'customers' && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: 'Tổng khách hàng', value: stats.users, sub: 'Đã đăng ký', icon: <Users size={18} />, bg: 'bg-blue-50', color: 'text-blue-600' },
              { title: 'Mới tháng này', value: stats.newUsers, sub: 'Đăng ký gần đây', icon: <TrendingUp size={18} />, bg: 'bg-emerald-50', color: 'text-emerald-600' },
              { title: 'Đã mua hàng', value: stats.usersWithOrders, sub: fmtPct(stats.usersWithOrders, stats.users), icon: <ShoppingCart size={18} />, bg: 'bg-amber-50', color: 'text-amber-600' },
              { title: 'Tỉ lệ mua hàng', value: fmtPct(stats.usersWithOrders, stats.users), sub: 'Purchase rate', icon: <Percent size={18} />, bg: 'bg-purple-50', color: 'text-purple-600' },
            ].map((c, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className={`w-9 h-9 rounded-xl ${c.bg} flex items-center justify-center mb-3 ${c.color}`}>{c.icon}</div>
                <div className="text-2xl font-bold text-gray-900">{loading ? '…' : c.value}</div>
                <div className="text-xs text-gray-500 mt-0.5">{c.title}</div>
                <div className="text-[11px] text-gray-400 mt-0.5">{c.sub}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <Section title="Khách mua nhiều nhất" sub="Top 10 theo số đơn">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead><tr className="bg-gray-50 text-gray-400 uppercase tracking-wider">
                    <th className="px-4 py-3">#</th><th className="px-4 py-3">Khách hàng</th><th className="px-4 py-3">Đơn hàng</th><th className="px-4 py-3">Chi tiêu</th>
                  </tr></thead>
                  <tbody className="divide-y divide-gray-50">
                    {(() => {
                      const userMap = {};
                      orders.forEach(o => {
                        const uid = o.user?._id || o.user;
                        if (!uid) return;
                        if (!userMap[uid]) userMap[uid] = { name: o.user?.name || 'Khách', orders: 0, total: 0 };
                        userMap[uid].orders++;
                        if (o.status === 'Đã giao') userMap[uid].total += (o.totalPrice || 0);
                      });
                      return Object.values(userMap).sort((a,b)=>b.orders-a.orders).slice(0,10).map((u,i)=>(
                        <tr key={i} className="hover:bg-gray-50">
                          <td className="px-4 py-2.5 text-gray-400 font-bold">#{i+1}</td>
                          <td className="px-4 py-2.5">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-[#C9A96E]/20 flex items-center justify-center text-[10px] font-bold text-[#C9A96E] uppercase">{u.name[0]}</div>
                              <span className="font-medium text-gray-900">{u.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-2.5 font-bold text-blue-600">{u.orders}</td>
                          <td className="px-4 py-2.5 font-bold text-emerald-600">{fmtMoney(u.total)}</td>
                        </tr>
                      ));
                    })()}
                  </tbody>
                </table>
              </div>
            </Section>

            <Section title="Khách chi tiêu nhiều nhất" sub="Top 10 theo doanh thu">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead><tr className="bg-gray-50 text-gray-400 uppercase tracking-wider">
                    <th className="px-4 py-3">#</th><th className="px-4 py-3">Khách hàng</th><th className="px-4 py-3">Chi tiêu</th><th className="px-4 py-3">Đơn hàng</th>
                  </tr></thead>
                  <tbody className="divide-y divide-gray-50">
                    {(() => {
                      const userMap = {};
                      orders.forEach(o => {
                        const uid = o.user?._id || o.user;
                        if (!uid) return;
                        if (!userMap[uid]) userMap[uid] = { name: o.user?.name || 'Khách', orders: 0, total: 0 };
                        userMap[uid].orders++;
                        if (o.status === 'Đã giao') userMap[uid].total += (o.totalPrice || 0);
                      });
                      return Object.values(userMap).sort((a,b)=>b.total-a.total).slice(0,10).map((u,i)=>(
                        <tr key={i} className="hover:bg-gray-50">
                          <td className="px-4 py-2.5 text-gray-400 font-bold">#{i+1}</td>
                          <td className="px-4 py-2.5">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-[#C9A96E]/20 flex items-center justify-center text-[10px] font-bold text-[#C9A96E] uppercase">{u.name[0]}</div>
                              <span className="font-medium text-gray-900">{u.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-2.5 font-bold text-emerald-600">{fmtMoney(u.total)}</td>
                          <td className="px-4 py-2.5 font-bold text-blue-600">{u.orders}</td>
                        </tr>
                      ));
                    })()}
                  </tbody>
                </table>
              </div>
            </Section>
          </div>
        </>
      )}

    </div>
  );
};
// Dashboard - Tổng quan chi tiêu cá nhân
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
  HiOutlineArrowTrendingUp,
  HiOutlineArrowTrendingDown,
  HiOutlineBanknotes,
  HiOutlineCreditCard,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineArrowRight,
} from 'react-icons/hi2';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';

const formatVND = (amount) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);

const MONTHS = [
  'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
  'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12',
];

const formatDateVN = (dateStr) => {
  const d = new Date(dateStr);
  const day = d.getDate();
  const month = d.getMonth() + 1;
  const year = d.getFullYear();
  const weekdays = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
  const weekday = weekdays[d.getDay()];
  return `${weekday}, ${day}/${month}/${year}`;
};

/* Skeleton loader components */
const SkeletonCard = () => (
  <div className="rounded-2xl p-5 animate-pulse bg-gray-200 h-[120px]" />
);

const SkeletonChart = () => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 animate-pulse">
    <div className="h-5 bg-gray-200 rounded w-48 mb-4" />
    <div className="h-[300px] bg-gray-100 rounded-xl" />
  </div>
);

const SkeletonTransaction = () => (
  <div className="flex items-center justify-between py-3 animate-pulse">
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 bg-gray-200 rounded-xl" />
      <div>
        <div className="h-4 bg-gray-200 rounded w-32 mb-2" />
        <div className="h-3 bg-gray-100 rounded w-48" />
      </div>
    </div>
    <div className="h-4 bg-gray-200 rounded w-24" />
  </div>
);

const Dashboard = () => {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    fetchData();
  }, [month, year]);

  useEffect(() => {
    if (!loading && data) {
      const timer = setTimeout(() => setVisible(true), 50);
      return () => clearTimeout(timer);
    }
    setVisible(false);
  }, [loading, data]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/dashboard?month=${month}&year=${year}`);
      setData(res.data);
    } catch (err) {
      toast.error('Không thể tải dữ liệu dashboard');
    } finally {
      setLoading(false);
    }
  };

  const prevMonth = () => {
    if (month === 1) {
      setMonth(12);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  };

  const nextMonth = () => {
    if (month === 12) {
      setMonth(1);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  };

  const CustomTooltipPie = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 backdrop-blur-sm border border-gray-100 rounded-xl px-4 py-3 shadow-lg">
          <p className="text-sm font-semibold text-gray-900">{payload[0].name}</p>
          <p className="text-sm text-gray-600 mt-0.5">{formatVND(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  const CustomTooltipArea = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 backdrop-blur-sm border border-gray-100 rounded-xl px-4 py-3 shadow-lg">
          <p className="text-sm font-semibold text-gray-900 mb-1.5">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-gray-600">{entry.name}:</span>
              <span className="font-medium" style={{ color: entry.color }}>
                {formatVND(entry.value)}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  /* Skeleton loading state */
  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header skeleton */}
        <div className="flex items-center justify-between">
          <div className="h-8 bg-gray-200 rounded w-40 animate-pulse" />
          <div className="h-10 bg-gray-100 rounded-full w-52 animate-pulse" />
        </div>

        {/* Summary cards skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>

        {/* Charts skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SkeletonChart />
          <SkeletonChart />
        </div>

        {/* Recent transactions skeleton */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="h-5 bg-gray-200 rounded w-44 mb-4 animate-pulse" />
          <div className="space-y-3">
            <SkeletonTransaction />
            <SkeletonTransaction />
            <SkeletonTransaction />
            <SkeletonTransaction />
          </div>
        </div>
      </div>
    );
  }

  const totalIncome = data?.totalIncome || 0;
  const totalExpense = data?.totalExpense || 0;
  const balance = data?.balance ?? totalIncome - totalExpense;
  const expenseByCategory = (data?.byCategory || []).map((item) => ({
    ...item,
    amount: item.total,
  }));
  const dailyTrend = data?.dailyTrend || [];
  const recentTransactions = data?.recentTransactions || [];

  return (
    <div
      className="space-y-6 transition-opacity duration-500 ease-out"
      style={{ opacity: visible ? 1 : 0 }}
    >
      {/* Header with month selector */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="flex items-center gap-1 bg-white rounded-full shadow-sm border border-gray-200 px-1 py-1">
          <button
            onClick={prevMonth}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <HiOutlineChevronLeft className="w-4 h-4 text-gray-600" />
          </button>
          <span className="text-sm font-medium text-gray-700 min-w-[130px] text-center px-2">
            {MONTHS[month - 1]} {year}
          </span>
          <button
            onClick={nextMonth}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <HiOutlineChevronRight className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Tong thu */}
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg p-5 text-white">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <HiOutlineArrowTrendingUp className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm font-medium text-white/80">Tổng thu</span>
          </div>
          <p className="text-2xl font-bold">{formatVND(totalIncome)}</p>
        </div>

        {/* Tong chi */}
        <div className="bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl shadow-lg p-5 text-white">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <HiOutlineArrowTrendingDown className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm font-medium text-white/80">Tổng chi</span>
          </div>
          <p className="text-2xl font-bold">{formatVND(totalExpense)}</p>
        </div>

        {/* So du */}
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg p-5 text-white">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <HiOutlineBanknotes className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm font-medium text-white/80">Số dư</span>
          </div>
          <p className="text-2xl font-bold">{formatVND(balance)}</p>
        </div>

        {/* Tong giao dich */}
        <div className="bg-gradient-to-br from-purple-500 to-fuchsia-600 rounded-2xl shadow-lg p-5 text-white">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <HiOutlineCreditCard className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm font-medium text-white/80">Giao dịch</span>
          </div>
          <p className="text-2xl font-bold">{recentTransactions.length > 0 ? data?.recentTransactions?.length || 0 : 0} <span className="text-sm font-normal text-white/70">trong tháng</span></p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart - Expense by Category */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Chi tiêu theo danh mục</h2>
          {expenseByCategory.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={expenseByCategory}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={110}
                  paddingAngle={3}
                  dataKey="amount"
                  nameKey="name"
                  cornerRadius={4}
                >
                  {expenseByCategory.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={entry.color || `hsl(${index * 45}, 70%, 55%)`}
                      stroke="none"
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltipPie />} />
                <Legend
                  formatter={(value) => (
                    <span className="text-sm text-gray-600">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-[300px] text-gray-400">
              <svg className="w-16 h-16 mb-3 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
              </svg>
              <p className="text-sm">Không có dữ liệu chi tiêu trong tháng này</p>
            </div>
          )}
        </div>

        {/* Area Chart - Daily Trend */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Xu hướng thu chi</h2>
          {dailyTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={dailyTrend}>
                <defs>
                  <linearGradient id="gradientIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22c55e" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#22c55e" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="gradientExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#ef4444" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12, fill: '#9ca3af' }}
                  tickFormatter={(val) => {
                    const d = new Date(val);
                    return `${d.getDate()}/${d.getMonth() + 1}`;
                  }}
                  axisLine={{ stroke: '#e5e7eb' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: '#9ca3af' }}
                  tickFormatter={(val) => {
                    if (val >= 1000000) return `${(val / 1000000).toFixed(0)}M`;
                    if (val >= 1000) return `${(val / 1000).toFixed(0)}K`;
                    return val;
                  }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltipArea />} />
                <Area
                  type="monotone"
                  dataKey="income"
                  name="Thu nhập"
                  stroke="#22c55e"
                  fill="url(#gradientIncome)"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 5, stroke: '#22c55e', strokeWidth: 2, fill: '#fff' }}
                />
                <Area
                  type="monotone"
                  dataKey="expense"
                  name="Chi tiêu"
                  stroke="#ef4444"
                  fill="url(#gradientExpense)"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 5, stroke: '#ef4444', strokeWidth: 2, fill: '#fff' }}
                />
                <Legend
                  formatter={(value) => (
                    <span className="text-sm text-gray-600">{value}</span>
                  )}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-[300px] text-gray-400">
              <svg className="w-16 h-16 mb-3 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
              </svg>
              <p className="text-sm">Không có dữ liệu trong tháng này</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Giao dịch gần đây</h2>
          <Link
            to="/transactions"
            className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
          >
            Xem tất cả
            <HiOutlineArrowRight className="w-4 h-4" />
          </Link>
        </div>
        {recentTransactions.length > 0 ? (
          <div className="space-y-1">
            {recentTransactions.map((tx) => {
              const catColor = tx.category?.color || '#6b7280';
              return (
                <div
                  key={tx._id}
                  className="flex items-center justify-between py-3 px-3 -mx-3 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: catColor + '18' }}
                    >
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: catColor }}
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {tx.description || tx.category?.name || 'Không có mô tả'}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {tx.category?.name && (
                          <span
                            className="inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full"
                            style={{
                              backgroundColor: catColor + '15',
                              color: catColor,
                            }}
                          >
                            {tx.category.name}
                          </span>
                        )}
                        <span className="text-xs text-gray-400">
                          {formatDateVN(tx.date)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <span
                    className={`text-sm font-semibold whitespace-nowrap ${
                      tx.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {tx.type === 'income' ? '+' : '-'}{formatVND(tx.amount)}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <svg className="w-16 h-16 mb-3 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
            </svg>
            <p className="text-sm">Chưa có giao dịch nào trong tháng này</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

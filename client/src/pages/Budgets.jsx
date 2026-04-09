import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
  HiOutlinePlus,
  HiOutlineTrash,
  HiOutlineXMark,
  HiOutlineExclamationTriangle,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineBanknotes,
} from 'react-icons/hi2';

const formatVND = (amount) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);

const MONTHS = [
  'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
  'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12',
];

const Budgets = () => {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ category: '', amount: '' });
  const [submitting, setSubmitting] = useState(false);

  // Delete
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchBudgets();
  }, [month, year]);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/api/categories');
      setCategories(res.data.filter((c) => c.type === 'expense'));
    } catch {
      // Silently fail
    }
  };

  const fetchBudgets = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/budgets?month=${month}&year=${year}`);
      setBudgets(res.data);
    } catch {
      toast.error('Không thể tải ngân sách');
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

  const openAddModal = () => {
    setFormData({ category: '', amount: '' });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.category || !formData.amount) {
      toast.error('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/api/budgets', {
        ...formData,
        month,
        year,
      });
      toast.success('Thêm ngân sách thành công');
      closeModal();
      fetchBudgets();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/api/budgets/${deleteId}`);
      toast.success('Xóa ngân sách thành công');
      setDeleteId(null);
      fetchBudgets();
    } catch {
      toast.error('Không thể xóa ngân sách');
    }
  };

  const getProgressGradient = (percent) => {
    if (percent > 80) return 'bg-gradient-to-r from-red-400 to-red-600';
    if (percent > 50) return 'bg-gradient-to-r from-yellow-400 to-orange-500';
    return 'bg-gradient-to-r from-emerald-400 to-green-600';
  };

  const getProgressBg = (percent) => {
    if (percent > 80) return 'bg-red-100';
    if (percent > 50) return 'bg-yellow-100';
    return 'bg-green-100';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with month selector */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Ngân sách</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 bg-white rounded-full shadow-sm border border-gray-200 px-1 py-1">
            <button
              onClick={prevMonth}
              className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
            >
              <HiOutlineChevronLeft className="w-4 h-4 text-gray-600" />
            </button>
            <span className="text-sm font-medium text-gray-700 min-w-[120px] text-center px-2">
              {MONTHS[month - 1]} {year}
            </span>
            <button
              onClick={nextMonth}
              className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
            >
              <HiOutlineChevronRight className="w-4 h-4 text-gray-600" />
            </button>
          </div>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-sm hover:shadow-md"
          >
            <HiOutlinePlus className="w-4 h-4" />
            Thêm ngân sách
          </button>
        </div>
      </div>

      {/* Budget List */}
      {budgets.length > 0 ? (
        <div className="space-y-4">
          {budgets.map((budget) => {
            const spent = budget.spent || 0;
            const limit = budget.amount || 0;
            const percent = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;
            const overBudget = spent > limit;
            const catName = budget.category?.name || 'Không rõ';
            const catColor = budget.category?.color || '#6b7280';

            return (
              <div
                key={budget._id}
                className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 p-5"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full flex-shrink-0"
                      style={{ backgroundColor: catColor }}
                    />
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">{catName}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {formatVND(spent)} / {formatVND(limit)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {percent > 80 && (
                      <span className="flex items-center gap-1 text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded-full animate-pulse">
                        <HiOutlineExclamationTriangle className="w-3.5 h-3.5" />
                        {overBudget ? 'Vượt ngân sách' : 'Sắp hết'}
                      </span>
                    )}
                    <button
                      onClick={() => setDeleteId(budget._id)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Xóa"
                    >
                      <HiOutlineTrash className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className={`w-full h-2.5 rounded-full ${getProgressBg(percent)}`}>
                  <div
                    className={`h-2.5 rounded-full transition-all duration-700 ease-out ${getProgressGradient(percent)}`}
                    style={{ width: `${Math.min(percent, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1.5">
                  <span className="text-xs text-gray-400">{percent.toFixed(0)}% đã sử dụng</span>
                  <span className="text-xs text-gray-400">
                    Còn lại: {formatVND(Math.max(limit - spent, 0))}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
          <div className="flex justify-center mb-3">
            <div className="w-14 h-14 rounded-full bg-indigo-50 flex items-center justify-center">
              <HiOutlineBanknotes className="w-7 h-7 text-indigo-400" />
            </div>
          </div>
          <p className="text-gray-400 text-sm">Chưa có ngân sách nào cho tháng này</p>
          <button
            onClick={openAddModal}
            className="mt-3 text-indigo-600 hover:text-indigo-700 text-sm font-medium"
          >
            Thêm ngân sách đầu tiên
          </button>
        </div>
      )}

      {/* Add Budget Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-gray-900">Thêm ngân sách</h2>
              <button
                onClick={closeModal}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <HiOutlineXMark className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Danh mục chi tiêu
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                >
                  <option value="">Chọn danh mục</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hạn mức (VND)
                </label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="0"
                  min="0"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Month info */}
              <p className="text-xs text-gray-400">
                Ngân sách cho {MONTHS[month - 1]} {year}
              </p>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 py-2.5 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Đang lưu...' : 'Thêm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDeleteId(null)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Xác nhận xóa</h3>
            <p className="text-sm text-gray-500 mb-5">
              Bạn có chắc chắn muốn xóa ngân sách này?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 py-2.5 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-medium transition-colors"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Budgets;

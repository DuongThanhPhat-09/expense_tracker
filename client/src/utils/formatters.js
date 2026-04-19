// Các hàm format dùng chung cho toàn bộ ứng dụng

/**
 * Format số tiền theo định dạng VND
 * @param {number} amount - Số tiền cần format
 * @returns {string} Chuỗi đã format, ví dụ: "1.500.000 ₫"
 */
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount || 0);
};

/**
 * Format số tiền gọn (dùng cho biểu đồ): 1500000 → "1.5tr"
 * @param {number} amount
 * @returns {string}
 */
export const formatCurrencyCompact = (amount) => {
  if (!amount) return '0';
  if (amount >= 1_000_000_000) return `${(amount / 1_000_000_000).toFixed(1)} tỷ`;
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)} tr`;
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(0)}K`;
  return amount.toString();
};

/**
 * Format ngày theo định dạng Việt Nam
 * @param {string|Date} date
 * @returns {string} "15/04/2026"
 */
export const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

/**
 * Format ngày dài: "Thứ tư, 15 tháng 4 năm 2026"
 * @param {string|Date} date
 * @returns {string}
 */
export const formatDateLong = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

/**
 * Tính phần trăm an toàn (tránh chia 0)
 * @param {number} part
 * @param {number} total
 * @returns {number} Phần trăm làm tròn
 */
export const safePercent = (part, total) => {
  if (!total || total === 0) return 0;
  return Math.round((part / total) * 100);
};

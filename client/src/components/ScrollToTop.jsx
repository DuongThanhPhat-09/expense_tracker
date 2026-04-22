import { useState, useEffect } from 'react';
import { HiOutlineArrowUp } from 'react-icons/hi2';

/**
 * Nút cuộn lên đầu trang - chỉ hiển thị khi đã scroll xuống > 300px
 */
const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.scrollY > 300);
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      aria-label="Cuộn lên đầu trang"
      className="fixed bottom-20 md:bottom-6 right-6 z-40 w-11 h-11 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg shadow-indigo-500/30 flex items-center justify-center transition-all duration-200 hover:scale-110"
    >
      <HiOutlineArrowUp className="w-5 h-5" />
    </button>
  );
};

export default ScrollToTop;

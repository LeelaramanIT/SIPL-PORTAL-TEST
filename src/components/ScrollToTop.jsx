import React, { useEffect, useState } from 'react';
import { IoIosArrowUp } from "react-icons/io";

function ScrollToTop({ scrollContainerRef }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const scrollContainer = scrollContainerRef?.current || window;

    const getScrollTop = () =>
      scrollContainer === window
        ? window.scrollY
        : scrollContainer.scrollTop;

    const toggleVisible = () => {
      setVisible(getScrollTop() > 300);
    };

    scrollContainer.addEventListener('scroll', toggleVisible);
    return () => scrollContainer.removeEventListener('scroll', toggleVisible);
  }, [scrollContainerRef]);

  const scrollToTop = () => {
    const scrollContainer = scrollContainerRef?.current || window;
    if (scrollContainer === window) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    visible && (
      <button
        onClick={scrollToTop}
        className={`fixed bottom-6 right-6 z-50 bg-gray-100 hover:bg-gray-300 text-white w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all duration-500 ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
          }`}
        title="Scroll to top"
      >
        <IoIosArrowUp className="text-black" />
      </button>
    )
  );
}

export default ScrollToTop;

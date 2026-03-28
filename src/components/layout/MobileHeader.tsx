import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

interface MobileHeaderProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  transparent?: boolean;
}

const MobileHeader: React.FC<MobileHeaderProps> = ({
  title,
  showBack = false,
  onBack,
  rightAction,
  transparent = false,
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <header
      className={`sticky top-0 z-40 flex items-center h-14 px-4 ${
        transparent
          ? 'bg-transparent'
          : 'bg-white border-b border-gray-100 shadow-sm'
      }`}
    >
      {showBack ? (
        <button
          onClick={handleBack}
          className="flex items-center justify-center w-10 h-10 -ml-2 rounded-full text-gray-600 hover:bg-gray-100 transition-colors"
          aria-label="Go back"
        >
          <ChevronLeft size={24} />
        </button>
      ) : (
        <div className="w-8" />
      )}

      {title && (
        <h1 className="flex-1 text-center text-base font-semibold text-gray-900 truncate px-2">
          {title}
        </h1>
      )}

      <div className="flex justify-end flex-shrink-0">
        {rightAction}
      </div>
    </header>
  );
};

export default MobileHeader;

import React, { useState, useEffect } from 'react';
import { FiCheck, FiX, FiAlertTriangle, FiInfo } from 'react-icons/fi';

const Alert = ({ type, message, onClose, autoClose = true, duration = 5000 }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (autoClose && onClose) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [autoClose, duration, onClose]);

  if (!isVisible) return null;

  const typeConfig = {
    success: {
      bg: '#f0f9f5',
      border: '#d1f4d6',
      text: '#2d7a4a',
      icon: FiCheck
    },
    error: {
      bg: '#fdf5f5',
      border: '#fde7e7',
      text: '#d73c3c',
      icon: FiX
    },
    warning: {
      bg: '#fffbf0',
      border: '#fde8d1',
      text: '#d67d3b',
      icon: FiAlertTriangle
    },
    info: {
      bg: 'f7f9ff',
      border: '#e0e8f6',
      text: '#295aa6',
      icon: FiInfo
    }
  };

  const config = typeConfig[type] || typeConfig.info;
  const IconComponent = config.icon;

  return (
    <div className="flex gap-3 rounded-lg border p-4" style={{ backgroundColor: config.bg, borderColor: config.border, color: config.text }} role="alert">
      <div className="shrink-0 pt-0.5">
        <IconComponent className="h-5 w-5" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold">{message}</p>
      </div>
      {onClose && (
        <button
          onClick={() => {
            setIsVisible(false);
            onClose();
          }}
          className="shrink-0 p-0.5 text-lg leading-none opacity-60 hover:opacity-100 transition-opacity"
          aria-label="Close alert"
        >
          <FiX className="h-5 w-5" />
        </button>
      )}
    </div>
  );
};

export default Alert;
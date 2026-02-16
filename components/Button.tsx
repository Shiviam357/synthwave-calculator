
import React from 'react';

interface ButtonProps {
  label: string;
  onClick: (label: string) => void;
  className?: string;
}

const Button: React.FC<ButtonProps> = ({ label, onClick, className = '' }) => {
  return (
    <button
      onClick={() => onClick(label)}
      className={`${className}`}
      aria-label={`calculator button ${label}`}
    >
      {label}
    </button>
  );
};

export default Button;

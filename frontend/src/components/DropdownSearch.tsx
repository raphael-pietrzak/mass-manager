import React, { useState, useEffect } from 'react';

interface DropdownSearchProps {
  options: { value: string; label: string }[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const DropdownSearch: React.FC<DropdownSearchProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Sélectionner...',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOptions, setFilteredOptions] = useState(options);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    const filtered = options.filter((option) =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredOptions(filtered);
  }, [searchTerm, options]);

  const selectedOption = options.find((opt) => opt.value === value);

  const displayValue = isFocused ? searchTerm : (selectedOption?.label || '');

  return (
    <div className="relative w-full">
      <input
        type="text"
        className="w-full px-4 py-2 text-left bg-white border rounded-md shadow-sm focus:outline-none focus:ring-2"
        placeholder={placeholder}
        value={displayValue}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => {
          setIsOpen(true);
          setIsFocused(true);
          setSearchTerm('');
        }}
        onBlur={() => {
          setTimeout(() => {
            setIsOpen(false);
            setIsFocused(false);
          }, 200);
        }}
      />

      {isOpen && filteredOptions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
          {filteredOptions.map((option) => (
            <div
              key={option.value}
              className="px-4 py-2 cursor-pointer hover:bg-gray-100"
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
                setSearchTerm('');
              }}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

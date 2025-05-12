import React, { useState, useEffect, useRef } from 'react';

interface DropdownSearchProps {
  options: { value: string; label: string }[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  defaultValue?: string;
  inlineSearch?: boolean;
  onInputChange?: (input: string) => void;
}

export const DropdownSearch: React.FC<DropdownSearchProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Sélectionner...',
  defaultValue = '',
  inlineSearch = false,
  onInputChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOptions, setFilteredOptions] = useState(options);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const effectiveValue = value || defaultValue;
  const selectedOption = options.find((opt) => opt.value === effectiveValue);

  useEffect(() => {
    const filtered = options.filter((option) =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredOptions(filtered);
  }, [searchTerm, options]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (!isOpen && selectedOption) {
      setSearchTerm(selectedOption.label);
    }
  }, [selectedOption, isOpen]);

  const handleSelect = (value: string, label: string) => {
    onChange(value);
    if (inlineSearch) {
      setSearchTerm(label);
    }
    setSearchTerm('');
    setIsOpen(false);
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {inlineSearch ? (
        // Mode recherche inline dans le champ principal
        <input
          type="text"
          value={searchTerm}
          placeholder={placeholder}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
            onInputChange?.(e.target.value);
          }}
          onClick={() => setIsOpen(true)}
          className="w-full px-4 py-2 bg-white border rounded-md shadow-sm focus:outline-none"
        />
      ) : (
        // Mode classique avec champ de recherche en dropdown
        <div
          className="w-full px-4 py-2 text-left bg-white border rounded-md shadow-sm cursor-pointer flex justify-between items-center"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className={selectedOption ? 'text-black' : 'text-gray-500'}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <svg className="w-4 h-4 ml-2" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      )}

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
          {!inlineSearch && (
            <input
              type="text"
              className="w-full p-2 border-b"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                onInputChange?.(e.target.value);
              }}
              onClick={(e) => e.stopPropagation()}
            />
          )}
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
              <div
                key={option.value}
                className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${effectiveValue === option.value ? 'bg-gray-100' : ''}`}
                onClick={() => {
                  onChange(option.value);
                  setSearchTerm(option.label);
                  setIsOpen(false);
                }}
              >
                {option.label}
              </div>
            ))
          ) : searchTerm.trim() !== '' && onInputChange ? (
            <div
              className="px-4 py-2 cursor-pointer hover:bg-gray-100 text-blue-600"
              onClick={() => handleSelect(searchTerm, searchTerm)}
            >
              Nouvel email : <strong>{searchTerm}</strong>
            </div>
          ) : (
            <div className="px-4 py-2 text-gray-500">Aucun résultat</div>
          )}
        </div>
      )}
    </div>
  );
};
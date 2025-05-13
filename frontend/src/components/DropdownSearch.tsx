import React, { useState, useEffect, useRef } from 'react';

interface DropdownSearchProps {
  options: { value: string; label: string }[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  inlineSearch?: boolean;
}

export const DropdownSearch: React.FC<DropdownSearchProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Sélectionner...',
  inlineSearch = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selectedOption = options.find((opt) => opt.value === value);
  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  const handleSelect = (value: string, label: string) => {
    onChange(value);
    setSearchTerm(label);
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
          }}
          onClick={() => setIsOpen(true)}
          className="w-full px-4 py-2 bg-white border rounded-md shadow-sm focus:outline-none"
        />
      ) : (
        // Mode classique avec champ de recherche en dropdown
        <div
          className="w-full px-4 py-2 text-left bg-white border rounded-md shadow-sm cursor-pointer flex justify-between items-center"
          onClick={() => {
            setIsOpen((prev) => {
              const newState = !prev;
              if (newState && !inlineSearch) {
                setSearchTerm('');
              }
              return newState;
            });
          }}
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
              //value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
              }}
              onClick={(e) => e.stopPropagation()}
            />
          )}
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
              <div
                key={option.value}
                className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${value === option.value ? 'bg-gray-100' : ''}`}
                onClick={() => {
                  onChange(option.value);
                  setSearchTerm(option.label);
                  setIsOpen(false);
                }}
              >
                {option.label}
              </div>
            ))
          ) : searchTerm.trim() !== '' ? (
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
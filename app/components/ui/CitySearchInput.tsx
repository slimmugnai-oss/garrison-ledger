'use client';

import { useState, useEffect, useRef } from 'react';
import cityData from '@/lib/data/cost-of-living-cities.json';

interface City {
  city: string;
  state: string;
  cost_of_living_index: number;
}

interface CitySearchInputProps {
  value: string;
  onSelect: (city: City) => void;
  label: string;
  placeholder?: string;
  accentColor?: 'blue' | 'green';
}

export default function CitySearchInput({
  value,
  onSelect,
  label,
  placeholder = 'Start typing a city name...',
  accentColor = 'blue'
}: CitySearchInputProps) {
  const [searchTerm, setSearchTerm] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const [filteredCities, setFilteredCities] = useState<City[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const cities = cityData as City[];

  const accentColors = {
    blue: {
      border: 'border-blue-600',
      focus: 'focus:border-blue-600',
      bg: 'bg-blue-50',
      hover: 'hover:bg-blue-50',
      text: 'text-blue-600'
    },
    green: {
      border: 'border-green-600',
      focus: 'focus:border-green-600',
      bg: 'bg-green-50',
      hover: 'hover:bg-green-50',
      text: 'text-green-600'
    }
  };

  const colors = accentColors[accentColor];

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter cities based on search term
  useEffect(() => {
    if (searchTerm.length >= 3) {
      const term = searchTerm.toLowerCase();
      const filtered = cities.filter(
        (city) =>
          city.city.toLowerCase().includes(term) ||
          city.state.toLowerCase().includes(term) ||
          `${city.city}, ${city.state}`.toLowerCase().includes(term)
      );
      setFilteredCities(filtered.slice(0, 10)); // Limit to 10 results
      setHighlightedIndex(0);
      setIsOpen(filtered.length > 0);
    } else {
      setFilteredCities([]);
      setIsOpen(false);
    }
  }, [searchTerm, cities]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSelectCity = (city: City) => {
    setSearchTerm(`${city.city}, ${city.state}`);
    setIsOpen(false);
    onSelect(city);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < filteredCities.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredCities[highlightedIndex]) {
          handleSelectCity(filteredCities[highlightedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        break;
    }
  };

  return (
    <div ref={wrapperRef} className="relative">
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label}
      </label>
      <input
        ref={inputRef}
        type="text"
        value={searchTerm}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          if (searchTerm.length >= 3 && filteredCities.length > 0) {
            setIsOpen(true);
          }
        }}
        className={`w-full px-4 py-3 border-2 border-gray-300 rounded-lg ${colors.focus} focus:outline-none text-base transition-colors`}
        placeholder={placeholder}
        autoComplete="off"
      />
      
      {isOpen && filteredCities.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border-2 border-gray-200 rounded-lg shadow-xl max-h-64 overflow-y-auto">
          {filteredCities.map((city, index) => (
            <button
              key={`${city.city}-${city.state}-${city.cost_of_living_index}`}
              onClick={() => handleSelectCity(city)}
              className={`w-full text-left px-4 py-3 transition-colors ${
                index === highlightedIndex ? colors.bg : colors.hover
              } ${index !== filteredCities.length - 1 ? 'border-b border-gray-100' : ''}`}
              onMouseEnter={() => setHighlightedIndex(index)}
            >
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-semibold text-gray-900">
                    {city.city}, {city.state}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    Cost of Living Index: {city.cost_of_living_index}
                  </div>
                </div>
                {city.cost_of_living_index > 100 ? (
                  <span className="text-xs font-semibold text-red-600 ml-2">
                    {((city.cost_of_living_index - 100)).toFixed(0)}% above avg
                  </span>
                ) : city.cost_of_living_index < 100 ? (
                  <span className="text-xs font-semibold text-green-600 ml-2">
                    {((100 - city.cost_of_living_index)).toFixed(0)}% below avg
                  </span>
                ) : (
                  <span className="text-xs font-semibold text-gray-600 ml-2">
                    Average
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
      
      {searchTerm.length > 0 && searchTerm.length < 3 && (
        <p className="text-xs text-gray-500 mt-1">
          Type at least 3 characters to search...
        </p>
      )}
    </div>
  );
}


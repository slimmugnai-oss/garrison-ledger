'use client';

import { useState, useRef, useEffect } from 'react';

import militaryBasesData from '@/lib/data/military-bases.json';

interface MilitaryBase {
  id: string;
  name: string;
  branch: string;
  state: string;
  city: string;
  lat: number;
  lng: number;
  zip: string;
  aliases?: string[]; // Former names (e.g., ["Fort Bragg"] for Fort Liberty)
}

const militaryBases = militaryBasesData.bases as MilitaryBase[];

interface BaseAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function BaseAutocomplete({ 
  value, 
  onChange, 
  placeholder = "e.g., Fort Liberty, NC (optional)",
  className = "w-full border border-border rounded-lg px-3 py-2"
}: BaseAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filteredBases, setFilteredBases] = useState<MilitaryBase[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter bases based on input value
  const filterBases = (inputValue: string) => {
    if (inputValue.length < 3) {
      setFilteredBases([]);
      return;
    }

    const filtered = militaryBases.filter(base => {
      const input = inputValue.toLowerCase();
      
      // Search name, city, state, branch
      if (base.name.toLowerCase().includes(input) ||
          base.city.toLowerCase().includes(input) ||
          base.state.toLowerCase().includes(input) ||
          base.branch.toLowerCase().includes(input)) {
        return true;
      }
      
      // Search aliases (former names like "Fort Bragg")
      if (base.aliases && base.aliases.length > 0) {
        return base.aliases.some(alias => alias.toLowerCase().includes(input));
      }
      
      return false;
    });

    // Sort by relevance (exact matches first, then by name)
    const sorted = filtered.sort((a, b) => {
      const aName = a.name.toLowerCase();
      const bName = b.name.toLowerCase();
      const input = inputValue.toLowerCase();
      
      // Exact matches first
      if (aName.startsWith(input) && !bName.startsWith(input)) return -1;
      if (!aName.startsWith(input) && bName.startsWith(input)) return 1;
      
      // Then by name
      return aName.localeCompare(bName);
    });

    setFilteredBases(sorted.slice(0, 10)); // Limit to 10 results
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    filterBases(newValue);
    setIsOpen(newValue.length >= 3 && filteredBases.length > 0);
    setHighlightedIndex(-1);
  };

  // Handle base selection
  const selectBase = (base: MilitaryBase) => {
    // Always include state to ensure MHA code detection works
    const fullName = `${base.name}, ${base.state}`;
    onChange(fullName);
    setIsOpen(false);
    setHighlightedIndex(-1);
    inputRef.current?.blur();
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || filteredBases.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < filteredBases.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : filteredBases.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < filteredBases.length) {
          selectBase(filteredBases[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setHighlightedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle input focus
  const handleFocus = () => {
    if (value.length >= 3) {
      filterBases(value);
      setIsOpen(filteredBases.length > 0);
    }
  };

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        placeholder={placeholder}
        className={className}
        autoComplete="off"
      />
      
      {isOpen && filteredBases.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-surface border border-subtle rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          {filteredBases.map((base, index) => (
            <div
              key={`${base.id}-${index}`}
              className={`px-3 py-2 cursor-pointer border-b border-gray-100 last:border-b-0 ${
                index === highlightedIndex 
                  ? 'bg-blue-50 text-blue-900' 
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => selectBase(base)}
              onMouseEnter={() => setHighlightedIndex(index)}
            >
              <div className="font-medium text-sm">{base.name}</div>
              <div className="text-xs text-muted">
                {base.city}, {base.state} • {base.branch}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

/**
 * LINE ITEM CODE AUTOCOMPLETE
 *
 * Searchable dropdown for 30+ known LES line codes with fuzzy matching
 */

import { useState, useMemo, useRef, useEffect } from "react";
import Icon from "@/app/components/ui/Icon";
import type { LineCodeOption, LesSection } from "@/app/types/les";
import { LINE_CODES, getSection } from "@/lib/les/codes";
import Badge from "@/app/components/ui/Badge";

interface Props {
  value: string;
  onChange: (code: string) => void;
  onSelect?: (option: LineCodeOption) => void;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
}

/**
 * Generate autocomplete options from LINE_CODES registry
 */
function getLineCodeOptions(): LineCodeOption[] {
  return Object.entries(LINE_CODES).map(([code, def]) => ({
    code,
    description: def.description,
    section: def.section as LesSection,
  }));
}

const SECTION_COLORS: Record<LesSection, string> = {
  ALLOWANCE: "text-green-700 bg-green-50 border-green-200",
  TAX: "text-red-700 bg-red-50 border-red-200",
  DEDUCTION: "text-orange-700 bg-orange-50 border-orange-200",
  ALLOTMENT: "text-blue-700 bg-blue-50 border-blue-200",
  DEBT: "text-gray-700 bg-gray-50 border-gray-200",
  ADJUSTMENT: "text-purple-700 bg-purple-50 border-purple-200",
  OTHER: "text-gray-700 bg-gray-50 border-gray-200",
};

const SECTION_ICONS: Record<LesSection, string> = {
  ALLOWANCE: "DollarSign",
  TAX: "Landmark",
  DEDUCTION: "Calculator",
  ALLOTMENT: "Banknote",
  DEBT: "AlertCircle",
  ADJUSTMENT: "RefreshCw",
  OTHER: "File",
};

export default function LineItemAutocomplete({
  value,
  onChange,
  onSelect,
  className = "",
  placeholder = "Search line codes...",
  disabled = false,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const allOptions = useMemo(() => getLineCodeOptions(), []);

  // Filter options based on search query
  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) {
      // Show all options when no search, grouped by section
      return allOptions;
    }

    const query = searchQuery.toLowerCase().trim();

    // Fuzzy search: match code or description
    return allOptions.filter((option) => {
      const codeMatch = option.code.toLowerCase().includes(query);
      const descMatch = option.description.toLowerCase().includes(query);
      const sectionMatch = option.section.toLowerCase().includes(query);

      return codeMatch || descMatch || sectionMatch;
    });
  }, [searchQuery, allOptions]);

  // Group options by section for display
  const groupedOptions = useMemo(() => {
    const groups: Record<LesSection, LineCodeOption[]> = {
      ALLOWANCE: [],
      TAX: [],
      DEDUCTION: [],
      ALLOTMENT: [],
      DEBT: [],
      ADJUSTMENT: [],
      OTHER: [],
    };

    filteredOptions.forEach((option) => {
      groups[option.section].push(option);
    });

    // Remove empty groups
    return Object.entries(groups).filter(([_, items]) => items.length > 0) as [
      LesSection,
      LineCodeOption[],
    ][];
  }, [filteredOptions]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.toUpperCase();
    setSearchQuery(newValue);
    onChange(newValue);
    setIsOpen(true);
    setFocusedIndex(-1);
  };

  // Handle option selection
  const handleSelect = (option: LineCodeOption) => {
    onChange(option.code);
    setSearchQuery(option.code);
    setIsOpen(false);
    onSelect?.(option);
    inputRef.current?.blur();
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedIndex((prev) => (prev < filteredOptions.length - 1 ? prev + 1 : prev));
      setIsOpen(true);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Enter" && focusedIndex >= 0) {
      e.preventDefault();
      handleSelect(filteredOptions[focusedIndex]);
    } else if (e.key === "Escape") {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  // Get current option details if code is recognized
  const currentOption = useMemo(() => {
    if (!value) return null;
    return allOptions.find((opt) => opt.code === value);
  }, [value, allOptions]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={searchQuery || value}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100"
        />
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
          <Icon name="Search" className="h-4 w-4 text-gray-400" />
        </div>
      </div>

      {/* Current selection badge */}
      {currentOption && !isOpen && (
        <div className="mt-2 flex items-center gap-2">
          <Badge
            variant={
              currentOption.section === "ALLOWANCE"
                ? "success"
                : currentOption.section === "TAX"
                  ? "danger"
                  : "warning"
            }
            className="text-xs"
          >
            {currentOption.description}
          </Badge>
        </div>
      )}

      {/* Dropdown */}
      {isOpen && filteredOptions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 mt-1 max-h-96 w-full overflow-auto rounded-lg border border-gray-200 bg-white shadow-lg"
        >
          {groupedOptions.map(([section, items]) => (
            <div key={section} className="border-b border-gray-100 last:border-b-0">
              {/* Section header */}
              <div
                className={`sticky top-0 flex items-center gap-2 px-3 py-2 text-xs font-semibold ${
                  SECTION_COLORS[section]
                }`}
              >
                <Icon name={SECTION_ICONS[section] as any} className="h-3.5 w-3.5" />
                <span>{section}</span>
                <Badge variant="info" className="ml-auto text-xs">
                  {items.length}
                </Badge>
              </div>

              {/* Section items */}
              {items.map((option, idx) => {
                const globalIndex = filteredOptions.indexOf(option);
                const isFocused = globalIndex === focusedIndex;

                return (
                  <button
                    key={option.code}
                    type="button"
                    onClick={() => handleSelect(option)}
                    onMouseEnter={() => setFocusedIndex(globalIndex)}
                    className={`flex w-full items-center justify-between px-4 py-2 text-left transition-colors ${
                      isFocused ? "bg-blue-50" : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{option.code}</div>
                      <div className="text-sm text-gray-600">{option.description}</div>
                    </div>
                    <Icon name="ChevronRight" className="h-4 w-4 text-gray-400" />
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      )}

      {/* No results */}
      {isOpen && searchQuery && filteredOptions.length === 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-gray-200 bg-white p-4 shadow-lg">
          <div className="text-center text-sm text-gray-500">
            <Icon name="AlertCircle" className="mx-auto mb-2 h-8 w-8 text-gray-400" />
            <p>No line codes found matching "{searchQuery}"</p>
            <p className="mt-1 text-xs text-gray-400">
              Try a different search or add as custom code
            </p>
          </div>
        </div>
      )}
    </div>
  );
}


import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectInputProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder: string;
  className?: string;
  allowCustomValue?: boolean;
  customValuePlaceholder?: string;
}

export const SelectInput = ({
  id,
  value,
  onChange,
  options,
  placeholder,
  className,
  allowCustomValue = false,
  customValuePlaceholder = "Enter custom value..."
}: SelectInputProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCustom, setIsCustom] = useState(false);
  const [customValue, setCustomValue] = useState("");
  const selectRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Effect to handle clicks outside of the select dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus the input when switching to custom mode
  useEffect(() => {
    if (isCustom && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isCustom]);

  // Check if the current value is a custom one (not in options)
  useEffect(() => {
    if (value && !options.some(option => option.value === value) && !isCustom) {
      setIsCustom(true);
      setCustomValue(value);
    }
  }, [value, options, isCustom]);

  const handleOptionSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    setIsCustom(false);
  };

  const handleCustomOptionClick = () => {
    setIsCustom(true);
    setIsOpen(false);
    // Initialize with current value if it's already custom
    if (value && !options.some(option => option.value === value)) {
      setCustomValue(value);
    }
  };

  const handleCustomValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomValue(e.target.value);
  };

  const handleCustomValueSubmit = () => {
    if (customValue.trim()) {
      console.log("Custom value submitted:", customValue.trim());
      onChange(customValue.trim());
    } else {
      console.log("Custom value is empty, not submitting");
    }
    setIsCustom(false);
  };

  const handleCancel = () => {
    setIsCustom(false);
    // Revert to selected option if there is one
    if (options.some(option => option.value === value)) {
      setCustomValue("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault(); // Prevent form submission
      handleCustomValueSubmit();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  // Get the label text to display
  const selectedOption = options.find(option => option.value === value);
  const displayText = selectedOption ? selectedOption.label : value || placeholder;

  return (
    <div className={cn("relative w-full", className)} ref={selectRef}>
      {isCustom ? (
        <div className="flex w-full relative">
          <input
            ref={inputRef}
            type="text"
            className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            placeholder={customValuePlaceholder}
            value={customValue}
            onChange={handleCustomValueChange}
            onKeyDown={handleKeyDown}
          />
          <div className="absolute right-0 top-0 h-full flex">
            <button
              type="button"
              className="h-full px-2 text-gray-400 hover:text-gray-600"
              onClick={handleCustomValueSubmit}
              aria-label="Confirm custom value"
            >
              <Check className="h-4 w-4" />
            </button>
            <button
              type="button"
              className="h-full px-2 text-gray-400 hover:text-gray-600"
              onClick={handleCancel}
              aria-label="Cancel custom value"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          className="flex w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 h-10 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          onClick={() => setIsOpen(!isOpen)}
          id={id}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
        >
          <span className={`truncate ${value ? "" : "text-muted-foreground"}`}>
            {displayText}
          </span>
          <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
        </button>
      )}

      {isOpen && (
        <div className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md border bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm z-10">
          <ul className="py-1 overflow-auto" role="listbox" aria-labelledby={id}>
            {options.map((option) => (
              <li
                key={option.value}
                onClick={() => handleOptionSelect(option.value)}
                className={`cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-gray-100 
                  ${value === option.value ? "bg-gray-100" : ""}`}
                role="option"
                aria-selected={value === option.value}
              >
                <div className="flex items-center">
                  <span className="ml-3 block truncate">{option.label}</span>
                </div>
                {value === option.value && (
                  <span className="absolute inset-y-0 right-0 flex items-center pr-4">
                    <Check className="h-4 w-4" aria-hidden="true" />
                  </span>
                )}
              </li>
            ))}
            
            {allowCustomValue && (
              <li
                onClick={handleCustomOptionClick}
                className="cursor-pointer select-none border-t border-gray-200 relative py-2 pl-3 pr-9 hover:bg-gray-100"
                role="option"
              >
                <div className="flex items-center text-blue-600">
                  <span className="ml-3 block truncate">Enter custom role...</span>
                </div>
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

import { useState } from "react";

interface Option {
  value: string;
  label: string;
}

interface SelectProps {
  options: Option[];
  placeholder?: string;
  onChange: (value: string) => void;
  className?: string;
  defaultValue?: string;
  value?: string;
}

const Select: React.FC<SelectProps> = ({
  options,
  placeholder = "Select an option",
  onChange,
  className = "",
  defaultValue = "",
  value,
}) => {
  // Manage the selected value
  const [selectedValue, setSelectedValue] = useState<string>(defaultValue);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedValue(value);
    onChange(value); // Trigger parent handler
  };

  const currentValue = value !== undefined ? value : selectedValue;

  return (
    <select
      className={`h-11 w-full appearance-none rounded-lg border border-gray-300 bg-white px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 text-gray-800 ${
        currentValue ? "text-gray-800" : "text-gray-400"
      } ${className}`}
      value={currentValue}
      onChange={handleChange}
    >
      {/* Placeholder option */}
      <option
        value=""
        disabled
        className="text-gray-400 bg-white"
      >
        {placeholder}
      </option>
      {/* Map over options */}
      {options.map((option) => (
        <option
          key={option.value}
          value={option.value}
          className="text-gray-800 bg-white"
        >
          {option.label}
        </option>
      ))}
    </select>
  );
};

export default Select;

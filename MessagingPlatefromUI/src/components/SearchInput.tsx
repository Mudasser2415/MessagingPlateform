import React from "react";
import { Search } from "lucide-react";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder = "Search",
}) => {
  return (
    <div style={{ position: "relative", minWidth: 240, flex: 1 }}>
      <Search
        size={16}
        style={{
          position: "absolute",
          left: "0.85rem",
          top: "50%",
          transform: "translateY(-50%)",
          color: "var(--secondary)",
          pointerEvents: "none",
        }}
      />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="form-input"
        style={{ paddingLeft: "2.35rem", marginBottom: 0 }}
      />
    </div>
  );
};

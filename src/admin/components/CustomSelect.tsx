import React, { useState, useRef, useEffect } from "react";

export interface SelectOption {
  value: string;
  label: string;
  emoji?: string;
}

interface CustomSelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  compact?: boolean; // 필터 바용 컴팩트 모드
}

/**
 * 네이티브 <select>를 대체하는 커스텀 드롭다운.
 * 블로그 디자인 토큰(--color-*) 기반, 다크/라이트 모두 대응.
 */
export default function CustomSelect({
  options,
  value,
  onChange,
  placeholder,
  className = "",
  compact = false,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // 외부 클릭 시 닫기
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isOpen]);

  // 키보드 접근성
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsOpen(false);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setIsOpen(!isOpen);
    } else if (e.key === "ArrowDown" && !isOpen) {
      e.preventDefault();
      setIsOpen(true);
    }
  };

  const handleOptionSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  const selectedOption = options.find((o) => o.value === value);
  const displayLabel = selectedOption
    ? `${selectedOption.emoji ? selectedOption.emoji + " " : ""}${selectedOption.label}`
    : placeholder || "선택";

  const py = compact ? "py-1.5" : "py-2.5";
  const px = compact ? "px-3" : "px-3.5";
  const textSize = compact ? "text-xs" : "text-sm";

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* 트리거 버튼 */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        className={`w-full ${px} ${py} ${textSize} bg-background border border-border rounded-xl text-foreground text-left flex items-center justify-between gap-2 transition-all duration-200 cursor-pointer hover:border-accent/50 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 ${
          isOpen ? "border-accent ring-1 ring-accent/30" : ""
        }`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="truncate opacity-90">{displayLabel}</span>
        <svg
          className={`w-3.5 h-3.5 shrink-0 opacity-50 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          viewBox="0 0 12 12"
          fill="none"
        >
          <path
            d="M2.5 4.5L6 8L9.5 4.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* 드롭다운 메뉴 */}
      {isOpen && (
        <div
          className="absolute z-50 mt-1.5 w-full min-w-[160px] py-1 bg-card-bg border border-border rounded-xl shadow-lg overflow-hidden animate-dropdownOpen"
          role="listbox"
        >
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => handleOptionSelect(option.value)}
                className={`w-full ${px} py-2 ${textSize} text-left flex items-center gap-2 transition-colors cursor-pointer ${
                  isSelected
                    ? "bg-accent/10 text-accent font-medium"
                    : "text-foreground hover:bg-muted"
                }`}
              >
                {option.emoji && <span className="shrink-0">{option.emoji}</span>}
                <span className="truncate">{option.label}</span>
                {isSelected && (
                  <svg className="w-3.5 h-3.5 ml-auto shrink-0 text-accent" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* 드롭다운 애니메이션 */}
      <style>{`
        @keyframes dropdownOpen {
          from {
            opacity: 0;
            transform: translateY(-4px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-dropdownOpen {
          animation: dropdownOpen 0.15s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
}

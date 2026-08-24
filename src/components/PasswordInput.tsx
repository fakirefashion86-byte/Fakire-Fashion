"use client";

import { useState } from "react";
import { EyeIcon, EyeOffIcon } from "./icons";
import { INPUT_CLASS } from "@/lib/formStyles";

export default function PasswordInput({
  value,
  onChange,
  placeholder,
  required,
  minLength,
  className,
  autoComplete,
  iconClassName,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  minLength?: number;
  className?: string;
  autoComplete?: string;
  iconClassName?: string;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        type={visible ? "text" : "password"}
        required={required}
        minLength={minLength}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        className={`${className ?? INPUT_CLASS} w-full pr-10`}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Hide password" : "Show password"}
        className={`absolute right-3 top-1/2 -translate-y-1/2 ${iconClassName ?? "text-ink-muted hover:text-foreground"}`}
        tabIndex={-1}
      >
        {visible ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
      </button>
    </div>
  );
}

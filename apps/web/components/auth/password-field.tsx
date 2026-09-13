"use client";

import * as React from "react";
import { Lock, Eye, EyeOff } from "lucide-react";
import { FormInput, FormInputProps } from "./form-input";

export interface PasswordFieldProps extends Omit<FormInputProps, "type" | "leftIcon" | "rightIcon"> {
  onPasswordFocus?: () => void;
  onPasswordBlur?: () => void;
}

export const PasswordField = React.forwardRef<HTMLInputElement, PasswordFieldProps>(
  (
    {
      label = "Password",
      placeholder = "••••••••",
      helperText = "Use at least 8 characters with a mix of letters, numbers and symbols.",
      onFocus,
      onBlur,
      onPasswordFocus,
      onPasswordBlur,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = React.useState(false);

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      // Trigger global event for chef mascot
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("password-field-focus"));
      }
      onPasswordFocus?.();
      onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      // Trigger global event for chef mascot
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("password-field-blur"));
      }
      onPasswordBlur?.();
      onBlur?.(e);
    };

    return (
      <FormInput
        ref={ref}
        type={showPassword ? "text" : "password"}
        label={label}
        placeholder={placeholder}
        helperText={helperText}
        onFocus={handleFocus}
        onBlur={handleBlur}
        leftIcon={<Lock className="h-4 w-4" />}
        rightIcon={
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="text-slate-400 hover:text-white transition-colors cursor-pointer p-1 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#14F1C7]"
            tabIndex={-1}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        }
        {...props}
      />
    );
  }
);

PasswordField.displayName = "PasswordField";

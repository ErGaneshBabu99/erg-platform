import * as React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline";
  size?: "sm" | "md" | "lg" | "icon";
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variants = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  ghost: "btn-ghost",
  danger: "inline-flex items-center justify-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-all duration-200",
  outline: "inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-navy-600 text-navy-600 hover:bg-navy-600 hover:text-white font-semibold rounded-xl transition-all duration-200",
};

const sizes = {
  sm: "text-sm px-3 py-1.5",
  md: "",
  lg: "text-lg px-8 py-4",
  icon: "p-2",
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, leftIcon, rightIcon, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(variants[variant], sizes[size], className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : leftIcon}
        {children}
        {!loading && rightIcon}
      </button>
    );
  }
);

Button.displayName = "Button";
export { Button };

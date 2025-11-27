import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function LoadingSpinner({ className, size = "md" }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-8 w-8 border-2",
    md: "h-12 w-12 border-3",
    lg: "h-16 w-16 border-4",
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="relative">
        <div
          className={cn(
            "animate-spin rounded-full border-t-primary border-r-transparent border-b-primary border-l-transparent",
            sizeClasses[size],
            className
          )}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-3 w-3 rounded-full bg-primary animate-pulse" />
        </div>
      </div>
    </div>
  );
}

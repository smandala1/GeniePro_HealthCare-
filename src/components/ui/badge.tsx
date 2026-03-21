import { cn } from "@/lib/utils"

type BadgeVariant = "default" | "outline" | "success" | "warning" | "destructive" | "secondary"

interface BadgeProps extends React.ComponentProps<"span"> {
  variant?: BadgeVariant
}

const variantClasses: Record<BadgeVariant, string> = {
  default:     "bg-primary-500 text-white border-transparent",
  outline:     "border-gray-200 text-gray-600 bg-transparent",
  success:     "bg-green-100 text-green-700 border-transparent",
  warning:     "bg-amber-100 text-amber-700 border-transparent",
  destructive: "bg-red-100 text-red-700 border-transparent",
  secondary:   "bg-gray-100 text-gray-600 border-transparent",
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
        variantClasses[variant],
        className
      )}
      {...props}
    />
  )
}

export { Badge }

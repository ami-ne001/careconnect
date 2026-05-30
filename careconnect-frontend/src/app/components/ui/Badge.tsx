type BadgeVariant = "active" | "pending" | "critical" | "completed" | "inactive" | "warning" | "info" | "normal" | "abnormal" | "urgent" | "stable" | "watch";

const variants: Record<BadgeVariant, string> = {
  active: "bg-emerald-100 text-emerald-700",
  pending: "bg-amber-100 text-amber-700",
  critical: "bg-red-100 text-red-700",
  completed: "bg-slate-100 text-slate-600",
  inactive: "bg-gray-100 text-gray-500",
  warning: "bg-orange-100 text-orange-700",
  info: "bg-blue-100 text-blue-700",
  normal: "bg-emerald-100 text-emerald-700",
  abnormal: "bg-red-100 text-red-700",
  urgent: "bg-red-100 text-red-700",
  stable: "bg-emerald-100 text-emerald-700",
  watch: "bg-amber-100 text-amber-700",
};

interface BadgeProps {
  variant: BadgeVariant;
  children: React.ReactNode;
  dot?: boolean;
}

export function Badge({ variant, children, dot }: BadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${variants[variant]}`}>
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}

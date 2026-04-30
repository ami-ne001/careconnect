import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: "up" | "down" | "stable";
  trendValue?: string;
  icon: React.ReactNode;
  iconBg?: string;
}

export function StatCard({ title, value, subtitle, trend, trendValue, icon, iconBg = "bg-[#EFF6FF]" }: StatCardProps) {
  const trendColor = trend === "up" ? "text-[#10B981]" : trend === "down" ? "text-[#EF4444]" : "text-[#64748B]";
  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;

  return (
    <div className="bg-white rounded-xl p-5 border border-[#E2E8F0]" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs uppercase tracking-wider text-[#64748B] font-semibold mb-2">{title}</p>
          <p className="text-2xl font-bold text-[#0F172A] leading-tight">{value}</p>
          {subtitle && <p className="text-sm text-[#64748B] mt-1">{subtitle}</p>}
          {trendValue && (
            <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${trendColor}`}>
              <TrendIcon size={13} />
              <span>{trendValue}</span>
            </div>
          )}
        </div>
        <div className={`w-11 h-11 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

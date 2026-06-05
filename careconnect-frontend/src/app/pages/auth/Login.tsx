import { useState } from "react";
import { useNavigate } from "react-router";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/store/useAuth";
import { getApiErrorMessage } from "@/utils/apiError";
import { toast } from "sonner";

const roleRoutes: Record<string, string> = {
  ADMIN: "/admin/dashboard",
  DOCTOR: "/doctor/dashboard",
  NURSE: "/nurse/dashboard",
  RECEPTIONIST: "/receptionist/dashboard",
  PATIENT: "/patient/dashboard",
  LAB_TECHNICIAN: "/lab/dashboard",
};

const displayRoles = [
  { label: "Admin", value: "ADMIN", defaultEmail: "admin@careconnect.com" },
  { label: "Doctor", value: "DOCTOR", defaultEmail: "doctor@careconnect.com" },
  { label: "Nurse", value: "NURSE", defaultEmail: "nurse@careconnect.com" },
  { label: "Receptionist", value: "RECEPTIONIST", defaultEmail: "receptionist@careconnect.com" },
  { label: "Patient", value: "PATIENT", defaultEmail: "patient@careconnect.com" },
  { label: "Lab Technician", value: "LAB_TECHNICIAN", defaultEmail: "lab@careconnect.com" },
];

export function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const userRole = await login(email, password, remember);
      toast.success("Successfully logged in!");
      navigate(roleRoutes[userRole] || "/admin/dashboard");
    } catch (err: any) {
      console.error(err);
      toast.error(getApiErrorMessage(err, "Failed to sign in. Please verify your credentials."));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ fontFamily: "Inter, sans-serif" }}>
      {/* Left panel */}
      <div className="hidden lg:flex w-1/2 flex-col items-center justify-center relative overflow-hidden" style={{ background: "#1E3A5F" }}>
        {/* Decorative circles */}
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-10" style={{ background: "#0EA5E9" }} />
        <div className="absolute -bottom-20 -right-20 w-72 h-72 rounded-full opacity-10" style={{ background: "#06B6D4" }} />
        <div className="absolute top-1/3 right-10 w-40 h-40 rounded-full opacity-5" style={{ background: "#0EA5E9" }} />

        {/* Medical icon pattern */}
        <div className="absolute inset-0 opacity-5">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute text-white"
              style={{
                left: `${(i % 5) * 22 + 3}%`,
                top: `${Math.floor(i / 5) * 26 + 5}%`,
                fontSize: 24,
                transform: `rotate(${i * 15}deg)`,
              }}
            >
              ✚
            </div>
          ))}
        </div>

        <div className="relative z-10 text-center px-12">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-[#0EA5E9] flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 16 16" fill="none">
                <path d="M8 1v14M1 8h14" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </div>
            <span className="text-white font-bold text-3xl tracking-tight">CareConnect</span>
          </div>
          <h2 className="text-white font-bold mb-4" style={{ fontSize: 32, lineHeight: 1.2 }}>
            Streamlining Care.
            <br />Empowering Staff.
          </h2>
          <p className="text-white/60 text-base leading-relaxed max-w-sm">
            The all-in-one hospital management system designed for modern healthcare facilities.
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap justify-center gap-2 mt-8">
            {["Patient Management", "Lab Integration", "Smart Scheduling", "Secure & Compliant"].map((f) => (
              <span key={f} className="px-3 py-1.5 rounded-full bg-white/10 text-white/80 text-xs font-medium">
                {f}
              </span>
            ))}
          </div>
        </div>

        <p className="absolute bottom-6 text-white/30 text-sm">© 2026 CareConnect Hospital System</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center bg-white px-8">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-xl bg-[#1E3A5F] flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 1v14M1 8h14" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </div>
            <span className="text-[#1E3A5F] font-bold text-xl">CareConnect</span>
          </div>

          <div className="mb-8">
            <h1 className="font-bold text-[#0F172A] mb-1" style={{ fontSize: 28 }}>Welcome Back</h1>
            <p className="text-[#64748B] text-sm">Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@careconnect.com"
                className="w-full h-11 px-3 rounded-lg border border-[#E2E8F0] text-[#0F172A] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9] focus:border-transparent"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full h-11 px-3 pr-11 rounded-lg border border-[#E2E8F0] text-[#0F172A] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9] focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#0F172A]"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Remember + forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="w-4 h-4 rounded border-[#E2E8F0] accent-[#0EA5E9]"
                />
                <span className="text-sm text-[#64748B]">Remember me</span>
              </label>
              <a href="/auth/forgot-password" className="text-sm text-[#0EA5E9] font-medium hover:underline">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 rounded-lg text-white text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{ background: "#1E3A5F" }}
            >
              {isLoading ? (
                <>
                  <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <p className="text-center text-xs text-[#94A3B8] mt-8">
            © 2026 CareConnect Hospital System. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
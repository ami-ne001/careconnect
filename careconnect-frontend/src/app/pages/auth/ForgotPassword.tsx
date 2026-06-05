import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Mail, CheckCircle } from "lucide-react";
import { authApi } from "@/api";
import { getApiErrorMessage } from "@/utils/apiError";
import { toast } from "sonner";

export function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await authApi.forgotPassword(email);
      setSent(true);
      toast.success("Reset link sent successfully!");
    } catch (err: unknown) {
      console.error(err);
      toast.error(getApiErrorMessage(err, "Failed to request password reset."));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F0F4F8]" style={{ fontFamily: "Inter, sans-serif" }}>
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl p-8 border border-[#E2E8F0]" style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>
          <div className="flex items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-xl bg-[#1E3A5F] flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 1v14M1 8h14" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </div>
            <span className="text-[#1E3A5F] font-bold text-xl">CareConnect</span>
          </div>

          {!sent ? (
            <>
              <div className="w-12 h-12 rounded-2xl bg-[#EFF6FF] flex items-center justify-center mb-5">
                <Mail size={22} className="text-[#0EA5E9]" />
              </div>
              <h1 className="font-bold text-[#0F172A] mb-2" style={{ fontSize: 22 }}>Forgot Password?</h1>
              <p className="text-[#64748B] text-sm mb-6 leading-relaxed">
                Enter your registered email address and we'll send you a link to reset your password.
              </p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="you@careconnect.com"
                    className="w-full h-11 px-3 rounded-lg border border-[#E2E8F0] text-[#0F172A] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9] focus:border-transparent"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 rounded-lg text-white text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  style={{ background: "#1E3A5F" }}
                >
                  {isLoading ? (
                    <>
                      <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      Sending Link...
                    </>
                  ) : (
                    "Send Reset Link"
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-5">
                <CheckCircle size={30} className="text-[#10B981]" />
              </div>
              <h2 className="font-bold text-[#0F172A] mb-2" style={{ fontSize: 22 }}>Check Your Email</h2>
              <p className="text-[#64748B] text-sm leading-relaxed">
                We've sent a password reset link to <strong>{email}</strong>. Check your inbox and follow the instructions.
              </p>
            </div>
          )}

          <button
            onClick={() => navigate("/auth/login")}
            className="flex items-center gap-2 text-sm text-[#64748B] hover:text-[#0F172A] mt-6 transition-colors"
          >
            <ArrowLeft size={15} />
            Back to Sign In
          </button>
        </div>
        <p className="text-center text-xs text-[#94A3B8] mt-4">
          © 2026 CareConnect Hospital System
        </p>
      </div>
    </div>
  );
}

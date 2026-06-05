import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { ArrowLeft, Eye, EyeOff, Lock } from "lucide-react";
import { authApi } from "@/api";
import { getApiErrorMessage } from "@/utils/apiError";
import { toast } from "sonner";

export function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      toast.error("Invalid reset link. Please request a new password reset.");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    try {
      await authApi.resetPassword({ token, newPassword: password });
      toast.success("Password updated successfully. You can sign in now.");
      navigate("/auth/login");
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, "Failed to reset password."));
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F0F4F8]" style={{ fontFamily: "Inter, sans-serif" }}>
        <div className="w-full max-w-md bg-white rounded-2xl p-8 border border-[#E2E8F0]" style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>
          <h1 className="font-bold text-[#0F172A] mb-2" style={{ fontSize: 22 }}>Invalid Reset Link</h1>
          <p className="text-sm text-[#64748B] mb-6">
            This password reset link is missing or invalid. Please request a new one.
          </p>
          <button
            type="button"
            onClick={() => navigate("/auth/forgot-password")}
            className="w-full h-11 rounded-lg text-white text-sm font-semibold"
            style={{ background: "#1E3A5F" }}
          >
            Request New Link
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F0F4F8]" style={{ fontFamily: "Inter, sans-serif" }}>
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl p-8 border border-[#E2E8F0]" style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>
          <div className="w-12 h-12 rounded-2xl bg-[#EFF6FF] flex items-center justify-center mb-5">
            <Lock size={22} className="text-[#0EA5E9]" />
          </div>
          <h1 className="font-bold text-[#0F172A] mb-2" style={{ fontSize: 22 }}>Reset Password</h1>
          <p className="text-[#64748B] text-sm mb-6 leading-relaxed">
            Enter a new password for your CareConnect account.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-1.5">New Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  placeholder="At least 8 characters"
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

            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Confirm Password</label>
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                placeholder="Re-enter your password"
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
                  Updating...
                </>
              ) : (
                "Update Password"
              )}
            </button>
          </form>

          <button
            onClick={() => navigate("/auth/login")}
            className="flex items-center gap-2 text-sm text-[#64748B] hover:text-[#0F172A] mt-6 transition-colors"
          >
            <ArrowLeft size={15} />
            Back to Sign In
          </button>
        </div>
      </div>
    </div>
  );
}

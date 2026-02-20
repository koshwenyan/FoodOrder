import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

export default function ResetPassword() {
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await api.post("/user/reset-password", {
        token,
        newPassword,
      });
      setSuccess(res.data.message || "Password reset successful");
      setToken("");
      setNewPassword("");
    } catch (err) {
      const msg = err?.response?.data?.message || "Reset failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f1115] text-[#f6f1e8] px-4 flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-3xl bg-[#171a20] border border-[#2a2f3a] shadow-lg p-8"
      >
        <div className="rounded-2xl bg-gradient-to-br from-[#1d222c] via-[#171a20] to-[#2a2f3a] p-5 border border-[#2a2f3a] text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-[#c9a96a]">
            Reset Password
          </p>
          <h1 className="text-3xl font-semibold mt-1">Set New Password</h1>
          <p className="text-sm text-[#a8905d] mt-1">
            Paste your reset token and choose a new password.
          </p>
        </div>

        {error && (
          <div className="mt-6 mb-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-6 mb-4 rounded-2xl bg-green-500/10 border border-green-500/30 text-green-700 px-4 py-3 text-sm">
            {success}
            <div className="mt-2">
              <Link
                to="/login"
                className="font-semibold text-[#f6f1e8] hover:underline"
              >
                Go to Login
              </Link>
            </div>
          </div>
        )}

        <div className="mt-6 mb-4">
          <label className="block text-xs uppercase tracking-wide text-[#c9a96a] mb-1">
            Reset Token
          </label>
          <input
            type="text"
            required
            className="w-full rounded-xl bg-[#1d222c] border border-[#2a2f3a] px-3 py-2 
            text-[#f6f1e8] placeholder-[#c9a96a]/70
            focus:outline-none focus:ring-2 focus:ring-[#c9a96a] focus:border-[#2a2f3a]
            transition"
            placeholder="Paste token here"
            value={token}
            onChange={(e) => setToken(e.target.value)}
          />
        </div>

        <div className="mb-6">
          <label className="block text-xs uppercase tracking-wide text-[#c9a96a] mb-1">
            New Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              className="w-full rounded-xl bg-[#1d222c] border border-[#2a2f3a] px-3 py-2 pr-12 
              text-[#f6f1e8] placeholder-[#c9a96a]/70
              focus:outline-none focus:ring-2 focus:ring-[#c9a96a] focus:border-[#2a2f3a]
              transition"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#c9a96a] hover:text-[#f6f1e8] transition"
            >
              {showPassword ? "HIDE" : "SHOW"}
            </button>
          </div>
        </div>

        <button
          disabled={loading}
          className="w-full relative overflow-hidden rounded-full
          bg-[#f6f1e8] text-[#171a20]
          py-2.5 font-semibold
          transition hover:bg-[#c9a96a] active:scale-[0.98]
          disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Resetting..." : "Reset Password"}
        </button>

        <p className="mt-5 text-center text-sm text-[#a8905d]">
          Back to{" "}
          <Link
            to="/login"
            className="font-semibold text-[#f6f1e8] hover:underline"
          >
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}

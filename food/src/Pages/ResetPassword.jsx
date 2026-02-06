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
    <div className="min-h-screen bg-[#f6f1eb] text-[#1f1a17] px-4 flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-3xl bg-white/90 border border-[#ead8c7] shadow-lg p-8"
      >
        <div className="rounded-2xl bg-gradient-to-br from-[#f9e9d7] via-[#f8f3ee] to-[#f2ddc7] p-5 border border-[#ead8c7] text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-[#8b6b4f]">
            Reset Password
          </p>
          <h1 className="text-3xl font-semibold mt-1">Set New Password</h1>
          <p className="text-sm text-[#6c5645] mt-1">
            Paste your reset token and choose a new password.
          </p>
        </div>

        {error && (
          <div className="mt-6 mb-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-600 px-4 py-3 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-6 mb-4 rounded-2xl bg-green-500/10 border border-green-500/30 text-green-700 px-4 py-3 text-sm">
            {success}
            <div className="mt-2">
              <Link
                to="/login"
                className="font-semibold text-[#1f1a17] hover:underline"
              >
                Go to Login
              </Link>
            </div>
          </div>
        )}

        <div className="mt-6 mb-4">
          <label className="block text-xs uppercase tracking-wide text-[#8b6b4f] mb-1">
            Reset Token
          </label>
          <input
            type="text"
            required
            className="w-full rounded-xl bg-white/80 border border-[#ead8c7] px-3 py-2 
            text-[#1f1a17] placeholder-[#8b6b4f]/70
            focus:outline-none focus:ring-2 focus:ring-[#d6c3b2] focus:border-[#d6c3b2]
            transition"
            placeholder="Paste token here"
            value={token}
            onChange={(e) => setToken(e.target.value)}
          />
        </div>

        <div className="mb-6">
          <label className="block text-xs uppercase tracking-wide text-[#8b6b4f] mb-1">
            New Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              className="w-full rounded-xl bg-white/80 border border-[#ead8c7] px-3 py-2 pr-12 
              text-[#1f1a17] placeholder-[#8b6b4f]/70
              focus:outline-none focus:ring-2 focus:ring-[#d6c3b2] focus:border-[#d6c3b2]
              transition"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#8b6b4f] hover:text-[#1f1a17] transition"
            >
              {showPassword ? "HIDE" : "SHOW"}
            </button>
          </div>
        </div>

        <button
          disabled={loading}
          className="w-full relative overflow-hidden rounded-full
          bg-[#1f1a17] text-[#f8f3ee]
          py-2.5 font-semibold
          transition hover:bg-[#2b241f] active:scale-[0.98]
          disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Resetting..." : "Reset Password"}
        </button>

        <p className="mt-5 text-center text-sm text-[#6c5645]">
          Back to{" "}
          <Link
            to="/login"
            className="font-semibold text-[#1f1a17] hover:underline"
          >
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}

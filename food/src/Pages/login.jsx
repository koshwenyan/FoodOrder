import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const user = await login(email, password);

      if (user.role === "admin") {
        navigate("/admin/dashboard");
      } else if (user.role === "shop-admin") {
        navigate("/shop-admin/shopadmindashboard");
      } else {
        setError("Unauthorized role");
      }
    } catch {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-black to-slate-950 px-4">

      {/* Background Glow */}
      <div className="absolute inset-0 flex justify-center items-center pointer-events-none bg-slate-800">
        <div className="h-96 w-96 rounded-full bg-emerald-500/20 blur-3xl" />
      </div>

      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-sm rounded-2xl 
        bg-white/5 backdrop-blur-xl
        border border-white/10
        shadow-[0_0_40px_rgba(16,185,129,0.15)]
        p-8"
      >
        <h1 className="text-3xl font-semibold text-center bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent mb-2">
          Admin Login
        </h1>

        <p className="text-center text-slate-400 mb-6 text-sm">
          Secure access to your dashboard
        </p>

        {error && (
          <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 px-3 py-2 text-sm">
            {error}
          </div>
        )}

        {/* Email */}
        <div className="mb-4">
          <label className="block text-xs uppercase tracking-wide text-slate-400 mb-1">
            Email
          </label>
          <input
            type="email"
            required
            className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 
            text-slate-200 placeholder-slate-500
            focus:outline-none focus:ring-2 focus:ring-emerald-400/60 focus:border-emerald-400/40
            transition"
            placeholder="admin@email.com"
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* Password */}
        <div className="mb-6">
          <label className="block text-xs uppercase tracking-wide text-slate-400 mb-1">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 pr-12 
              text-slate-200 placeholder-slate-500
              focus:outline-none focus:ring-2 focus:ring-emerald-400/60 focus:border-emerald-400/40
              transition"
              placeholder="••••••••"
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-emerald-300 transition"
            >
              {showPassword ? "HIDE" : "SHOW"}
            </button>
          </div>
        </div>

        <button
          disabled={loading}
          className="w-full relative overflow-hidden rounded-lg
          bg-gradient-to-r from-emerald-400 to-teal-400
          py-2 font-semibold text-slate-900
          transition hover:brightness-110 active:scale-[0.98]
          disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-900 border-t-transparent" />
              Logging in...
            </span>
          ) : (
            "Login"
          )}
        </button>
      </form>
    </div>
  );
}

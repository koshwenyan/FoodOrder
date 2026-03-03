import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

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
            }
            else if (user.role === "company-admin") {
                navigate("/company-admin/companyadmindashboard");
            } else if (user.role === "company-staff") {
                navigate("/delivery-staff/orders");
            } else {
                setError("Unauthorized role");
            }
        } catch (err) {
            setError(err.message || "Invalid email or password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white text-[#0f172a] px-4 flex items-center justify-center">
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-md rounded-3xl bg-[#f8fafc] border border-[#cbd5e1] shadow-lg p-8"
            >
                <div className="rounded-2xl bg-gradient-to-br from-[#f8fafc] via-[#f1f5f9] to-[#e2e8f0] p-5 border border-[#cbd5e1] text-center">
                    <p className="text-xs uppercase tracking-[0.2em] text-[#475569]">
                        Admin Access
                    </p>
                    <h1 className="text-3xl font-semibold mt-1">Login</h1>
                    <p className="text-sm text-[#475569] mt-1">
                        Secure access to your dashboard
                    </p>
                </div>

                {error && (
                    <div className="mt-6 mb-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 text-sm">
                        {error}
                    </div>
                )}

                {/* Email */}
                <div className="mt-6 mb-4">
                    <label className="block text-xs uppercase tracking-wide text-[#475569] mb-1">
                        Email
                    </label>
                    <input
                        type="email"
                        required
                        className="w-full rounded-xl bg-[#f1f5f9] border border-[#cbd5e1] px-3 py-2 
            text-[#0f172a] placeholder-[#64748b]
            focus:outline-none focus:ring-2 focus:ring-[#0ea5e9] focus:border-[#0ea5e9]
            transition"
                        placeholder="admin@email.com"
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>

                {/* Password */}
                <div className="mb-6">
                    <label className="block text-xs uppercase tracking-wide text-[#475569] mb-1">
                        Password
                    </label>
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            required
                            className="w-full rounded-xl bg-[#f1f5f9] border border-[#cbd5e1] px-3 py-2 pr-12 
              text-[#0f172a] placeholder-[#64748b]
              focus:outline-none focus:ring-2 focus:ring-[#0ea5e9] focus:border-[#0ea5e9]
              transition"
                            placeholder="••••••••"
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#475569] hover:text-[#0f172a] transition"
                        >
                            {showPassword ? "HIDE" : "SHOW"}
                        </button>
                    </div>
                </div>

                <button
                    disabled={loading}
                    className="w-full relative overflow-hidden rounded-full
          bg-[#0ea5e9] text-[#0f172a]
          py-2.5 font-semibold
          transition hover:bg-[#0ea5e9] active:scale-[0.98]
          disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    {loading ? (
                        <span className="flex items-center justify-center gap-2">
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#0f172a] border-t-transparent" />
                            Logging in...
                        </span>
                    ) : (
                        "Login"
                    )}
                </button>

                <p className="mt-5 text-center text-sm text-[#475569]">
                    <Link
                        to="/forgot-password"
                        className="font-semibold text-[#0ea5e9] hover:underline"
                    >
                        Forgot password?
                    </Link>
                </p>

                <p className="mt-2 text-center text-sm text-[#475569]">
                    Customer?{" "}
                    <Link
                        to="/customer/login"
                        className="font-semibold text-[#0ea5e9] hover:underline"
                    >
                        Login here
                    </Link>{" "}
                    or{" "}
                    <Link
                        to="/customer/register"
                        className="font-semibold text-[#0ea5e9] hover:underline"
                    >
                        Register
                    </Link>
                </p>
            </form>
        </div>
    );
}

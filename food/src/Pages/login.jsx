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
        <div className="min-h-screen bg-[#0f1115] text-[#f6f1e8] px-4 flex items-center justify-center">
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-md rounded-3xl bg-[#171a20] border border-[#2a2f3a] shadow-lg p-8"
            >
                <div className="rounded-2xl bg-gradient-to-br from-[#1d222c] via-[#171a20] to-[#2a2f3a] p-5 border border-[#2a2f3a] text-center">
                    <p className="text-xs uppercase tracking-[0.2em] text-[#c9a96a]">
                        Admin Access
                    </p>
                    <h1 className="text-3xl font-semibold mt-1">Login</h1>
                    <p className="text-sm text-[#a8905d] mt-1">
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
                    <label className="block text-xs uppercase tracking-wide text-[#c9a96a] mb-1">
                        Email
                    </label>
                    <input
                        type="email"
                        required
                        className="w-full rounded-xl bg-[#1d222c] border border-[#2a2f3a] px-3 py-2 
            text-[#f6f1e8] placeholder-[#a8905d]
            focus:outline-none focus:ring-2 focus:ring-[#c9a96a] focus:border-[#c9a96a]
            transition"
                        placeholder="admin@email.com"
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>

                {/* Password */}
                <div className="mb-6">
                    <label className="block text-xs uppercase tracking-wide text-[#c9a96a] mb-1">
                        Password
                    </label>
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            required
                            className="w-full rounded-xl bg-[#1d222c] border border-[#2a2f3a] px-3 py-2 pr-12 
              text-[#f6f1e8] placeholder-[#a8905d]
              focus:outline-none focus:ring-2 focus:ring-[#c9a96a] focus:border-[#c9a96a]
              transition"
                            placeholder="••••••••"
                            onChange={(e) => setPassword(e.target.value)}
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
          bg-[#c9a96a] text-[#171a20]
          py-2.5 font-semibold
          transition hover:bg-[#e2c68a] active:scale-[0.98]
          disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    {loading ? (
                        <span className="flex items-center justify-center gap-2">
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#171a20] border-t-transparent" />
                            Logging in...
                        </span>
                    ) : (
                        "Login"
                    )}
                </button>

                <p className="mt-5 text-center text-sm text-[#a8905d]">
                    <Link
                        to="/forgot-password"
                        className="font-semibold text-[#f6f1e8] hover:underline"
                    >
                        Forgot password?
                    </Link>
                </p>

                <p className="mt-2 text-center text-sm text-[#a8905d]">
                    Customer?{" "}
                    <Link
                        to="/customer/login"
                        className="font-semibold text-[#f6f1e8] hover:underline"
                    >
                        Login here
                    </Link>{" "}
                    or{" "}
                    <Link
                        to="/customer/register"
                        className="font-semibold text-[#f6f1e8] hover:underline"
                    >
                        Register
                    </Link>
                </p>
            </form>
        </div>
    );
}

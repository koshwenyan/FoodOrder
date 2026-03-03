import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function CustomerRegister() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await api.post("/user/register", {
        ...form,
        role: "customer",
      });

      setSuccess("Account created! Please log in.");
      setForm({ name: "", email: "", phone: "", address: "", password: "" });
      setTimeout(() => navigate("/customer/login"), 800);
    } catch (err) {
      const msg = err?.response?.data?.message || "Register failed";
      setError(msg);
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
            Customer Access
          </p>
          <h1 className="text-3xl font-semibold mt-1">Register</h1>
          <p className="text-sm text-[#475569] mt-1">
            Create your account to place orders.
          </p>
        </div>

        {error && (
          <div className="mt-6 mb-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="mt-6 mb-4 rounded-2xl bg-emerald-500/10 border border-emerald-400/40 text-emerald-300 px-4 py-3 text-sm">
            {success}
          </div>
        )}

        <div className="mt-6 mb-4">
          <label className="block text-xs uppercase tracking-wide text-[#475569] mb-1">
            Name
          </label>
          <input
            name="name"
            required
            className="w-full rounded-xl bg-[#f1f5f9] border border-[#cbd5e1] px-3 py-2 
            text-[#0f172a] placeholder-[#64748b]/70
            focus:outline-none focus:ring-2 focus:ring-[#0ea5e9] focus:border-[#cbd5e1]
            transition"
            placeholder="Your name"
            onChange={handleChange}
            value={form.name}
          />
        </div>

        <div className="mb-4">
          <label className="block text-xs uppercase tracking-wide text-[#475569] mb-1">
            Email
          </label>
          <input
            name="email"
            type="email"
            required
            className="w-full rounded-xl bg-[#f1f5f9] border border-[#cbd5e1] px-3 py-2 
            text-[#0f172a] placeholder-[#64748b]/70
            focus:outline-none focus:ring-2 focus:ring-[#0ea5e9] focus:border-[#cbd5e1]
            transition"
            placeholder="you@email.com"
            onChange={handleChange}
            value={form.email}
          />
        </div>

        <div className="mb-4">
          <label className="block text-xs uppercase tracking-wide text-[#475569] mb-1">
            Phone
          </label>
          <input
            name="phone"
            required
            className="w-full rounded-xl bg-[#f1f5f9] border border-[#cbd5e1] px-3 py-2 
            text-[#0f172a] placeholder-[#64748b]/70
            focus:outline-none focus:ring-2 focus:ring-[#0ea5e9] focus:border-[#cbd5e1]
            transition"
            placeholder="09xxxxxxx"
            onChange={handleChange}
            value={form.phone}
          />
        </div>

        <div className="mb-4">
          <label className="block text-xs uppercase tracking-wide text-[#475569] mb-1">
            Address
          </label>
          <input
            name="address"
            required
            className="w-full rounded-xl bg-[#f1f5f9] border border-[#cbd5e1] px-3 py-2 
            text-[#0f172a] placeholder-[#64748b]/70
            focus:outline-none focus:ring-2 focus:ring-[#0ea5e9] focus:border-[#cbd5e1]
            transition"
            placeholder="Your address"
            onChange={handleChange}
            value={form.address}
          />
        </div>

        <div className="mb-6">
          <label className="block text-xs uppercase tracking-wide text-[#475569] mb-1">
            Password
          </label>
          <input
            name="password"
            type="password"
            required
            className="w-full rounded-xl bg-[#f1f5f9] border border-[#cbd5e1] px-3 py-2 
            text-[#0f172a] placeholder-[#64748b]/70
            focus:outline-none focus:ring-2 focus:ring-[#0ea5e9] focus:border-[#cbd5e1]
            transition"
            placeholder="••••••••"
            onChange={handleChange}
            value={form.password}
          />
        </div>

        <button
          disabled={loading}
          className="w-full relative overflow-hidden rounded-full
          bg-[#e2e8f0] text-[#0f172a]
          py-2.5 font-semibold
          transition hover:bg-[#0ea5e9] active:scale-[0.98]
          disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Creating..." : "Create Account"}
        </button>

        <p className="mt-5 text-center text-sm text-[#475569]">
          Already have an account?{" "}
          <Link
            to="/customer/login"
            className="font-semibold text-[#0ea5e9] hover:underline"
          >
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}

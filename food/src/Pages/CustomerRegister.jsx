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
    <div className="min-h-screen bg-[#0f1115] text-[#f6f1e8] px-4 flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-3xl bg-[#171a20] border border-[#2a2f3a] shadow-lg p-8"
      >
        <div className="rounded-2xl bg-gradient-to-br from-[#1d222c] via-[#171a20] to-[#2a2f3a] p-5 border border-[#2a2f3a] text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-[#c9a96a]">
            Customer Access
          </p>
          <h1 className="text-3xl font-semibold mt-1">Register</h1>
          <p className="text-sm text-[#a8905d] mt-1">
            Create your account to place orders.
          </p>
        </div>

        {error && (
          <div className="mt-6 mb-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-600 px-4 py-3 text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="mt-6 mb-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 px-4 py-3 text-sm">
            {success}
          </div>
        )}

        <div className="mt-6 mb-4">
          <label className="block text-xs uppercase tracking-wide text-[#c9a96a] mb-1">
            Name
          </label>
          <input
            name="name"
            required
            className="w-full rounded-xl bg-[#1d222c] border border-[#2a2f3a] px-3 py-2 
            text-[#f6f1e8] placeholder-[#c9a96a]/70
            focus:outline-none focus:ring-2 focus:ring-[#d6c3b2] focus:border-[#d6c3b2]
            transition"
            placeholder="Your name"
            onChange={handleChange}
            value={form.name}
          />
        </div>

        <div className="mb-4">
          <label className="block text-xs uppercase tracking-wide text-[#c9a96a] mb-1">
            Email
          </label>
          <input
            name="email"
            type="email"
            required
            className="w-full rounded-xl bg-[#1d222c] border border-[#2a2f3a] px-3 py-2 
            text-[#f6f1e8] placeholder-[#c9a96a]/70
            focus:outline-none focus:ring-2 focus:ring-[#d6c3b2] focus:border-[#d6c3b2]
            transition"
            placeholder="you@email.com"
            onChange={handleChange}
            value={form.email}
          />
        </div>

        <div className="mb-4">
          <label className="block text-xs uppercase tracking-wide text-[#c9a96a] mb-1">
            Phone
          </label>
          <input
            name="phone"
            required
            className="w-full rounded-xl bg-[#1d222c] border border-[#2a2f3a] px-3 py-2 
            text-[#f6f1e8] placeholder-[#c9a96a]/70
            focus:outline-none focus:ring-2 focus:ring-[#d6c3b2] focus:border-[#d6c3b2]
            transition"
            placeholder="09xxxxxxx"
            onChange={handleChange}
            value={form.phone}
          />
        </div>

        <div className="mb-4">
          <label className="block text-xs uppercase tracking-wide text-[#c9a96a] mb-1">
            Address
          </label>
          <input
            name="address"
            required
            className="w-full rounded-xl bg-[#1d222c] border border-[#2a2f3a] px-3 py-2 
            text-[#f6f1e8] placeholder-[#c9a96a]/70
            focus:outline-none focus:ring-2 focus:ring-[#d6c3b2] focus:border-[#d6c3b2]
            transition"
            placeholder="Your address"
            onChange={handleChange}
            value={form.address}
          />
        </div>

        <div className="mb-6">
          <label className="block text-xs uppercase tracking-wide text-[#c9a96a] mb-1">
            Password
          </label>
          <input
            name="password"
            type="password"
            required
            className="w-full rounded-xl bg-[#1d222c] border border-[#2a2f3a] px-3 py-2 
            text-[#f6f1e8] placeholder-[#c9a96a]/70
            focus:outline-none focus:ring-2 focus:ring-[#d6c3b2] focus:border-[#d6c3b2]
            transition"
            placeholder="••••••••"
            onChange={handleChange}
            value={form.password}
          />
        </div>

        <button
          disabled={loading}
          className="w-full relative overflow-hidden rounded-full
          bg-[#f6f1e8] text-[#171a20]
          py-2.5 font-semibold
          transition hover:bg-[#c9a96a] active:scale-[0.98]
          disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Creating..." : "Create Account"}
        </button>

        <p className="mt-5 text-center text-sm text-[#a8905d]">
          Already have an account?{" "}
          <Link
            to="/customer/login"
            className="font-semibold text-[#f6f1e8] hover:underline"
          >
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}

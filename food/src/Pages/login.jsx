import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Admin from "./Users.jsx";
export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate("/Admin"); // after login
    } catch {
      setError("Invalid email or password");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <form
        onSubmit={handleSubmit}
        className="bg-slate-950 border border-slate-800 p-8 rounded-xl w-full max-w-sm"
      >
        <h1 className="text-2xl font-bold text-center text-emerald-400 mb-6">
          Admin Login
        </h1>

        {error && (
          <p className="text-red-400 text-sm mb-3">{error}</p>
        )}

        <input
          type="email"
          placeholder="Email"
          className="w-full mb-3 bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-3 py-2"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full mb-5 bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-3 py-2"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-900 font-semibold py-2 rounded-lg">
          Login
        </button>
      </form>
    </div>
  );
}

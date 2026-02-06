import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function CustomerHome() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/customer/login");
  };

  return (
    <div className="min-h-screen bg-[#f6f1eb] text-[#1f1a17] px-6 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="rounded-3xl bg-gradient-to-br from-[#f9e9d7] via-[#f8f3ee] to-[#f2ddc7] p-6 sm:p-8 shadow-lg border border-[#ead8c7]">
          <p className="text-sm uppercase tracking-[0.2em] text-[#8b6b4f]">
            Customer Portal
          </p>
          <h1 className="text-3xl sm:text-4xl font-semibold">
            Welcome{user?.name ? `, ${user.name}` : ""}
          </h1>
          <p className="text-sm text-[#6c5645] mt-2">
            Your account is ready. We will add ordering features here soon.
          </p>
        </div>

        <div className="mt-6 rounded-3xl bg-white/90 border border-[#ead8c7] p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Next steps</h2>
          <p className="text-sm text-[#6c5645] mt-2">
            This page is a placeholder for customer ordering. Let me know what
            you want customers to do next (browse shops, place orders, track
            delivery, etc.).
          </p>
          <div className="mt-5 flex gap-3">
            <button
              onClick={handleLogout}
              className="rounded-full bg-[#1f1a17] text-[#f8f3ee] px-5 py-2 text-sm font-semibold hover:bg-[#2b241f]"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./Pages/Dashboard.jsx";
import Shop from "./Pages/Shop.jsx";
import Users from "./Pages/Users.jsx";
import Categories from "./Pages/Category.jsx";
import Company from "./Pages/Deliservice.jsx";
import Reviews from "./Pages/Review.jsx";
import Sidebar from "./components/sidebar.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-black">
        <Sidebar />

        <main className="flex-1 p-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/users" element={<Users />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/company" element={<Company />} />
            <Route path="/reviews" element={<Reviews />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

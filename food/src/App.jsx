import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import Login from "./Pages/login.jsx";
// import AdminDashboard from "./Pages/AdminDashboard.jsx";
import PrivateRoute from "./routes/PrivateRoute.jsx";
import Users from "./Pages/Users.jsx";
import Shop from "./Pages/Shop.jsx";
import Category from "./Pages/Category.jsx";
import Delivery from "./Pages/Deliservice.jsx";
import Review from "./Pages/Review.jsx";
import Sidebar from "./components/sidebar.jsx";
import { AdminDashboard } from "./Pages/AdminDashboard.jsx";
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            path="/admin"
            element={
              <PrivateRoute>
                <Sidebar />
              </PrivateRoute>
            }
          >
            <Route path="admindashboard" element={<AdminDashboard />} />
            <Route path="users" element={<Users />} />
            <Route path="shop" element={<Shop />} />
            <Route path="category" element={<Category />} />
            <Route path="delivery" element={<Delivery />} />
            <Route path="review" element={<Review />} />
          </Route>

          <Route path="*" element={<Login />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

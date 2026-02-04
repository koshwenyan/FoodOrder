// import AdminLayout from "./Pages/AdminLayout.jsx";
// import ShopAdminLayout from "./Pages/ShopAdminLayout.jsx";
import AdminDashboard from "./Pages/AdminDashboard.jsx";
import ShopAdminDashboard from "./Pages/ShopAdminDashBoard.jsx";
import Users from "./Pages/Users.jsx";
import Orders from "./Pages/Orders.jsx";
import Delivery from "./Pages/Deliservice.jsx";
import Menu from "./Pages/Menu.jsx";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import PrivateRoute from "./routes/PrivateRoute.jsx";
import Login from "./Pages/Login.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import AdminShell from "./components/Adminshell.jsx";
import Shop from "./Pages/Shop.jsx";
import Category from "./Pages/Category.jsx";
import  ShopDelivery  from "./Pages/Delivery.jsx";
import OrdersLists from "./Pages/OrdersLists.jsx";
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          {/* LOGIN */}
          <Route path="/login" element={<Login />} />

          {/* ADMIN */}
          <Route
  path="/admin"
  element={
    <PrivateRoute allowedRoles={["admin"]}>
      <AdminShell />
    </PrivateRoute>
  }
>
  <Route path="dashboard" element={<AdminDashboard />} />
  <Route path="users" element={<Users />} />
  <Route path="shop" element={<Shop />} />
  <Route path="deliservice" element={< Delivery  />} />
  <Route path="categories" element={<Category />} />
</Route>


          {/* SHOP ADMIN */}
          <Route
            path="/shop-admin"
            element={
              <PrivateRoute allowedRoles={["shop-admin"]}>
                <AdminShell />
              </PrivateRoute>
            }
          >
            <Route path="shopadmindashboard" element={<ShopAdminDashboard />} />
            <Route path="orders" element={<Orders />} />
            <Route path="delivery" element={<ShopDelivery />} />
            <Route path="menu" element={<Menu />} />
            <Route path="orderslists" element={<OrdersLists />} />
          </Route>

          {/* FALLBACK */}
          <Route path="*" element={<Login />} />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

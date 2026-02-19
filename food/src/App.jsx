// import { BrowserRouter, Routes, Route } from "react-router-dom";
// import { AuthProvider } from "./context/AuthContext.jsx";
// import PrivateRoute from "./routes/PrivateRoute.jsx";

/* ========== PAGES ========== */

// import Login from "./Pages/Login.jsx";

import AdminDashboard from "./Pages/AdminDashboard.jsx";
import ShopAdminDashboard from "./Pages/ShopAdminDashBoard.jsx";
import DeliveryCompanyAdminDashboard from "./Pages/deliveryCompanyAdminDashboard.jsx";

import Users from "./Pages/Users.jsx";
import Orders from "./Pages/Orders.jsx";
import Delivery from "./Pages/Deliservice.jsx";
import ShopDelivery from "./Pages/Delivery.jsx";
import Menu from "./Pages/Menu.jsx";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import PrivateRoute from "./routes/PrivateRoute.jsx";
import Login from "./Pages/Login.jsx";
import CustomerLogin from "./Pages/CustomerLogin.jsx";
import CustomerRegister from "./Pages/CustomerRegister.jsx";
import ForgotPassword from "./Pages/ForgotPassword.jsx";
import ResetPassword from "./Pages/ResetPassword.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import AdminShell from "./components/Adminshell.jsx";
import Shop from "./Pages/Shop.jsx";
import Category from "./Pages/Category.jsx";
import OrdersLists from "./Pages/OrdersLists.jsx";
import CustomerHome from "./Pages/CustomerHome.jsx";
import DeliveryOrder from "./Pages/deliveryCompanyOrder.jsx"
import DeliveryStaff from "./Pages/deliveryCompanyStaff.jsx"
import DeliveryStaffOrders from "./Pages/DeliveryStaffOrders.jsx";
import CompanyPhoneOrders from "./Pages/CompanyPhoneOrders.jsx";
export default function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>

                    {/* LOGIN */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/customer/login" element={<CustomerLogin />} />
                    <Route path="/customer/register" element={<CustomerRegister />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password" element={<ResetPassword />} />

                    {/* ================= ADMIN ================= */}
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
                        <Route path="deliservice" element={<Delivery />} />
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

                    {/* CUSTOMER */}
                    <Route
                        path="/customer/home"
                        element={
                            <PrivateRoute allowedRoles={["customer"]} redirectTo="/customer/login">
                                <CustomerHome />
                            </PrivateRoute>
                        }
                    />

                    {/* ================= COMPANY ADMIN ================= */}
                    <Route
                        path="/company-admin"
                        element={
                            <PrivateRoute allowedRoles={["company-admin"]}>
                                <AdminShell />
                            </PrivateRoute>
                        }
                    >
                        <Route
                            path="companyadmindashboard"
                            element={<DeliveryCompanyAdminDashboard />}
                        />

                        {/* reuse pages if needed */}
                        <Route path="AssignedOrder" element={<DeliveryOrder />} />
                        <Route path="phone-orders" element={<CompanyPhoneOrders />} />
                        <Route path="delivery-staff" element={<DeliveryStaff />} />
                    </Route>

                    {/* ================= DELIVERY STAFF ================= */}
                    <Route
                        path="/delivery-staff/orders"
                        element={
                            <PrivateRoute allowedRoles={["company-staff"]} redirectTo="/login">
                                <DeliveryStaffOrders />
                            </PrivateRoute>
                        }
                    />

                    {/* ================= FALLBACK ================= */}
                    <Route path="*" element={<Login />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

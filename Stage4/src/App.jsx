import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Home from "./pages/Home/Home";
import Register from "./pages/Register/Register";
import Login from "./pages/Login/Login";
import RestaurantRegister from "./pages/RestaurantRegister/RestaurantRegister";
import RestaurantLogin from "./pages/RestaurantLogin/RestaurantLogin";
import AdminLogin from "./pages/AdminLogin/AdminLogin";
import AdminPendingRestaurants from "./pages/AdminPendingRestaurants/AdminPendingRestaurants";
import WeeklyMealSelection from "./pages/WeeklyMealSelection/WeeklyMealSelection";
import OrderSummary from "./pages/OrderSummary/OrderSummary";
import PaymentResult from "./pages/PaymentResult/PaymentResult";
import MyMeals from "./pages/MyMeals/MyMeals";
import AddMeal from "./pages/AddMeal/AddMeal";
import EditMeal from "./pages/EditMeal/EditMeal";
import CustomerDashboard from "./pages/CustomerDashboard/CustomerDashboard";
import Restaurants from "./pages/Restaurants/Restaurants";
import MealBrowse from "./pages/MealBrowse/MealBrowse";
import AdminDashboard from "./pages/AdminDashboard/AdminDashboard";
import AdminCustomers from "./pages/AdminCustomers/AdminCustomers";
import AdminOrders from "./pages/AdminOrders/AdminOrders";
import Payment from "./pages/Payment/Payment";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/restaurant-register" element={<RestaurantRegister />} />
          <Route path="/restaurant-login" element={<RestaurantLogin />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/pending-restaurants" element={<AdminPendingRestaurants />} />
          <Route path="/weekly-selection" element={<WeeklyMealSelection />} />
          <Route path="/order-summary" element={<OrderSummary />} />
          <Route path="/payment-result" element={<PaymentResult />} />
          <Route path="/restaurant/meals" element={<MyMeals />} />
          <Route path="/restaurant/meals/new" element={<AddMeal />} />
          <Route path="/restaurant/meals/:mealId/edit" element={<EditMeal />} />
          <Route path="/dashboard" element={<CustomerDashboard />} />
          <Route path="/restaurants" element={<Restaurants />} />
          <Route path="/restaurants/:restaurantId/meals" element={<MealBrowse />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/customers" element={<AdminCustomers />} />
          <Route path="/admin/orders" element={<AdminOrders />} />
          <Route path="/payment" element={<Payment />} />
        
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

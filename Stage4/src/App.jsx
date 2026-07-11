import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Home from "./pages/Home/Home";
import Register from "./pages/Register/Register";
import Login from "./pages/Login/Login";
import RestaurantRegister from "./pages/RestaurantRegister/RestaurantRegister";
import RestaurantLogin from "./pages/RestaurantLogin/RestaurantLogin";
import AdminPendingRestaurants from "./pages/AdminPendingRestaurants/AdminPendingRestaurants";
import WeeklyMealSelection from "./pages/WeeklyMealSelection/WeeklyMealSelection";
import OrderSummary from "./pages/OrderSummary/OrderSummary";
import MyMeals from "./pages/MyMeals/MyMeals";
import AddMeal from "./pages/AddMeal/AddMeal";
import EditMeal from "./pages/EditMeal/EditMeal";
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
          <Route path="/admin/pending-restaurants" element={<AdminPendingRestaurants />} />
          <Route path="/weekly-selection" element={<WeeklyMealSelection />} />
          <Route path="/order-summary" element={<OrderSummary />} />
          <Route path="/restaurant/meals" element={<MyMeals />} />
          <Route path="/restaurant/meals/new" element={<AddMeal />} />
          <Route path="/restaurant/meals/:mealId/edit" element={<EditMeal />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
import ProductList from "./Pages/ProductList"
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom'
import ProductDetails from "./Pages/ProductDetails";
import Navbar from "./components/Navbar";
import CartPage from "./Pages/CartPage";
import CheckOut from "./Pages/Checkout";
import PrivateRouter from "./components/PrivateRouter";
import Signup from "./Pages/SignUp";
import Login from "./Pages/LoginPage";

function App(){
  return(
    <div>
      <Router >
        <Navbar />
        <Routes>
          <Route path="/" element={<ProductList />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckOut />} />
          <Route element={<PrivateRouter />} >
            <Route path="/checkout" element={<CheckOut />} />
          </Route>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </Router>
    </div>
  )
}

export default App;
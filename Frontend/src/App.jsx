import ProductList from "./Pages/ProductList"
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom'
import ProductDetails from "./Pages/ProductDetails";
import Navbar from "./components/Navbar";
import CartPage from "./Pages/CartPage";

function App(){
  return(
    <div>
      <Router >
        <Navbar />
        <Routes>
          <Route path="/" element={<ProductList />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/cart" element={<CartPage />} />
        </Routes>
      </Router>
    </div>
  )
}

export default App;
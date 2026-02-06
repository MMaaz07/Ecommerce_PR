import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../Context/CartContext";

function CheckOut() {
  const BASEURL = import.meta.env.VITE_DJANGO_BASE_URL;
  const navigate = useNavigate();
  const { clearCart } = useCart();

  const [form, setForm] = useState({
    name: "",
    address: "",
    phone: "",
    payment_mode: "COD",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleChange=(e)=>{
    setForm({
        ...form,
        [e.target.name]:e.target.value,
    })
  }

  const handleSubmit= async (e)=>{
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try{
        const res= await fetch(`${BASEURL}/api/orders/create/`,{
            method:'POST',
            headers:{
                'Content-Type':'application/json'
            },
            body: JSON.stringify(form)
        })
        const data=await res.json();
        if(res.ok){
            setMessage("Order Placed Successfully")
            fetch(`${BASEURL}/api/cart`)
            clearCart();
            setTimeout(()=>{
                navigate("/");
            },2000);
        }
        else{
            setMessage(data.error || "Failed to Fetch Order.Try Again")
        }
    }
    catch(error){
        setMessage("An Error Occured. Please try again");
    }
    finally{
        setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center p-6">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6">CheckOut</h1>

        <form onSubmit={handleSubmit} className="space y-4">
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />
          <textarea
            name="address"
            placeholder="Address"
            value={form.address}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          ></textarea>
          <input
            type="tel"
            name="phone"
            placeholder="Phone Number"
            value={form.phone}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />
          <select
            name="payment_mode"
            value={form.payment_mode}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          >
            <option value="COD">Cash on Delivery</option>
            <option value="CreditCard">Online Payment</option>
          </select>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-300 "
          >
            {loading ? "Processing..." : "Place Order"}
          </button>
          {message && (
            <p className="text-center text-green-700 font semibold mt-4">
              {message}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}

export default CheckOut;

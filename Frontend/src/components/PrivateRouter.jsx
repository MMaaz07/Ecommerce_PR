import {Navigate, Outlet} from "react-router-dom";

const isAuthenticated=()=> !!localStorage.getItem("access_token");
const BASE_URL="https://ecommerce-backend-equf.onrender.com"

export default function PrivateRouter({redirectTo=`BASE_URL/login`}){
    return isAuthenticated()? <Outlet /> : <Navigate to={redirectTo} replace />;
};
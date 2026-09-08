import { Navigate, Outlet } from "react-router-dom";
import { useContext } from "react";
import { UserDataContext } from "../context/UserContext";

const UserProtectedWrapper = () => {

    const { user, loading } = useContext(UserDataContext);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};

export default UserProtectedWrapper;
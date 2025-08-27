import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

function RequireAuth({ allowedRoles }) {
  const { isLoggedIn, data } = useSelector((state) => state.auth);
  const role = data?.role;

  console.log("Checking auth:", { isLoggedIn, role, allowedRoles });

  if (role === undefined && isLoggedIn) {
    return <div>Loading...</div>;
  }

  return isLoggedIn && allowedRoles.includes(role)
    ? <Outlet />
    : isLoggedIn
      ? <Navigate to="/denied" />
      : <Navigate to="/login" />;
}
export default RequireAuth;
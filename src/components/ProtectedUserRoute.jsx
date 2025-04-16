import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";

const ProtectedUserRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    axios
      .get("http://localhost:8000/api/v1/auth/me", { withCredentials: true })
      .then((res) => {
        if (res.data.user && res.data.user.role === "admin") {
          setIsAdmin(true);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return null; // Or a spinner

  return isAdmin ? <Navigate to="/admin-dashboard" replace /> : children;
};

export default ProtectedUserRoute;
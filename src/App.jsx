import React, { useContext, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Auth from "./pages/auth";
import Profile from "./components/profile";
import EditProfile from "./components/editProfile"; // Import the EditProfile component
import PageLayout from "./pagelayout/pageLayout";
import Feed from "./pages/feed";
import Home from "./pages/Home";
import OtherProfile from "./components/otherProfile";
import ChatPage from "./pages/chat";
import { io } from "socket.io-client";
import { GlobalContext } from "./context";
import AdminDashboard from "./pages/AdminDashboard";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute";
import ProtectedUserRoute from "./components/ProtectedUserRoute";
// import { colors } from '@mui/material';

function App() {
  const { authUsers, setSocket, socket, setOnlineUsers } =
    useContext(GlobalContext);
  useEffect(() => {
    if (authUsers) {
      // console.log("Auth User ID:", authUsers?.id);
      const socketio = io("http://localhost:8000", {
        query: {
          userId: authUsers?.id,
        },
        transports: ["websocket"],
      });
      setSocket(socketio);

      socketio.on("getOnlineUsers", (onlineUsers) => {
        // console.log("Online users:", onlineUsers);
        setOnlineUsers(onlineUsers);
      });

      return () => {
        socketio.close();
        setSocket(null);
      };
    } else if (socket) {
      socket.close();
      setSocket(null);
    }
  }, [authUsers, setSocket, setOnlineUsers]);

  return (
    <Router>
      <PageLayout>
        <Routes>
          <Route path="/" element={<Auth />} />
          <Route
            path="/admin-dashboard"
            element={
              <ProtectedAdminRoute>
                <AdminDashboard />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/profile/"
            element={
              <ProtectedUserRoute>
                <Profile />
              </ProtectedUserRoute>
            }
          />
          <Route
            path="/edit-profile"
            element={
              <ProtectedUserRoute>
                <EditProfile />
              </ProtectedUserRoute>
            }
          />
          <Route
            path="/feed"
            element={
              <ProtectedUserRoute>
                <Feed />
              </ProtectedUserRoute>
            }
          />
          <Route
            path="/chat"
            element={
              <ProtectedUserRoute>
                <ChatPage />
              </ProtectedUserRoute>
            }
          />
          <Route
            path="/home"
            element={
              <ProtectedUserRoute>
                <Home />
              </ProtectedUserRoute>
            }
          />
          <Route
            path="/user"
            element={
              <ProtectedUserRoute>
                <OtherProfile />
              </ProtectedUserRoute>
            }
          />
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </PageLayout>
    </Router>
  );
}

export default App;

import { createContext, useEffect, useState } from "react";

export const GlobalContext = createContext(null);

export const GlobalState = ({ children }) => {
  const [profilePic, setProfilePic] = useState(() => {
    const storedProfilePic = sessionStorage.getItem("profilePic");
    return storedProfilePic ? JSON.parse(storedProfilePic) : null;
  });

  const [socket, setSocket] = useState(null); // Socket is typically not persisted

  const [onlineUsers, setOnlineUsers] = useState(() => {
    const storedOnlineUsers = sessionStorage.getItem("onlineUsers");
    return storedOnlineUsers ? JSON.parse(storedOnlineUsers) : [];
  });

  const [messages, setMessages] = useState(() => {
    const storedMessages = sessionStorage.getItem("messages");
    return storedMessages ? JSON.parse(storedMessages) : [];
  });

  const [authUsers, setAuthUsers] = useState(() => {
    const storedAuthUsers = sessionStorage.getItem("authUsers");
    return storedAuthUsers ? JSON.parse(storedAuthUsers) : null;
  });

  const [suggestedUsers, setSuggestedUsers] = useState(() => {
    const storedSuggestedUsers = sessionStorage.getItem("suggestedUsers");
    return storedSuggestedUsers ? JSON.parse(storedSuggestedUsers) : [];
  });

  const [selectedUser, setSelectedUser] = useState(() => {
    const storedSelectededUser = sessionStorage.getItem("selectedUser");
    return storedSelectededUser ? JSON.parse(storedSelectededUser) : null;
  });

  const [globalProfilePic, setGlobalProfilePic] = useState(() => {
    const storedGlobalProfilePic = sessionStorage.getItem("globalProfilePic");
    return storedGlobalProfilePic ? JSON.parse(storedGlobalProfilePic) : null;
  });

  // Persist states to sessionStorage whenever they change
  useEffect(() => {
    sessionStorage.setItem("profilePic", JSON.stringify(profilePic));
  }, [profilePic]);

  useEffect(() => {
    sessionStorage.setItem("onlineUsers", JSON.stringify(onlineUsers));
  }, [onlineUsers]);

  useEffect(() => {
    sessionStorage.setItem("messages", JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    sessionStorage.setItem("authUsers", JSON.stringify(authUsers));
  }, [authUsers]);

  useEffect(() => {
    sessionStorage.setItem("suggestedUsers", JSON.stringify(suggestedUsers));
  }, [suggestedUsers]);

  useEffect(() => {
    sessionStorage.setItem("selectedUser", JSON.stringify(selectedUser));
  }, [selectedUser]);

  useEffect(() => {
    sessionStorage.setItem(
      "globalProfilePic",
      JSON.stringify(globalProfilePic)
    );
  }, [globalProfilePic]);

  return (
    <GlobalContext.Provider
      value={{
        profilePic,
        setProfilePic,
        socket,
        setSocket,
        onlineUsers,
        setOnlineUsers,
        messages,
        setMessages,
        authUsers,
        setAuthUsers,
        suggestedUsers,
        setSuggestedUsers,
        selectedUser,
        setSelectedUser,
        globalProfilePic,
        setGlobalProfilePic,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

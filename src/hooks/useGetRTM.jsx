import React, { useContext, useEffect } from "react";
import { GlobalContext } from "../context";

const useGetRTM = () => {
  const { setMessages, messages, socket } = useContext(GlobalContext);
  useEffect(() => {
    socket?.on("newMessage", (newMessage) => {
      setMessages([...messages, newMessage]);
    });
    return () => {
      socket?.off("newMessage");
    };
  }, [messages, setMessages]);
};

export default useGetRTM;

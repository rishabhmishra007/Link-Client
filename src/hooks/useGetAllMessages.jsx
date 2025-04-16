import { useContext, useEffect } from "react";
import axios from "axios";
import { GlobalContext } from "../context";

const useGetAllMessages = () => {
  const { selectedUser, setMessages } = useContext(GlobalContext);
  useEffect(() => {
    const fetchAllMessage = async () => {
      try {
        const res = await axios.get(
          `http://localhost:8000/api/v1/message/all/${selectedUser?._id}`,
          {
            withCredentials: true,
          }
        );
        if(res.data.success){
          // console.log(res.data);
          
            setMessages(res.data.messages);
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchAllMessage();
  }, [selectedUser]);
};

export default useGetAllMessages;

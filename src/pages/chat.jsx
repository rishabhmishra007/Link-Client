import React, { useContext, useEffect, useRef, useState } from "react";
import { GlobalContext } from "../context";
import { Avatar, Button, IconButton, Tooltip } from "@mui/material";
import Input from "@mui/joy/Input";
import { LuMessageCircleCode } from "react-icons/lu";
import { IoSendSharp } from "react-icons/io5";
import { BsEmojiSmile } from "react-icons/bs";
import { MdSearch } from "react-icons/md";
import Messages from "../components/Messages";
import axios from "axios";
import EmojiPicker from "emoji-picker-react";

const ChatPage = () => {
  const {
    authUsers,
    suggestedUsers,
    selectedUser,
    setSelectedUser,
    onlineUsers,
    messages,
    setMessages,
  } = useContext(GlobalContext);
  const [textMessage, setTextMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef(null);
  // console.log("selectedUser", selectedUser);
  // console.log("suggestedUsers", suggestedUsers);
  // console.log("onlineUsers", onlineUsers);
  
  

  const sendMessageHandler = async (receiverId) => {
    if (!textMessage.trim()) return;

    try {
      const res = await axios.post(
        `http://localhost:8000/api/v1/message/send/${receiverId}`,
        { textMessage },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      if (res.data.success) {
        setMessages([...messages, res.data.newMessage]);
        setTextMessage("");
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Filter suggested users based on search query
  const filteredUsers = suggestedUsers.filter((user) =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle keyboard enter press for sending message
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey && selectedUser) {
      e.preventDefault();
      sendMessageHandler(selectedUser?._id);
    }
  };

  useEffect(() => {
    return () => {
      setSelectedUser(null);
    };
  }, []);

  const handleEmojiClick = (emojiObject) => {
    setTextMessage((prev) => prev + emojiObject.emoji); // Append the selected emoji to the message
  };

  const toggleEmojiPicker = () => {
    setShowEmojiPicker((prev) => !prev); // Toggle the emoji picker visibility
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false); // Close the emoji picker
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <section className="w-full md:w-1/4 lg:w-1/5 bg-white dark:bg-gray-800 shadow-md z-10 border-r border-gray-200 dark:border-gray-700">
        {/* User profile section */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Avatar
                src={
                  authUsers?.data?.profilePicture || "/default-profile-pic.jpg"
                }
                alt={authUsers?.data?.username}
                sx={{
                  width: 40,
                  height: 40,
                  boxShadow: "0 3px 5px rgba(0, 0, 0, 0.1)",
                }}
              />
              <h1 className="font-bold ml-3 text-lg text-gray-800 dark:text-gray-200">
                {authUsers?.data?.username}
              </h1>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative mb-3">
            <Input
              variant="outlined"
              size="sm"
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-gray-100 dark:bg-gray-700 rounded-full pl-9"
              sx={{
                "--Input-radius": "24px",
                "--Input-focusedThickness": "2px",
              }}
            />
            {/* <MdSearch className="absolute left-3 top-2.5 text-gray-500 dark:text-gray-400" size={16} /> */}
          </div>
        </div>

        {/* Contacts list */}
        <div className="overflow-y-auto h-[calc(100vh-130px)]">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No contacts found
            </div>
          ) : (
            filteredUsers.map((suggestedUser) => {
              const isOnline = onlineUsers.includes(suggestedUser._id);
              const isSelected = selectedUser?._id === suggestedUser._id;

              return (
                <div
                  key={suggestedUser.id}
                  onClick={() => setSelectedUser(suggestedUser)}
                  className={`flex items-center p-3 mx-2 my-1 rounded-lg cursor-pointer transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700 ${
                    isSelected ? "bg-blue-50 dark:bg-gray-700" : ""
                  }`}
                >
                  <div className="relative">
                    <Avatar
                      src={
                        suggestedUser?.profilePicture ||
                        "/default-profile-pic.jpg"
                      }
                      alt={suggestedUser?.username}
                      sx={{ width: 48, height: 48 }}
                    />
                    <span
                      className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white dark:border-gray-800 ${
                        isOnline ? "bg-green-500" : "bg-gray-400"
                      }`}
                    />
                  </div>

                  <div className="ml-3 flex-1">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-900 dark:text-gray-200">
                        {suggestedUser?.username}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date().toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[120px]">
                        {isOnline ? "Active now" : "Last seen recently"}
                      </span>
                      {false && (
                        <span className="bg-blue-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                          2
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* Chat area */}
      {selectedUser ? (
        <section className="flex-1 flex flex-col h-full bg-gray-50 dark:bg-gray-900">
          {/* Chat header */}
          <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center">
              <div className="relative">
                <Avatar
                  src={
                    selectedUser?.profilePicture || "/default-profile-pic.jpg"
                  }
                  alt={selectedUser?.username}
                  sx={{ width: 40, height: 40 }}
                />
                <span
                  className={`absolute bottom-0 right-0 h-2 w-2 rounded-full border-2 border-white dark:border-gray-800 ${
                    onlineUsers.includes(selectedUser._id)
                      ? "bg-green-500"
                      : "bg-gray-400"
                  }`}
                />
              </div>
              <div className="ml-3">
                <div className="font-medium text-gray-900 dark:text-gray-200">
                  {selectedUser?.username}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {onlineUsers.includes(selectedUser._id)
                    ? "Online"
                    : "Offline"}
                </div>
              </div>
            </div>
          </div>

          {/* Messages area */}
          <Messages selectedUser={selectedUser} />

          {/* Message input */}
          <div className="flex items-center p-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-inner md:pb-0 pb-16">
            <Tooltip title="Emoji">
              <IconButton
                size="small"
                className="text-gray-500 dark:text-gray-400 mr-2"
                onClick={toggleEmojiPicker} // Toggle emoji picker on click
              >
                <BsEmojiSmile className="text-white" />
              </IconButton>
            </Tooltip>

            {/* Emoji Picker */}
            {showEmojiPicker && (
              <div ref={emojiPickerRef} className="absolute bottom-16 left-80 z-50">
                <EmojiPicker onEmojiClick={handleEmojiClick} />
              </div>
            )}

            <Input
              variant="outlined"
              className="flex-grow bg-gray-100 dark:bg-gray-700"
              size="lg"
              placeholder="Type your message..."
              value={textMessage}
              onChange={(e) => setTextMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              sx={{
                "--Input-radius": "24px",
                "--Input-focusedThickness": "2px",
              }}
            />

            <Button
              onClick={() => sendMessageHandler(selectedUser?._id)}
              variant="contained"
              disabled={!textMessage.trim()}
              className="ml-2"
              sx={{
                minWidth: "40px",
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                padding: 0,
                backgroundColor: "#4f46e5",
                "&:hover": {
                  backgroundColor: "#4338ca",
                },
              }}
            >
              <IoSendSharp />
            </Button>
          </div>
        </section>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 text-center p-4">
          <div className="p-8 rounded-full bg-blue-50 dark:bg-gray-800 mb-4">
            <LuMessageCircleCode className="text-5xl sm:text-6xl md:text-7xl text-blue-500 dark:text-blue-400" />
          </div>
          <h1 className="text-xl md:text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
            Your Messages
          </h1>
          <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 max-w-md">
            Select a contact from the sidebar to start chatting
          </p>
        </div>
      )}
    </div>
  );
};

export default ChatPage;

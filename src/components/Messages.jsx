import { Avatar, Button } from "@mui/material";
import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { GlobalContext } from "../context";
import useGetAllMessages from "../hooks/useGetAllMessages";
import useGetRTM from "../hooks/useGetRTM";

const Messages = ({ selectedUser }) => {
  useGetRTM();
  useGetAllMessages();
  const { messages, authUsers, profilePic, globalProfilePic } =
    useContext(GlobalContext);
  // console.log(authUsers);

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
      {/* Header with user info */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
        <div className="flex items-center justify-center">
          <div className="flex flex-col items-center">
            <Avatar
              src={selectedUser?.profilePicture}
              alt={selectedUser?.username}
              sx={{ 
                width: { xs: 70, sm: 80, md: 90 }, 
                height: { xs: 70, sm: 80, md: 90 },
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
              }}
            />
            <span className="mt-2 font-medium text-lg dark:text-gray-200">
              {selectedUser?.username}
            </span>
            <Link to={`/profile/${selectedUser?._id}`}>
              <Button 
                className="h-8 my-2 text-xs md:text-sm" 
                variant="outlined" 
                size="small"
                sx={{
                  borderRadius: '20px',
                  textTransform: 'none',
                  minWidth: '100px',
                  transition: 'all 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
                  }
                }}
              >
                View profile
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
        {messages &&
          messages.map((message) => {
            const isSender = message.senderId === authUsers?.id;
            
            return (
              <div
                key={message._id}
                className={`flex w-full items-start ${
                  isSender ? "justify-end" : "justify-start"
                } mb-4`}
              >
                {/* Display Avatar for each message */}
                {!isSender && (
                  <Avatar
                    src={selectedUser?.profilePicture || "/default-profile-pic.jpg"}
                    alt={selectedUser?.username || "User"}
                    sx={{ 
                      width: 36, 
                      height: 36,
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                    }}
                    className="mr-2 flex-shrink-0"
                  />
                )}

                {/* Message Bubble */}
                <div
                  className={`p-3 rounded-2xl max-w-[75%] sm:max-w-[65%] md:max-w-[55%] shadow-sm ${
                    isSender
                      ? "bg-blue-600 text-white rounded-tr-none"
                      : "bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded-tl-none"
                  }`}
                >
                  <div className="flex flex-col gap-1">
                    <span className={`font-medium text-xs ${!isSender ? "text-blue-600 dark:text-blue-400" : "text-blue-100"}`}>
                      {isSender
                        ? authUsers?.username || "You"
                        : selectedUser?.username || "User"}
                    </span>
                    <span className="text-sm md:text-base whitespace-pre-wrap break-words">
                      {message.message}
                    </span>
                    <span className="text-xs opacity-70 text-right mt-1">
                      {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                {/* Display Avatar for sender */}
                {isSender && (
                  <Avatar
                    src={profilePic || "/default-profile-pic.jpg"}
                    alt={authUsers?.username || "User"}
                    sx={{ 
                      width: 36, 
                      height: 36,
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                    }}
                    className="ml-2 flex-shrink-0"
                  />
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default Messages;
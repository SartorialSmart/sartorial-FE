import { useState } from "react";
import { Send, Mail } from "lucide-react";

const messagesData = [
  {
    id: 1,
    name: "Jane",
    avatar: "/avatar.jpg",
    lastMessage: "Say hi to Jane",
    lastTime: "12:30",
    unreadCount: 10,
    messages: [
      { sender: "Sam Adams", text: "Are you coming for my presentation today? if not send someone", time: "Yesterday 3:30PM", type: "received" },
      { sender: "You", text: "Are you coming for my presentation today? if not send someone", time: "Yesterday 3:30PM", type: "sent" },
      { sender: "Sam Adams", text: "Are you coming for my presentation today? if not send someone", time: "Yesterday 3:30PM", type: "received" },
      { sender: "You", text: "Are you coming for my presentation today? if not send someone", time: "Yesterday 3:30PM", type: "sent" },
      { sender: "Sam Adams", text: "Are you coming for my presentation today? if not send someone", time: "Today 3:30PM", type: "received" },
      { sender: "You", text: "Are you coming for my presentation today? if not send someone", time: "Today 3:30PM", type: "sent" },
    ],
  },
];

const ChatComponent = () => {
  const [selectedChat, setSelectedChat] = useState(messagesData[0]);
  const [newMessage, setNewMessage] = useState("");

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    const updatedMessages = [
      ...selectedChat.messages,
      { sender: "You", text: newMessage, time: "Now", type: "sent" },
    ];
    setSelectedChat({ ...selectedChat, messages: updatedMessages });
    setNewMessage("");
  };

  return (
    <div className="flex h-screen bg-gray-100">

      <div className="w-1/3 bg-white border-r p-4">
        <h2 className="text-xl font-semibold mb-4">Messages</h2>
        <input type="text" placeholder="Search here..." className="w-full px-3 py-2 border rounded-lg mb-4" />
        <div>
          {messagesData.map((chat) => (
            <div
              key={chat.id}
              className={`flex items-center justify-between p-3 rounded-lg cursor-pointer ${
                selectedChat.id === chat.id ? "bg-gray-200" : "hover:bg-gray-100"
              }`}
              onClick={() => setSelectedChat(chat)}
            >
              <div className="flex items-center space-x-3">
                <img src={chat.avatar} alt={chat.name} className="w-10 h-10 rounded-full" />
                <div>
                  <p className="font-medium">{chat.name}</p>
                  <p className="text-gray-500 text-sm">{chat.lastMessage}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400">{chat.lastTime}</p>
                {chat.unreadCount > 0 && (
                  <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full">
                    {chat.unreadCount}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>


      <div className="w-2/3 flex flex-col">
        <div className="flex items-center justify-between p-4 bg-white border-b">
          <div className="flex items-center space-x-3">
            <img src={selectedChat.avatar} alt={selectedChat.name} className="w-10 h-10 rounded-full" />
            <div>
              <p className="text-lg font-semibold">{selectedChat.name}</p>
              <p className="text-green-500 text-sm">Online</p>
            </div>
          </div>
          <button className="flex items-center bg-gray-200 px-3 py-2 rounded-lg hover:bg-gray-300">
            <Mail size={16} className="mr-2" />
            Send Email
          </button>
        </div>


        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {selectedChat.messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.type === "sent" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-xs p-3 rounded-lg ${msg.type === "sent" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"}`}>
                <p className="text-sm">{msg.text}</p>
                <p className="text-xs mt-1 opacity-70">{msg.time}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t bg-white flex items-center">
          <input
            type="text"
            className="flex-1 border rounded-lg px-4 py-2"
            placeholder="Type your message here..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button onClick={handleSendMessage} className="ml-3 bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-600">
            <Send size={16} className="mr-2" />
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatComponent;

import ClientSideABrLayout from "../../components/navs/ClientSideBarLayout";
import ChatComponent from "../../components/messaging/Chat";

const ChatDisplay = () => {
  
  return (
    <ClientSideABrLayout>
      <div className="bg-gray-100 p-6 rounded-sm ">
        <ChatComponent />
      </div>
    </ClientSideABrLayout>
  );
};

export default ChatDisplay;

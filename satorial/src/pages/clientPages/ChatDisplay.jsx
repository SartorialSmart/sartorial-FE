import ClientSideABrLayout from "../../components/navs/ClientSideBarLayout";
import ChatComponent from "../../components/messaging/Chat";

const ChatDisplay = () => {
  
  return (
    <ClientSideABrLayout>
      <div className="space-y-6">
        <ChatComponent />
      </div>
    </ClientSideABrLayout>
  );
};

export default ChatDisplay;

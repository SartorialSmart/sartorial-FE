import { useState } from "react";
import { HelpCircle, Phone, Lock } from "lucide-react";
import FAQContent from "./FAQContent";
import ContactContent from "./ContactContent";
import PrivacyContent from "./PrivacyContent";

const HelpCenter = () => {
  const [activeModal, setActiveModal] = useState(null);

  const handleItemClick = (title) => {
    setActiveModal(title);
  };

  const handleCloseModal = () => {
    setActiveModal(null);
  };

  const getModalContent = () => {
    switch (activeModal) {
      case "FAQ":
        return <FAQContent onClose={handleCloseModal} />;
      case "Contact":
        return <ContactContent onClose={handleCloseModal} />;
      case "Privacy Policy":
        return <PrivacyContent onClose={handleCloseModal} />;
      default:
        return null;
    }
  };

  const helpItems = [
    {
      id: 1,
      title: "FAQ",
      description: "Find answers to frequently asked questions",
      icon: <HelpCircle className="w-6 h-6 text-blue-600" />,
    },
    {
      id: 2,
      title: "Contact",
      description: "Get in touch with our support team",
      icon: <Phone className="w-6 h-6 text-blue-600" />,
    },
    {
      id: 3,
      title: "Privacy Policy",
      description: "Learn about how we protect your data",
      icon: <Lock className="w-6 h-6 text-blue-600" />,
    },
  ];

  return (
    <div className=" p-8">
      <h2 className="text-2xl font-semibold mb-6">Help Centre</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {helpItems.map((item) => (
          <div
            key={item.id}
            className="bg-white p-6 rounded-xl shadow-sm flex flex-col items-start border hover:shadow-md transition cursor-pointer"
            onClick={() => handleItemClick(item.title)}
          >
            {item.icon}
            <h3 className="text-lg font-medium mt-4">{item.title}</h3>
            <p className="text-gray-500 text-sm mt-1">{item.description}</p>
          </div>
        ))}
      </div>

      {/* Modal Overlay */}
      {activeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          {getModalContent()}
        </div>
      )}
    </div>
  );
};

export default HelpCenter;

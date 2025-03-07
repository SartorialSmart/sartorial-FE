import { HelpCircle, Phone, Lock } from "lucide-react";

const helpItems = [
  {
    id: 1,
    icon: <HelpCircle size={28} className="text-blue-500" />,
    title: "FAQ",
    description: "Frequently Asked Questions",
  },
  {
    id: 2,
    icon: <Phone size={28} className="text-blue-500" />,
    title: "Contact",
    description: "Get Support From Us",
  },
  {
    id: 3,
    icon: <Lock size={28} className="text-blue-500" />,
    title: "Privacy Policy",
    description: "Instructions For Employees",
  },
];

const HelpCenter = () => {
  return (
    <div className="bg-gray-100 p-8">

      <div className="text-sm text-gray-500 mb-4">
        <span className="text-blue-500">Dashboard</span> &nbsp; ▸ &nbsp; Help Centre
      </div>


      <h2 className="text-2xl font-semibold mb-6">Help Centre</h2>


      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {helpItems.map((item) => (
          <div
            key={item.id}
            className="bg-white p-6 rounded-xl shadow-sm flex flex-col items-start border hover:shadow-md transition"
          >
            {item.icon}
            <h3 className="text-lg font-medium mt-4">{item.title}</h3>
            <p className="text-gray-500 text-sm mt-1">{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HelpCenter;

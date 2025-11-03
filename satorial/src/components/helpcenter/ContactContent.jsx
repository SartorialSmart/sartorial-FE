import { X } from "lucide-react";
import officeSvg from "../../assets/images/social/office.svg";
import mailSvg from "../../assets/images/social/mail.svg";
import chatSvg from "../../assets/images/social/chat.svg";

const ContactContent = ({ onClose }) => {
  return (
    <div className="relative bg-white p-6 rounded-lg shadow-lg max-w-4xl mx-auto">
      <button
        onClick={onClose}
        className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
      >
        <X size={20} />
      </button>

      <h2 className="text-2xl font-semibold">Contact Support</h2>

      <hr className="my-4" />

      <div className="flex flex-row space-x-4">
        <div className="inline-block border p-4 rounded-xl space-y-4 mb-6">
          <div className="flex items-center justify-center">
            <img
              src={officeSvg}
              alt="Office"
              className="w-[50px] h-[50px] object-contain"
            />
          </div>

          <div className="mt-6 space-y-2 flex flex-col items-center">
            <h2 className="text-gray-700 text-[28px]">Office</h2>
            <p className="text-gray-700 text-[16px]">
              1817 Marshville Road, Ste 125
            </p>
            <p className="text-gray-700 text-[16px]">ATLANTA, GA 30308</p>
          </div>
        </div>

        <div className="inline-block border p-4 rounded-xl space-y-4 mb-6">
          <div className="flex items-center justify-center">
            <img
              src={mailSvg}
              alt="Mail"
              className="w-[50px] h-[50px] object-contain"
            />
          </div>

          <div className="mt-6 space-y-2 flex flex-col items-center">
            <h2 className="text-gray-700 text-[28px]">Mail</h2>
            <p className="text-gray-700 text-[16px]">Send us Email</p>
            <p className="text-gray-700 text-[16px]">support@creatt.in</p>
          </div>
        </div>

        <div className="inline-block border p-4 rounded-xl space-y-4 mb-6">
          <div className="flex items-center justify-center">
            <img
              src={chatSvg}
              alt="Chat"
              className="w-[50px] h-[50px] object-contain"
            />
          </div>

          <div className="mt-6 space-y-2 flex flex-col items-center">
            <h2 className="text-gray-700 text-[28px]">Live Support</h2>
            <p className="text-gray-700 text-[16px]">+(800) 486-9872</p>
            <p className="text-gray-700 text-[16px]">Connect with Live Agent</p>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={onClose}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default ContactContent;

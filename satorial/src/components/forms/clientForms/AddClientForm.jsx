import { useState, useEffect } from "react";
import { X, Calendar, Upload } from "lucide-react";
import ClientService from "../../../services/ClientService";
import { useAuth } from "../../../contexts/AuthContext";
import SuccessModal from "../../modals/SuccessModal";

const AddClientForm = ({ onNext, onClose }) => {
  const { user } = useAuth();

  const initialFormData = {
    first_name: localStorage.getItem("first_name") || "",
    last_name: localStorage.getItem("last_name") || "",
    email: localStorage.getItem("email") || "",
    phone_number: localStorage.getItem("phone_number") || "",
    birthdate: localStorage.getItem("birthdate") || "",
    gender: localStorage.getItem("gender") || "Female",
    house_number: localStorage.getItem("house_number") || "",
    street: localStorage.getItem("street") || "",
    city: localStorage.getItem("city") || "",
    state: localStorage.getItem("state") || "",
    country: localStorage.getItem("country") || "",
    postal_code: localStorage.getItem("postal_code") || "",
    client_image: null,
  };

  const [formData, setFormData] = useState(initialFormData);
  const [clientId, setClientId] = useState(localStorage.getItem("clientId") || "");
  const [preview, setPreview] = useState(localStorage.getItem("clientImagePreview") || null);
  const [loading, setLoading] = useState(false);
  const [modalData, setModalData] = useState(null);

  useEffect(() => {
    const storedPreview = localStorage.getItem("clientImagePreview");
    if (storedPreview) {
      setPreview(storedPreview);
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    localStorage.setItem(name, value);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, client_image: file }));
      const imageUrl = URL.createObjectURL(file);
      setPreview(imageUrl);
      localStorage.setItem("clientImagePreview", imageUrl);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value) {
          formDataToSend.append(key, value);
        }
      });

      const createdClient = await ClientService.createClient(formDataToSend);

      if (createdClient?.id) {
        setClientId(createdClient.id);
        localStorage.setItem("clientId", createdClient.id);

        const addressData = {
          client: createdClient.id,
          house_number: formData.house_number,
          street: formData.street,
          city: formData.city,
          state: formData.state,
          country: formData.country,
          postal_code: formData.postal_code,
        };

        await ClientService.createClientAddress(addressData);

        onNext(createdClient.id);
      }
    } catch (err) {
      let message = "Failed to create client. Please try again.";
      if (err.response?.data) {
        message = Object.entries(err.response.data)
          .map(([field, errors]) => `${field.replace("_", " ")}: ${errors.join(", ")}`)
          .join(". ");
      }
      setModalData({ title: "Error!", message, buttonText: "Close" });
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {modalData && <SuccessModal {...modalData} onClose={() => setModalData(null)} />}

      <div className="fixed inset-0 bg-black/40 flex justify-center items-center p-4">
        <div className="bg-white rounded-lg w-full max-w-3xl relative p-6">
          <button onClick={onClose} className="absolute top-4 right-4">
            <X size={20} />
          </button>

          <h2 className="text-2xl font-semibold mb-4">Add Client</h2>

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Personal Details</h3>

            <div className="flex items-center gap-4">
              <label className="relative border border-blue-500 text-blue-500 px-4 py-2 rounded-lg hover:bg-blue-50 flex items-center cursor-pointer">
                <Upload size={18} className="mr-2" />
                Upload Picture
                <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              </label>

              {preview && <img src={preview} alt="Profile Preview" className="w-16 h-16 rounded-full object-cover border border-gray-300" />}
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              {["first_name", "last_name", "email", "phone_number"].map((field) => (
                <input
                  key={field}
                  type={field === "email" ? "email" : "text"}
                  name={field}
                  placeholder={field.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                  value={formData[field]}
                  onChange={handleChange}
                  className="border rounded-lg px-4 py-2 w-full"
                />
              ))}

              <div className="relative w-full">
                <input type="date" name="birthdate" value={formData.birthdate} onChange={handleChange} className="border rounded-lg px-4 py-2 w-full" />
                <Calendar size={18} className="absolute top-3 right-4 text-gray-400" />
              </div>

              <div className="flex items-center gap-4">
                <label className="text-gray-600">Gender:</label>
                {["Male", "Female", "Other"].map((gender) => (
                  <label key={gender} className="flex items-center">
                    <input type="radio" name="gender" value={gender} checked={formData.gender === gender} onChange={handleChange} className="mr-1" />
                    {gender}
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Billing Address</h3>

            <div className="grid grid-cols-2 gap-4">
              {["house_number", "street", "city", "state", "country", "postal_code"].map((field) => (
                <input
                  key={field}
                  type="text"
                  name={field}
                  placeholder={field.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                  value={formData[field]}
                  onChange={handleChange}
                  className="border rounded-lg px-4 py-2 w-full"
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <button onClick={handleSubmit} disabled={loading} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
              {loading ? "Saving..." : "Next: Measurement"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddClientForm;

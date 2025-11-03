import { useState, useEffect } from "react";
import { Edit, UploadCloud } from "lucide-react";
import InputField from "../../miniComponents/InputField";
import ClientService from "../../../services/ClientService";
import DEFAULT_AVATAR from "../../../assets/images/default_avatar.svg"

const ClientGeneralInfo = ({ clientId }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [client, setClient] = useState(null);
  const [editedClient, setEditedClient] = useState(null);
  const [clientAddress, setClientAddress] = useState(null);

  useEffect(() => {
    const fetchClientData = async () => {
      try {
        const data = await ClientService.getClientById(clientId);
        if (data.client_image) {
          data.client_image = data.client_image.replace("image/upload/", "");
        }
        setClient(data);
        setEditedClient({ ...data });

        if (data.addresses?.length) {
          const addressData = await ClientService.getClientAddressById(data.addresses[0].id);
          setClientAddress(addressData);
        }
      } catch (error) {
        console.error("Error fetching client data:", error);
      }
    };

    if (clientId) fetchClientData();
  }, [clientId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedClient((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setClientAddress((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
  
    const formData = new FormData();
    formData.append("client_image", file); 
  
    try {
      const updatedClient = await ClientService.updateClient(clientId, formData, true);
      updatedClient.client_image = updatedClient.client_image.replace("image/upload/", "");
      setClient((prev) => ({ ...prev, client_image: updatedClient.client_image }));
    } catch (error) {
      console.error("Error uploading client image:", error);
    }
  };
  

  const handleSave = async () => {
    setIsSaving(true);
  
    const formData = new FormData();
    Object.keys(editedClient).forEach((key) => {
      if (key === "client_image") return; 
      formData.append(key, editedClient[key] || ""); 
    });
  
    try {
      await ClientService.updateClient(clientId, formData, true);
      setClient(editedClient);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating client:", error);
    }
  
    setIsSaving(false);
  };
  
  if (!client) return <p>Loading client data...</p>;

  return (
    <div className="bg-white p-6 mt-4 rounded-lg shadow">
      <h3 className="text-lg font-medium">Personal Details</h3>
      <div className="flex items-center mt-4">
        <img src={client.client_image || DEFAULT_AVATAR } alt="Profile" className="w-20 h-20 rounded-full border" />
        <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="fileInput" />
        <label htmlFor="fileInput" className="ml-4 flex items-center px-3 py-2 border rounded-lg text-blue-600 hover:bg-gray-100 cursor-pointer">
          <UploadCloud size={16} className="mr-2" /> Upload
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        {["first_name", "last_name", "email", "phone_number", "birthdate"].map((field) => (
          <InputField key={field} label={field.replace("_", " ")} name={field} value={editedClient?.[field] || ""} readOnly={!isEditing || isSaving} onChange={handleChange} />
        ))}
      </div>

      <div className="mt-4">
        <label className="text-gray-600 block mb-2">Gender</label>
        <div className="flex items-center">
          {["Male", "Female"].map(gender => (
            <label key={gender} className="mr-4 flex items-center">
              <input
                type="radio"
                name="gender"
                value={gender}
                checked={editedClient?.gender === gender}
                disabled={!isEditing || isSaving}
                onChange={handleChange}
                className="mr-2"
              />
              {gender}
            </label>
          ))}
        </div>
      </div>

      <h3 className="text-lg font-medium mt-6">Billing Address</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        {["house_number", "street", "city", "state", "country", "postal_code"].map((field) => (
          <InputField key={field} label={field.replace("_", " ")} name={field} value={clientAddress?.[field] || ""} readOnly={!isEditing || isSaving} onChange={handleAddressChange} />
        ))}
      </div>

      <div className="mt-6 flex justify-end">
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
          disabled={isSaving}
        >
          {isEditing ? (isSaving ? "Saving..." : "Save") : "Edit"}
        </button>
      </div>
    </div>
  );
};

export default ClientGeneralInfo;
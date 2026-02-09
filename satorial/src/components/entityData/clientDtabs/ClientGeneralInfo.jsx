import { useState, useEffect } from "react";
import { Edit2, Save, X, Upload, User, Mail, Phone, Calendar, MapPin, Check } from "lucide-react";
import InputField from "../../miniComponents/InputField";
import ClientService from "../../../services/ClientService";
import DEFAULT_AVATAR from "../../../assets/images/default_avatar.svg";

const ClientGeneralInfo = ({ clientId }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [client, setClient] = useState(null);
  const [editedClient, setEditedClient] = useState(null);
  const [clientAddress, setClientAddress] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

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
          const addressData = await ClientService.getClientAddressById(
            data.addresses[0].id
          );
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

    setIsUploading(true);
    const formData = new FormData();
    formData.append("client_image", file);

    try {
      const updatedClient = await ClientService.updateClient(
        clientId,
        formData,
        true
      );
      updatedClient.client_image = updatedClient.client_image.replace(
        "image/upload/",
        ""
      );
      setClient((prev) => ({
        ...prev,
        client_image: updatedClient.client_image,
      }));
    } catch (error) {
      console.error("Error uploading client image:", error);
    } finally {
      setIsUploading(false);
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

      // Also update address if it exists
      if (clientAddress?.id) {
        await ClientService.updateClientAddress(clientAddress.id, {
          house_number: clientAddress.house_number,
          street: clientAddress.street,
          city: clientAddress.city,
          state: clientAddress.state,
          country: clientAddress.country,
          postal_code: clientAddress.postal_code,
        });
      }

      setClient(editedClient);
      setIsEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Error updating client:", error);
    }

    setIsSaving(false);
  };

  const handleCancel = () => {
    setEditedClient({ ...client });
    setIsEditing(false);
  };

  if (!client)
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {saveSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3 animate-fade-in">
          <div className="flex-shrink-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
            <Check size={16} className="text-white" />
          </div>
          <p className="text-green-800 font-medium">
            Client information updated successfully!
          </p>
        </div>
      )}

      {/* Personal Details Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
          <h3 className="text-xl font-semibold text-white flex items-center">
            <User size={20} className="mr-2" />
            Personal Details
          </h3>
        </div>

        <div className="p-6">
          {/* Profile Image Section */}
          <div className="flex items-center space-x-6 mb-8 pb-6 border-b border-gray-200">
            <div className="relative group">
              <div className="relative">
                <img
                  src={client.client_image || DEFAULT_AVATAR}
                  alt="Profile"
                  className="w-24 h-24 rounded-full border-4 border-gray-100 shadow-md object-cover"
                />
                {isUploading && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                  </div>
                )}
              </div>
            </div>
            <div className="flex-1">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="fileInput"
                disabled={isUploading}
              />
              <label
                htmlFor="fileInput"
                className="inline-flex items-center px-4 py-2 bg-blue-50 border-2 border-blue-200 rounded-lg text-blue-700 hover:bg-blue-100 cursor-pointer transition-all font-medium"
              >
                <Upload size={18} className="mr-2" />
                {isUploading ? "Uploading..." : "Change Photo"}
              </label>
              <p className="text-sm text-gray-500 mt-2">
                JPG, PNG or GIF. Max size 5MB
              </p>
            </div>
          </div>

          {/* Personal Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { field: "first_name", label: "First Name", icon: User },
              { field: "last_name", label: "Last Name", icon: User },
              { field: "email", label: "Email Address", icon: Mail },
              { field: "phone_number", label: "Phone Number", icon: Phone },
              { field: "birthdate", label: "Birth Date", icon: Calendar },
            ].map(({ field, label, icon: Icon }) => (
              <div key={field} className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {label}
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Icon size={18} />
                  </div>
                  <input
                    type={field === "birthdate" ? "date" : "text"}
                    name={field}
                    value={editedClient?.[field] || ""}
                    readOnly={!isEditing || isSaving}
                    onChange={handleChange}
                    className={`w-full pl-11 pr-4 py-3 border rounded-lg transition-all ${
                      isEditing && !isSaving
                        ? "border-blue-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        : "border-gray-200 bg-gray-50 text-gray-700"
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Gender Selection */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Gender
            </label>
            <div className="flex items-center space-x-6">
              {["Male", "Female"].map((gender) => (
                <label
                  key={gender}
                  className={`flex items-center px-6 py-3 rounded-lg border-2 cursor-pointer transition-all ${
                    editedClient?.gender === gender
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  } ${!isEditing || isSaving ? "opacity-60 cursor-not-allowed" : ""}`}
                >
                  <input
                    type="radio"
                    name="gender"
                    value={gender}
                    checked={editedClient?.gender === gender}
                    disabled={!isEditing || isSaving}
                    onChange={handleChange}
                    className="mr-3 w-4 h-4 text-blue-600"
                  />
                  <span className="font-medium">{gender}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Billing Address Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4">
          <h3 className="text-xl font-semibold text-white flex items-center">
            <MapPin size={20} className="mr-2" />
            Billing Address
          </h3>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              "house_number",
              "street",
              "city",
              "state",
              "country",
              "postal_code",
            ].map((field) => (
              <div key={field} className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                  {field.replace("_", " ")}
                </label>
                <input
                  type="text"
                  name={field}
                  value={clientAddress?.[field] || ""}
                  readOnly={!isEditing || isSaving}
                  onChange={handleAddressChange}
                  className={`w-full px-4 py-3 border rounded-lg transition-all ${
                    isEditing && !isSaving
                      ? "border-blue-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      : "border-gray-200 bg-gray-50 text-gray-700"
                  }`}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4">
        {isEditing && (
          <button
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all font-medium flex items-center shadow-sm"
            onClick={handleCancel}
            disabled={isSaving}
          >
            <X size={18} className="mr-2" />
            Cancel
          </button>
        )}
        <button
          className={`px-6 py-3 rounded-lg transition-all font-medium flex items-center shadow-md ${
            isEditing
              ? "bg-green-600 hover:bg-green-700 text-white"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          } disabled:opacity-50 disabled:cursor-not-allowed`}
          onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
          disabled={isSaving}
        >
          {isEditing ? (
            <>
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save size={18} className="mr-2" />
                  Save Changes
                </>
              )}
            </>
          ) : (
            <>
              <Edit2 size={18} className="mr-2" />
              Edit Details
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ClientGeneralInfo;
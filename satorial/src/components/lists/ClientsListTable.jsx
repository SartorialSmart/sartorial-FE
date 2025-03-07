import { useState, useEffect, useRef } from "react";
import { MoreVertical, Trash, X } from "lucide-react";
import ClientService from "../../services/ClientService";

const ClientsList = () => {
  const [clients, setClients] = useState([]);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [clientToDelete, setClientToDelete] = useState(null);
  const [loading, setLoading] = useState(false);

  const dropdownRefs = useRef([]);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const data = await ClientService.getClients();
        setClients(data);
        dropdownRefs.current = data.map(() => React.createRef());
      } catch (error) {
        console.error("Failed to fetch clients:", error);
      }
    };
    fetchClients();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        activeDropdown !== null &&
        dropdownRefs.current[activeDropdown] &&
        !dropdownRefs.current[activeDropdown].current.contains(event.target)
      ) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [activeDropdown]);

  const handleDropdownClick = async (index, clientId) => {
    setActiveDropdown(activeDropdown === index ? null : index);
    try {
      const clientData = await ClientService.getClientById(clientId);
      setSelectedClient(clientData);
    } catch (error) {
      console.error("Failed to fetch client details:", error);
    }
  };

  const handleDeleteClick = (clientId) => {
    setClientToDelete(clientId);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!clientToDelete) return;
    setLoading(true);
    try {
      await ClientService.deleteClient(clientToDelete);
      setClients(clients.filter((client) => client.id !== clientToDelete));
      setShowDeleteModal(false);
    } catch (error) {
      console.error("Error deleting client:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 bg-gray-100">
      <h2 className="text-xl font-semibold mb-4">Clients List</h2>
      <div className="overflow-x-auto bg-white rounded-lg shadow-md border">
        <table className="w-full border-collapse min-w-[600px]">
          <thead>
            <tr className="bg-gray-200 text-left text-xs sm:text-sm">
              <th className="p-2 sm:p-3 font-medium">Client Name</th>
              <th className="p-2 sm:p-3 font-medium">Email</th>
              <th className="p-2 sm:p-3 font-medium">Phone</th>
              <th className="p-2 sm:p-3 font-medium">Address</th>
              <th className="p-2 sm:p-3 w-8">Actions</th>
            </tr>
          </thead>
          <tbody>
            {clients.length > 0 ? (
              clients.map((client, index) => {
                const firstAddress =
                  client.addresses.length > 0
                    ? `${client.addresses[0].house_number}, ${client.addresses[0].street}, ${client.addresses[0].city}`
                    : "No address available";

                return (
                  <tr key={index} className="border-t hover:bg-gray-50 transition">
                    <td className="p-2 sm:p-3 text-xs sm:text-sm">
                      {client.first_name} {client.last_name}
                    </td>
                    <td className="p-2 sm:p-3 text-xs sm:text-sm">{client.email}</td>
                    <td className="p-2 sm:p-3 text-xs sm:text-sm">{client.phone_number}</td>
                    <td className="p-2 sm:p-3 text-xs sm:text-sm">{firstAddress}</td>
                    <td className="p-2 sm:p-3 w-8 text-gray-600 relative">
                      <div
                        className="border border-gray-400 rounded-md p-1 cursor-pointer hover:text-gray-800 text-gray-500 transition inline-block"
                        onClick={() => handleDropdownClick(index, client.id)}
                      >
                        <MoreVertical size={16} />
                      </div>
                      {activeDropdown === index && (
                        <div className="absolute -top-4 right-0 mt-1 w-24 bg-white shadow-lg border rounded-md text-sm z-50">
                          <a
                            href={`/client-data/${client.id}`}
                            className="block px-3 py-2 hover:bg-gray-100 cursor-pointer"
                          >
                            View
                          </a>
                          <button
                            onClick={() => handleDeleteClick(client.id)}
                            className="block w-full text-left px-3 py-2 text-red-500 hover:bg-red-100"
                          >
                            <Trash size={14} className="inline-block mr-1" />
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} className="p-3 text-center text-xs text-gray-500">
                  No clients found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center p-4">
          <div className="bg-white rounded-lg w-full max-w-sm p-6">
            <button onClick={() => setShowDeleteModal(false)} className="absolute top-4 right-4">
              <X size={20} />
            </button>
            <h2 className="text-lg font-semibold mb-4">Confirm Deletion</h2>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete this client? This action cannot be undone.
            </p>
            <div className="flex justify-between">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="border border-gray-400 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700"
                disabled={loading}
              >
                {loading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientsList;

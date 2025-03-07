import { MoreVertical } from "lucide-react";

const columns = [
  { key: "order_allocation_details", label: "Order Allocation Details" },
  { key: "status", label: "Status" },
  { key: "assigned_to", label: "Assigned To" },
  { key: "actions", label: "Actions" },
];

const data = [
  {
    order_allocation_details: {
      image: "/wedding-dress.jpg",
      name: "Wedding Dress",
      description: "5 piece white wedding dress set",
    },
    status: "Unallocated",
    assigned_to: null,
  },
  {
    order_allocation_details: {
      image: "/wedding-dress.jpg",
      name: "Wedding Dress",
      description: "5 piece white wedding dress set",
    },
    status: "Unallocated",
    assigned_to: null,
  },
  {
    order_allocation_details: {
      image: "/wedding-dress.jpg",
      name: "Wedding Dress",
      description: "5 piece white wedding dress set",
    },
    status: "Allocated",
    assigned_to: {
      name: "Lara Adams",
      email: "lara@gmail.com",
      avatar: "/lara-avatar.jpg",
    },
  },
  {
    order_allocation_details: {
      image: "/wedding-dress.jpg",
      name: "Wedding Dress",
      description: "5 piece white wedding dress set",
    },
    status: "Allocated",
    assigned_to: {
      name: "Lara Adams",
      email: "lara@gmail.com",
      avatar: "/lara-avatar.jpg",
    },
  },
];

const getStatusClass = (status) => {
  return status === "Allocated"
    ? "bg-green-100 text-green-700"
    : "bg-yellow-100 text-yellow-700";
};

const AllocationListTable = () => {
  return (
    <div className="p-4 sm:p-6 bg-gray-100">
      <h2 className="text-xl sm:text-2xl font-semibold mb-4">
        Allocation List
      </h2>

      <div className="overflow-x-auto bg-white rounded-lg shadow-md border">
        <table className="w-full border-collapse min-w-[700px]">
          <thead>
            <tr className="bg-gray-200 text-left text-sm sm:text-base">
              <th className="p-3 sm:p-4 w-12">
                <input type="checkbox" className="w-4 h-4" />
              </th>
              {columns.map((col, index) => (
                <th key={index} className="p-3 sm:p-4 font-medium">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className="border-t hover:bg-gray-50 transition"
              >
                <td className="p-3 sm:p-4 w-12">
                  <input type="checkbox" className="w-4 h-4" />
                </td>


                <td className="p-3 sm:p-4 text-sm sm:text-base flex items-center space-x-3">
                  <img
                    src={row.order_allocation_details.image}
                    alt={row.order_allocation_details.name}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                  <div>
                    <p className="font-medium">{row.order_allocation_details.name}</p>
                    <p className="text-gray-500 text-sm">
                      {row.order_allocation_details.description}
                    </p>
                  </div>
                </td>

                <td className="p-3 sm:p-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusClass(
                      row.status
                    )}`}
                  >
                    {row.status}
                  </span>
                </td>


                <td className="p-3 sm:p-4">
                  {row.assigned_to ? (
                    <div className="flex items-center space-x-3">
                      <img
                        src={row.assigned_to.avatar}
                        alt={row.assigned_to.name}
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                      <div>
                        <p className="font-medium">{row.assigned_to.name}</p>
                        <p className="text-gray-500 text-sm">
                          {row.assigned_to.email}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <span className="text-gray-500">Nil</span>
                  )}
                </td>

                <td className="p-3 sm:p-4 text-blue-600 cursor-pointer hover:underline">
                  {row.assigned_to ? "Reassign" : "Assign"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AllocationListTable;

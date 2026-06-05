import Toolbar_1 from "../../components/toolbars/Toolbar_1";
import ClientSideABrLayout from "../../components/navs/ClientSideBarLayout";
import OrderListTable from "../../components/lists/OrderListTable";
import { useState } from "react";

const ClientOrderListDisplay = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  return (
    <ClientSideABrLayout>
      <div className="space-y-6">
        <Toolbar_1
          hideExport
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          filterBy={statusFilter}
          onFilterChange={setStatusFilter}
          filterOptions={[
            { value: "All", label: "All statuses" },
            { value: "Pending", label: "Pending" },
            { value: "In Progress", label: "In Progress" },
            { value: "Completed", label: "Completed" },
          ]}
        />
        <OrderListTable
          showAddButton={false}
          showEditAction={false}
          searchTerm={searchQuery}
          statusFilter={statusFilter}
          dateFilter={"All Time"}
        />
      </div>
    </ClientSideABrLayout>
  );
};

export default ClientOrderListDisplay;

import Toolbar_1 from "../../components/toolbars/Toolbar_1";
import ClientSideABrLayout from "../../components/navs/ClientSideBarLayout";
import ClientsList from "../../components/lists/ClientsListTable";
import { useState } from "react";

const ClientsListDisplay = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterBy, setFilterBy] = useState("all");

  return (
    <ClientSideABrLayout>
      <div className="space-y-6">
        <Toolbar_1
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          filterBy={filterBy}
          onFilterChange={setFilterBy}
        />
        <ClientsList searchQuery={searchQuery} filterBy={filterBy} />
      </div>
    </ClientSideABrLayout>
  );
};

export default ClientsListDisplay;

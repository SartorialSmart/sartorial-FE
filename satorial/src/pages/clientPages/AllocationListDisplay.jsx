import Toolbar_1 from "../../components/toolbars/Toolbar_1";
import ClientSideABrLayout from "../../components/navs/ClientSideBarLayout";
import AllocationListTable from "../../components/lists/AllocationListTable";
import { useState } from "react";

const AllocationsListDisplay = () => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <ClientSideABrLayout>
      <div className="space-y-6">
        <Toolbar_1
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          filterBy={"all"}
          onFilterChange={() => {}}
          filterOptions={[{ value: "all", label: "All" }]}
        />
        <AllocationListTable searchTerm={searchQuery} />
      </div>
    </ClientSideABrLayout>
  );
};

export default AllocationsListDisplay;

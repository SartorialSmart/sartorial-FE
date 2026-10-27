import Toolbar_1 from "../../components/toolbars/Toolbar_1";
import ClientSideABrLayout from "../../components/navs/ClientSideBarLayout";
import ClientsList from "../../components/lists/ClientsListTable";
import ImportClientsModal from "../../components/modals/formModals/ImportClientsModal";
import { useState, useRef } from "react";

const ClientsListDisplay = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterBy, setFilterBy] = useState("all");
  const [importModalOpen, setImportModalOpen] = useState(false);
  const clientsListRef = useRef();

  return (
    <ClientSideABrLayout>
      <div className="space-y-6">
        <Toolbar_1
          title="Clients Management"
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          filterBy={filterBy}
          onFilterChange={setFilterBy}
          onExport={() => clientsListRef.current?.handleExport()}
          onImport={() => setImportModalOpen(true)}
        />
        <ClientsList ref={clientsListRef} searchQuery={searchQuery} filterBy={filterBy} />
      </div>
      <ImportClientsModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onSuccess={() => clientsListRef.current?.refreshClients?.()}
      />
    </ClientSideABrLayout>
  );
};

export default ClientsListDisplay;

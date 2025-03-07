import Toolbar_1 from "../../components/toolbars/Toolbar_1";
import ClientSideABrLayout from "../../components/navs/ClientSideBarLayout";
import AllocationListTable from "../../components/lists/AllocationListTable";

const AllocationsListDisplay = () => {
  
  return (
    <ClientSideABrLayout>
      <div className="bg-gray-100 p-6 rounded-sm">
        <Toolbar_1 />
        <AllocationListTable />
      </div>
    </ClientSideABrLayout>
  );
};

export default AllocationsListDisplay;

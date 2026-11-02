import InventorySideBarLayout from "../../components/navs/InventorySideBarLayout";
import DispenseInventoryList from "../../components/lists/DispenseInventoryList";

const DispenseInventoryListDisplay = () => {
  
  return (
    <InventorySideBarLayout>
      <div className="space-y-6">
        <DispenseInventoryList />
      </div>
    </InventorySideBarLayout>
  );
};

export default DispenseInventoryListDisplay;

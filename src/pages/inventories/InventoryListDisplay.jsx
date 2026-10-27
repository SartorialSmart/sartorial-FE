import InventorySideBarLayout from "../../components/navs/InventorySideBarLayout";
import InventoryList from "../../components/lists/InventoryList";

const InventoryListDisplay = () => {
  
  return (
    <InventorySideBarLayout>
      <div className="space-y-6">
        <InventoryList />
      </div>
    </InventorySideBarLayout>
  );
};

export default InventoryListDisplay;

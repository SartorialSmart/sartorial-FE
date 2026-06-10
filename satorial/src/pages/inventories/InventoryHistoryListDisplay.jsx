import InventorySideBarLayout from "../../components/navs/InventorySideBarLayout";
import InventoryHistoryList from "../../components/lists/InventoryHistoryList";

const InventoryHistoryListDisplay = () => {
  return (
    <InventorySideBarLayout>
      <div className="space-y-6">
        <InventoryHistoryList />
      </div>
    </InventorySideBarLayout>
  );
};

export default InventoryHistoryListDisplay;

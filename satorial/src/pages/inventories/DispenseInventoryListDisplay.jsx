import InventorySideBarLayout from "../../components/navs/InventorySideBarLayout";
import DispenseInventoryList from "../../components/lists/DispenseInventoryList";

const DispenseInventoryListDisplay = () => {
  
  return (
    <InventorySideBarLayout>
      <div className="bg-gray-100 p-6 rounded-sm ">
        <DispenseInventoryList />
      </div>
    </InventorySideBarLayout>
  );
};

export default DispenseInventoryListDisplay;

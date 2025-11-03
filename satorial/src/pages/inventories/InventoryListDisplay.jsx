import InventorySideBarLayout from "../../components/navs/InventorySideBarLayout";
import InventoryList from "../../components/lists/InventoryList";

const InventoryListDisplay = () => {
  
  return (
    <InventorySideBarLayout>
      <div className="bg-gray-100 p-6 rounded-sm ">
        <InventoryList />
      </div>
    </InventorySideBarLayout>
  );
};

export default InventoryListDisplay;

import InventorySideBarLayout from "../../components/navs/InventorySideBarLayout";
import InventoryCategoryList from "../../components/lists/InventoryCategoryList";

const InventoryCategoryListDisplay = () => {
  
  return (
    <InventorySideBarLayout>
      <div className="bg-gray-100 p-6 rounded-sm ">
        <InventoryCategoryList />
      </div>
    </InventorySideBarLayout>
  );
};

export default InventoryCategoryListDisplay;

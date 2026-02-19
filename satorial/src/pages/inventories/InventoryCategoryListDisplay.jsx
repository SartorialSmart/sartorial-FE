import InventorySideBarLayout from "../../components/navs/InventorySideBarLayout";
import InventoryCategoryList from "../../components/lists/InventoryCategoryList";

const InventoryCategoryListDisplay = () => {
  
  return (
    <InventorySideBarLayout>
      <div className="space-y-6">
        <InventoryCategoryList />
      </div>
    </InventorySideBarLayout>
  );
};

export default InventoryCategoryListDisplay;

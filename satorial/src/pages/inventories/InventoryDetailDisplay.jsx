import { useParams } from "react-router-dom";
import InventorySideBarLayout from "../../components/navs/InventorySideBarLayout";
import InventoryDetail from "../../components/inventory/InventoryDetail";

const InventoryDetailDisplay = () => {
  const { itemId } = useParams();

  return (
    <InventorySideBarLayout>
      <div className="space-y-6">
        <InventoryDetail itemId={itemId} />
      </div>
    </InventorySideBarLayout>
  );
};

export default InventoryDetailDisplay;

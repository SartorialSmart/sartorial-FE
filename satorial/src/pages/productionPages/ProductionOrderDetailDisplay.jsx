import ProductionSideBarLayout from "../../components/navs/ProductionSideBarLayout";
import ProductionOrderDetail from "../../components/entityData/productionData.jsx/ProductionOrderDetail";

const ProductionOrderDetailDisplay = () => {
  return (
    <ProductionSideBarLayout>
      <div className="space-y-6">
        <ProductionOrderDetail />
      </div>
    </ProductionSideBarLayout>
  );
};

export default ProductionOrderDetailDisplay;

import ProductionSideBarLayout from "../../components/navs/ProductionSideBarLayout";
import ProductionOrderList from "../../components/lists/ProductionOrderList";

const ProductionOrderListDisplay = () => {
  return (
    <ProductionSideBarLayout>
      <div className="space-y-6">
        <ProductionOrderList />
      </div>
    </ProductionSideBarLayout>
  );
};

export default ProductionOrderListDisplay;

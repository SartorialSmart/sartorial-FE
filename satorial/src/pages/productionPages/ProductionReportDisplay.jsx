import ProductionSideBarLayout from "../../components/navs/ProductionSideBarLayout";
import ProductionReport from "../../components/report/ProductionReport";

const ProductionReportDisplay = () => {
  return (
    <ProductionSideBarLayout>
      <div className="space-y-6">
        <ProductionReport />
      </div>
    </ProductionSideBarLayout>
  );
};

export default ProductionReportDisplay;

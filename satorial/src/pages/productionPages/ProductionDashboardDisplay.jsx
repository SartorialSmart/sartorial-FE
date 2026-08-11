import { useState } from "react";
import ProductionSideBarLayout from "../../components/navs/ProductionSideBarLayout";
import ProductionDashboardOverview from "../../components/overview/ProductionDashboardOverview";
import ToolbarWithDateFilter_1 from "../../components/toolbars/ToolBarwithDateFilter_1";
import LocationFilter from "../../components/filters/LocationFilter";

const ProductionDashboardDisplay = () => {
  const [dateFilter, setDateFilter] = useState("All Time");
  const [customDateRange, setCustomDateRange] = useState(null);
  const [location, setLocation] = useState("");

  const handleDateFilterChange = (filter, customRange) => {
    setDateFilter(filter);
    setCustomDateRange(customRange);
  };

  return (
    <ProductionSideBarLayout>
      <div className="space-y-6">
        <ToolbarWithDateFilter_1
          title="Production Management"
          subtitle="Manage and track all production orders"
          onDateFilterChange={handleDateFilterChange}
        />
        <div className="flex justify-end">
          <LocationFilter value={location} onChange={setLocation} className="min-w-56" />
        </div>
        <ProductionDashboardOverview
          dateFilter={dateFilter}
          customDateRange={customDateRange}
          location={location}
        />
      </div>
    </ProductionSideBarLayout>
  );
};

export default ProductionDashboardDisplay;

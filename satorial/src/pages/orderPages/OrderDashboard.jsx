import { useState } from "react";
import OrderSideABrLayout from "../../components/navs/OrderSideBarLayout";
import OrderDashboardOverview from "../../components/overview/OrderDashboardOverview";
import ToolbarWithDateFilter_1 from "../../components/toolbars/ToolBarwithDateFilter_1";
import LocationFilter from "../../components/filters/LocationFilter";

const OrderDashboardDisplay = () => {
  const [dateFilter, setDateFilter] = useState("All Time");
  const [customDateRange, setCustomDateRange] = useState(null);
  const [location, setLocation] = useState("");

  const handleDateFilterChange = (filter, customRange) => {
    setDateFilter(filter);
    setCustomDateRange(customRange);
  };

  return (
    <OrderSideABrLayout>
      <div className="space-y-6">
        <ToolbarWithDateFilter_1 
          onDateFilterChange={handleDateFilterChange}
        />
        <div className="flex justify-end">
          <LocationFilter value={location} onChange={setLocation} className="min-w-56" />
        </div>
        <OrderDashboardOverview 
          dateFilter={dateFilter}
          customDateRange={customDateRange}
          location={location}
        />
      </div>
    </OrderSideABrLayout>
  );
};

export default OrderDashboardDisplay;
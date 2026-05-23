import { useState } from "react";
import OrderSideABrLayout from "../../components/navs/OrderSideBarLayout";
import OrderDashboardOverview from "../../components/overview/OrderDashboardOverview";
import ToolbarWithDateFilter_1 from "../../components/toolbars/ToolBarwithDateFilter_1";

const OrderDashboardDisplay = () => {
  const [dateFilter, setDateFilter] = useState("All Time");
  const [customDateRange, setCustomDateRange] = useState(null);

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
        <OrderDashboardOverview 
          dateFilter={dateFilter}
          customDateRange={customDateRange}
        />
      </div>
    </OrderSideABrLayout>
  );
};

export default OrderDashboardDisplay;
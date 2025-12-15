import { useState } from "react";
import OrderSideABrLayout from "../../components/navs/OrderSideBarLayout";
import OrderListTable from "../../components/lists/OrderListTable";
import OrderDashboardOverview from "../../components/overview/OrderDashboardOverview";
import ToolbarWithDateFilter_1 from "../../components/toolbars/ToolBarwithDateFilter_1";

const OrderDashboardDisplay = () => {
  const [dateFilter, setDateFilter] = useState("All Time");
  const [customDateRange, setCustomDateRange] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const handleDateFilterChange = (filter, customRange) => {
    setDateFilter(filter);
    setCustomDateRange(customRange);
  };

  const handleSearchChange = (search) => {
    setSearchTerm(search);
  };

  const handleStatusFilterChange = (status) => {
    setStatusFilter(status);
  };

  return (
    <OrderSideABrLayout>
      <div className="bg-gray-100 p-6 rounded-sm">
        <ToolbarWithDateFilter_1 
          onDateFilterChange={handleDateFilterChange}
        />
        <OrderDashboardOverview 
          dateFilter={dateFilter}
          customDateRange={customDateRange}
        />
        <OrderListTable 
          searchTerm={searchTerm}
          dateFilter={dateFilter}
          statusFilter={statusFilter}
          customDateRange={customDateRange}
          onSearchChange={handleSearchChange}
          onStatusFilterChange={handleStatusFilterChange}
        />
      </div>
    </OrderSideABrLayout>
  );
};

export default OrderDashboardDisplay;
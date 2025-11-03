import { useState } from "react";
import OrderSideABrLayout from "../../components/navs/OrderSideBarLayout";
import OrderListTable from "../../components/lists/OrderListTable";
import ToolBarwithDateFilter_2 from "../../components/toolbars/ToolBarwithDateFilter_2";

const OrderListDisplay = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("All Time");
  const [statusFilter, setStatusFilter] = useState("All");
  const [customDateRange, setCustomDateRange] = useState(null);

  const handleSearchChange = (term) => {
    setSearchTerm(term);
  };

  const handleDateFilterChange = (filter) => {
    setDateFilter(filter);
    // Reset custom date range if not using custom filter
    if (filter !== "Custom") {
      setCustomDateRange(null);
    }
  };

  const handleStatusFilterChange = (status) => {
    setStatusFilter(status);
  };

  const handleCustomDateRangeChange = (range) => {
    setCustomDateRange(range);
  };

  return (
    <OrderSideABrLayout>
      <div className="bg-gray-100 p-6 rounded-sm">
        <ToolBarwithDateFilter_2
          onSearchChange={handleSearchChange}
          onDateFilterChange={handleDateFilterChange}
          onStatusFilterChange={handleStatusFilterChange}
          onCustomDateRangeChange={handleCustomDateRangeChange}
        />
        <OrderListTable
          searchTerm={searchTerm}
          dateFilter={dateFilter}
          statusFilter={statusFilter}
          customDateRange={customDateRange}
        />
      </div>
    </OrderSideABrLayout>
  );
};

export default OrderListDisplay;

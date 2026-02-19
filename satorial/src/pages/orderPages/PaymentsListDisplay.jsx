import { useState } from "react";
import OrderSideABrLayout from "../../components/navs/OrderSideBarLayout";
import PaymentsListTable from "../../components/lists/PaymentListTable";
import ToolbarWithDateFilter_4 from "../../components/toolbars/ToolBarwithDateFilter_4";

const PaymentsListDisplay = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("All Time");
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

  const handleCustomDateRangeChange = (range) => {
    setCustomDateRange(range);
  };

  return (
    <OrderSideABrLayout>
      <div className="space-y-6">
        <ToolbarWithDateFilter_4
          onSearchChange={handleSearchChange}
          onDateFilterChange={handleDateFilterChange}
          onCustomDateRangeChange={handleCustomDateRangeChange}
        />
        <PaymentsListTable
          searchTerm={searchTerm}
          dateFilter={dateFilter}
          customDateRange={customDateRange}
        />
      </div>
    </OrderSideABrLayout>
  );
};

export default PaymentsListDisplay;

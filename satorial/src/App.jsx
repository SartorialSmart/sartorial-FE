import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import ProtectedRoute from "../utils/ProtectedRoutes";
import OrganizationRegister from "./pages/Auth/OrganizationRegister";
import Login from "./pages/Auth/Login";
import DashboardLayout from "./pages/dashboard/DashboardLayout";
import LandingPage from "./pages/home/Home";

import ClientDashboard from "./pages/clientPages/ClientDashboard";
import ClientsListDisplay from "./pages/clientPages/ClientsListDisplay";
import ClientOrderListDisplay from "./pages/clientPages/ClientOrderListDisplay";
import AllocationsListDisplay from "./pages/clientPages/AllocationListDisplay";
import ChatDisplay from "./pages/clientPages/ChatDisplay";
import GetHelpDisplay from "./pages/clientPages/GetHelpDisplay";
import ClientDataDisplay from "./pages/clientPages/ClientDataDisplay";

import OrderDashboardDisplay from "./pages/orderPages/OrderDashboard";
import OrderListDisplay from "./pages/orderPages/OrderListDisplay";
import BillsListDisplay from "./pages/orderPages/BillsListDisplay";
import PaymentsListDisplay from "./pages/orderPages/PaymentsListDisplay";
import VendorCategoryListDisplay from "./pages/orderPages/VendorCategoryListDisplay";
import OrderDetailDisplay from "./pages/orderPages/OrderDetailDisplay";
import EditOrderFormDisplay from "./pages/orderPages/EditOrderFormDisplay";

import StaffListDisplay from "./pages/staffPages/StaffListDisplay";
import StaffDetailDisplay from "./pages/staffPages/StaffDetailDisplay";
import ExitedStaffsListDisplay from "./pages/staffPages/ExitedStaffsListDisplay";
import PayrollListDisplay from "./pages/staffPages/PayrollListDisplay";
import GeneratePayrollListDisplay from "./pages/staffPages/GeneratePayrollListDisplay";

import ReportDashboardDisplay from "./pages/reportPages/ReportDashboardDisplay";
import MonthlyDataReportDisplay from "./pages/reportPages/MonthlyDataReportDisplay";
import SalesReportDisplay from "./pages/reportPages/SalesReportDisplay";
import PaymentsReportDisplay from "./pages/reportPages/PaymentsReportDisplay";
import OrderReportDisplay from "./pages/reportPages/OrderReportDisplay";
import BillsReportDisplay from "./pages/reportPages/BillsReportDisplay";
import StaffPerformanceReportDisplay from "./pages/reportPages/StaffPerformanceReportDisplay";

import ExpensesDashboardDisplay from "./pages/expensesPages/ExpensesDashboardDisplay";
import ExpensesCategoryListDisplay from "./pages/expensesPages/ExpensesCategoryListDisplay";

import InventoryListDisplay from "./pages/inventories/InventoryListDisplay";
import InventoryCategoryListDisplay from "./pages/inventories/InventoryListDisplay";
import DispenseInventoryListDisplay from "./pages/inventories/DispenseInventoryListDisplay";
import VendorListDisplay from "./pages/orderPages/VendorListDisplay";
import SubscriptionPanelDisplay from "./pages/subscriptionPages/SubscriptionPanelDisplay";
import PricingPlansDisplay from "./pages/subscriptionPages/PricingPlansDisplay";
import AddVendorFormDisplay from "./pages/orderPages/AddVendorFormDisplay";

import ProfileSettingsDisplay from "./pages/settingsPages/ProfileSettingsDisplay";
import ForgotPassword from "./pages/Auth/ForgotPassword";

const dashboards = [
  "client",
  "order",
  "expenses",
  "reports",
  "settings",
  "subscriptions",
  "staff",
  "inventories",
];

const protectedRoutes = [
  { path: "/dashboard", element: <DashboardLayout /> },

  { path: "/client/client-dashboard", element: <ClientDashboard /> },
  { path: "/client/clients-list", element: <ClientsListDisplay /> },
  { path: "/client/orders-list", element: <ClientOrderListDisplay /> },
  { path: "/client/allocations-list", element: <AllocationsListDisplay /> },
  { path: "/chat", element: <ChatDisplay /> },
  { path: "/client-data/:clientId", element: <ClientDataDisplay /> },

  { path: "/order/order-dashboard", element: <OrderDashboardDisplay /> },
  { path: "/order/orders-list", element: <OrderListDisplay /> },
  { path: "/order/bills-list", element: <BillsListDisplay /> },
  { path: "/order/payments-list", element: <PaymentsListDisplay /> },
  {
    path: "/order/vendor-category-list",
    element: <VendorCategoryListDisplay />,
  },
  { path: "/order/vendor-list", element: <VendorListDisplay /> },
  { path: "/order/vendor/add", element: <AddVendorFormDisplay /> },

  { path: "/order/detail/:orderId", element: <OrderDetailDisplay /> },
  { path: "/order/edit/:orderId", element: <EditOrderFormDisplay /> },

  { path: "/staff/staff-list", element: <StaffListDisplay /> },
  { path: "/staff/staff-detail/:slug", element: <StaffDetailDisplay /> },
  { path: "/staff/exited-staffs-list", element: <ExitedStaffsListDisplay /> },
  { path: "/staff/payroll-list", element: <PayrollListDisplay /> },
  { path: "/staff/generate-payroll", element: <GeneratePayrollListDisplay /> },

  { path: "/reports/reports/dashboard", element: <ReportDashboardDisplay /> },
  { path: "/reports/monthly/data", element: <MonthlyDataReportDisplay /> },
  { path: "/reports/sales/report", element: <SalesReportDisplay /> },
  { path: "/reports/payments/report", element: <PaymentsReportDisplay /> },
  { path: "/reports/orders/report", element: <OrderReportDisplay /> },
  { path: "/reports/bills/report", element: <BillsReportDisplay /> },
  {
    path: "/reports/staff/performance/report",
    element: <StaffPerformanceReportDisplay />,
  },

  { path: "/expenses/overview", element: <ExpensesDashboardDisplay /> },
  { path: "/expenses/category/list", element: <ExpensesCategoryListDisplay /> },

  { path: "/inventory/list/overview", element: <InventoryListDisplay /> },
  {
    path: "/inventory/category/list",
    element: <InventoryCategoryListDisplay />,
  },
  {
    path: "/inventory/dispense/list",
    element: <DispenseInventoryListDisplay />,
  },

  { path: "/subscriptions/panel", element: <SubscriptionPanelDisplay /> },
  { path: "/subscriptions/pricing/plan", element: <PricingPlansDisplay /> },

  { path: "/settings", element: <ProfileSettingsDisplay /> },

  { path: "/help-centre", element: <GetHelpDisplay /> },
];

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/register" element={<OrganizationRegister />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {dashboards.map((dashboard, index) => (
          <Route
            key={index}
            path={`/${dashboard}/help-centre`}
            element={
              <ProtectedRoute>
                <GetHelpDisplay />
              </ProtectedRoute>
            }
          />
        ))}

        {protectedRoutes.map(({ path, element }, index) => (
          <Route
            key={index}
            path={path}
            element={<ProtectedRoute>{element}</ProtectedRoute>}
          />
        ))}

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;

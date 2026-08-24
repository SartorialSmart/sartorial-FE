import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import ProtectedRoute from "../utils/ProtectedRoutes";
import AdminRoute from "../utils/AdminRoute";
import PermissionRoute from "../utils/PermissionRoute";
import ErrorBoundary from "./components/common/ErrorBoundary";
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
import MyOrdersDisplay from "./pages/orderPages/MyOrdersDisplay";
import BillsListDisplay from "./pages/orderPages/BillsListDisplay";
import BillDetailDisplay from "./pages/orderPages/BillDetailDisplay";
import PaymentsListDisplay from "./pages/orderPages/PaymentsListDisplay";
import VendorCategoryListDisplay from "./pages/orderPages/VendorCategoryListDisplay";
import OrderDetailDisplay from "./pages/orderPages/OrderDetailDisplay";
import EditOrderFormDisplay from "./pages/orderPages/EditOrderFormDisplay";

import StaffListDisplay from "./pages/staffPages/StaffListDisplay";
import TeamManagementDisplay from "./pages/staffPages/TeamManagementDisplay";
import AcceptInvite from "./pages/Auth/AcceptInvite";
import StaffDetailDisplay from "./pages/staffPages/StaffDetailDisplay";
import StaffEditDisplay from "./pages/staffPages/StaffEditDisplay";
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
import FinancialReportDisplay from "./pages/reportPages/FinancialReportDisplay";
import ExpensesReportDisplay from "./pages/reportPages/ExpensesReportDisplay";

import ExpensesDashboardDisplay from "./pages/expensesPages/ExpensesDashboardDisplay";
import ExpensesCategoryListDisplay from "./pages/expensesPages/ExpensesCategoryListDisplay";

import InventoryListDisplay from "./pages/inventories/InventoryListDisplay";
import InventoryDetailDisplay from "./pages/inventories/InventoryDetailDisplay";
import InventoryCategoryListDisplay from "./pages/inventories/InventoryCategoryListDisplay";
import DispenseInventoryListDisplay from "./pages/inventories/DispenseInventoryListDisplay";
import DispenseMaterialsDisplay from "./pages/inventories/DispenseMaterialsDisplay";
import InventoryHistoryListDisplay from "./pages/inventories/InventoryHistoryListDisplay";
import VendorListDisplay from "./pages/orderPages/VendorListDisplay";
import SubscriptionPanelDisplay from "./pages/subscriptionPages/SubscriptionPanelDisplay";
import PricingPlansDisplay from "./pages/subscriptionPages/PricingPlansDisplay";
import AddVendorFormDisplay from "./pages/orderPages/AddVendorFormDisplay";

import NotificationsListDisplay from "./pages/notificationPages/NotificationsListDisplay";
import ProfileSettingsDisplay from "./pages/settingsPages/ProfileSettingsDisplay";
import RoleSettingsDisplay from "./pages/settingsPages/RoleSettingsDisplay";
import StockMovementHistoryDisplay from "./pages/inventories/StockMovementHistoryDisplay";
import ForgotPassword from "./pages/Auth/ForgotPassword";
import ResetPassword from "./pages/Auth/ResetPassword";
import PlanNoticeGate from "./components/Subscriptions/PlanNoticeGate";

import ProductionDashboardDisplay from "./pages/productionPages/ProductionDashboardDisplay";
import ProductionOrderListDisplay from "./pages/productionPages/ProductionOrderListDisplay";
import ProductionOrderDetailDisplay from "./pages/productionPages/ProductionOrderDetailDisplay";
import ProductionReportDisplay from "./pages/productionPages/ProductionReportDisplay";

const dashboards = [
  "client",
  "order",
  "expenses",
  "reports",
  "settings",
  "subscriptions",
  "staff",
  "inventories",
  "production",
];

const protectedRoutes = [
  { path: "/dashboard", element: <DashboardLayout /> },

  { path: "/client/client-dashboard", element: <ClientDashboard />, perm: { module: "clients", requireView: true } },
  { path: "/client/clients-list", element: <ClientsListDisplay />, perm: { module: "clients", requireView: true } },
  { path: "/client/orders-list", element: <ClientOrderListDisplay />, perm: { module: "clients", requireView: true } },
  { path: "/client/allocations-list", element: <AllocationsListDisplay />, perm: { module: "orders", requireView: true } },
  { path: "/chat", element: <ChatDisplay /> },
  { path: "/client-data/:clientId", element: <ClientDataDisplay />, perm: { module: "clients", requireView: true } },
  { path: "/edit-client/:clientId", element: <ClientDataDisplay />, perm: { module: "clients", action: "edit" } },

  { path: "/order/order-dashboard", element: <OrderDashboardDisplay />, perm: { module: "orders", requireView: true } },
  { path: "/order/orders-list", element: <OrderListDisplay />, perm: { module: "orders", requireView: true } },
  { path: "/order/bills-list", element: <BillsListDisplay />, perm: { module: "billing", requireView: true } },
  { path: "/order/bill-detail/:billId", element: <BillDetailDisplay />, perm: { module: "billing", requireView: true } },
  { path: "/order/payments-list", element: <PaymentsListDisplay />, perm: { module: "billing", requireView: true } },
  {
    path: "/order/vendor-category-list",
    element: <VendorCategoryListDisplay />,
    perm: { module: "vendors", requireView: true },
  },
  { path: "/order/vendor-list", element: <VendorListDisplay />, perm: { module: "vendors", requireView: true } },
  { path: "/order/vendor/add", element: <AddVendorFormDisplay />, perm: { module: "vendors", action: "create" } },

  { path: "/order/detail/:orderId", element: <OrderDetailDisplay />, perm: { module: "orders", requireView: true } },
  { path: "/order/edit/:orderId", element: <EditOrderFormDisplay />, perm: { module: "orders", action: "edit" } },
  { path: "/order/my-orders", element: <MyOrdersDisplay /> },

  { path: "/staff/staff-list", element: <StaffListDisplay />, perm: { module: "staff", requireView: true } },
  { path: "/staff/team", element: <TeamManagementDisplay />, perm: { module: "staff", requireView: true } },
  { path: "/staff/staff-detail/:slug", element: <StaffDetailDisplay />, perm: { module: "staff", requireView: true } },
  { path: "/staff/edit/:slug", element: <StaffEditDisplay />, perm: { module: "staff", action: "manage" } },
  { path: "/staff/exited-staffs-list", element: <ExitedStaffsListDisplay />, perm: { module: "staff", requireView: true } },
  { path: "/staff/payroll-list", element: <PayrollListDisplay />, perm: { module: "payroll", requireView: true } },
  { path: "/staff/generate-payroll", element: <GeneratePayrollListDisplay />, perm: { module: "payroll", action: "manage" } },

  { path: "/reports/reports/dashboard", element: <ReportDashboardDisplay />, perm: { module: "reports", requireView: true } },
  { path: "/reports/monthly/data", element: <MonthlyDataReportDisplay />, perm: { module: "reports", requireView: true } },
  { path: "/reports/sales/report", element: <SalesReportDisplay />, perm: { module: "reports", requireView: true } },
  { path: "/reports/payments/report", element: <PaymentsReportDisplay />, perm: { module: "reports", requireView: true } },
  { path: "/reports/orders/report", element: <OrderReportDisplay />, perm: { module: "reports", requireView: true } },
  { path: "/reports/bills/report", element: <BillsReportDisplay />, perm: { module: "reports", requireView: true } },
  {
    path: "/reports/staff/performance/report",
    element: <StaffPerformanceReportDisplay />,
    perm: { module: "reports", requireView: true },
  },
  { path: "/reports/financial/report", element: <FinancialReportDisplay />, perm: { module: "reports", requireView: true } },
  { path: "/reports/expenses/report", element: <ExpensesReportDisplay />, perm: { module: "reports", requireView: true } },

  { path: "/expenses/overview", element: <ExpensesDashboardDisplay />, perm: { module: "expenses", requireView: true } },
  { path: "/expenses/category/list", element: <ExpensesCategoryListDisplay />, perm: { module: "expenses", requireView: true } },

  { path: "/inventory/list/overview", element: <InventoryListDisplay />, perm: { module: "inventory", requireView: true } },
  { path: "/inventory/detail/:itemId", element: <InventoryDetailDisplay />, perm: { module: "inventory", requireView: true } },
  {
    path: "/inventory/category/list",
    element: <InventoryCategoryListDisplay />,
    perm: { module: "inventory", requireView: true },
  },
  {
    path: "/inventory/dispense/list",
    element: <DispenseInventoryListDisplay />,
    perm: { module: "inventory", requireView: true },
  },
  {
    path: "/inventory/dispense-materials",
    element: <DispenseMaterialsDisplay />,
    perm: { module: "inventory", requireView: true },
  },
  {
    path: "/inventory/history",
    element: <InventoryHistoryListDisplay />,
    perm: { module: "inventory", requireView: true },
  },
  {
    path: "/inventory/stock-movements",
    element: <StockMovementHistoryDisplay />,
    perm: { module: "inventory", requireView: true },
  },

  { path: "/subscriptions/panel", element: <SubscriptionPanelDisplay /> },
  { path: "/subscriptions/pricing/plan", element: <PricingPlansDisplay /> },

  { path: "/notifications", element: <NotificationsListDisplay /> },

  { path: "/production/dashboard", element: <ProductionDashboardDisplay />, perm: { module: "production", requireView: true } },
  { path: "/production/orders-list", element: <ProductionOrderListDisplay />, perm: { module: "production", requireView: true } },
  {
    path: "/production/detail/:productionId",
    element: <ProductionOrderDetailDisplay />,
    perm: { module: "production", requireView: true },
  },
  { path: "/production/report", element: <ProductionReportDisplay />, perm: { module: "production", requireView: true } },

  { path: "/settings", element: <ProfileSettingsDisplay />, perm: { module: "settings", requireView: true } },
  { path: "/settings/roles", element: <RoleSettingsDisplay />, perm: { module: "settings", action: "manage" } },
  { path: "/profile", element: <ProfileSettingsDisplay /> },

  { path: "/help-centre", element: <GetHelpDisplay /> },
];

const App = () => {
  return (
    <ErrorBoundary>
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/register" element={<OrganizationRegister />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/accept-invite" element={<AcceptInvite />} />

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

        {protectedRoutes.map(({ path, element, admin, perm }, index) => {
          let wrapped = element;
          if (admin) {
            wrapped = <AdminRoute>{element}</AdminRoute>;
          } else if (perm) {
            wrapped = (
              <PermissionRoute
                module={perm.module}
                action={perm.action}
                anyActions={perm.anyActions}
                requireView={perm.requireView}
              >
                {element}
              </PermissionRoute>
            );
          } else {
            wrapped = <ProtectedRoute>{element}</ProtectedRoute>;
          }
          return <Route key={index} path={path} element={wrapped} />;
        })}

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <PlanNoticeGate />
    </Router>
    </ErrorBoundary>
  );
};

export default App;

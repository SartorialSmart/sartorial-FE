import ClientSideABrLayout from "../../components/navs/ClientSideBarLayout";
import DashboardOverview from "../../components/overview/ClientDashboardOverview";
import OrderListTable from "../../components/lists/OrderListTable";



const ClientDashboard = () => {
  return (
    <ClientSideABrLayout>
      <div className="bg-gray-100 p-6 rounded-sm min-h-screen ">
        <DashboardOverview />
        <OrderListTable />
      </div>
    </ClientSideABrLayout>
  );
};

export default ClientDashboard;

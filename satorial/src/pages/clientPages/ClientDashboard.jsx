import ClientSideABrLayout from "../../components/navs/ClientSideBarLayout";
import DashboardOverview from "../../components/overview/ClientDashboardOverview";
import ClientsList from "../../components/lists/ClientsListTable";



const ClientDashboard = () => {
  return (
    <ClientSideABrLayout>
      <div className="bg-gray-100 p-6 rounded-sm min-h-screen ">
        <DashboardOverview />
        <ClientsList />
      </div>
    </ClientSideABrLayout>
  );
};

export default ClientDashboard;

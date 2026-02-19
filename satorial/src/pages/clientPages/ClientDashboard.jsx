import ClientSideABrLayout from "../../components/navs/ClientSideBarLayout";
import DashboardOverview from "../../components/overview/ClientDashboardOverview";
import ClientsList from "../../components/lists/ClientsListTable";



const ClientDashboard = () => {
  return (
    <ClientSideABrLayout>
      <div className="space-y-6">
        <DashboardOverview />
        <ClientsList />
      </div>
    </ClientSideABrLayout>
  );
};

export default ClientDashboard;

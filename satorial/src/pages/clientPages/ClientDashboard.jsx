import ClientSideABrLayout from "../../components/navs/ClientSideBarLayout";
import DashboardOverview from "../../components/overview/ClientDashboardOverview";


const ClientDashboard = () => {
  return (
    <ClientSideABrLayout>
      <div className="space-y-6">
        <DashboardOverview />
      </div>
    </ClientSideABrLayout>
  );
};

export default ClientDashboard;

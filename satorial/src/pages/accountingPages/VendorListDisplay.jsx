import AccountingSideBarLayout from "../../components/navs/AccountingSideBarLayout";
import VendorsList from "../../components/lists/VendorList";

const VendorListDisplay = () => {
  
  return (
    <AccountingSideBarLayout>
      <div className="space-y-6">
        <VendorsList />
      </div>
    </AccountingSideBarLayout>
  );
};

export default VendorListDisplay;

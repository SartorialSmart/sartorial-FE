import AccountingSideBarLayout from "../../components/navs/AccountingSideBarLayout";
import VendorCategoryListTable from "../../components/lists/VendorCategoryListTable";
import ToolbarWithDateFilter_5 from "../../components/toolbars/ToolBarwithDateFilter_5";
import AddVendorForm from "../../components/forms/vendorForms/AddVendorForm";

const AddVendorFormDisplay = () => {
  
  return (
    <AccountingSideBarLayout>
      <div className="space-y-6">
        <AddVendorForm />
      </div>
    </AccountingSideBarLayout>
  );
};

export default AddVendorFormDisplay;

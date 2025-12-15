import OrderSideABrLayout from "../../components/navs/OrderSideBarLayout";
import VendorCategoryListTable from "../../components/lists/VendorCategoryListTable";
import ToolbarWithDateFilter_5 from "../../components/toolbars/ToolBarwithDateFilter_5";
import AddVendorForm from "../../components/forms/vendorForms/AddVendorForm";

const AddVendorFormDisplay = () => {
  
  return (
    <OrderSideABrLayout>
      <div className="bg-gray-100 p-6 rounded-sm ">
        <AddVendorForm />
      </div>
    </OrderSideABrLayout>
  );
};

export default AddVendorFormDisplay;

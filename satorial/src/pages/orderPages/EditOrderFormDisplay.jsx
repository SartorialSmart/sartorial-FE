import OrderSideABrLayout from "../../components/navs/OrderSideBarLayout";
import EditOrderForm from "../../components/forms/orderforms/EditOrderForm";


const EditOrderFormDisplay = () => {
  return (
    <OrderSideABrLayout>
      <div className="bg-gray-100 p-6 rounded-sm min-h-screen ">
        <EditOrderForm />
      </div>
    </OrderSideABrLayout>
  );
};

export default EditOrderFormDisplay;

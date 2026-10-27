import OrderSideABrLayout from "../../components/navs/OrderSideBarLayout";
import EditOrderForm from "../../components/forms/orderforms/EditOrderForm";


const EditOrderFormDisplay = () => {
  return (
    <OrderSideABrLayout>
      <div className="space-y-6">
        <EditOrderForm />
      </div>
    </OrderSideABrLayout>
  );
};

export default EditOrderFormDisplay;

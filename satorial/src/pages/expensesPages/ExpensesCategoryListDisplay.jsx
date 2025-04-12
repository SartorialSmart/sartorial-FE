import ExpensesCategoryList from "../../components/lists/ExpensesCategoryList";
import ExpensesSideABrLayout from "../../components/navs/ExpensesSideBarLayout";


const ExpensesCategoryListDisplay = () => {
  return (
    <ExpensesSideABrLayout>
      <div className="bg-gray-100 p-6 rounded-sm min-h-screen ">
        <ExpensesCategoryList />
      </div>
    </ExpensesSideABrLayout>
  );
};

export default ExpensesCategoryListDisplay;

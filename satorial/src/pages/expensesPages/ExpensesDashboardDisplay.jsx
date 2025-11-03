import ExpensesSideABrLayout from "../../components/navs/ExpensesSideBarLayout";
import ExpensesOverview from "../../components/overview/ExpensesOverview";
import ExpensesList from "../../components/lists/ExpensesList";



const ExpensesDashboardDisplay = () => {
  return (
    <ExpensesSideABrLayout>
      <div className="bg-gray-100 p-6 rounded-sm min-h-screen ">
        <ExpensesOverview />
        <ExpensesList />
      </div>
    </ExpensesSideABrLayout>
  );
};

export default ExpensesDashboardDisplay;

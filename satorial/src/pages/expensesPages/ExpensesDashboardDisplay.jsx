import ExpensesSideABrLayout from "../../components/navs/ExpensesSideBarLayout";
// import ExpensesOverview from "../../components/overview/ExpensesOverview";
import ExpensesList from "../../components/lists/ExpensesList";



const ExpensesDashboardDisplay = () => {
  return (
    <ExpensesSideABrLayout>
      <div className="space-y-6">
        {/* <ExpensesOverview /> */}
        <ExpensesList />
      </div>
    </ExpensesSideABrLayout>
  );
};

export default ExpensesDashboardDisplay;

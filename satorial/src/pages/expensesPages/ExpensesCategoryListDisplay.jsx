import ExpensesCategoryList from "../../components/lists/ExpensesCategoryList";
import ExpensesSideABrLayout from "../../components/navs/ExpensesSideBarLayout";
import { useState } from "react";

const ExpensesCategoryListDisplay = () => {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <ExpensesSideABrLayout>
      <div className="bg-gray-100 p-6 rounded-sm min-h-screen ">
        <ExpensesCategoryList
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />
      </div>
    </ExpensesSideABrLayout>
  );
};

export default ExpensesCategoryListDisplay;

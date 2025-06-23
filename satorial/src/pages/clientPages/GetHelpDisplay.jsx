import ClientSideABrLayout from "../../components/navs/ClientSideBarLayout";
import GetHelp from "../../components/helpcenter/HelpCenter";

const GetHelpDisplay = () => {
  return (
    <ClientSideABrLayout>
      <div className=" p-6 rounded-sm ">
        <GetHelp />
      </div>
    </ClientSideABrLayout>
  );
};

export default GetHelpDisplay;

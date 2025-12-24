import React, { useContext } from "react";
import { UserContext } from "@/context/UserContext";
import Navbar from "./Navbar";
import DashboardSkeleton from "@/pages/Home/components/DashboardSkeleton";

const DashboardLayout = ({ children }) => {
  const { user, loading } = useContext(UserContext);

  return (
    <div>
      <Navbar />

      {loading ? <DashboardSkeleton /> : user && <div>{children}</div>}
    </div>
  );
};

export default DashboardLayout;

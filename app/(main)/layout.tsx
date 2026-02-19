import ClientLayout from "./ClientLayout";
import React from "react";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
	return <ClientLayout>{children}</ClientLayout>;
};

export default MainLayout;

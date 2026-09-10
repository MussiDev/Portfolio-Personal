import ClientLayout from "./ClientLayout";
import React from "react";
import Arrow from "../src/common/Arrow";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
	return (
		<ClientLayout>
			{children}
			<Arrow />
		</ClientLayout>
	);
};

export default MainLayout;

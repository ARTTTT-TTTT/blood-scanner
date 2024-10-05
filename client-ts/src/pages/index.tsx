import { useState } from "react";

import { ProtectedRoute, Header, Sidebar, MainContent } from "@/components";

export default function HomePage() {
      const [isSidebarOpen, setIsSidebarOpen] = useState(false);

      const toggleSidebar = () => {
          setIsSidebarOpen(!isSidebarOpen);
      };

    return (
        <div className="flex h-screen bg-gray-900">
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
            <div className="flex-1 flex flex-col">
                <Header isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
                <MainContent isSidebarOpen={isSidebarOpen} />
            </div>
        </div>
    );
}

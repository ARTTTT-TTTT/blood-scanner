import { useState, useEffect, useCallback } from "react";
import nookies from "nookies";
import { useQuery } from "react-query";
import Image from "next/image";

import { ProtectedRoute } from "@/components";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import MainContent from "../components/MainContent";
import { getUserProfile } from "@/api";
import { ReadUserProfileModel } from "@/models";

export default function HomePage() {
      const [isSidebarOpen, setIsSidebarOpen] = useState(false);

      const toggleSidebar = () => {
          setIsSidebarOpen(!isSidebarOpen);
      };

    const [profile, setProfile] = useState<ReadUserProfileModel | null>(null);
    const { data: userProfile } = useQuery("userProfile", async () => {
        const cookies = nookies.get();
        const token = cookies.token;
        return await getUserProfile(token);
    });

    useEffect(() => {
        if (userProfile) {
            setProfile(userProfile);
        }
    }, [userProfile]);

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

import { useRouter } from "next/router";
import nookies from "nookies";

interface HeaderProps {
    isSidebarOpen: boolean; // เพิ่ม prop เพื่อเช็คว่า Sidebar เปิดอยู่หรือไม่
    toggleSidebar: () => void; // ฟังก์ชันสำหรับเปิดปิด Sidebar
}

export const Header: React.FC<HeaderProps> = ({ isSidebarOpen, toggleSidebar }) => {
    const router = useRouter();
    const handleLogout = () => {
        nookies.destroy(null, "token", { path: "/" });
        router.push("/login");
    };

    return (
        <article
            className={`flex justify-between p-4 text-white transition-all duration-300 bg-gray-900 ${
                isSidebarOpen ? "md:opacity-100 opacity-50" : "md:opacity-100 opacity-100"
            }`}
        >
            <section className="flex items-center">
                <button onClick={toggleSidebar} className="text-white">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="h-6 w-6"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="m12.75 15 3-3m0 0-3-3m3 3h-7.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                </button>
                {/* เพิ่มการจัดตำแหน่ง Responsive สำหรับชื่อ */}
                <h1
                    className={`text-lg font-bold ml-4 transition-transform duration-300 ease-in-out ${
                        isSidebarOpen ? "translate-x-40" : "translate-x-0"
                    } 
                        hidden md:block`} // ซ่อนในหน้าจอมือถือ
                >
                    Blood Scanner
                </h1>
            </section>

            {/* ปุ่มออกจากระบบและ avatar */}
            <div className="hidden md:flex items-center space-x-4">
                {" "}
                {/* ซ่อนในหน้าจอเล็ก */}
                <button onClick={handleLogout} className="hover:bg-gray-700 p-2 rounded-md">
                    ออกจากระบบ
                </button>
            </div>

            {/* แสดงชื่อในหน้าจอมือถือ */}
            <h1 className={`text-lg font-bold text-center w-full transition-opacity duration-300 ease-in-out md:hidden`}>Blood Scanner</h1>
        </article>
    );
};

export default Header;

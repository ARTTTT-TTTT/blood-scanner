import { Card } from "@material-tailwind/react";
import { useRouter } from "next/router";
import nookies from "nookies";

interface SidebarProps {
    isOpen: boolean;
    toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
    const router = useRouter();
    const handleLogout = () => {
        nookies.destroy(null, "token", { path: "/" });
        router.push("/login");
    };

    return (
        <article
            className={`fixed z-50 top-0 left-0 h-full bg-black text-white p-4 md:pt-6 pt-[1.1rem] transform ${
                isOpen ? "translate-x-0" : "-translate-x-full"
            } transition-transform duration-300 ease-in-out flex flex-col justify-between`} // ใช้ flex-col เพื่อจัดเรียงแนวตั้ง
        >
            <section className="overflow-y-auto w-40">
                <button onClick={toggleSidebar} className="text-white mb-2">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="h-6 w-6"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 9-3 3m0 0 3 3m-3-3h7.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                </button>
                <figure className="my-3 ">
                    <h2 className="mb-1 text-lg">Today</h2>
                    <Card shadow={false} className="p-1 bg-gray-800 text-white">
                        <ul>
                            <li>แดง : </li>
                            <li>ปกติ : </li>
                            <li>เขียว : </li>
                            <li>ขุ่น : </li>
                        </ul>
                    </Card>
                </figure>
                <figure className="my-2">
                    <h2 className="mb-1 text-lg">Yesterday</h2>
                    <Card shadow={false} className="p-1 bg-gray-800 text-white">
                        <ul>
                            <li>แดง : </li>
                            <li>ปกติ : </li>
                            <li>เขียว : </li>
                            <li>ขุ่น : </li>
                        </ul>
                    </Card>
                </figure>
            </section>

            {/* ปุ่มออกจากระบบและ icon */}
            <section className="flex items-center space-x-2 md:hidden mt-auto gap-2">
                {" "}
                {/* เพิ่ม mt-auto เพื่อจัดเรียงที่ด้านล่าง */}
                <div className="w-8 h-8 rounded-full bg-gray-600"></div>
                <button onClick={handleLogout} className="hover:bg-gray-700 p-2 rounded-md">
                    ออกจากระบบ
                </button>
            </section>
        </article>
    );
};

export default Sidebar;

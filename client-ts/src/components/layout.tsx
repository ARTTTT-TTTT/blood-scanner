import { ReactNode } from "react";

interface LayoutProps {
    children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
    return (
        /*<main className="relative w-screen min-h-screen">
            {" "}
            <section className="hidden md:block lg:hidden absolute inset-0"></section>
            <section className="hidden lg:block absolute inset-0"></section>
            <section className="block lg:hidden md:hidden absolute inset-0"></section>
            {children}
        </main>  */
        <main>{children}</main>
    );
};

export default Layout;

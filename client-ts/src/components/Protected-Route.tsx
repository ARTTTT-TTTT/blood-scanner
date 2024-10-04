//Higher-Order Component
import { useRouter } from "next/router";
import { useEffect, ReactNode } from "react";

interface ProtectedRouteProps {
    children: ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
    const router = useRouter();

    useEffect(() => {
        const checkAuth = async () => {
            const response = await fetch("/api/check-auth");
            if (response.status !== 200) {
                router.push("/login");
            }
        };
        checkAuth();
    }, [router]);

    return <>{children}</>;
};

export default ProtectedRoute;

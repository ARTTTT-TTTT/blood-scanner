import { Card, CardHeader, CardBody, Input, Button, Typography } from "@material-tailwind/react";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import nookies from "nookies";

import { login } from "@/api";
import { UserLoginModel } from "@/models";

export default function LoginPage() {
    const router = useRouter();
    const [mistake, setMistake] = useState(false);
    const [formData, setFormData] = useState<UserLoginModel>({
        email: "",
        password: "",
    });
    const [errors, setErrors] = useState<UserLoginModel>({
        email: "",
        password: "",
    });

    useEffect(() => {
        nookies.destroy(null, "token", { path: "/" });
    }, []);

    const validateEmail = useCallback((email: string) => {
        const re = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
        return re.test(email);
    }, []);

    const validatePassword = useCallback((password: string) => {
        return password.length >= 4;
    }, []);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        setErrors((prev) => ({
            ...prev,
            [name]: "",
        }));
    }, []);

    const handleSubmit = useCallback(
        async (e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault();

            let valid = true;
            const newErrors = { email: "", password: "" };

            if (!formData.email || !validateEmail(formData.email)) {
                newErrors.email = "อีเมลไม่ถูกต้อง";
                valid = false;
            }

            if (!formData.password || !validatePassword(formData.password)) {
                newErrors.password = "รหัสผ่านต้องมีอย่างน้อย 4 ตัวอักษร";
                valid = false;
            }

            setErrors(newErrors);

            if (!valid) return;

            try {
                const response = await login(formData.email, formData.password);
                if (!response.ok) {
                    setMistake(true);
                }

                if (response.ok) {
                    const { access_token } = await response.json();
                    document.cookie = `token=${access_token}; path=/;`;
                    router.push("/");
                }
            } catch (error) {
                console.error("Error during login:", error);
            }
        },
        [formData, validateEmail, validatePassword, router]
    );

    return (
        <article className="relative z-10 flex items-center justify-center w-full h-full bg-gray-600">
            <section className="container mx-auto h-screen grid place-items-center">
                <Card shadow={false} className="sm:px-24 sm:pb-8 sm:pt-4 pb-2 pt-4 border border-gray-300">
                    <CardHeader shadow={false} floated={false} className="text-center flex justify-center items-center font-bold text-4xl pb-1">
                        เข้าสู่ระบบ
                    </CardHeader>
                    <CardBody className="sm:p-6 p-8">
                        <form onSubmit={handleSubmit} className="flex flex-col gap-4 md:mt-0 -mt-4">
                            <div>
                                <label htmlFor="email">
                                    <Typography variant="small" color="blue-gray" className="block font-medium mb-2">
                                        อีเมล์ของคุณ
                                    </Typography>
                                    <Input
                                        id="email"
                                        color="gray"
                                        size="lg"
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="@mail.com"
                                        className="w-full placeholder:opacity-100 border-t-blue-gray-200 focus:!border-t-gray-900"
                                        labelProps={{
                                            className: "hidden",
                                        }}
                                        crossOrigin="use-credentials"
                                    />
                                    {errors.email && (
                                        <Typography variant="small" color="red">
                                            {errors.email}
                                        </Typography>
                                    )}
                                </label>
                                <label htmlFor="password">
                                    <Typography variant="small" color="blue-gray" className="block font-medium mb-2 mt-4">
                                        รหัสผ่าน
                                    </Typography>
                                    <Input
                                        id="password"
                                        color="gray"
                                        size="lg"
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="********"
                                        className="w-full placeholder:opacity-100 !border-t-blue-gray-200 focus:!border-t-gray-900"
                                        labelProps={{
                                            className: "before:content-none after:content-none",
                                        }}
                                        crossOrigin="use-credentials"
                                    />
                                    {errors.password && (
                                        <Typography variant="small" color="red">
                                            {errors.password}
                                        </Typography>
                                    )}
                                </label>
                                {mistake && (
                                    <Typography variant="small" color="red">
                                        อีเมลหรือรหัสผ่านไม่ถูกต้อง
                                    </Typography>
                                )}
                            </div>
                            <Button type="submit" size="lg" color="gray" fullWidth className="mb-1 mt-3 font-itim">
                                เข้าสู่ระบบ
                            </Button>
                            <Typography variant="small" className="text-center mx-auto max-w-[19rem] !font-medium !text-gray-600">
                                Upon signing in, you consent to abide by our{" "}
                                <a href="#" rel="noopener noreferrer" className="text-gray-900 transition-colors hover:text-blue-500 ml-1">
                                    Terms of Service
                                </a>{" "}
                                &{" "}
                                <a href="#" rel="noopener noreferrer" className="text-gray-900 transition-colors hover:text-blue-500">
                                    Privacy Policy.
                                </a>
                            </Typography>
                        </form>
                    </CardBody>
                </Card>
            </section>
        </article>
    );
}

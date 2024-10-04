import { Typography } from "@material-tailwind/react";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/router";
import nookies from "nookies";

import { Navbar, AlphabetCard, ProtectedRoute } from "@/components";
import { getExerciseIdPercent, getExerciseById } from "@/api";
import { AlphabetModel } from "@/models";

export default function ExercisesPage() {
    const [percent, setPercent] = useState<number | null>(null);
    const [alphabets, setAlphabets] = useState<AlphabetModel[]>([]);
    const {
        query: { id },
    } = useRouter();

    const fetchExerciseData = useCallback(async (token: string, exerciseId: string) => {
        try {
            const exercise = await getExerciseById(token, exerciseId);
            setAlphabets(exercise.alphabets);
        } catch (error) {
            console.error("Failed to fetch exercise:", error);
        }
    }, []);

    const fetchPercentData = useCallback(async (token: string, exerciseId: string) => {
        try {
            const { percent } = await getExerciseIdPercent(token, exerciseId);
            setPercent(percent);
        } catch (error) {
            console.error("Failed to fetch progress percent:", error);
        }
    }, []);

    useEffect(() => {
        const token = nookies.get().token;

        if (token && id) {
            fetchExerciseData(token, id as string);
            fetchPercentData(token, id as string);
        }
    }, [id, fetchExerciseData, fetchPercentData]);

    const progressBarWidth = useMemo(() => ({ width: `${percent ?? 0}%` }), [percent]);

    return (
        <ProtectedRoute>
            <article className="relative z-10 w-full h-full">
                <Navbar />
                <main className="flex justify-center items-center">
                    <article className="bg-white my-10 mx-3 pb-12 lg:px-28 md:px-48 sm:px-32 px-10 rounded-xl">
                        <section className="flex flex-col items-center text-center">
                            <Typography variant="h1" color="blue-gray" className="mt-8 !leading-tight lg:text-4xl text-3xl text-nowrap text-center">
                                Exercise {id}
                            </Typography>
                            <Typography
                                variant="lead"
                                color="blue-gray"
                                className="mt-0 mb-5 !text-gray-500 text-base font-normal text-nowrap text-center"
                            >
                                รอการอัพเดต เพิ่มเติม
                            </Typography>
                            <figure className="bg-brown-100 relative h-8 lg:w-96 w-full rounded-full mt-2 mb-8">
                                <div style={progressBarWidth} className="bg-red-500 absolute top-0 left-0 h-full rounded-full">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                        className="icon icon-tabler icons-tabler-filled icon-tabler-star absolute text-orange-400 h-16 -mt-5 -right-9"
                                    >
                                        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                        <path d="M8.243 7.34l-6.38 .925l-.113 .023a1 1 0 0 0 -.44 1.684l4.622 4.499l-1.09 6.355l-.013 .11a1 1 0 0 0 1.464 .944l5.706 -3l5.693 3l.1 .046a1 1 0 0 0 1.352 -1.1l-1.091 -6.355l4.624 -4.5l.078 -.085a1 1 0 0 0 -.633 -1.62l-6.38 -.926l-2.852 -5.78a1 1 0 0 0 -1.794 0l-2.853 5.78z" />
                                    </svg>
                                </div>
                            </figure>
                        </section>
                        <section className="container mx-auto grid grid-cols-1 gap-x-10 gap-y-10 lg:grid-cols-2">
                            {alphabets.map((alphabet, idx) => (
                                <AlphabetCard key={idx} {...alphabet} />
                            ))}
                        </section>
                    </article>
                </main>
            </article>
        </ProtectedRoute>
    );
}

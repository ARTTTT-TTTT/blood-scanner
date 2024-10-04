import { useMemo, useEffect, useState, useCallback } from "react";
import { Card, CardBody, Button, Typography } from "@material-tailwind/react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/router";
import Image from "next/image";

import { Navbar, ProtectedRoute, RecordAudio } from "@/components";
import { getAlphabet } from "@/api";
import { AlphabetModel } from "@/models";

const API_URL = process.env.NEXT_PUBLIC_FASTAPI_URL;

const Read_Progressions_Alphabet_count = {
    count: 0,
    correct: 0,
    incorrect: 0,
};

export default function AlphabetPage() {
    const router = useRouter();
    const { id, alphabet } = router.query;
    const [showResult, setShowResult] = useState(false);
    const [progression, setProgression] = useState(Read_Progressions_Alphabet_count);
    const [data, setData] = useState<AlphabetModel>({ alphabet: "", image_file: "", mp3_file: "" });

    const handleRecordComplete = useCallback((correct: boolean) => {
        setProgression((prev) => {
            const newCount = prev.count + 1;
            const newCorrect = correct ? prev.correct + 1 : prev.correct;
            const newIncorrect = !correct ? prev.incorrect + 1 : prev.incorrect;

            if (newCount >= 10) {
                setShowResult(true);
            }

            return {
                count: newCount, // Reset will be handled in handleReset
                correct: newCorrect,
                incorrect: newIncorrect,
            };
        });
    }, []);

    const handleReset = () => {
        setProgression(Read_Progressions_Alphabet_count);
        setShowResult(false);
    };

    // Calculate percentage of correct recordings
    const correctPercentage = useMemo(() => {
        return progression.count > 0 ? (progression.correct / progression.count) * 100 : 0;
    }, [progression.correct, progression.count]);

    const countPercent = useMemo(() => progression.count * 10, [progression.count]);

    useEffect(() => {
        const fetchData = async () => {
            if (id && alphabet) {
                try {
                    const fetchedData = await getAlphabet(Number(id), String(alphabet));
                    setData(fetchedData);
                } catch (error) {
                    console.error("Error fetching alphabet data:", error);
                }
            }
        };

        fetchData();
    }, [id, alphabet]);

    // Use image_file from data if available; otherwise, use a default URL
    const imageUrl = useMemo(() => {
        return data.image_file ? `${API_URL}/exercises/images/${data.image_file}` : `${API_URL}/exercises/images/669fd886a9ab1e377b281896`;
    }, [data.image_file]);

    return (
        <ProtectedRoute>
            <article className="relative z-10 w-full h-full">
                <Navbar />
                <div className="flex justify-center items-center">
                    <article className="bg-white sm:my-7 my-2 mx-3 lg:px-28 md:px-48 sm:px-32 px-6 rounded-xl">
                        <section className="flex flex-col justify-center items-center">
                            <Typography
                                variant="h1"
                                color="blue-gray"
                                className="font-itim h-fit w-fit mt-8 !leading-tight lg:text-4xl text-3xl text-nowrap text-center"
                            >
                                ฝึกออกเสียง ครั้งที่ {progression.count} / 10
                            </Typography>
                            <figure className="bg-brown-100 relative sm:h-9 h-7 lg:w-96 w-full rounded-full mt-6">
                                <div style={{ width: `${countPercent}%` }} className="bg-red-500 absolute top-0 left-0 h-full rounded-full">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                        className="icon icon-tabler icons-tabler-filled icon-tabler-star absolute text-orange-400 sm:-mt-7 -mt-6 sm:h-20 h-16 -right-9"
                                    >
                                        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                        <path d="M8.243 7.34l-6.38 .925l-.113 .023a1 1 0 0 0 -.44 1.684l4.622 4.499l-1.09 6.355l-.013 .11a1 1 0 0 0 1.464 .944l5.706 -3l5.693 3l.1 .046a1 1 0 0 0 1.352 -1.1l-1.091 -6.355l4.624 -4.5l.078 -.085a1 1 0 0 0 -.633 -1.62l-6.38 -.926l-2.852 -5.78a1 1 0 0 0 -1.794 0l-2.853 5.78z" />
                                    </svg>
                                </div>
                            </figure>
                            <figure className="flex justify-center items-center mt-8 gap-x-5">
                                <button
                                    title="Audio"
                                    className="mb-0 flex items-center justify-center bg-orange-400 hover:bg-orange-600 rounded-full w-16 h-16 focus:outline-none"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="icon icon-tabler icons-tabler-outline icon-tabler-volume h-12 text-white"
                                    >
                                        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                        <path d="M15 8a5 5 0 0 1 0 8" />
                                        <path d="M17.7 5a9 9 0 0 1 0 14" />
                                        <path d="M6 15h-2a1 1 0 0 1 -1 -1v-4a1 1 0 0 1 1 -1h2l3.5 -4.5a.8 .8 0 0 1 1.5 .5v14a.8 .8 0 0 1 -1.5 .5l-3.5 -4.5" />
                                    </svg>
                                </button>
                                <Typography
                                    variant="h1"
                                    className="bg-red-300 w-fit px-6 py-3 rounded-full underline !leading-tight lg:text-4xl text-3xl text-nowrap text-center text-red-50 text-opacity-90"
                                >
                                    {alphabet}
                                </Typography>
                                <button
                                    title="Slow"
                                    className="mb-0 flex items-center justify-center bg-orange-400 hover:bg-orange-600 rounded-full w-16 h-16 focus:outline-none"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="icon icon-tabler icons-tabler-outline icon-tabler-snowflake h-12 text-white"
                                    >
                                        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                        <path d="M10 4l2 1l2 -1" />
                                        <path d="M12 2v6.5l3 1.72" />
                                        <path d="M17.928 6.268l.134 2.232l1.866 1.232" />
                                        <path d="M20.66 7l-5.629 3.25l.01 3.458" />
                                        <path d="M19.928 14.268l-1.866 1.232l-.134 2.232" />
                                        <path d="M20.66 17l-5.629 -3.25l-2.99 1.738" />
                                        <path d="M14 20l-2 -1l-2 1" />
                                        <path d="M12 22v-6.5l-3 -1.72" />
                                        <path d="M6.072 17.732l-.134 -2.232l-1.866 -1.232" />
                                        <path d="M3.34 17l5.629 -3.25l-.01 -3.458" />
                                        <path d="M4.072 9.732l1.866 -1.232l.134 -2.232" />
                                        <path d="M3.34 7l5.629 3.25l2.99 -1.738" />
                                    </svg>
                                </button>
                            </figure>
                        </section>
                        <section className="container m-10 mx-auto grid gap-10 min-h-[30vh] w-fit grid-cols-1 items-center lg:grid-cols-2">
                            <figure className="flex flex-col lg:flex-row justify-center items-center">
                                <div className="justify-center items-center h-[20rem] w-[20rem] bg-deep-purple-100 rounded-3xl">
                                    <Image width={1024} height={1024} alt="พยัญชนะ" src={imageUrl} className="h-full w-full object-cover" priority />
                                </div>
                            </figure>
                            <figure className="row-start-2 lg:row-auto">
                                <div className="grid">
                                    <RecordAudio onRecordComplete={handleRecordComplete} />
                                </div>
                            </figure>
                        </section>
                    </article>
                </div>
                {showResult && (
                    <AnimatePresence>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.25 }}
                            className="absolute top-0 left-0 right-0 bottom-0 flex justify-center items-center"
                        >
                            <Card className="max-w-xl">
                                <CardBody>
                                    <div className="flex w-full justify-center">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            stroke-width="2"
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                            className="text-green-500 icon icon-tabler icons-tabler-outline icon-tabler-circle-dashed-check h-16"
                                        >
                                            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                            <path d="M8.56 3.69a9 9 0 0 0 -2.92 1.95" />
                                            <path d="M3.69 8.56a9 9 0 0 0 -.69 3.44" />
                                            <path d="M3.69 15.44a9 9 0 0 0 1.95 2.92" />
                                            <path d="M8.56 20.31a9 9 0 0 0 3.44 .69" />
                                            <path d="M15.44 20.31a9 9 0 0 0 2.92 -1.95" />
                                            <path d="M20.31 15.44a9 9 0 0 0 .69 -3.44" />
                                            <path d="M20.31 8.56a9 9 0 0 0 -1.95 -2.92" />
                                            <path d="M15.44 3.69a9 9 0 0 0 -3.44 -.69" />
                                            <path d="M9 12l2 2l4 -4" />
                                        </svg>
                                    </div>
                                    <div className="text-center px-6">
                                        <Typography color="blue-gray" className="mt-5" variant="h4">
                                            คะแนน {correctPercentage.toFixed(2)}%
                                        </Typography>
                                        <Button size="lg" className="mt-8 font-itim" onClick={handleReset}>
                                            ตกลง
                                        </Button>
                                    </div>
                                </CardBody>
                            </Card>
                        </motion.div>
                    </AnimatePresence>
                )}
            </article>
        </ProtectedRoute>
    );
}

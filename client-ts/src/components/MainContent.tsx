import { Card, CardHeader, CardBody } from "@material-tailwind/react";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";

interface MainContentProps {
    isSidebarOpen: boolean;
}

const MainContent: React.FC<MainContentProps> = ({ isSidebarOpen }) => {
    const [isCameraOn, setIsCameraOn] = useState(false); // State สำหรับจัดการสถานะกล้อง
    const [capturedImage, setCapturedImage] = useState<string | null>(null); // สำหรับจัดการภาพที่ถ่าย
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null); // สำหรับ canvas

    // ฟังก์ชันเปิดกล้อง
    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.play();
                console.log("Camera started successfully.");
            }
            setIsCameraOn(true);
        } catch (error) {
            console.error("Error accessing the camera: ", error);
        }
    };

    // ฟังก์ชันปิดกล้อง
    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            const tracks = stream.getTracks();
            tracks.forEach((track) => track.stop());
            videoRef.current.srcObject = null;
        }
        setIsCameraOn(false);
        console.log("Camera stopped.");
    };

    // ฟังก์ชันถ่ายภาพ
    const captureImage = () => {
        if (videoRef.current && canvasRef.current) {
            const canvas = canvasRef.current;
            const video = videoRef.current;
            const context = canvas.getContext("2d");
            if (context) {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                context.drawImage(video, 0, 0, canvas.width, canvas.height);
                const dataUrl = canvas.toDataURL("image/png"); // แปลงเป็น Base64
                setCapturedImage(dataUrl); // เก็บข้อมูล Base64 ของภาพที่ถ่าย
                console.log("Image captured:", dataUrl);
                //sendImageToAPI;
            }
        }
    };

    // ฟังก์ชันส่งภาพไปยัง API
    const sendImageToAPI = async (imageData: string) => {
        try {
            const response = await fetch("/api/upload", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ image: imageData }), // ส่ง Base64
            });
            const result = await response.json();
            console.log("Image uploaded successfully:", result);
        } catch (error) {
            console.error("Error uploading image:", error);
        }
    };

    // ใช้ useEffect เพื่อตรวจสอบการเปลี่ยนแปลงของกล้อง
    useEffect(() => {
        if (isCameraOn && videoRef.current) {
            videoRef.current.play().catch((error) => {
                console.error("Error playing the video stream: ", error);
            });
        }
    }, [isCameraOn]);

    return (
        <article
            className={`h-full flex justify-center bg-gray-800 text-white transition-all duration-300 ${
                isSidebarOpen ? "md:opacity-100 opacity-50" : "md:opacity-100 opacity-100"
            }`}
        >
            <Card shadow={false} className="bg-gray-800">
                <CardHeader
                    shadow={false}
                    floated={false}
                    className="text-center flex justify-center items-center font-bold text-xl bg-gray-800 text-white"
                >
                    04 / ตุลาคม / 2024 - 0
                </CardHeader>
                <CardBody className="flex flex-col items-center gap-3">
                    {/* พื้นที่สำหรับเปิดกล้อง */}
                    <Card className="md:w-96 md:h-96 w-64 h-64 bg-gray-900 flex items-center justify-center mb-8">
                        {isCameraOn ? (
                            <video ref={videoRef} className="w-full h-full bg-black" />
                        ) : (
                            <span className="text-white">พื้นที่สำหรับเปิดกล้อง</span>
                        )}
                    </Card>

                    <div className="md:gap-24 gap-14 flex bg-gray-700 rounded-full px-3 py-2">
                        {/* ปุ่มเปิดกล้อง */}
                        <button onClick={isCameraOn ? stopCamera : startCamera} className="text-white">
                            {isCameraOn ? (
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-10">
                                    <path d="M.97 3.97a.75.75 0 0 1 1.06 0l15 15a.75.75 0 1 1-1.06 1.06l-15-15a.75.75 0 0 1 0-1.06ZM17.25 16.06l2.69 2.69c.944.945 2.56.276 2.56-1.06V6.31c0-1.336-1.616-2.005-2.56-1.06l-2.69 2.69v8.12ZM15.75 7.5v8.068L4.682 4.5h8.068a3 3 0 0 1 3 3ZM1.5 16.5V7.682l11.773 11.773c-.17.03-.345.045-.523.045H4.5a3 3 0 0 1-3-3Z" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-10">
                                    <path d="M4.5 4.5a3 3 0 0 0-3 3v9a3 3 0 0 0 3 3h8.25a3 3 0 0 0 3-3v-9a3 3 0 0 0-3-3H4.5ZM19.94 18.75l-2.69-2.69V7.94l2.69-2.69c.944-.945 2.56-.276 2.56 1.06v11.38c0 1.336-1.616 2.005-2.56 1.06Z" />
                                </svg>
                            )}
                        </button>

                        {/* ปุ่มถ่ายภาพ */}
                        <button onClick={captureImage} className="text-white w-fit">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-10">
                                <path d="M12 9a3.75 3.75 0 1 0 0 7.5A3.75 3.75 0 0 0 12 9Z" />
                                <path
                                    fillRule="evenodd"
                                    d="M9.344 3.071a49.52 49.52 0 0 1 5.312 0c.967.052 1.83.585 2.332 1.39l.821 1.317c.24.383.645.643 1.11.71.386.054.77.113 1.152.177 1.432.239 2.429 1.493 2.429 2.909V18a3 3 0 0 1-3 3h-15a3 3 0 0 1-3-3V9.574c0-1.416.997-2.67 2.429-2.909.382-.064.766-.123 1.151-.178a1.56 1.56 0 0 0 1.11-.71l.822-1.315a2.942 2.942 0 0 1 2.332-1.39ZM6.75 12.75a5.25 5.25 0 1 1 10.5 0 5.25 5.25 0 0 1-10.5 0Zm12-1.5a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </button>

                        {/* ปุ่มส่งภาพ */}
                        <button
                            onClick={() => {
                                if (capturedImage) {
                                    sendImageToAPI(capturedImage); // ส่งภาพที่ถูกถ่ายไปยัง API
                                } else {
                                    alert("ยังไม่มีภาพที่ถ่าย"); // แจ้งเตือนหากยังไม่ได้ถ่ายภาพ
                                }
                            }}
                            className="text-white"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-10">
                                <path
                                    fillRule="evenodd"
                                    d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm.53 5.47a.75.75 0 0 0-1.06 0l-3 3a.75.75 0 1 0 1.06 1.06l1.72-1.72v5.69a.75.75 0 0 0 1.5 0v-5.69l1.72 1.72a.75.75 0 1 0 1.06-1.06l-3-3Z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </button>
                    </div>

                    {/* Canvas ที่ซ่อนไว้สำหรับการถ่ายภาพ */}
                    <canvas ref={canvasRef} style={{ display: "none" }} />

                    {/* แสดงภาพที่ถ่าย */}
                    {capturedImage && (
                        <div className="mt-4">
                            <Image src={capturedImage} alt="Captured" className="w-64 h-64 object-contain" />
                        </div>
                    )}
                </CardBody>
            </Card>
        </article>
    );
};

export default MainContent;

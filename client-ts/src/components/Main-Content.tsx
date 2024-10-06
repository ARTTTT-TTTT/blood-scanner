import { Card, CardHeader, CardBody } from "@material-tailwind/react";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";

const API_URL = process.env.NEXT_PUBLIC_FASTAPI_URL;

interface MainContentProps {
    isSidebarOpen: boolean;
}

export const MainContent: React.FC<MainContentProps> = ({ isSidebarOpen }) => {
    const [responseMessage, setResponseMessage] = useState<string | null>(null);
    const [isCameraOn, setIsCameraOn] = useState<boolean>(false);
    const [capturedImage, setCapturedImage] = useState<Blob | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null!);
    const videoRef = useRef<HTMLVideoElement>(null!);
    const streamRef = useRef<MediaStream | null>(null);

    const today = new Date();
    const day = today.getDate();
    const month = today.toLocaleString("default", { month: "long" }); // ใช้ชื่อเดือนแบบเต็ม
    const year = today.getFullYear();
    const displayDate = `${day} / ${month} / ${year}`;

    const startCamera = async () => {
        try {
            // กำหนดให้ใช้กล้องหลัง
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: { exact: "environment" } },
            });

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.play();
            }

            streamRef.current = stream;
            setIsCameraOn(true);
        } catch (error) {
            console.error("Error accessing the camera: ", error);
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track: MediaStreamTrack) => {
                track.stop(); // หยุด track ของกล้อง
            });

            if (videoRef.current) {
                videoRef.current.srcObject = null; // ล้าง stream ออกจาก video element
            }

            streamRef.current = null; // ล้าง stream
            setIsCameraOn(false);

            // สร้าง iframe ใหม่เพื่อรีเซ็ตกล้อง
            const iframe = document.createElement("iframe");
            iframe.style.display = "none"; // ซ่อน iframe ไม่ให้ผู้ใช้เห็น
            iframe.src = "about:blank";
            document.body.appendChild(iframe);

            setTimeout(() => {
                document.body.removeChild(iframe); // ลบ iframe ออกจาก DOM หลังจากล้าง
            }, 100); // รอประมาณ 100ms ก่อนลบออก
            window.location.reload(); // รีเฟรชเพจ
        }
    };

    const captureImage = () => {
        if (videoRef.current && canvasRef.current) {
            const canvas = canvasRef.current;
            const video = videoRef.current;
            const context = canvas.getContext("2d");

            if (context) {
                // กำหนดขนาดภาพที่ต้องการ เช่น 512x512
                const width = 512;
                const height = 512;

                // ตั้งค่าขนาดของ canvas ให้เป็น 512x512
                canvas.width = width;
                canvas.height = height;
                context.drawImage(video, 0, 0, canvas.width, canvas.height);

                // แปลงภาพใน canvas เป็น Blob แทนการแปลงเป็น Base64 string
                canvas.toBlob((blob) => {
                    if (blob) {
                        setCapturedImage(blob); // เก็บ blob ของภาพที่ถ่าย
                    }
                }, "image/png");
            }
        }
    };

    const sendImageToAPI = async (imageBlob: Blob) => {
        const formData = new FormData();
        formData.append("image", imageBlob, "captured-image.png");

        try {
            const response = await fetch(`${API_URL}/blood/upload-image-prediction`, {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.statusText}`);
            }

            if (response.ok) {
                const text = await response.text(); // ค่านี้จะเป็น "0", "1", "2", หรือ "3"
                if (text) {
                    // แปลง text เป็น int
                    const result = parseInt(text, 10);
                    let displayMessage = "";

                    switch (result) {
                        case 0:
                            displayMessage = "ปกติ";
                            break;
                        case 1:
                            displayMessage = "ขุ่น";
                            break;
                        case 2:
                            displayMessage = "แดง";
                            break;
                        case 3:
                            displayMessage = "เขียว";
                            break;
                        default:
                            displayMessage = "ค่าที่ไม่รู้จัก"; // เผื่อกรณีค่าไม่ตรงกับที่กำหนด
                    }
                    setResponseMessage(displayMessage); // ตั้งค่า responseMessage เป็นข้อความที่แปลแล้ว
                }
            } else {
                console.error("Error:", response.statusText);
            }
        } catch (error) {
            console.error("Error:", error);
        }
    };

    useEffect(() => {
        if (isCameraOn) {
            startCamera();
        } else {
            stopCamera();
        }
    }, [isCameraOn]);

    return (
        <article
            className={`h-full flex justify-center bg-gray-800 text-white transition-all duration-300 ${
                isSidebarOpen ? "md:opacity-100 opacity-50" : "md:opacity-100 opacity-100"
            }`}
        >
            <Card
                shadow={false}
                className={`bg-gray-800 transition-transform duration-300 ease-in-out ${isSidebarOpen ? "md:translate-x-24" : "md:translate-x-0"} `}
            >
                <CardHeader
                    shadow={false}
                    floated={false}
                    className="text-center flex justify-center items-center font-bold text-xl bg-gray-800 text-white"
                >
                    {displayDate} - 0 {/* วันที่ปัจจุบัน */}
                </CardHeader>
                <CardBody className="md:p-4 p-6 flex flex-col items-center justify-center gap-6">
                    {/* พื้นที่สำหรับเปิดกล้อง */}
                    <Card className="md:w-96 md:h-96 w-64 h-64 bg-gray-900 flex items-center justify-center">
                        {isCameraOn ? (
                            <video ref={videoRef} className="md:w-80 md:h-80 w-60 h-60 object-fill rounded-xl" autoPlay />
                        ) : (
                            <span className="text-white">พื้นที่สำหรับเปิดกล้อง</span>
                        )}
                    </Card>

                    {/* พื้นที่สำหรับภาพถ่าย */}
                    <section className="flex items-center justify-center md:gap-8 gap-4">
                        {/* Canvas ที่ซ่อนไว้สำหรับการถ่ายภาพ */}
                        <canvas ref={canvasRef} style={{ display: "none" }} />
                        <Card className="md:w-48 md:h-48 w-36 h-36 bg-gray-900 flex items-center justify-center">
                            {capturedImage ? (
                                <Image
                                    src={capturedImage ? URL.createObjectURL(capturedImage) : ""}
                                    alt="Captured"
                                    className="md:w-44 md:h-44 w-40 h-40 object-fill rounded-xl"
                                    width={512}
                                    height={512}
                                />
                            ) : (
                                <span className="text-white">ยังไม่มีภาพถ่าย</span>
                            )}
                        </Card>
                        <Card className="md:w-40 md:h-20 w-24 h-12 bg-gray-700 flex items-center justify-center md:text-4xl text-xl text-nowrap">
                            {responseMessage ? <span className="text-white">{responseMessage}</span> : <span className="text-white">ผลลัพธ์</span>}
                        </Card>
                    </section>

                    <section className="md:gap-24 gap-14 flex bg-gray-700 rounded-full px-3 py-2">
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
                                    sendImageToAPI(capturedImage); // ส่ง Blob ของภาพที่ถูกจับไปยัง API
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
                    </section>
                </CardBody>
            </Card>
        </article>
    );
};

export default MainContent;

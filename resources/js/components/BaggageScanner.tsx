import { motion, AnimatePresence } from 'framer-motion';
import { Camera, RefreshCw, Smartphone, ScanLine, X } from 'lucide-react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';

export default function BaggageScanner() {
    const [hasPermission, setHasPermission] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const [scanResult, setScanResult] = useState<'Small' | 'Medium' | 'Large' | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);

    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
        }
    }, [stream, hasPermission]); // Re-run when permission changes and video element mounts

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            });
            setStream(mediaStream);
            setHasPermission(true);
            setIsScanning(true);
            simulateScan();
        } catch (err) {
            console.error("Error accessing camera:", err);
            alert("Could not access camera. Please allow camera permissions to use the scanner.");
        }
    };

    const stopCamera = useCallback(() => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
        setHasPermission(false);
        setIsScanning(false);
        setScanResult(null);
    }, [stream]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [stream]);

    const simulateScan = () => {
        setScanResult(null);
        // Mock scanning process
        setTimeout(() => {
            const sizes: ('Small' | 'Medium' | 'Large')[] = ['Small', 'Medium', 'Large'];
            const randomSize = sizes[Math.floor(Math.random() * sizes.length)];
            setScanResult(randomSize);
        }, 3000);
    };

    return (
        <section className="py-16 md:py-24 bg-gray-900 text-white overflow-hidden relative">
            {/* Background decorative elements */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-500/10 blur-[100px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-yellow-500/10 blur-[100px] rounded-full pointer-events-none" />

            <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

                    {/* Text / Intro */}
                    <div className="space-y-6 md:space-y-8 text-center lg:text-left">
                        <div className="inline-flex items-center gap-2 bg-orange-500/20 text-orange-300 px-4 py-1.5 rounded-full text-sm font-medium border border-orange-500/30">
                            <ScanLine className="w-4 h-4" />
                            AI-Powered Size Detection
                        </div>
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
                            Unsure about your <br className="hidden sm:block" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">bag size?</span>
                        </h2>
                        <p className="text-base sm:text-lg text-gray-400 max-w-lg mx-auto lg:mx-0 leading-relaxed">
                            Use our AI scanner to instantly measure your luggage. Just point your camera, and we'll tell you if it fits a Small, Medium, or Large locker.
                        </p>

                        {!hasPermission && (
                            <div className="flex justify-center lg:justify-start">
                                <Button
                                    size="lg"
                                    onClick={startCamera}
                                    className="h-14 px-8 w-full sm:w-auto rounded-full bg-orange-500 hover:bg-orange-600 text-white font-bold text-lg shadow-lg shadow-orange-900/50 transition-all group"
                                >
                                    <Camera className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                                    Start Scanner
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Scanner Interface */}
                    <div className="relative mx-auto w-full max-w-md aspect-[3/4] bg-black rounded-3xl overflow-hidden border-4 border-gray-800 shadow-2xl">
                        {!hasPermission ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 bg-gray-900/50 backdrop-blur-sm p-8 text-center">
                                <Smartphone className="w-16 h-16 mb-4 opacity-50" />
                                <p>Tap "Start Scanner" to open camera</p>
                            </div>
                        ) : (
                            <>
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                    muted
                                    className="w-full h-full object-cover -scale-x-100"
                                />

                                {/* AR Overlay UI */}
                                <div className="absolute inset-0 pointer-events-none">
                                    {/* Scanning Corner Brackets */}
                                    <div className="absolute top-8 left-8 w-12 h-12 md:w-16 md:h-16 border-t-4 border-l-4 border-orange-500 rounded-tl-xl opacity-80" />
                                    <div className="absolute top-8 right-8 w-12 h-12 md:w-16 md:h-16 border-t-4 border-r-4 border-orange-500 rounded-tr-xl opacity-80" />
                                    <div className="absolute bottom-8 left-8 w-12 h-12 md:w-16 md:h-16 border-b-4 border-l-4 border-orange-500 rounded-bl-xl opacity-80" />
                                    <div className="absolute bottom-8 right-8 w-12 h-12 md:w-16 md:h-16 border-b-4 border-r-4 border-orange-500 rounded-br-xl opacity-80" />

                                    {/* Scanning Beam */}
                                    {isScanning && !scanResult && (
                                        <motion.div
                                            className="absolute top-0 left-0 w-full h-1 bg-orange-400 shadow-[0_0_20px_rgba(249,115,22,0.8)]"
                                            animate={{ top: ['10%', '90%', '10%'] }}
                                            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                        />
                                    )}

                                    {/* Close Button */}
                                    <button
                                        onClick={stopCamera}
                                        className="absolute top-4 right-4 p-2 bg-black/50 rounded-full text-white pointer-events-auto hover:bg-black/70 transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>

                                    {/* HUD Elements */}
                                    <div className="absolute top-6 left-6 flex items-center gap-2">
                                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                                        <span className="text-xs font-mono text-red-500 font-bold uppercase tracking-widest">Live Feed</span>
                                    </div>

                                    {/* Result Pop-up */}
                                    <AnimatePresence>
                                        {scanResult && (
                                            <motion.div
                                                initial={{ scale: 0.5, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                exit={{ scale: 0.5, opacity: 0 }}
                                                className="absolute inset-0 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm"
                                            >
                                                <div className="bg-white text-gray-900 p-6 rounded-2xl w-full max-w-xs text-center shadow-2xl pointer-events-auto">
                                                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
                                                        <ScanLine className="w-8 h-8" />
                                                    </div>
                                                    <h3 className="text-2xl font-bold mb-2">{scanResult} Bag</h3>
                                                    <p className="text-gray-500 mb-6">
                                                        We recommend the <span className="font-bold text-gray-900">{scanResult} Locker</span>.
                                                    </p>
                                                    <div className="flex gap-2">
                                                        <Button onClick={simulateScan} variant="outline" className="flex-1 border-gray-200">
                                                            <RefreshCw className="w-4 h-4 mr-2" /> Retry
                                                        </Button>
                                                        <Button onClick={stopCamera} className="flex-1 bg-orange-500 hover:bg-orange-600 text-white">
                                                            Select
                                                        </Button>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}

import React, { useRef, useState, useEffect } from 'react';
import { Camera as CameraIcon, X, RefreshCw, Check, Undo2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

interface CameraModalProps {
    isOpen: boolean;
    onClose: () => void;
    onPhotosCaptured: (files: File[]) => void;
}

export default function CameraModal({ isOpen, onClose, onPhotosCaptured }: CameraModalProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [capturedPhotos, setCapturedPhotos] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [isInitializing, setIsInitializing] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            startCamera();
        } else {
            stopCamera();
            // Clear local previews but don't clear capturedPhotos yet as we might need them if user clicks add
        }
    }, [isOpen]);

    const startCamera = async () => {
        setIsInitializing(true);
        setError(null);
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' },
                audio: false
            });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
            setIsInitializing(false);
        } catch (err) {
            console.error("Error accessing camera:", err);
            setError("Could not access camera. Please ensure permissions are granted.");
            setIsInitializing(false);
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    };

    const capturePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');

            if (context) {
                // Set canvas size to match video dimensions
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;

                // Draw the video frame to the canvas
                context.drawImage(video, 0, 0, canvas.width, canvas.height);

                // Convert canvas to blob
                canvas.toBlob((blob) => {
                    if (blob) {
                        const file = new File([blob], `captured_bag_${Date.now()}.jpg`, { type: 'image/jpeg' });
                        setCapturedPhotos(prev => [...prev, file]);
                        setPreviews(prev => [...prev, URL.createObjectURL(blob)]);
                    }
                }, 'image/jpeg', 0.8);
            }
        }
    };

    const removeCapturedPhoto = (index: number) => {
        const newPhotos = [...capturedPhotos];
        newPhotos.splice(index, 1);
        setCapturedPhotos(newPhotos);

        const newPreviews = [...previews];
        URL.revokeObjectURL(newPreviews[index]);
        newPreviews.splice(index, 1);
        setPreviews(newPreviews);
    };

    const handleAddPhotos = () => {
        onPhotosCaptured(capturedPhotos);
        handleClose();
    };

    const handleClose = () => {
        stopCamera();
        setCapturedPhotos([]);
        previews.forEach(p => URL.revokeObjectURL(p));
        setPreviews([]);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden bg-black text-white border-none">
                <DialogHeader className="p-4 bg-gray-900 border-b border-gray-800">
                    <DialogTitle className="flex items-center gap-2 text-white">
                        <CameraIcon className="h-5 w-5 text-orange-500" />
                        Live Bag Photo
                    </DialogTitle>
                    <DialogDescription className="text-gray-400">
                        Capture visual proof of condition.
                    </DialogDescription>
                </DialogHeader>

                <div className="relative aspect-video bg-black flex items-center justify-center">
                    {isInitializing && !error && (
                        <div className="flex flex-col items-center gap-2">
                            <RefreshCw className="h-8 w-8 animate-spin text-orange-500" />
                            <p className="text-sm text-gray-400">Initializing camera...</p>
                        </div>
                    )}

                    {error && (
                        <div className="p-6 text-center">
                            <X className="h-10 w-10 text-red-500 mx-auto mb-2" />
                            <p className="text-red-400">{error}</p>
                            <Button variant="outline" className="mt-4 border-gray-700 hover:bg-gray-800" onClick={startCamera}>
                                Retry
                            </Button>
                        </div>
                    )}

                    <video 
                        ref={videoRef} 
                        autoPlay 
                        playsInline 
                        className={`w-full h-full object-cover ${isInitializing || error ? 'hidden' : 'block'}`}
                    />
                    
                    <canvas ref={canvasRef} className="hidden" />

                    {/* Quick Previews Sidebar */}
                    {previews.length > 0 && (
                        <div className="absolute left-4 top-4 bottom-4 w-16 overflow-y-auto no-scrollbar flex flex-col gap-2 pointer-events-none">
                            {previews.map((url, i) => (
                                <div key={i} className="w-16 h-16 rounded-lg border-2 border-orange-500 overflow-hidden shadow-xl pointer-events-auto">
                                    <img src={url} className="w-full h-full object-cover" />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Actions Overlay */}
                    {!isInitializing && !error && (
                        <div className="absolute bottom-6 inset-x-0 flex justify-center items-center gap-8">
                            <Button 
                                type="button"
                                size="icon" 
                                variant="outline" 
                                className="h-12 w-12 rounded-full border-2 border-white bg-transparent hover:bg-white/10"
                                onClick={handleClose}
                            >
                                <Undo2 className="h-6 w-6 text-white" />
                            </Button>

                            <button 
                                onClick={capturePhoto}
                                className="h-20 w-20 rounded-full border-4 border-white flex items-center justify-center group active:scale-95 transition-all"
                            >
                                <div className="h-16 w-16 rounded-full bg-white group-hover:bg-gray-200 transition-colors" />
                            </button>

                            <Button 
                                type="button"
                                size="icon" 
                                variant="default" 
                                className="h-12 w-12 rounded-full bg-orange-600 hover:bg-orange-700"
                                onClick={handleAddPhotos}
                                disabled={capturedPhotos.length === 0}
                            >
                                <Check className="h-6 w-6" />
                            </Button>
                        </div>
                    )}
                </div>

                {capturedPhotos.length > 0 && (
                    <div className="bg-gray-900 p-4 flex items-center justify-between">
                        <p className="text-sm font-medium">{capturedPhotos.length} photo(s) captured</p>
                        <Button size="sm" onClick={handleAddPhotos}>
                            Finish & Add
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}

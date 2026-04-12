import { Html5Qrcode } from 'html5-qrcode';
import { CheckCircle, AlertCircle, ScanLine, X, RefreshCw } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { StatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCurrency } from '@/context/CurrencyContext';
import CameraModal from './CameraModal';
import { Badge } from './ui/badge';

interface Booking {
    id: string;
    customer: string;
    contact: string;
    bags: Record<string, number>;
    amount: number;
    status: string;
    source: string;
    checkIn: string;
    tagNumber?: string;
    notes?: string;
}

interface BookingScannerProps {
    isOpen: boolean;
    onClose: () => void;
    bookings: Booking[];
    onCheckIn: (bookingId: string, data: { tagNumber: string, notes?: string, photos: File[], paymentStatus: string }) => void;
}

export default function BookingScanner({ isOpen, onClose, bookings, onCheckIn }: BookingScannerProps) {
    const { format } = useCurrency();
    const [scanResult, setScanResult] = useState<string | null>(null);
    const [foundBooking, setFoundBooking] = useState<Booking | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [scanning, setScanning] = useState(false);
    const [permissionError, setPermissionError] = useState(false);

    // Check-in form state
    const [tagNumber, setTagNumber] = useState('');
    const [notes, setNotes] = useState('');
    const [paymentStatus, setPaymentStatus] = useState('pending');
    const [capturedPhotos, setCapturedPhotos] = useState<File[]>([]);
    const [isCameraOpen, setIsCameraOpen] = useState(false);

    const scannerRef = useRef<Html5Qrcode | null>(null);

    // Initialize scanner logic
    useEffect(() => {
        if (isOpen && !scanResult) {
            const scannerId = "reader-custom";

            // Wait for modal animation
            const timer = setTimeout(async () => {
                if (!document.getElementById(scannerId)) return;

                // Cleanup existing
                if (scannerRef.current) {
                    try {
                        if (scannerRef.current.isScanning) {
                            await scannerRef.current.stop();
                        }
                    } catch (e) {
                        // ignore stop error
                    }
                    scannerRef.current = null;
                }

                const html5QrCode = new Html5Qrcode(scannerId);
                scannerRef.current = html5QrCode;

                try {
                    setScanning(true);
                    setPermissionError(false);

                    // Prefer back camera
                    await html5QrCode.start(
                        { facingMode: "environment" },
                        {
                            fps: 10,
                            qrbox: { width: 250, height: 250 },
                            aspectRatio: 1.0
                        },
                        (decodedText) => onScanSuccess(decodedText),
                        (errorMessage) => {
                            // ongoing scan error, ignore
                        }
                    );
                } catch (err) {
                    console.error("Error starting scanner", err);
                    setScanning(false);
                    setPermissionError(true);
                }
            }, 300);

            return () => {
                clearTimeout(timer);
                stopScanner();
            };
        }
    }, [isOpen, scanResult]);

    const stopScanner = async () => {
        if (scannerRef.current) {
            try {
                if (scannerRef.current.isScanning) {
                    await scannerRef.current.stop();
                }
            } catch (err) {
                console.error("Failed to stop scanner", err);
            }
            // we don't clear the ref immediately to allow restarts if needed, 
            // but for this flow we can clear it.
            try {
                scannerRef.current.clear();
            } catch (e) { }
            scannerRef.current = null;
        }
        setScanning(false);
    };

    const onScanSuccess = (decodedText: string) => {
        stopScanner();
        setScanResult(decodedText);

        // Search for booking
        const booking = bookings.find(b => b.id === decodedText);
        if (booking) {
            setFoundBooking(booking);
            setTagNumber(booking.tagNumber || '');
            setNotes(booking.notes || '');
            setError(null);
        } else {
            setFoundBooking(null);
            setError(`No booking found for ID: ${decodedText}`);
        }
    };

    const handleManualCheckIn = () => {
        if (foundBooking) {
            onCheckIn(foundBooking.id, {
                tagNumber,
                notes,
                photos: capturedPhotos,
                paymentStatus: paymentStatus
            });
            onClose();
        }
    };

    const resetScanner = () => {
        setScanResult(null);
        setFoundBooking(null);
        setError(null);
        // Effect will restart scanner
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <ScanLine className="h-5 w-5" />
                        Scan Booking QR
                    </DialogTitle>
                    <DialogDescription>
                        Use your camera to scan the booking QR code.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-2">
                    {/* Scanner Custom UI */}
                    <div className={`relative w-full overflow-hidden rounded-lg bg-black ${!scanResult ? 'aspect-square' : 'hidden'} [&_video]:-scale-x-100`}>
                        <div id="reader-custom" className="w-full h-full"></div>

                        {/* Overlay elements */}
                        {scanning && (
                            <div className="absolute inset-0 border-2 border-orange-500/50 rounded-lg pointer-events-none flex items-center justify-center">
                                <div className="w-64 h-64 border-2 border-white/80 rounded-lg relative">
                                    <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-orange-500"></div>
                                    <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-orange-500"></div>
                                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-orange-500"></div>
                                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-orange-500"></div>
                                </div>
                            </div>
                        )}

                        {permissionError && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-gray-900 p-6 text-center">
                                <AlertCircle className="h-10 w-10 text-red-500 mb-2" />
                                <h3 className="font-semibold">Camera Access Error</h3>
                                <p className="text-sm text-gray-400 mt-1">Please ensure you have granted camera permissions to this site.</p>
                                <Button size="sm" variant="secondary" className="mt-4" onClick={resetScanner}>
                                    Retry
                                </Button>
                            </div>
                        )}

                        {!scanning && !permissionError && !scanResult && (
                            <div className="absolute inset-0 flex items-center justify-center text-white">
                                <RefreshCw className="h-8 w-8 animate-spin text-orange-500" />
                            </div>
                        )}
                    </div>

                    {/* Results UI */}
                    {scanResult && !foundBooking && (
                        <div className="text-center py-8 space-y-4">
                            <div className="bg-red-50 text-red-600 p-4 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
                                <X className="h-8 w-8" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Booking Not Found</h3>
                                <p className="text-gray-500">{error || "The scanned code didn't match any active booking."}</p>
                            </div>
                            <Button variant="outline" onClick={resetScanner}>Scan Again</Button>
                        </div>
                    )}

                    {foundBooking && (
                        <div className="space-y-6">
                            <div className="bg-green-50 border border-green-100 rounded-lg p-4 flex items-start gap-3">
                                <div className="bg-green-100 p-2 rounded-full text-green-600 mt-1">
                                    <CheckCircle className="h-5 w-5" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="font-semibold text-green-900">Booking Verified</h3>
                                    <p className="text-green-700 text-sm">Successfully identified booking <span className="font-mono font-bold">{foundBooking.id}</span></p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="block text-gray-500 text-xs uppercase tracking-wider">Customer</span>
                                    <span className="font-medium text-gray-900">{foundBooking.customer}</span>
                                </div>
                                <div>
                                    <span className="block text-gray-500 text-xs uppercase tracking-wider">Status</span>
                                    <StatusBadge status={foundBooking.status} />
                                </div>
                                <div>
                                    <span className="block text-gray-500 text-xs uppercase tracking-wider">Bags</span>
                                    <span className="font-medium text-gray-900">
                                        {Object.entries(foundBooking.bags)
                                            .filter(([_, count]) => count > 0)
                                            .map(([type, count]) => `${count} ${type}`)
                                            .join(', ')}
                                    </span>
                                </div>
                                <div>
                                    <span className="block text-gray-500 text-xs uppercase tracking-wider">Amount Due</span>
                                    <span className="font-medium text-gray-900">{format(foundBooking.amount)}</span>
                                </div>
                            </div>

                            <div className="space-y-4 border-t pt-4">
                                <div className="space-y-2">
                                    <Label htmlFor="tag-number">Tag Number</Label>
                                    <Input
                                        id="tag-number"
                                        placeholder="e.g. A-123"
                                        value={tagNumber}
                                        onChange={(e) => setTagNumber(e.target.value)}
                                        autoFocus
                                    />
                                    <p className="text-xs text-muted-foreground">Assign a physical tag number to the baggage.</p>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="notes">Notes (Optional)</Label>
                                    <Input
                                        id="notes"
                                        placeholder="Add any internal notes..."
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                    />
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <Label>Luggage Photos</Label>
                                        <Button 
                                            type="button" 
                                            variant="outline" 
                                            size="sm" 
                                            onClick={() => setIsCameraOpen(true)}
                                            className="gap-2"
                                        >
                                            <Camera className="h-4 w-4" />
                                            Capture Photo
                                        </Button>
                                    </div>

                                    {capturedPhotos.length > 0 && (
                                        <div className="h-28 w-full rounded-md border p-2 overflow-x-auto">
                                            <div className="flex gap-2 min-w-max pb-2">
                                                {capturedPhotos.map((file, i) => (
                                                    <div key={i} className="relative group min-w-[80px] h-20">
                                                        <img 
                                                            src={URL.createObjectURL(file)} 
                                                            className="w-full h-full object-cover rounded-md border shadow-sm" 
                                                        />
                                                        <button 
                                                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                                            onClick={() => setCapturedPhotos(prev => prev.filter((_, idx) => idx !== i))}
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    <p className="text-xs text-muted-foreground">{capturedPhotos.length} photos added. (Unlimited)</p>
                                </div>

                                <div className="space-y-2">
                                    <Label>Payment Status</Label>
                                    <Select value={paymentStatus} onValueChange={setPaymentStatus}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Payment Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="pending">Pending</SelectItem>
                                            <SelectItem value="paid">Paid</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter className="sm:justify-between gap-2">
                    {/* Allow canceling or resetting if found */}
                    <div className="flex gap-2">
                        {foundBooking && (
                            <Button variant="outline" onClick={resetScanner}>
                                Scan Another
                            </Button>
                        )}
                        <Button variant="ghost" onClick={onClose}>
                            Cancel
                        </Button>
                    </div>

                    {foundBooking && (
                        <Button onClick={handleManualCheckIn} disabled={!tagNumber}>
                            Confirm Check-in
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>

            <CameraModal 
                isOpen={isCameraOpen}
                onClose={() => setIsCameraOpen(false)}
                onPhotosCaptured={(files) => {
                    setCapturedPhotos(prev => [...prev, ...files]);
                }}
            />
        </Dialog>
    );
}

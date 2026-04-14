import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot, Loader2, ImagePlus, RefreshCw, Download } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import QRCode from "react-qr-code";
import { Button } from '@/components/ui/button';

type Message = {
    id: string;
    text: string;
    sender: 'bot' | 'user';
    image?: string | null;
    isBookingSuccess?: boolean;
    bookingRef?: string;
};

const SUGGESTED_QUESTIONS = [
    "What are your storage rates?",
    "Where are you located?",
    "How do I book storage?",
];

export default function GuestChatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'welcome',
            text: "Hi there! 👋 I'm the Tarragon Assistant. I can help you with rates, booking, and analysis. Send me a photo or a text message!",
            sender: 'bot',
        },
    ]);
    const [inputValue, setInputValue] = useState('');
    const [pendingImage, setPendingImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    
    const [sessionId, setSessionId] = useState(() => {
        let sid = sessionStorage.getItem('chat_session_id');
        if (!sid) {
            sid = 'sess_' + Math.random().toString(36).substring(2, 15);
            sessionStorage.setItem('chat_session_id', sid);
        }
        return sid;
    });
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPendingImage(reader.result as string);
                // Optionally auto-focus input after attachment
            };
            reader.readAsDataURL(file);
        }
    };
    const cleanMessageText = (text: string) => {
        // Removes <BOOKING_TOOL>...</BOOKING_TOOL> OR <USED_TOOL>...</BOOKING_TOOL> and everything inside
        return text.replace(/<(BOOKING_TOOL|USED_TOOL)>[\s\S]*?(<\/BOOKING_TOOL>|$)/g, '').trim();
    };

    const executeBooking = async (jsonStr: string, botMessageId: string) => {
        try {
            // Strip markdown code blocks if the AI added them
            const sanitized = jsonStr.replace(/```json/g, '').replace(/```/g, '').trim();
            let bookingData = JSON.parse(sanitized);

            // AUTO-FIX: Basic date sanitization for lazy LLMs
            if (bookingData.drop_off_time && bookingData.drop_off_time.includes('TBA')) {
              bookingData.drop_off_time = bookingData.drop_off_time.replace(/\(.*\)/, '').trim() + " 12:00";
            }
            if (bookingData.pick_up_time === 'N/A' || !bookingData.pick_up_time) {
              // Default to +24 hours if missing
              const start = new Date(bookingData.drop_off_time);
              start.setDate(start.getDate() + 1);
              bookingData.pick_up_time = start.toISOString().slice(0, 16).replace('T', ' ');
            }

            console.log("Executing tool call with sanitization:", bookingData);

            const response = await fetch('/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bookingData)
            });

            const result = await response.json();
            if (result.success) {
                const ref = result.booking_reference;
                setMessages(prev => [...prev, {
                    id: 'booking_' + Date.now(),
                    sender: 'bot',
                    text: `✅ Booking Confirmed!\n\nReference: ${ref}\n\nYou can present this QR code at the facility for check-in:`,
                    isBookingSuccess: true,
                    bookingRef: ref
                }]);
            } else {
                setMessages(prev => [...prev, {
                    id: 'booking_err_' + Date.now(),
                    sender: 'bot',
                    text: "❌ " + (result.error || "Something went wrong with the booking.")
                }]);
            }
        } catch (e) {
            console.error("Booking Tool Error:", e);
        }
    };
    const downloadBookingPass = async (ref: string) => {
        const canvas = document.createElement('canvas');
        canvas.width = 400;
        canvas.height = 550;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Background
        ctx.fillStyle = '#f97316'; // Orange-500
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Header Text
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 28px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('TARRAGON MANILA', canvas.width / 2, 60);

        ctx.font = '16px sans-serif';
        ctx.fillText('Premium Luggage Storage', canvas.width / 2, 90);

        // White card body
        const padding = 30;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        // ctx.roundRect(padding, 120, canvas.width - (padding * 2), 380, 20); // Not all browsers support roundRect, use fallback
        
        const x = padding, y = 120, w = canvas.width - (padding * 2), h = 380, r = 20;
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + w, y, x + w, y + h, r);
        ctx.arcTo(x + w, y + h, x, y + h, r);
        ctx.arcTo(x, y + h, x, y, r);
        ctx.arcTo(x, y, x + w, y, r);
        ctx.closePath();
        ctx.fill();

        // Load QR Code
        try {
            const svgElement = document.getElementById(`qr-code-${ref}`);
            if (!svgElement) {
                console.error("QR Code SVG not found");
                return;
            }
            const svgData = new XMLSerializer().serializeToString(svgElement);
            const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
            const url = URL.createObjectURL(svgBlob);
            
            const img = new Image();
            img.onload = () => {
                ctx.drawImage(img, (canvas.width - 250) / 2, 160, 250, 250);

                // Ref text
                ctx.fillStyle = '#1f2937'; // gray-800
                ctx.font = 'bold 24px monospace';
                ctx.fillText(ref, canvas.width / 2, 450);

                ctx.fillStyle = '#9ca3af'; // gray-400
                ctx.font = '14px sans-serif';
                ctx.fillText('PRESENT THIS QR AT CHECK-IN', canvas.width / 2, 485);

                // Trigger Download
                const link = document.createElement('a');
                link.download = `Tarragon-Booking-${ref}.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();
                
                URL.revokeObjectURL(url);
            };
            img.src = url;
        } catch (e) {
            console.error("Failed to generate download pass", e);
        }
    };

    const handleSend = async (text: string = inputValue) => {
        if ((!text.trim() && !pendingImage) || isLoading) return;

        const currentImage = pendingImage;
        const msgText = text;

        const newUserMsg: Message = {
            id: Date.now().toString(),
            text: msgText,
            sender: 'user',
            image: currentImage,
        };

        setMessages((prev) => [...prev, newUserMsg]);
        setInputValue('');
        setPendingImage(null);
        setIsLoading(true);

        const botMessageId = (Date.now() + 1).toString();
        setMessages((prev) => [
            ...prev,
            {
                id: botMessageId,
                text: '',
                sender: 'bot',
            }
        ]);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    message: msgText || "Attached an image.",
                    session_id: sessionId,
                    image: currentImage
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to reach server');
            }

            const reader = response.body?.getReader();
            const decoder = new TextDecoder('utf-8');
            let buffer = '';

            if (reader) {
                setIsLoading(false); 
                let fullText = '';
                let toolBuffer = '';
                let isCapturingTool = false;

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    buffer += decoder.decode(value, { stream: true });
                    const lines = buffer.split('\n\n');
                    buffer = lines.pop() || '';

                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            try {
                                const json = JSON.parse(line.substring(6));
                                if (json.text) {
                                    fullText += json.text;
                                    
                                    // Tool capture logic
                                    if (fullText.includes('<BOOKING_TOOL>')) {
                                      isCapturingTool = true;
                                      const parts = fullText.split('<BOOKING_TOOL>');
                                      if (parts[1] && parts[1].includes('</BOOKING_TOOL>')) {
                                         const toolContent = parts[1].split('</BOOKING_TOOL>')[0];
                                         executeBooking(toolContent, botMessageId);
                                         // Mark as used to prevent double trigger
                                         fullText = fullText.replace('<BOOKING_TOOL>', '<USED_TOOL>');
                                         isCapturingTool = false;
                                      }
                                    }

                                    setMessages((prev) => 
                                        prev.map((msg) => 
                                            msg.id === botMessageId 
                                                ? { ...msg, text: cleanMessageText(fullText) } 
                                                : msg
                                        )
                                    );
                                }
                            } catch (e) {
                                console.error("Parse error on stream chunk:", line);
                            }
                        }
                    }
                }
            }
        } catch (error: any) {
            console.error('Chat error:', error);
            setMessages((prev) => 
                prev.map((msg) => 
                    msg.id === botMessageId 
                        ? { ...msg, text: msg.text + (msg.text ? " [Error completing response]" : "I'm sorry, I couldn't reach the AI right now.") } 
                        : msg
                )
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="bg-white border text-gray-900 border-gray-200 shadow-2xl rounded-2xl w-[320px] sm:w-[380px] h-[550px] flex flex-col overflow-hidden mb-4"
                    >
                        {/* Header */}
                        <div className="bg-orange-500 text-white p-4 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="bg-white/20 p-1.5 rounded-lg">
                                    <Bot className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm">Tarragon Assistant</h3>
                                    <p className="text-xs text-orange-100 flex items-center gap-1">
                                        <span className="w-2 h-2 rounded-full bg-green-400 inline-block"></span>
                                        Online
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <button 
                                    onClick={() => {
                                        const newSid = 'sess_' + Math.random().toString(36).substring(2, 15);
                                        sessionStorage.setItem('chat_session_id', newSid);
                                        setSessionId(newSid);
                                        setMessages([{ id: 'welcome', text: "Hi there! 👋 I'm the Tarragon Assistant. I can help you with rates, booking, and analysis. Send me a photo or a text message!", sender: 'bot' }]);
                                    }}
                                    className="text-white hover:bg-white/20 p-1.5 rounded-lg transition-colors"
                                    title="Start New Conversation"
                                >
                                    <RefreshCw className="w-5 h-5" />
                                </button>
                                <button 
                                    onClick={() => setIsOpen(false)}
                                    className="text-white hover:bg-white/20 p-1.5 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 p-4 overflow-y-auto bg-gray-50 flex flex-col gap-4">
                            {messages.map((msg) => (
                                <div 
                                    key={msg.id} 
                                    className={`flex max-w-[85%] ${msg.sender === 'user' ? 'self-end' : 'self-start'}`}
                                >
                                    <div className="flex gap-2 items-end w-full">
                                        {msg.sender === 'bot' && (
                                            <div className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center shrink-0 mb-1">
                                                <Bot className="w-3.5 h-3.5" />
                                            </div>
                                        )}
                                        <div 
                                            className={`p-3 rounded-2xl text-sm break-words whitespace-pre-wrap ${
                                                msg.sender === 'user' 
                                                    ? 'bg-orange-500 text-white rounded-br-none' 
                                                    : 'bg-white border border-gray-100 shadow-sm text-gray-800 rounded-bl-none'
                                            }`}
                                        >
                                            {msg.image && (
                                                <img 
                                                    src={msg.image} 
                                                    alt="Attached" 
                                                    className="max-w-full rounded-lg mb-2 border border-white/20 max-h-48 object-cover" 
                                                />
                                            )}
                                            {msg.text}
                                            {msg.isBookingSuccess && msg.bookingRef && (
                                                <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-100 flex flex-col items-center">
                                                    <div className="w-32 h-32 mb-2 bg-white flex items-center justify-center rounded-lg border border-gray-200">
                                                        <QRCode 
                                                            id={`qr-code-${msg.bookingRef}`}
                                                            value={msg.bookingRef}
                                                            size={112}
                                                            style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                                                        />
                                                    </div>
                                                    <span className="text-[10px] font-mono text-gray-400 bg-white px-2 py-0.5 rounded border border-gray-100">
                                                        {msg.bookingRef}
                                                    </span>
                                                    <Button 
                                                        variant="outline" 
                                                        size="sm" 
                                                        className="mt-3 w-full border-orange-200 text-orange-600 hover:bg-orange-50 gap-2 rounded-xl"
                                                        onClick={() => downloadBookingPass(msg.bookingRef!)}
                                                    >
                                                        <Download className="w-4 h-4" />
                                                        Download Pass
                                                    </Button>
                                                </div>
                                            )}
                                            {msg.sender === 'bot' && !msg.text && isLoading && (
                                              <span className="inline-flex gap-1 items-center h-4">
                                                  <span className="w-1.5 h-1.5 rounded-full bg-gray-300 animate-bounce"></span>
                                                  <span className="w-1.5 h-1.5 rounded-full bg-gray-300 animate-bounce delay-100"></span>
                                                  <span className="w-1.5 h-1.5 rounded-full bg-gray-300 animate-bounce delay-200"></span>
                                              </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {messages.length === 1 && (
                                <div className="flex flex-col gap-2 mt-2">
                                    <p className="text-xs text-gray-500 font-medium px-2">Suggested questions:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {SUGGESTED_QUESTIONS.map((q, i) => (
                                            <button
                                                key={i}
                                                disabled={isLoading}
                                                onClick={() => handleSend(q)}
                                                className="text-left text-xs bg-white border border-orange-100 text-orange-600 hover:bg-orange-50 disabled:opacity-50 px-3 py-2 rounded-xl transition-colors shadow-sm"
                                            >
                                                {q}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-3 bg-white border-t border-gray-100 flex flex-col gap-2">
                            {pendingImage && (
                                <div className="relative inline-block self-start">
                                    <img src={pendingImage} alt="Preview" className="h-16 rounded-md shadow-sm border border-orange-200" />
                                    <button 
                                        type="button"
                                        onClick={(e) => { e.preventDefault(); setPendingImage(null); }} 
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 shadow-sm"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            )}

                            <form 
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    handleSend();
                                }}
                                className="flex items-end gap-2 min-w-0"
                            >
                                <input 
                                    type="file"
                                    accept="image/*"
                                    capture="environment" // Suggests back-camera if available on mobile
                                    className="hidden"
                                    ref={fileInputRef}
                                    onChange={handleImageUpload}
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="rounded-full shrink-0 text-gray-500 border-gray-200"
                                >
                                    <ImagePlus className="w-4 h-4" />
                                </Button>
                                <textarea
                                    rows={1}
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSend();
                                        }
                                    }}
                                    placeholder="Type your message..."
                                    disabled={isLoading}
                                    className="flex-1 min-w-0 resize-none overflow-y-auto rounded-3xl bg-gray-50 border border-gray-200 px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:outline-none focus:ring-1 focus:ring-orange-500 leading-relaxed"
                                    style={{ maxHeight: '120px' }}
                                />
                                <Button 
                                    type="submit" 
                                    size="icon"
                                    disabled={(!inputValue.trim() && !pendingImage) || isLoading}
                                    className="rounded-full bg-orange-500 hover:bg-orange-600 text-white shadow-sm shrink-0 self-end"
                                >
                                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                </Button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className="w-14 h-14 bg-orange-500 hover:bg-orange-600 text-white rounded-full shadow-lg flex items-center justify-center transition-colors shadow-orange-200 border-2 border-white"
            >
                {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
            </motion.button>
        </div>
    );
}

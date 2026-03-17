import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type Message = {
    id: string;
    text: string;
    sender: 'bot' | 'user';
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
            text: "Hi there! 👋 I'm the Tarragon Assistant. How can I help you today?",
            sender: 'bot',
        },
    ]);
    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = (text: string = inputValue) => {
        if (!text.trim()) return;

        const newUserMsg: Message = {
            id: Date.now().toString(),
            text,
            sender: 'user',
        };

        setMessages((prev) => [...prev, newUserMsg]);
        setInputValue('');

        // Simple bot response logic
        setTimeout(() => {
            let botReply = "Thanks for your message! Our team will get back to you soon. Please check our FAQ on the Pricing page for immediate answers.";
            
            const lowerText = text.toLowerCase();
            if (lowerText.includes('rate') || lowerText.includes('price') || lowerText.includes('cost')) {
                botReply = "Our rates start at $2.00/hour or $5.00/day per bag. You can find full details on our Pricing page!";
            } else if (lowerText.includes('locate') || lowerText.includes('where')) {
                botReply = "We are located at Tarragon Corner, just minutes away from NAIA Terminal 3 in Pasay City. You can easily walk from the Runway Manila footbridge!";
            } else if (lowerText.includes('book') || lowerText.includes('reserve')) {
                botReply = "You can book directly by clicking the 'Book Storage Now' button on our pages. It takes less than 2 minutes and guarantees your spot!";
            } else if (lowerText.includes('hi') || lowerText.includes('hello')) {
                botReply = "Hello! Let me know if you have any questions about storing your luggage with us.";
            }

            setMessages((prev) => [
                ...prev,
                {
                    id: (Date.now() + 1).toString(),
                    text: botReply,
                    sender: 'bot',
                }
            ]);
        }, 600);
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
                        className="bg-white border text-gray-900 border-gray-200 shadow-2xl rounded-2xl w-[320px] sm:w-[380px] h-[450px] flex flex-col overflow-hidden mb-4"
                    >
                        {/* Header */}
                        <div className="bg-blue-600 text-white p-4 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="bg-white/20 p-1.5 rounded-lg">
                                    <Bot className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm">Tarragon Assistant</h3>
                                    <p className="text-xs text-blue-100 flex items-center gap-1">
                                        <span className="w-2 h-2 rounded-full bg-green-400 inline-block"></span>
                                        Online
                                    </p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setIsOpen(false)}
                                className="text-white hover:bg-white/20 p-1.5 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 p-4 overflow-y-auto bg-gray-50 flex flex-col gap-4">
                            {messages.map((msg) => (
                                <div 
                                    key={msg.id} 
                                    className={`flex max-w-[85%] ${msg.sender === 'user' ? 'self-end' : 'self-start'}`}
                                >
                                    <div className="flex gap-2 items-end">
                                        {msg.sender === 'bot' && (
                                            <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 mb-1">
                                                <Bot className="w-3.5 h-3.5" />
                                            </div>
                                        )}
                                        <div 
                                            className={`p-3 rounded-2xl text-sm ${
                                                msg.sender === 'user' 
                                                    ? 'bg-blue-600 text-white rounded-br-none' 
                                                    : 'bg-white border border-gray-100 shadow-sm text-gray-800 rounded-bl-none'
                                            }`}
                                        >
                                            {msg.text}
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
                                                onClick={() => handleSend(q)}
                                                className="text-left text-xs bg-white border border-blue-100 text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-xl transition-colors shadow-sm"
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
                        <div className="p-3 bg-white border-t border-gray-100">
                            <form 
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    handleSend();
                                }}
                                className="flex gap-2"
                            >
                                <Input
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    placeholder="Type your message..."
                                    className="border-gray-200 rounded-full bg-gray-50 focus-visible:ring-blue-500"
                                />
                                <Button 
                                    type="submit" 
                                    size="icon"
                                    disabled={!inputValue.trim()}
                                    className="rounded-full bg-blue-600 hover:bg-blue-700 shrink-0"
                                >
                                    <Send className="w-4 h-4" />
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
                className="w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-colors shadow-blue-200 border-2 border-white"
            >
                {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
            </motion.button>
        </div>
    );
}

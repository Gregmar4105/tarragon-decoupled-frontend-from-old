import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot, User, Loader2 } from 'lucide-react';
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
    const [isLoading, setIsLoading] = useState(false);
    const [loadingSeconds, setLoadingSeconds] = useState(0);
    const loadingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const [sessionId] = useState(() => {
        let sid = sessionStorage.getItem('chat_session_id');
        if (!sid) {
            sid = 'sess_' + Math.random().toString(36).substring(2, 15);
            sessionStorage.setItem('chat_session_id', sid);
        }
        return sid;
    });
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = async (text: string = inputValue) => {
        if (!text.trim() || isLoading) return;

        const newUserMsg: Message = {
            id: Date.now().toString(),
            text,
            sender: 'user',
        };

        setMessages((prev) => [...prev, newUserMsg]);
        setInputValue('');
        setIsLoading(true);
        setLoadingSeconds(0);
        loadingIntervalRef.current = setInterval(() => {
            setLoadingSeconds((s) => s + 1);
        }, 1000);

        // Allow up to 120 seconds for the AI agent (n8n booking flows can take 60-90s).
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 120000);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    message: text,
                    session_id: sessionId
                }),
                signal: controller.signal,
            });
            clearTimeout(timeoutId);

            let data;
            try {
                data = await response.json();
            } catch (e) {
                throw new Error('Failed to parse server response');
            }

            if (!response.ok) {
                const errorReply = data?.reply || data?.message || 'Network response was not ok';
                throw new Error(errorReply);
            }

            const botReply = data?.reply || 'I received your message!';

            setMessages((prev) => [
                ...prev,
                {
                    id: (Date.now() + 1).toString(),
                    text: botReply,
                    sender: 'bot',
                }
            ]);
        } catch (error: any) {
            clearTimeout(timeoutId);
            console.error('Chat error:', error);
            const isAborted = error.name === 'AbortError';
            setMessages((prev) => [
                ...prev,
                {
                    id: (Date.now() + 1).toString(),
                    text: isAborted
                        ? "⏱️ The AI took too long to respond. This can happen with complex booking requests. Please try again."
                        : (error.message || "I'm sorry, I'm having trouble connecting right now. Please try again later."),
                    sender: 'bot',
                }
            ]);
        } finally {
            setIsLoading(false);
            setLoadingSeconds(0);
            if (loadingIntervalRef.current) {
                clearInterval(loadingIntervalRef.current);
                loadingIntervalRef.current = null;
            }
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
                        className="bg-white border text-gray-900 border-gray-200 shadow-2xl rounded-2xl w-[320px] sm:w-[380px] h-[450px] flex flex-col overflow-hidden mb-4"
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
                                            <div className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center shrink-0 mb-1">
                                                <Bot className="w-3.5 h-3.5" />
                                            </div>
                                        )}
                                        <div 
                                            className={`p-3 rounded-2xl text-sm ${
                                                msg.sender === 'user' 
                                                    ? 'bg-orange-500 text-white rounded-br-none' 
                                                    : 'bg-white border border-gray-100 shadow-sm text-gray-800 rounded-bl-none'
                                            }`}
                                        >
                                            {msg.text}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex max-w-[85%] self-start">
                                    <div className="flex gap-2 items-end">
                                        <div className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center shrink-0 mb-1">
                                            <Bot className="w-3.5 h-3.5" />
                                        </div>
                                        <div className="p-3 rounded-2xl text-sm bg-white border border-gray-100 shadow-sm text-gray-800 rounded-bl-none flex flex-col gap-1.5">
                                            <div className="flex gap-1">
                                                <span className="w-2 h-2 rounded-full bg-gray-300 animate-bounce delay-100"></span>
                                                <span className="w-2 h-2 rounded-full bg-gray-300 animate-bounce delay-200"></span>
                                                <span className="w-2 h-2 rounded-full bg-gray-300 animate-bounce delay-300"></span>
                                            </div>
                                            {loadingSeconds >= 8 && (
                                                <p className="text-xs text-gray-400">
                                                    {loadingSeconds >= 30
                                                        ? `⏳ Still processing… (${loadingSeconds}s)`
                                                        : 'AI agent is thinking…'}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
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
                                    className="border-gray-200 rounded-full bg-gray-50 focus-visible:ring-orange-500"
                                />
                                <Button 
                                    type="submit" 
                                    size="icon"
                                    disabled={!inputValue.trim() || isLoading}
                                    className="rounded-full bg-orange-500 hover:bg-orange-600 text-white shadow-sm shrink-0"
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

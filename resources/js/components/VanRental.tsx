import { motion } from 'framer-motion';
import { Truck } from 'lucide-react';

export default function VanRental() {
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
                            <Truck className="w-4 h-4" />
                            Premium Transport
                        </div>
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
                            Tarragon Manila <br className="hidden sm:block" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">Van Rental</span>
                        </h2>
                        <p className="text-base sm:text-lg text-gray-400 max-w-lg mx-auto lg:mx-0 leading-relaxed">
                            Safe and reliable van rental services for airport transfers, city tours, and point-to-point transportation.
                        </p>
                    </div>

                    {/* Image Interface */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="relative mx-auto w-full max-w-2xl"
                    >
                        <div className="relative aspect-[16/10] bg-gray-800 rounded-3xl overflow-hidden border-4 border-gray-700 shadow-2xl">
                            <img 
                                src="/images/van-rental.jpg" 
                                alt="Tarragon Manila Van Rental Service"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.currentTarget.src = 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=1000'; // Fallback if image not found
                                }}
                            />
                            {/* Overlay tag */}
                            <div className="absolute bottom-6 right-6 bg-orange-500 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-lg border border-orange-400/50 backdrop-blur-sm">
                                Book Now
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}

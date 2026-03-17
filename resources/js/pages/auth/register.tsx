import { Form, Head, Link } from '@inertiajs/react';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { login } from '@/routes';
import { store } from '@/routes/register';

export default function Register() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-yellow-400 via-orange-400 to-orange-500 p-4 dark:bg-zinc-950">
            <Head title="Register" />

            {/* Logo */}
            <div className="flex flex-col items-center mb-8">
                <div className="bg-white p-3 rounded-xl mb-3 shadow-lg shadow-black/5">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-6 h-6 text-orange-500 dark:text-orange-400"
                    >
                        <path d="M6 20h0a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h0" />
                        <path d="M8 18V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v14" />
                    </svg>
                </div>
                <h1 className="text-xl font-bold text-white tracking-wide dark:text-white">Tarragon Manila</h1>
                <p className="text-xs text-orange-100 uppercase tracking-widest mt-1 dark:text-gray-400">Luggage Storage Rentals</p>
            </div>

            {/* Card */}
            <div className="w-full max-w-[400px] bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-8 dark:bg-zinc-900 dark:border-zinc-800">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Create Account</h2>
                    <p className="text-gray-500 mt-2 text-sm dark:text-gray-400">Join us today</p>
                </div>

                <Form
                    {...store.form()}
                    resetOnSuccess={['password', 'password_confirmation']}
                    disableWhileProcessing
                    className="flex flex-col gap-5"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="text-gray-600 font-medium text-sm dark:text-gray-300">Full Name</Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                                        <Input
                                            id="name"
                                            type="text"
                                            name="name"
                                            required
                                            autoFocus
                                            autoComplete="name"
                                            placeholder="Enter your full name"
                                            className="pl-10 h-11 border-gray-200 bg-gray-50/50 rounded-lg focus:bg-white transition-colors dark:bg-zinc-800 dark:border-zinc-700 dark:text-white dark:focus:bg-zinc-800"
                                        />
                                    </div>
                                    <InputError message={errors.name} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-gray-600 font-medium text-sm dark:text-gray-300">Email Address</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                                        <Input
                                            id="email"
                                            type="email"
                                            name="email"
                                            required
                                            autoComplete="email"
                                            placeholder="Enter your email"
                                            className="pl-10 h-11 border-gray-200 bg-gray-50/50 rounded-lg focus:bg-white transition-colors dark:bg-zinc-800 dark:border-zinc-700 dark:text-white dark:focus:bg-zinc-800"
                                        />
                                    </div>
                                    <InputError message={errors.email} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password" className="text-gray-600 font-medium text-sm dark:text-gray-300">Password</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                                        <Input
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            required
                                            autoComplete="new-password"
                                            placeholder="Create a password"
                                            className="pl-10 pr-10 h-11 border-gray-200 bg-gray-50/50 rounded-lg focus:bg-white transition-colors dark:bg-zinc-800 dark:border-zinc-700 dark:text-white dark:focus:bg-zinc-800"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                        >
                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                    <InputError message={errors.password} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password_confirmation" className="text-gray-600 font-medium text-sm dark:text-gray-300">Confirm Password</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                                        <Input
                                            id="password_confirmation"
                                            type={showConfirmPassword ? "text" : "password"}
                                            name="password_confirmation"
                                            required
                                            autoComplete="new-password"
                                            placeholder="Confirm your password"
                                            className="pl-10 pr-10 h-11 border-gray-200 bg-gray-50/50 rounded-lg focus:bg-white transition-colors dark:bg-zinc-800 dark:border-zinc-700 dark:text-white dark:focus:bg-zinc-800"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                        >
                                            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                    <InputError message={errors.password_confirmation} />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-11 bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white rounded-lg font-semibold text-base shadow-lg shadow-orange-500/20 transition-all hover:scale-[1.02] dark:bg-orange-600 dark:hover:bg-orange-700"
                                disabled={processing}
                            >
                                {processing && <Spinner className="mr-2" />}
                                Create Account
                            </Button>

                            <div className="relative my-2">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t border-gray-100 dark:border-zinc-800" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-white px-2 text-gray-400 dark:bg-zinc-900 dark:text-gray-500">or</span>
                                </div>
                            </div>

                            <div className="text-center text-sm">
                                <span className="text-gray-500 dark:text-gray-400">Already have an account? </span>
                                <Link href={login()} className="text-orange-600 hover:text-orange-700 font-medium dark:text-orange-500 dark:hover:text-orange-400">
                                    Sign in
                                </Link>
                            </div>
                        </>
                    )}
                </Form>
            </div>
        </div>
    );
}

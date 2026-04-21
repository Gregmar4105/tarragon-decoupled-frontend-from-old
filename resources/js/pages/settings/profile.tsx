import { Transition } from '@headlessui/react';
import { Form, Head, Link, usePage } from '@inertiajs/react';
import { Bell, Fingerprint, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import DeleteUser from '@/components/delete-user';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { edit } from '@/routes/profile';
import { send } from '@/routes/verification';
import type { BreadcrumbItem, SharedData } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Profile settings',
        href: edit().url,
    },
];

/**
 * Get the CSRF token from the meta tag or cookie.
 * Required for POST requests to web routes.
 */
function getCsrfToken(): string {
    // Try meta tag first (set by Inertia/Blade)
    const metaTag = document.querySelector('meta[name="csrf-token"]');
    if (metaTag) return metaTag.getAttribute('content') || '';

    // Fallback: read from XSRF-TOKEN cookie (Laravel encrypts this but accepts X-XSRF-TOKEN header)
    const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
    if (match) return decodeURIComponent(match[1]);

    return '';
}

export default function Profile({
    mustVerifyEmail,
    status,
}: {
    mustVerifyEmail: boolean;
    status?: string;
}) {
    const { auth } = usePage<SharedData>().props;

    // ─────────────────────────────────────────
    //  Mobile settings state
    // ─────────────────────────────────────────
    const [biometricEnabled, setBiometricEnabled] = useState(false);
    const [biometricLoading, setBiometricLoading] = useState(false);
    const [notifsEnabled, setNotifsEnabled] = useState(!!auth.user.fcm_token);
    const [notifLoading, setNotifLoading] = useState(false);
    const [mobileMessage, setMobileMessage] = useState<{ text: string; success: boolean } | null>(null);

    // Check biometric status on mount
    useEffect(() => {
        fetch('/native/check-biometrics')
            .then(res => res.json())
            .then(data => setBiometricEnabled(data.available))
            .catch(() => { /* Not in native context */ });
    }, []);

    // Listen for asynchronous native events (like push token generation)
    useEffect(() => {
        const handleNativeEvent = (e: any) => {
            const eventName = e.detail?.event || '';
            if (eventName.includes('TokenGenerated')) {
                setNotifsEnabled(true);
                setMobileMessage({ text: 'Push notifications successfully activated!', success: true });
                setNotifLoading(false);
            }
        };
        document.addEventListener('native-event', handleNativeEvent);
        return () => document.removeEventListener('native-event', handleNativeEvent);
    }, []);

    // Auto-dismiss mobile messages
    useEffect(() => {
        if (mobileMessage) {
            const timer = setTimeout(() => setMobileMessage(null), 4000);
            return () => clearTimeout(timer);
        }
    }, [mobileMessage]);

    const handleEnrollNotifications = async () => {
        setNotifLoading(true);
        try {
            const res = await fetch('/native/enroll-notifications', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-XSRF-TOKEN': getCsrfToken(),
                    'Accept': 'application/json',
                },
                credentials: 'same-origin',
            });
            const data = await res.json();
            if (res.ok) {
                setMobileMessage({ text: data.message || 'Notifications enrolled!', success: true });
                // We keep notifLoading = true until the native-event fires
            } else {
                setMobileMessage({ text: data.message || 'Failed to enroll.', success: false });
                setNotifLoading(false);
            }
        } catch {
            setMobileMessage({ text: 'Failed to enroll notifications.', success: false });
            setNotifLoading(false);
        }
    };

    const handleSetupBiometrics = async () => {
        const password = prompt('Confirm your password to enable fingerprint login:');
        if (!password) return;

        setBiometricLoading(true);
        try {
            const res = await fetch('/native/setup-biometrics', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-XSRF-TOKEN': getCsrfToken(),
                    'Accept': 'application/json',
                },
                credentials: 'same-origin',
                body: JSON.stringify({ password }),
            });
            const data = await res.json();
            if (res.ok && data.success) {
                setMobileMessage({ text: data.message, success: true });
                setBiometricEnabled(true);
            } else {
                setMobileMessage({ text: data.message || 'Biometric setup failed.', success: false });
            }
        } catch {
            setMobileMessage({ text: 'Failed to setup biometrics.', success: false });
        } finally {
            setBiometricLoading(false);
        }
    };

    const handleDisableBiometrics = async () => {
        setBiometricLoading(true);
        try {
            const res = await fetch('/native/disable-biometrics', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-XSRF-TOKEN': getCsrfToken(),
                    'Accept': 'application/json',
                },
                credentials: 'same-origin',
            });
            const data = await res.json();
            if (res.ok && data.success) {
                setMobileMessage({ text: data.message, success: true });
                setBiometricEnabled(false);
            } else {
                setMobileMessage({ text: data.message || 'Failed to disable biometrics.', success: false });
            }
        } catch {
            setMobileMessage({ text: 'Failed to disable biometrics.', success: false });
        } finally {
            setBiometricLoading(false);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Profile settings" />

            <h1 className="sr-only">Profile Settings</h1>

            <SettingsLayout>
                <div className="space-y-6">
                    <Heading
                        variant="small"
                        title="Profile information"
                        description="Update your name and email address"
                    />

                    <Form
                        {...ProfileController.update.form()}
                        options={{
                            preserveScroll: true,
                        }}
                        className="space-y-6"
                    >
                        {({ processing, recentlySuccessful, errors }) => (
                            <>
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Name</Label>

                                    <Input
                                        id="name"
                                        className="mt-1 block w-full"
                                        defaultValue={auth.user.name}
                                        name="name"
                                        required
                                        autoComplete="name"
                                        placeholder="Full name"
                                    />

                                    <InputError
                                        className="mt-2"
                                        message={errors.name}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email address</Label>

                                    <Input
                                        id="email"
                                        type="email"
                                        className="mt-1 block w-full"
                                        defaultValue={auth.user.email}
                                        name="email"
                                        required
                                        autoComplete="username"
                                        placeholder="Email address"
                                    />

                                    <InputError
                                        className="mt-2"
                                        message={errors.email}
                                    />
                                </div>

                                {mustVerifyEmail &&
                                    auth.user.email_verified_at === null && (
                                        <div>
                                            <p className="-mt-4 text-sm text-muted-foreground">
                                                Your email address is
                                                unverified.{' '}
                                                <Link
                                                    href={send()}
                                                    as="button"
                                                    className="text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-neutral-500"
                                                >
                                                    Click here to resend the
                                                    verification email.
                                                </Link>
                                            </p>

                                            {status ===
                                                'verification-link-sent' && (
                                                <div className="mt-2 text-sm font-medium text-green-600">
                                                    A new verification link has
                                                    been sent to your email
                                                    address.
                                                </div>
                                            )}
                                        </div>
                                    )}

                                <div className="flex items-center gap-4">
                                    <Button
                                        disabled={processing}
                                        data-test="update-profile-button"
                                    >
                                        Save
                                    </Button>

                                    <Transition
                                        show={recentlySuccessful}
                                        enter="transition ease-in-out"
                                        enterFrom="opacity-0"
                                        leave="transition ease-in-out"
                                        leaveTo="opacity-0"
                                    >
                                        <p className="text-sm text-neutral-600">
                                            Saved
                                        </p>
                                    </Transition>
                                </div>
                            </>
                        )}
                    </Form>

                    {/* ──────────────────────────────────── */}
                    {/*  Mobile App Settings                */}
                    {/* ──────────────────────────────────── */}
                    <div className="pt-6 border-t">
                        <Heading
                            variant="small"
                            title="Mobile App Settings"
                            description="Configure native mobile features for this device"
                        />

                        {/* Status message */}
                        {mobileMessage && (
                            <div className={`mt-4 flex items-center gap-2 p-3 rounded-lg text-sm font-medium ${
                                mobileMessage.success
                                    ? 'bg-green-50 text-green-700 border border-green-200'
                                    : 'bg-red-50 text-red-700 border border-red-200'
                            }`}>
                                {mobileMessage.success
                                    ? <CheckCircle2 className="h-4 w-4 shrink-0" />
                                    : <XCircle className="h-4 w-4 shrink-0" />
                                }
                                {mobileMessage.text}
                            </div>
                        )}

                        <div className="mt-4 space-y-4">
                            {/* Push Notifications */}
                            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-full ${notifsEnabled ? 'bg-green-100 text-green-600' : 'bg-primary/10 text-primary'}`}>
                                        <Bell className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="font-medium">Push Notifications</p>
                                        <p className="text-sm text-muted-foreground">
                                            {notifsEnabled 
                                                ? 'Push notifications are active on this device' 
                                                : 'Receive updates about your bookings'}
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    variant="outline"
                                    disabled={notifLoading || notifsEnabled}
                                    onClick={handleEnrollNotifications}
                                    className={notifsEnabled ? 'text-green-600 border-green-200 bg-green-50' : ''}
                                >
                                    {notifLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {notifsEnabled ? 'Enabled' : 'Enable'}
                                </Button>
                            </div>

                            {/* Biometric Login */}
                            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-full ${biometricEnabled ? 'bg-green-100 text-green-600' : 'bg-primary/10 text-primary'}`}>
                                        <Fingerprint className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="font-medium">Fingerprint Login</p>
                                        <p className="text-sm text-muted-foreground">
                                            {biometricEnabled
                                                ? 'Fingerprint login is active on this device'
                                                : 'Login quickly using your fingerprint'}
                                        </p>
                                    </div>
                                </div>
                                {biometricEnabled ? (
                                    <Button
                                        variant="outline"
                                        disabled={biometricLoading}
                                        onClick={handleDisableBiometrics}
                                        className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                                    >
                                        {biometricLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Disable
                                    </Button>
                                ) : (
                                    <Button
                                        variant="outline"
                                        disabled={biometricLoading}
                                        onClick={handleSetupBiometrics}
                                    >
                                        {biometricLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Setup
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <DeleteUser />
            </SettingsLayout>
        </AppLayout>
    );
}

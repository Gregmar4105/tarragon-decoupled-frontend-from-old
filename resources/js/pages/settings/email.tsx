import { Transition } from '@headlessui/react';
import { Head, useForm } from '@inertiajs/react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import type { BreadcrumbItem } from '@/types';
import { FormEventHandler, useState } from 'react';
import axios from 'axios';
import { Loader2 } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Email settings',
        href: '/settings/email',
    },
];

interface EmailSettingsProps {
    settings: {
        mail_host: string;
        mail_port: string;
        mail_username: string;
        mail_password: string;
        mail_encryption: string;
        mail_from_address: string;
        mail_from_name: string;
    };
    status?: string;
}

export default function EmailSettings({ settings, status }: EmailSettingsProps) {
    const [isTesting, setIsTesting] = useState(false);
    const [testResult, setTestResult] = useState<{success: boolean; message: string} | null>(null);

    const { data, setData, patch, processing, errors, recentlySuccessful } = useForm({
        mail_host: settings.mail_host || '',
        mail_port: settings.mail_port || '',
        mail_username: settings.mail_username || '',
        mail_password: settings.mail_password || '',
        mail_encryption: settings.mail_encryption || '',
        mail_from_address: settings.mail_from_address || '',
        mail_from_name: settings.mail_from_name || '',
    });

    const triggerTestEmail = async () => {
        setIsTesting(true);
        setTestResult(null);

        try {
            const response = await axios.post('/settings/email/test', data);
            setTestResult({ success: true, message: response.data.message });
        } catch (error: any) {
            setTestResult({ 
                success: false, 
                message: error.response?.data?.error || 'Failed to send test email.' 
            });
        } finally {
            setIsTesting(false);
        }
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        patch('/settings/email', {
            preserveScroll: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Email settings" />

            <h1 className="sr-only">Email Settings</h1>

            <SettingsLayout>
                <div className="space-y-6">
                    <Heading
                        variant="small"
                        title="Email Server Configuration"
                        description="Configure your SMTP settings for sending QR codes and notifications."
                    />

                    <form onSubmit={submit} className="space-y-6">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="grid gap-2">
                                <Label htmlFor="mail_host">SMTP Host</Label>
                                <Input
                                    id="mail_host"
                                    value={data.mail_host}
                                    onChange={(e) => setData('mail_host', e.target.value)}
                                    placeholder="smtp.mailtrap.io"
                                />
                                <InputError className="mt-2" message={errors.mail_host} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="mail_port">SMTP Port</Label>
                                <Input
                                    id="mail_port"
                                    value={data.mail_port}
                                    onChange={(e) => setData('mail_port', e.target.value)}
                                    placeholder="2525"
                                />
                                <InputError className="mt-2" message={errors.mail_port} />
                            </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="grid gap-2">
                                <Label htmlFor="mail_username">Username</Label>
                                <Input
                                    id="mail_username"
                                    value={data.mail_username}
                                    onChange={(e) => setData('mail_username', e.target.value)}
                                    placeholder="your-username"
                                />
                                <InputError className="mt-2" message={errors.mail_username} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="mail_password">Password</Label>
                                <Input
                                    id="mail_password"
                                    type="password"
                                    value={data.mail_password}
                                    onChange={(e) => setData('mail_password', e.target.value)}
                                    placeholder="••••••••"
                                />
                                <InputError className="mt-2" message={errors.mail_password} />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="mail_encryption">Encryption</Label>
                            <select 
                                id="mail_encryption"
                                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={data.mail_encryption}
                                onChange={(e) => setData('mail_encryption', e.target.value)}
                            >
                                <option value="">None</option>
                                <option value="tls">TLS</option>
                                <option value="ssl">SSL</option>
                            </select>
                            <InputError className="mt-2" message={errors.mail_encryption} />
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="grid gap-2">
                                <Label htmlFor="mail_from_address">From Address</Label>
                                <Input
                                    id="mail_from_address"
                                    type="email"
                                    value={data.mail_from_address}
                                    onChange={(e) => setData('mail_from_address', e.target.value)}
                                    placeholder="no-reply@example.com"
                                />
                                <InputError className="mt-2" message={errors.mail_from_address} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="mail_from_name">From Name</Label>
                                <Input
                                    id="mail_from_name"
                                    value={data.mail_from_name}
                                    onChange={(e) => setData('mail_from_name', e.target.value)}
                                    placeholder="Tarragon App"
                                />
                                <InputError className="mt-2" message={errors.mail_from_name} />
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-4">
                            <div className="flex items-center gap-4">
                                <Button disabled={processing}>Save Settings</Button>

                                <Transition
                                    show={recentlySuccessful || status === 'settings-updated'}
                                    enter="transition ease-in-out"
                                    enterFrom="opacity-0"
                                    leave="transition ease-in-out"
                                    leaveTo="opacity-0"
                                >
                                    <p className="text-sm text-neutral-600">Saved</p>
                                </Transition>
                            </div>

                            <div className="flex-1 sm:text-right">
                                <Button 
                                    type="button" 
                                    variant="secondary" 
                                    onClick={triggerTestEmail}
                                    disabled={isTesting}
                                >
                                    {isTesting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Send Test Email
                                </Button>
                            </div>
                        </div>

                        {testResult && (
                            <p className={`text-sm mt-2 ${testResult.success ? 'text-green-600' : 'text-red-500'}`}>
                                {testResult.message}
                            </p>
                        )}
                    </form>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}

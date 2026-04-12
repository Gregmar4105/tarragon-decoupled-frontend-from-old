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
        title: 'AI Assistant settings',
        href: '/settings/ai-assistant',
    },
];

interface AIAssistantProps {
    settings: {
        ai_api_endpoint: string;
        ai_model: string;
        ai_api_key: string;
        ai_system_prompt: string;
    };
    status?: string;
}

export default function AIAssistant({ settings, status }: AIAssistantProps) {
    const [isTesting, setIsTesting] = useState(false);
    const [testResult, setTestResult] = useState<{success: boolean; message: string} | null>(null);
    const [models, setModels] = useState<string[]>([]);

    const { data, setData, patch, processing, errors, recentlySuccessful } = useForm({
        ai_api_endpoint: settings.ai_api_endpoint || '',
        ai_model: settings.ai_model || '',
        ai_api_key: settings.ai_api_key || '',
        ai_system_prompt: settings.ai_system_prompt || '',
    });

    const triggerTestConnection = async () => {
        if (!data.ai_api_endpoint) {
            setTestResult({ success: false, message: 'Please provide an endpoint first.' });
            return;
        }

        setIsTesting(true);
        setTestResult(null);

        try {
            const response = await axios.post('/settings/ai-assistant/test', {
                endpoint: data.ai_api_endpoint,
                api_key: data.ai_api_key
            });
            
            const fetchedModels = response.data.models || [];
            setModels(fetchedModels);
            setTestResult({ success: true, message: `Successfully connected! Found ${fetchedModels.length} models.`});
            
            if (fetchedModels.length > 0) {
                if (!data.ai_model || !fetchedModels.includes(data.ai_model)) {
                    setData('ai_model', fetchedModels[0]);
                }
            }
        } catch (error: any) {
            setTestResult({ 
                success: false, 
                message: error.response?.data?.error || 'Failed to connect to the provided endpoint.' 
            });
        } finally {
            setIsTesting(false);
        }
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        patch('/settings/ai-assistant', {
            preserveScroll: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="AI Assistant settings" />

            <h1 className="sr-only">AI Assistant Settings</h1>

            <SettingsLayout>
                <div className="space-y-6">
                    <Heading
                        variant="small"
                        title="AI Assistant Configuration"
                        description="Configure your external AI model endpoints and access keys."
                    />

                    <form onSubmit={submit} className="space-y-6">
                        <div className="grid gap-2">
                            <Label htmlFor="ai_api_endpoint">AI Endpoint URL</Label>

                            <div className="flex items-center gap-2">
                                <Input
                                    id="ai_api_endpoint"
                                    type="url"
                                    className="block flex-1"
                                    value={data.ai_api_endpoint}
                                    onChange={(e) => setData('ai_api_endpoint', e.target.value)}
                                    placeholder="http://127.0.0.1:11434/api/generate"
                                />
                                <Button 
                                    type="button" 
                                    variant="secondary" 
                                    onClick={triggerTestConnection}
                                    disabled={isTesting}
                                >
                                    {isTesting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Test & Fetch Models
                                </Button>
                            </div>

                            <InputError className="mt-2" message={errors.ai_api_endpoint} />
                            {testResult && (
                                <p className={`text-sm ${testResult.success ? 'text-green-600' : 'text-red-500'}`}>
                                    {testResult.message}
                                </p>
                            )}
                            <p className="text-sm text-neutral-500">
                                Typical local Ollama URL: http://127.0.0.1:11434/api/generate
                            </p>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="ai_model">Model Name</Label>

                            {models.length > 0 ? (
                                <select 
                                    id="ai_model"
                                    className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={data.ai_model}
                                    onChange={(e) => setData('ai_model', e.target.value)}
                                >
                                    <option value="" disabled>Select a model...</option>
                                    {models.map(model => (
                                        <option key={model} value={model}>{model}</option>
                                    ))}
                                </select>
                            ) : (
                                <Input
                                    id="ai_model"
                                    className="mt-1 block w-full"
                                    value={data.ai_model}
                                    onChange={(e) => setData('ai_model', e.target.value)}
                                    placeholder="Click Test & Fetch Models first, or type manually (e.g. llama3)"
                                />
                            )}

                            <InputError className="mt-2" message={errors.ai_model} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="ai_api_key">API Key (Optional)</Label>

                            <Input
                                id="ai_api_key"
                                type="password"
                                className="mt-1 block w-full"
                                value={data.ai_api_key}
                                onChange={(e) => setData('ai_api_key', e.target.value)}
                                placeholder="Bearer token or API key"
                            />

                            <InputError className="mt-2" message={errors.ai_api_key} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="ai_system_prompt">System Prompt</Label>

                            <textarea
                                id="ai_system_prompt"
                                className="mt-1 block w-full min-h-[120px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                value={data.ai_system_prompt}
                                onChange={(e) => setData('ai_system_prompt', e.target.value)}
                                placeholder="You are a helpful assistant..."
                            />

                            <InputError className="mt-2" message={errors.ai_system_prompt} />
                        </div>

                        <div className="flex items-center gap-4">
                            <Button disabled={processing}>Save</Button>

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
                    </form>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}

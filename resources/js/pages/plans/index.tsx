import { Head, Link, useForm } from '@inertiajs/react';
import {
    Pencil,
    Trash2,
    Plus,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { useCurrency } from '@/context/CurrencyContext';
import AppLayout from '@/layouts/app-layout';

const breadcrumbs = [
    {
        title: 'Pricing Plans',
        href: '/plans',
    },
];

interface Plan {
    id: number;
    name: string;
    subtitle: string | null;
    duration_hours: number;
    price: number;
    price_small: number;
    price_medium: number;
    price_large: number;
    price_plus: number;
    billing_cycle: string;
    features: string[] | null;
    is_popular: boolean;
    description: string | null;
    is_active: boolean;
}

export default function PlansIndex({ plans }: { plans: Plan[] }) {
    const { format } = useCurrency();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState<Plan | null>(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset, transform } = useForm({
        name: '',
        subtitle: '',
        duration_hours: 1,
        price: '0',
        price_small: '',
        price_medium: '',
        price_large: '',
        price_plus: '',
        billing_cycle: 'hourly',
        features: '', // We'll parse this to array
        is_popular: false,
        description: '',
        is_active: true,
    });

    const openCreateModal = () => {
        setEditingPlan(null);
        reset();
        setData({
            name: '',
            subtitle: '',
            duration_hours: 1,
            price: '0',
            price_small: '',
            price_medium: '',
            price_large: '',
            price_plus: '',
            billing_cycle: 'hourly',
            features: '',
            is_popular: false,
            description: '',
            is_active: true,
        });
        setIsModalOpen(true);
    };

    const openEditModal = (plan: Plan) => {
        setEditingPlan(plan);
        setData({
            name: plan.name,
            subtitle: plan.subtitle || '',
            duration_hours: plan.duration_hours,
            price: plan.price?.toString() || '0',
            price_small: plan.price_small?.toString() || '0',
            price_medium: plan.price_medium?.toString() || '0',
            price_large: plan.price_large?.toString() || '0',
            price_plus: plan.price_plus?.toString() || '0',
            billing_cycle: plan.billing_cycle,
            features: plan.features ? plan.features.join('\n') : '',
            is_popular: plan.is_popular,
            description: plan.description || '',
            is_active: plan.is_active,
        });
        setIsModalOpen(true);
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to deactivate this plan? It will be hidden from the AI assistant and public booking forms.')) {
            destroy(`/plans/${id}`);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        transform((data) => ({
            ...data,
            price_small: data.price_small || '0',
            price_medium: data.price_medium || '0',
            price_large: data.price_large || '0',
            price_plus: data.price_plus || '0',
            features: typeof data.features === 'string' ? data.features.split('\n').filter(f => f.trim() !== '') : data.features,
        }));

        if (editingPlan) {
            put(`/plans/${editingPlan.id}`, {
                onSuccess: () => setIsModalOpen(false),
            });
        } else {
            post('/plans', {
                onSuccess: () => setIsModalOpen(false),
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pricing Plans Management" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Pricing Plans</h1>
                        <p className="text-muted-foreground">Manage the pricing tiers displayed on the landing page.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button className="gap-2 bg-orange-600 hover:bg-orange-700 text-white" onClick={openCreateModal}>
                            <Plus className="h-4 w-4" />
                            Add New Plan
                        </Button>
                    </div>
                </div>

                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Plan Name</TableHead>
                                    <TableHead>Billing Cycle</TableHead>
                                    <TableHead>Prices (Small / Med / Large / Plus)</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {plans.map((plan) => (
                                    <TableRow key={plan.id}>
                                        <TableCell>
                                            <div className="font-medium text-gray-900">{plan.name}</div>
                                            {plan.is_popular && <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full ml-2">Popular</span>}
                                        </TableCell>
                                        <TableCell className="capitalize">{plan.billing_cycle}</TableCell>
                                        <TableCell className="text-sm">
                                            <div className="flex gap-2 text-gray-700">
                                                <span title="Small">{format(plan.price_small)}</span> /
                                                <span title="Medium">{format(plan.price_medium)}</span> /
                                                <span title="Large">{format(plan.price_large)}</span> /
                                                <span title="Plus">{format(plan.price_plus)}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${plan.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                                {plan.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                                                    onClick={() => openEditModal(plan)}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                    onClick={() => handleDelete(plan.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {plans.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                            No plans found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Create/Edit Modal */}
                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogContent className="max-w-2xl bg-white max-h-[90vh] overflow-y-auto w-[95vw] md:w-full">
                        <DialogHeader>
                            <DialogTitle>{editingPlan ? 'Edit Plan' : 'Create New Plan'}</DialogTitle>
                            <DialogDescription>
                                Set the pricing and features for this plan.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Plan Name</Label>
                                    <Input value={data.name} onChange={e => setData('name', e.target.value)} required />
                                    {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label>Subtitle</Label>
                                    <Input value={data.subtitle} onChange={e => setData('subtitle', e.target.value)} placeholder="Perfect for short layovers" />
                                    {errors.subtitle && <p className="text-red-500 text-sm">{errors.subtitle}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Billing Cycle</Label>
                                    <Select value={data.billing_cycle} onValueChange={v => setData('billing_cycle', v)}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="hourly">Hourly</SelectItem>
                                            <SelectItem value="daily">Daily</SelectItem>
                                            <SelectItem value="weekly">Weekly</SelectItem>
                                            <SelectItem value="monthly">Monthly</SelectItem>
                                            <SelectItem value="custom">Custom</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Duration (Hours)</Label>
                                    <Input type="number" min="1" value={data.duration_hours} onChange={e => setData('duration_hours', parseInt(e.target.value))} required />
                                </div>
                            </div>

                            <div className="space-y-3 border p-4 rounded-xl bg-gray-50/50">
                                <Label className="text-base font-semibold">Prices Per Bag Size (USD)</Label>
                                <div className="grid grid-cols-4 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs">Small (Cabin)</Label>
                                        <Input type="number" step="0.01" value={data.price_small} onChange={e => setData('price_small', e.target.value)} required />
                                        {/* @ts-ignore */}
                                        {errors.price_small && <p className="text-red-500 text-xs">{errors.price_small}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs">Medium (Check-in)</Label>
                                        <Input type="number" step="0.01" value={data.price_medium} onChange={e => setData('price_medium', e.target.value)} required />
                                        {/* @ts-ignore */}
                                        {errors.price_medium && <p className="text-red-500 text-xs">{errors.price_medium}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs">Large (Oversize)</Label>
                                        <Input type="number" step="0.01" value={data.price_large} onChange={e => setData('price_large', e.target.value)} required />
                                        {/* @ts-ignore */}
                                        {errors.price_large && <p className="text-red-500 text-xs">{errors.price_large}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs">Plus (Surfboard, etc.)</Label>
                                        <Input type="number" step="0.01" value={data.price_plus} onChange={e => setData('price_plus', e.target.value)} required />
                                        {/* @ts-ignore */}
                                        {errors.price_plus && <p className="text-red-500 text-xs">{errors.price_plus}</p>}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Features (One per line)</Label>
                                <textarea
                                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    rows={4}
                                    value={data.features}
                                    onChange={e => setData('features', e.target.value)}
                                    placeholder="Insurance included&#10;24/7 access"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Footer Description</Label>
                                <Input value={data.description} onChange={e => setData('description', e.target.value)} placeholder="*When booking 7+ days" />
                            </div>

                            <div className="flex gap-6 pt-4">
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="is_active" checked={data.is_active} onCheckedChange={(v) => setData('is_active', !!v)} />
                                    <Label htmlFor="is_active">Active (Visible)</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="is_popular" checked={data.is_popular} onCheckedChange={(v) => setData('is_popular', !!v)} />
                                    <Label htmlFor="is_popular">Highlight as Popular</Label>
                                </div>
                            </div>

                            <DialogFooter className="pt-4">
                                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                                <Button type="submit" className="bg-orange-600 hover:bg-orange-700" disabled={processing}>
                                    {processing ? 'Saving...' : 'Save Plan'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout >
    );
}

<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $request->user(),
            ],
            'pricing' => function () {
                $plan = \App\Models\Plan::where('is_active', true)
                    ->orderBy('is_popular', 'desc')
                    ->first();

                if ($plan) {
                    return [
                        'name' => $plan->name,
                        'small' => (float) $plan->price_small,
                        'medium' => (float) $plan->price_medium,
                        'large' => (float) $plan->price_large,
                        'plus' => (float) $plan->price_plus,
                    ];
                }

                return [
                    'name' => 'Standard Rate',
                    'small' => 5.0,
                    'medium' => 10.0,
                    'large' => 15.0,
                    'plus' => 25.0,
                ];
            },
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'successBookingId' => fn () => $request->session()->get('successBookingId'),
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'notifications' => function () use ($request) {
                if (!$request->user()) {
                    return [];
                }
                return $request->user()->notifications()->latest()->take(50)->get()->map(function ($notification) {
                    return [
                        'id' => $notification->id,
                        'title' => $notification->data['title'] ?? 'Notification',
                        'message' => $notification->data['message'] ?? '',
                        'time' => $notification->created_at->diffForHumans(),
                        'read' => !is_null($notification->read_at),
                        'type' => $notification->data['type'] ?? 'info',
                        'booking_reference' => $notification->data['booking_reference'] ?? null,
                    ];
                });
            },
        ];
    }
}

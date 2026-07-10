<?php

namespace App\Providers;

use App\Models\AuditTrail;
use Carbon\CarbonImmutable;
use Illuminate\Auth\Events\Login;
use Illuminate\Auth\Events\Logout;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureDefaults();

        // Custom password reset URL for decoupled React app
        ResetPassword::createUrlUsing(function ($user, string $token) {
            $frontendUrl = env('FRONTEND_URL', 'http://localhost:3000');

            return $frontendUrl.'/reset-password/'.$token.'?email='.urlencode($user->email);
        });

        Event::listen(Login::class, function (Login $event) {
            AuditTrail::create([
                'user_id' => $event->user->id,
                'user_name' => $event->user->name,
                'auditable_type' => get_class($event->user),
                'auditable_id' => $event->user->id,
                'event' => 'login',
                'activity' => 'User Logged In',
                'ip_address' => request()->ip() ?: (request()->server('REMOTE_ADDR') ?: '127.0.0.1'),
                'created_at' => now(),
            ]);
        });

        Event::listen(Logout::class, function (Logout $event) {
            if ($event->user) {
                AuditTrail::create([
                    'user_id' => $event->user->id,
                    'user_name' => $event->user->name,
                    'auditable_type' => get_class($event->user),
                    'auditable_id' => $event->user->id,
                    'event' => 'logout',
                    'activity' => 'User Logged Out',
                    'ip_address' => request()->ip() ?: (request()->server('REMOTE_ADDR') ?: '127.0.0.1'),
                    'created_at' => now(),
                ]);
            }
        });
    }

    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null
        );
    }
}

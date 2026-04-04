<?php

namespace App\Providers;

use App\Models\AuditTrail;
use Illuminate\Auth\Events\Login;
use Illuminate\Auth\Events\Logout;
use Illuminate\Support\Facades\Event;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
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

        Event::listen(Login::class, function (Login $event) {
            AuditTrail::create([
                'user_id' => $event->user->id,
                'user_name' => $event->user->name,
                'auditable_type' => get_class($event->user),
                'auditable_id' => $event->user->id,
                'event' => 'login',
                'activity' => 'User Logged In',
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

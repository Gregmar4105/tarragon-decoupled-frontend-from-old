<?php

namespace App\Providers;

use App\Models\Setting;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\ServiceProvider;

class MailSettingsServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        // Only attempt to load settings if the table exists
        if (Schema::hasTable('settings')) {
            $settings = Setting::whereIn('key', [
                'mail_host',
                'mail_port',
                'mail_username',
                'mail_password',
                'mail_encryption',
                'mail_from_address',
                'mail_from_name'
            ])->pluck('value', 'key');

            if ($settings->isNotEmpty()) {
                // Update the SMTP mailer configuration
                if (isset($settings['mail_host'])) {
                    Config::set('mail.mailers.smtp.host', $settings['mail_host']);
                }
                if (isset($settings['mail_port'])) {
                    Config::set('mail.mailers.smtp.port', $settings['mail_port']);
                }
                if (isset($settings['mail_username'])) {
                    Config::set('mail.mailers.smtp.username', $settings['mail_username']);
                }
                if (isset($settings['mail_password'])) {
                    Config::set('mail.mailers.smtp.password', $settings['mail_password']);
                }
                if (isset($settings['mail_encryption'])) {
                    Config::set('mail.mailers.smtp.encryption', $settings['mail_encryption']);
                }
                
                // Update global from address
                if (isset($settings['mail_from_address'])) {
                    Config::set('mail.from.address', $settings['mail_from_address']);
                }
                if (isset($settings['mail_from_name'])) {
                    Config::set('mail.from.name', $settings['mail_from_name']);
                }

                // If any of these are set, we might want to force the default mailer to smtp
                // instead of whatever is in .env (like 'log'), but only if the host is set.
                if (!empty($settings['mail_host'])) {
                    Config::set('mail.default', 'smtp');
                }
            }
        }
    }
}

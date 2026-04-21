<?php

namespace App\Traits;

use App\Models\AuditTrail;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Log;

trait Auditable
{
    /**
     * Boot the Auditable trait for a model.
     */
    public static function bootAuditable()
    {
        static::created(function (Model $model) {
            static::audit('created', $model, null, $model->getAttributes());
        });

        static::updated(function (Model $model) {
            // Get only the changed attributes
            $changes = $model->getDirty();

            // Reconstruct the original state for changed properties
            $old = [];
            foreach ($changes as $key => $value) {
                $old[$key] = $model->getOriginal($key);
            }

            // Exclude models that had no real changes
            if (empty($changes)) {
                return;
            }

            static::audit('updated', $model, $old, $changes);
        });

        static::deleted(function (Model $model) {
            static::audit('deleted', $model, $model->getAttributes(), null);
        });
    }

    /**
     * Perform the audit logging.
     *
     * Wrapped in try/catch so that a missing column or SQLite incompatibility
     * NEVER blocks the actual operation (registration, login, etc.).
     */
    protected static function audit($event, Model $model, $oldValues = null, $newValues = null)
    {
        try {
            // Default to system user if running in console, otherwise Guest
            $userId = null;
            $userName = app()->runningInConsole() ? 'System' : 'Guest';

            if (auth()->check()) {
                $userId = auth()->id();
                $userName = auth()->user()->name ?? 'Unknown User';
            }

            // Determine activity string
            $modelName = class_basename($model);
            $activity = ucfirst($event) . ' ' . $modelName;

            // Safely get IP — fallback to 127.0.0.1 on Android/CLI
            $ip = '127.0.0.1';
            try {
                $ip = request()->ip() ?: request()->server('REMOTE_ADDR') ?: '127.0.0.1';
            } catch (\Throwable $e) {
                // Ignore — request() may not be available in all contexts
            }

            AuditTrail::create([
                'user_id'        => $userId,
                'user_name'      => $userName,
                'auditable_type' => get_class($model),
                'auditable_id'   => $model->getKey(),
                'event'          => $event,
                'activity'       => $activity,
                'ip_address'     => $ip,
                'old_values'     => $oldValues,
                'new_values'     => $newValues,
                'created_at'     => now(),
            ]);
        } catch (\Throwable $e) {
            // Audit logging must never break core app functionality.
            // Log the failure silently and continue.
            Log::warning('Auditable: failed to write audit log', [
                'event'     => $event,
                'model'     => get_class($model),
                'model_id'  => $model->getKey() ?? null,
                'error'     => $e->getMessage(),
            ]);
        }
    }
}

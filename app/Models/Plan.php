<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\Auditable;

class Plan extends Model
{
    use Auditable;

    protected $fillable = [
        'name',
        'subtitle',
        'duration_hours',
        'price',
        'price_small',
        'price_medium',
        'price_large',
        'price_plus',
        'billing_cycle',
        'features',
        'is_popular',
        'description',
        'is_active',
    ];

    protected $casts = [
        'features' => 'array',
        'is_popular' => 'boolean',
        'is_active' => 'boolean',
        'price' => 'decimal:2',
        'price_small' => 'decimal:2',
        'price_medium' => 'decimal:2',
        'price_large' => 'decimal:2',
        'price_plus' => 'decimal:2',
    ];
    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }
}

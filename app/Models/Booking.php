<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\Auditable;

class Booking extends Model
{
    use Auditable;

    protected $fillable = [
        'user_id',
        'plan_id',
        'customer_name',
        'customer_email',
        'customer_phone',
        'drop_off_time',
        'pick_up_time',
        'total_price',
        'status',
        'payment_status',
        'booking_reference',
        'source',
        'qr_code_path',
    ];

    /**
     * Get the route key for the model.
     *
     * @return string
     */
    public function getRouteKeyName()
    {
        return 'booking_reference';
    }

    public function items()
    {
        return $this->hasMany(BookingItem::class);
    }

    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }
}

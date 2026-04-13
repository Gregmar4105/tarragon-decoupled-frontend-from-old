<?php

namespace App\Models;

use App\Traits\Auditable;
use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    use Auditable;

    protected $fillable = ['key', 'value'];
}

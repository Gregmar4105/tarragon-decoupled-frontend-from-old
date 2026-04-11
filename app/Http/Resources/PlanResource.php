<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class PlanResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array
     */
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'subtitle' => $this->subtitle,
            'duration_hours' => $this->duration_hours,
            'price' => (float) $this->price,
            'price_small' => (float) $this->price_small,
            'price_medium' => (float) $this->price_medium,
            'price_large' => (float) $this->price_large,
            'price_plus' => (float) $this->price_plus,
            'billing_cycle' => $this->billing_cycle,
            'features' => $this->features,
            'is_popular' => (boolean) $this->is_popular,
            'description' => $this->description,
            'is_active' => (boolean) $this->is_active,
        ];
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class NutritionEntry extends Model
{
    protected $fillable = [
        'user_id',
        'entry_date',
        'meal_name',
        'category',
        'food_name',
        'amount',
        'unit',
        'energy_kcal',
        'protein_g',
        'carbohydrates_g',
        'fat_g',
        'fiber_g',
        'sugar_g',
        'net_carbs_g',
        'sodium_mg',
        'saturated_fat_g',
        'cholesterol_mg',
        'nutrients',
        'source',
    ];

    protected $casts = [
        'entry_date' => 'date',
        'nutrients' => 'array',
        'amount' => 'float',
        'energy_kcal' => 'float',
        'protein_g' => 'float',
        'carbohydrates_g' => 'float',
        'fat_g' => 'float',
        'fiber_g' => 'float',
        'sugar_g' => 'float',
        'net_carbs_g' => 'float',
        'sodium_mg' => 'float',
        'saturated_fat_g' => 'float',
        'cholesterol_mg' => 'float',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}

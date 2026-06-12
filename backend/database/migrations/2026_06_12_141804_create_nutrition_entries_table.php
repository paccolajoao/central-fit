<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('nutrition_entries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->date('entry_date');
            $table->string('meal_name');
            $table->string('category')->nullable();
            $table->string('food_name');
            $table->decimal('amount', 10, 2)->nullable();
            $table->string('unit')->nullable();
            $table->decimal('energy_kcal', 8, 2)->nullable();
            $table->decimal('protein_g', 8, 2)->nullable();
            $table->decimal('carbohydrates_g', 8, 2)->nullable();
            $table->decimal('fat_g', 8, 2)->nullable();
            $table->decimal('fiber_g', 8, 2)->nullable();
            $table->decimal('sugar_g', 8, 2)->nullable();
            $table->decimal('net_carbs_g', 8, 2)->nullable();
            $table->decimal('sodium_mg', 8, 2)->nullable();
            $table->decimal('saturated_fat_g', 8, 2)->nullable();
            $table->decimal('cholesterol_mg', 8, 2)->nullable();
            $table->jsonb('nutrients')->nullable();
            $table->string('source')->default('cronometer_csv');
            $table->timestamps();

            $table->index(['user_id', 'entry_date']);
            $table->unique(['user_id', 'entry_date', 'meal_name', 'food_name', 'amount'], 'nutrition_entries_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('nutrition_entries');
    }
};

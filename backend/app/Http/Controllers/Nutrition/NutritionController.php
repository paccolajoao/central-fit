<?php

namespace App\Http\Controllers\Nutrition;

use App\Http\Controllers\Controller;
use App\Models\NutritionEntry;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class NutritionController extends Controller
{
    public function daily(Request $request): JsonResponse
    {
        $request->validate([
            'date' => 'nullable|date_format:Y-m-d',
        ]);

        $date = $request->input('date', now()->toDateString());
        $userId = $request->user()->id;

        $entries = NutritionEntry::where('user_id', $userId)
            ->whereDate('entry_date', $date)
            ->orderBy('meal_name')
            ->orderBy('food_name')
            ->get();

        $totals = [
            'energy_kcal' => $entries->sum('energy_kcal'),
            'protein_g' => $entries->sum('protein_g'),
            'carbohydrates_g' => $entries->sum('carbohydrates_g'),
            'fat_g' => $entries->sum('fat_g'),
            'fiber_g' => $entries->sum('fiber_g'),
            'sugar_g' => $entries->sum('sugar_g'),
            'net_carbs_g' => $entries->sum('net_carbs_g'),
            'sodium_mg' => $entries->sum('sodium_mg'),
        ];

        $byMeal = $entries->groupBy('meal_name')->map(function ($mealEntries) {
            return [
                'entries' => $mealEntries->values(),
                'totals' => [
                    'energy_kcal' => $mealEntries->sum('energy_kcal'),
                    'protein_g' => $mealEntries->sum('protein_g'),
                    'carbohydrates_g' => $mealEntries->sum('carbohydrates_g'),
                    'fat_g' => $mealEntries->sum('fat_g'),
                ],
            ];
        });

        return response()->json([
            'date' => $date,
            'totals' => $totals,
            'by_meal' => $byMeal,
        ]);
    }

    public function weekly(Request $request): JsonResponse
    {
        $request->validate([
            'from' => 'nullable|date_format:Y-m-d',
            'to' => 'nullable|date_format:Y-m-d',
        ]);

        $to = $request->input('to', now()->toDateString());
        $from = $request->input('from', now()->subDays(6)->toDateString());
        $userId = $request->user()->id;

        $entries = NutritionEntry::where('user_id', $userId)
            ->whereBetween('entry_date', [$from, $to])
            ->get();

        $byDay = $entries->groupBy(fn ($e) => $e->entry_date->toDateString())
            ->map(function ($dayEntries) {
                return [
                    'energy_kcal' => round($dayEntries->sum('energy_kcal'), 1),
                    'protein_g' => round($dayEntries->sum('protein_g'), 1),
                    'carbohydrates_g' => round($dayEntries->sum('carbohydrates_g'), 1),
                    'fat_g' => round($dayEntries->sum('fat_g'), 1),
                    'fiber_g' => round($dayEntries->sum('fiber_g'), 1),
                ];
            });

        // Fill missing days with zeros
        $period = Carbon::parse($from)->daysUntil(Carbon::parse($to));
        $days = [];
        foreach ($period as $day) {
            $dateStr = $day->toDateString();
            $days[$dateStr] = $byDay[$dateStr] ?? [
                'energy_kcal' => 0,
                'protein_g' => 0,
                'carbohydrates_g' => 0,
                'fat_g' => 0,
                'fiber_g' => 0,
            ];
        }

        $daysWithData = collect($days)->filter(fn ($d) => $d['energy_kcal'] > 0);
        $count = max(1, $daysWithData->count());

        $summary = [
            'avg_energy_kcal' => round($daysWithData->sum('energy_kcal') / $count, 1),
            'avg_protein_g' => round($daysWithData->sum('protein_g') / $count, 1),
            'avg_carbohydrates_g' => round($daysWithData->sum('carbohydrates_g') / $count, 1),
            'avg_fat_g' => round($daysWithData->sum('fat_g') / $count, 1),
            'total_energy_kcal' => round($entries->sum('energy_kcal'), 1),
            'days_tracked' => $daysWithData->count(),
        ];

        return response()->json([
            'from' => $from,
            'to' => $to,
            'days' => $days,
            'summary' => $summary,
        ]);
    }

    public function destroy(Request $request, NutritionEntry $entry): JsonResponse
    {
        if ($entry->user_id !== $request->user()->id) {
            abort(403);
        }

        $entry->delete();

        return response()->json(['message' => 'Entrada removida com sucesso.']);
    }
}

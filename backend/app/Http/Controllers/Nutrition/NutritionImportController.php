<?php

namespace App\Http\Controllers\Nutrition;

use App\Http\Controllers\Controller;
use App\Models\NutritionEntry;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rules\File;

class NutritionImportController extends Controller
{
    // Maps variations of Cronometer CSV header names to our DB columns
    private const COLUMN_MAP = [
        'date' => 'entry_date',
        'meal' => 'meal_name',
        'category' => 'category',
        'food name' => 'food_name',
        'amount' => 'amount',
        'unit' => 'unit',
        'energy (kcal)' => 'energy_kcal',
        'protein (g)' => 'protein_g',
        'carbohydrates (g)' => 'carbohydrates_g',
        'fat (g)' => 'fat_g',
        'fiber (g)' => 'fiber_g',
        'sugars (g)' => 'sugar_g',
        'net carbs (g)' => 'net_carbs_g',
        'sodium (mg)' => 'sodium_mg',
        'saturated (g)' => 'saturated_fat_g',
        'cholesterol (mg)' => 'cholesterol_mg',
    ];

    public function import(Request $request): JsonResponse
    {
        $request->validate([
            'file' => ['required', File::types(['csv', 'txt'])->max(10 * 1024)],
        ]);

        $path = $request->file('file')->getRealPath();
        $content = file_get_contents($path);

        // Detect and convert encoding
        $encoding = mb_detect_encoding($content, ['UTF-8', 'ISO-8859-1', 'Windows-1252'], true);
        if ($encoding && $encoding !== 'UTF-8') {
            $content = mb_convert_encoding($content, 'UTF-8', $encoding);
        }

        $lines = str_getcsv($content, "\n");
        if (count($lines) < 2) {
            return response()->json(['error' => 'Arquivo CSV vazio ou inválido.'], 422);
        }

        $headers = array_map('trim', str_getcsv(array_shift($lines)));
        $headerMap = $this->buildHeaderMap($headers);

        if (!isset($headerMap['food_name']) || !isset($headerMap['entry_date'])) {
            return response()->json([
                'error' => 'Formato inválido. Certifique-se de exportar o "Serving Summary" do Cronometer.',
            ], 422);
        }

        $userId = $request->user()->id;
        $imported = 0;
        $skipped = 0;
        $minDate = null;
        $maxDate = null;
        $batch = [];

        foreach ($lines as $line) {
            $line = trim($line);
            if (empty($line)) continue;

            $row = str_getcsv($line);
            if (count($row) < count($headers)) {
                $row = array_pad($row, count($headers), null);
            }

            $entry = $this->mapRow($row, $headerMap, $userId);
            if (!$entry || empty($entry['food_name']) || empty($entry['entry_date'])) {
                $skipped++;
                continue;
            }

            if (!$minDate || $entry['entry_date'] < $minDate) $minDate = $entry['entry_date'];
            if (!$maxDate || $entry['entry_date'] > $maxDate) $maxDate = $entry['entry_date'];

            $batch[] = $entry;
        }

        // Insert in chunks, ignoring duplicates
        DB::transaction(function () use ($batch, &$imported, &$skipped) {
            foreach (array_chunk($batch, 100) as $chunk) {
                $result = NutritionEntry::insertOrIgnore($chunk);
                $imported += $result;
                $skipped += count($chunk) - $result;
            }
        });

        return response()->json([
            'imported' => $imported,
            'skipped' => $skipped,
            'date_range' => $minDate && $maxDate ? ['from' => $minDate, 'to' => $maxDate] : null,
        ]);
    }

    private function buildHeaderMap(array $headers): array
    {
        $map = [];
        foreach ($headers as $index => $header) {
            $normalized = strtolower(trim($header));
            if (isset(self::COLUMN_MAP[$normalized])) {
                $map[self::COLUMN_MAP[$normalized]] = $index;
            }
        }
        return $map;
    }

    private function mapRow(array $row, array $headerMap, int $userId): ?array
    {
        $get = fn (string $col) => isset($headerMap[$col]) ? (trim($row[$headerMap[$col]] ?? '') ?: null) : null;
        $getFloat = fn (string $col) => isset($headerMap[$col]) ? (is_numeric($row[$headerMap[$col]] ?? '') ? (float) $row[$headerMap[$col]] : null) : null;

        $date = $get('entry_date');
        if (!$date || !strtotime($date)) return null;

        // Normalize date format
        $date = date('Y-m-d', strtotime($date));

        return [
            'user_id' => $userId,
            'entry_date' => $date,
            'meal_name' => $get('meal_name') ?? 'Outros',
            'category' => $get('category'),
            'food_name' => $get('food_name') ?? '',
            'amount' => $getFloat('amount'),
            'unit' => $get('unit'),
            'energy_kcal' => $getFloat('energy_kcal'),
            'protein_g' => $getFloat('protein_g'),
            'carbohydrates_g' => $getFloat('carbohydrates_g'),
            'fat_g' => $getFloat('fat_g'),
            'fiber_g' => $getFloat('fiber_g'),
            'sugar_g' => $getFloat('sugar_g'),
            'net_carbs_g' => $getFloat('net_carbs_g'),
            'sodium_mg' => $getFloat('sodium_mg'),
            'saturated_fat_g' => $getFloat('saturated_fat_g'),
            'cholesterol_mg' => $getFloat('cholesterol_mg'),
            'source' => 'cronometer_csv',
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }
}

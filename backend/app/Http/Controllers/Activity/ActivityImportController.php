<?php

namespace App\Http\Controllers\Activity;

use App\Http\Controllers\Controller;
use App\Models\Activity;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use ZipArchive;

class ActivityImportController extends Controller
{
    // Mapeia colunas do Samsung Health (sem prefixo) → campo interno
    private const COLUMN_MAP = [
        'start_time'           => 'start_time',
        'end_time'             => 'end_time',
        'datauuid'             => 'external_id',
        'exercise_type'        => '_exercise_type_code',
        'exercise_custom_type' => '_activity_name_raw',
        'duration'             => '_duration_ms',
        'calorie'              => 'calories_kcal',
        'distance'             => 'distance_meters',
        'mean_speed'           => 'speed_avg_ms',
        'max_speed'            => 'speed_max_ms',
        'incline_distance'     => 'elevation_gain_meters',
        'decline_distance'     => 'elevation_loss_meters',
        'heart_rate'           => 'heart_rate_avg',
        'max_heart_rate'       => 'heart_rate_max',
        'min_heart_rate'       => 'heart_rate_min',
        'mean_cadence'         => 'cadence_avg',
        'count'                => 'step_count',
        'comment'              => 'notes',
    ];

    // Códigos de tipo de exercício do Samsung Health SDK
    private const EXERCISE_TYPE_MAP = [
        1001  => 'walk',
        1002  => 'run',
        1003  => 'run',
        2001  => 'cycle',
        3001  => 'elliptical',
        4001  => 'swim',
        4002  => 'swim',
        5001  => 'workout',
        6001  => 'workout',
        7001  => 'cycle',
        10001 => 'aerobics',
        11007 => 'cycle',
        13001 => 'yoga',
        13002 => 'pilates',
        14001 => 'run',    // treadmill run
        15001 => 'cycle',  // stationary bike
    ];

    public function importSamsung(Request $request): JsonResponse
    {
        $request->validate([
            'file' => 'required|file|mimes:zip,csv,txt|max:20480',
        ]);

        $file = $request->file('file');
        $mime = $file->getMimeType();
        $extension = strtolower($file->getClientOriginalExtension());

        if ($extension === 'zip' || str_contains($mime ?? '', 'zip')) {
            $csvContent = $this->extractExerciseCsvFromZip($file->getRealPath());
        } else {
            $csvContent = file_get_contents($file->getRealPath());
        }

        if ($csvContent === false || $csvContent === null) {
            return response()->json(['error' => 'Não foi possível ler o arquivo.'], 422);
        }

        $csvContent = $this->ensureUtf8($csvContent);
        $rows = $this->parseCsv($csvContent);

        if (empty($rows)) {
            return response()->json(['error' => 'Nenhuma linha de exercício encontrada no arquivo.'], 422);
        }

        $headers = array_shift($rows);
        $colIndex = $this->buildColumnIndex($headers);

        if (! isset($colIndex['start_time'])) {
            return response()->json(['error' => 'Formato não reconhecido: coluna start_time não encontrada.'], 422);
        }

        $userId = $request->user()->id;
        $records = [];
        $minDate = null;
        $maxDate = null;

        foreach ($rows as $row) {
            if (count($row) < 2) {
                continue;
            }

            $mapped = $this->mapRow($row, $colIndex);
            if ($mapped === null) {
                continue;
            }

            $mapped['user_id'] = $userId;
            $mapped['source'] = 'samsung_health';
            $mapped['created_at'] = now();
            $mapped['updated_at'] = now();

            $records[] = $mapped;

            $date = substr($mapped['start_time'], 0, 10);
            if ($minDate === null || $date < $minDate) {
                $minDate = $date;
            }
            if ($maxDate === null || $date > $maxDate) {
                $maxDate = $date;
            }
        }

        if (empty($records)) {
            return response()->json(['error' => 'Nenhum registro válido encontrado.'], 422);
        }

        $countBefore = Activity::where('user_id', $userId)->count();

        foreach (array_chunk($records, 100) as $chunk) {
            Activity::insertOrIgnore($chunk);
        }

        $countAfter = Activity::where('user_id', $userId)->count();
        $imported = $countAfter - $countBefore;
        $skipped = count($records) - $imported;

        return response()->json([
            'imported' => $imported,
            'skipped' => $skipped,
            'date_range' => ['from' => $minDate, 'to' => $maxDate],
        ]);
    }

    private function extractExerciseCsvFromZip(string $zipPath): ?string
    {
        $zip = new ZipArchive();
        if ($zip->open($zipPath) !== true) {
            return null;
        }

        $target = null;
        for ($i = 0; $i < $zip->numFiles; $i++) {
            $name = $zip->getNameIndex($i);
            // Procura arquivo de exercício Samsung Health
            if (str_contains(strtolower($name), 'exercise') && str_ends_with(strtolower($name), '.csv')) {
                // Prioriza o arquivo principal (sem sublastas de GPS/lap)
                if (! str_contains(strtolower($name), 'lap') && ! str_contains(strtolower($name), 'location')) {
                    $target = $name;
                    break;
                }
                $target = $name; // fallback
            }
        }

        if ($target === null) {
            $zip->close();
            return null;
        }

        $content = $zip->getFromName($target);
        $zip->close();

        return $content !== false ? $content : null;
    }

    private function ensureUtf8(string $content): string
    {
        if (mb_detect_encoding($content, ['UTF-8'], true)) {
            return $content;
        }
        $converted = mb_convert_encoding($content, 'UTF-8', 'ISO-8859-1');
        return $converted !== false ? $converted : $content;
    }

    private function parseCsv(string $content): array
    {
        $lines = preg_split('/\r\n|\r|\n/', trim($content));
        return array_map('str_getcsv', $lines ?: []);
    }

    private function buildColumnIndex(array $headers): array
    {
        $index = [];
        foreach ($headers as $i => $raw) {
            // Remove prefixo "com.samsung.health.exercise." se presente
            $key = strtolower(trim($raw));
            $key = preg_replace('/^com\.samsung\.health\.exercise\./', '', $key);
            $key = preg_replace('/^com\.samsung\.shealth\.exercise\./', '', $key);

            if (isset(self::COLUMN_MAP[$key])) {
                $index[self::COLUMN_MAP[$key]] = $i;
            }
        }
        return $index;
    }

    private function mapRow(array $row, array $colIndex): ?array
    {
        $get = fn (string $field) => isset($colIndex[$field]) ? trim($row[$colIndex[$field]] ?? '') : '';

        $startRaw = $get('start_time');
        if ($startRaw === '') {
            return null;
        }

        $startTime = $this->parseTimestamp($startRaw);
        if ($startTime === null) {
            return null;
        }

        $endRaw = $get('end_time');
        $endTime = $endRaw !== '' ? $this->parseTimestamp($endRaw) : null;

        $durationMs = $get('_duration_ms');
        $durationSeconds = null;
        if (is_numeric($durationMs) && (float) $durationMs > 0) {
            $durationSeconds = (int) round((float) $durationMs / 1000);
        } elseif ($endTime !== null) {
            $durationSeconds = (int) $startTime->diffInSeconds($endTime);
        }

        $typeCode = $get('_exercise_type_code');
        $activityType = null;
        if (is_numeric($typeCode)) {
            $activityType = self::EXERCISE_TYPE_MAP[(int) $typeCode] ?? 'other';
        }

        $nameRaw = $get('_activity_name_raw');
        $activityName = $nameRaw !== '' ? $nameRaw : null;

        $externalId = $get('external_id');
        if ($externalId === '') {
            // Gera um ID determinístico se não houver datauuid
            $externalId = md5($startTime->toIso8601String() . ($activityType ?? ''));
        }

        $record = [
            'external_id'            => $externalId,
            'activity_type'          => $activityType,
            'activity_name'          => $activityName,
            'start_time'             => $startTime->toDateTimeString(),
            'end_time'               => $endTime?->toDateTimeString(),
            'duration_seconds'       => $durationSeconds,
            'calories_kcal'          => $this->toFloat($get('calories_kcal')),
            'distance_meters'        => $this->toFloat($get('distance_meters')),
            'speed_avg_ms'           => $this->toFloat($get('speed_avg_ms')),
            'speed_max_ms'           => $this->toFloat($get('speed_max_ms')),
            'elevation_gain_meters'  => $this->toFloat($get('elevation_gain_meters')),
            'elevation_loss_meters'  => $this->toFloat($get('elevation_loss_meters')),
            'heart_rate_avg'         => $this->toInt($get('heart_rate_avg')),
            'heart_rate_max'         => $this->toInt($get('heart_rate_max')),
            'heart_rate_min'         => $this->toInt($get('heart_rate_min')),
            'cadence_avg'            => $this->toInt($get('cadence_avg')),
            'step_count'             => $this->toInt($get('step_count')),
            'notes'                  => $get('notes') !== '' ? $get('notes') : null,
            'raw_data'               => null,
        ];

        return $record;
    }

    private function parseTimestamp(string $raw): ?Carbon
    {
        if (is_numeric($raw)) {
            // Milissegundos Unix
            return Carbon::createFromTimestampMs((float) $raw);
        }
        try {
            return Carbon::parse($raw);
        } catch (\Throwable) {
            return null;
        }
    }

    private function toFloat(string $value): ?float
    {
        if ($value === '' || ! is_numeric($value)) {
            return null;
        }
        $f = (float) $value;
        return $f > 0 ? $f : null;
    }

    private function toInt(string $value): ?int
    {
        if ($value === '' || ! is_numeric($value)) {
            return null;
        }
        $i = (int) round((float) $value);
        return $i > 0 ? $i : null;
    }
}

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Repositories\ReportRepository;
use App\Models\Setting;
use Carbon\Carbon;
use Carbon\CarbonPeriod;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class AnalyticsController extends Controller
{
    private ReportRepository $repository;

    public function __construct(ReportRepository $repository)
    {
        $this->repository = $repository;
    }

    /**
     * Generate AI-powered booking analytics via the configured AI assistant.
     * Streams the response back as SSE.
     */
    public function analyze(Request $request)
    {
        set_time_limit(0);

        $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);

        $startDate = Carbon::parse($request->input('start_date'));
        $endDate = Carbon::parse($request->input('end_date'));

        // Load AI settings
        $settings = Setting::pluck('value', 'key');
        $aiEndpoint = rtrim($settings['ai_api_endpoint'] ?? '', '/');
        $aiModel = $settings['ai_model'] ?? '';
        $aiApiKey = $settings['ai_api_key'] ?? '';

        if (!$aiEndpoint || !$aiModel) {
            return response()->json([
                'error' => 'AI endpoint is not configured. Please visit Settings → AI Assistant to configure your AI model.'
            ], 422);
        }

        // Aggregate booking data for analysis
        $dataSummary = $this->aggregateBookingData($startDate, $endDate);

        // Build the analytics system prompt
        $systemPrompt = $this->buildAnalyticsPrompt($dataSummary, $startDate, $endDate);

        $userMessage = "Analyze the booking data provided in the system context. Provide a thorough analysis structured into the four sections: Descriptive, Diagnostic, Predictive, and Prescriptive. Be specific, reference actual numbers from the data, and provide actionable insights.";

        // Stream the AI response
        return response()->stream(function () use ($aiEndpoint, $aiModel, $aiApiKey, $systemPrompt, $userMessage) {

            $isOllama = str_contains($aiEndpoint, '11434')
                || str_contains($aiEndpoint, '/api/')
                || preg_match('/localhost|127\.0\.0\.1/', $aiEndpoint);

            if ($isOllama) {
                $this->streamOllama($aiEndpoint, $aiModel, $systemPrompt, $userMessage);
            } else {
                $this->streamOpenAI($aiEndpoint, $aiModel, $aiApiKey, $systemPrompt, $userMessage);
            }

            echo "data: [DONE]\n\n";
            ob_flush();
            flush();

        }, 200, [
            'Cache-Control' => 'no-cache',
            'X-Accel-Buffering' => 'no',
            'Content-Type' => 'text/event-stream',
        ]);
    }

    /**
     * Aggregate all booking data into a structured summary for the AI.
     */
    private function aggregateBookingData(Carbon $startDate, Carbon $endDate): array
    {
        $bookings = $this->repository->getBookingsWithinRange($startDate, $endDate);
        $periodDays = $startDate->diffInDays($endDate) + 1;

        // Previous period of equal length for comparison
        $prevEnd = $startDate->copy()->subDay();
        $prevStart = $prevEnd->copy()->subDays($periodDays - 1);
        $prevBookings = $this->repository->getBookingsWithinRange($prevStart, $prevEnd);

        // Current period stats
        $totalBookings = $bookings->count();
        $totalRevenue = $bookings->sum('total_price');
        $totalBags = $bookings->sum(fn($b) => $b->items->sum('quantity'));

        // Previous period stats
        $prevTotalBookings = $prevBookings->count();
        $prevTotalRevenue = $prevBookings->sum('total_price');
        $prevTotalBags = $prevBookings->sum(fn($b) => $b->items->sum('quantity'));

        // Source distribution
        $onlineCount = $bookings->where('source', 'online')->count();
        $walkinCount = $bookings->where('source', 'walk-in')->count();
        $prevOnline = $prevBookings->where('source', 'online')->count();
        $prevWalkin = $prevBookings->where('source', 'walk-in')->count();

        // Status distribution
        $statusCounts = $bookings->groupBy('status')->map->count()->toArray();

        // Day-of-week distribution
        $dowCounts = [];
        foreach ($bookings as $b) {
            $day = $b->created_at->format('l');
            $dowCounts[$day] = ($dowCounts[$day] ?? 0) + 1;
        }

        // Daily breakdown
        $dailyBreakdown = [];
        $period = CarbonPeriod::create($startDate, $endDate);
        foreach ($period as $date) {
            $key = $date->format('Y-m-d');
            $dayBookings = $bookings->filter(fn($b) => $b->created_at->format('Y-m-d') === $key);
            $dailyBreakdown[] = [
                'date' => $key,
                'day' => $date->format('l'),
                'bookings' => $dayBookings->count(),
                'revenue' => round($dayBookings->sum('total_price'), 2),
                'bags' => $dayBookings->sum(fn($b) => $b->items->sum('quantity')),
            ];
        }

        // Peak and low days
        $peakDay = collect($dailyBreakdown)->sortByDesc('bookings')->first();
        $lowDay = collect($dailyBreakdown)->sortBy('bookings')->first();

        // Hourly distribution (hour of booking creation)
        $hourlyCounts = [];
        foreach ($bookings as $b) {
            $hour = $b->created_at->format('H:00');
            $hourlyCounts[$hour] = ($hourlyCounts[$hour] ?? 0) + 1;
        }
        ksort($hourlyCounts);

        // Bag size distribution
        $bagSizes = [];
        foreach ($bookings as $b) {
            foreach ($b->items as $item) {
                $type = $item->item_type;
                $bagSizes[$type] = ($bagSizes[$type] ?? 0) + $item->quantity;
            }
        }

        return [
            'period' => [
                'start' => $startDate->format('Y-m-d'),
                'end' => $endDate->format('Y-m-d'),
                'days' => $periodDays,
            ],
            'current' => [
                'total_bookings' => $totalBookings,
                'total_revenue' => round($totalRevenue, 2),
                'total_bags' => $totalBags,
                'avg_booking_value' => $totalBookings > 0 ? round($totalRevenue / $totalBookings, 2) : 0,
                'avg_bags_per_booking' => $totalBookings > 0 ? round($totalBags / $totalBookings, 1) : 0,
                'daily_avg_bookings' => $periodDays > 0 ? round($totalBookings / $periodDays, 1) : 0,
                'daily_avg_revenue' => $periodDays > 0 ? round($totalRevenue / $periodDays, 2) : 0,
            ],
            'previous_period' => [
                'start' => $prevStart->format('Y-m-d'),
                'end' => $prevEnd->format('Y-m-d'),
                'total_bookings' => $prevTotalBookings,
                'total_revenue' => round($prevTotalRevenue, 2),
                'total_bags' => $prevTotalBags,
                'online' => $prevOnline,
                'walkin' => $prevWalkin,
            ],
            'sources' => [
                'online' => $onlineCount,
                'walkin' => $walkinCount,
            ],
            'status_distribution' => $statusCounts,
            'day_of_week' => $dowCounts,
            'hourly_distribution' => $hourlyCounts,
            'bag_size_distribution' => $bagSizes,
            'daily_breakdown' => $dailyBreakdown,
            'peak_day' => $peakDay,
            'lowest_day' => $lowDay,
        ];
    }

    /**
     * Build the analytics-specific system prompt for the AI model.
     */
    private function buildAnalyticsPrompt(array $data, Carbon $startDate, Carbon $endDate): string
    {
        $json = json_encode($data, JSON_PRETTY_PRINT);

        return <<<PROMPT
You are a Senior Business Intelligence Analyst for Tarragon Manila, a premium luggage storage service. You analyze booking data with expert precision and deliver boardroom-ready insights.

BOOKING DATA FOR ANALYSIS:
{$json}

ANALYSIS FORMAT — You MUST structure your response using these exact markdown headers:

## 📊 Descriptive Analysis — What Happened
Summarize the key events and patterns from this period. Include:
- Overall performance metrics (bookings, revenue, bags)
- Daily and weekly patterns (peak vs low days)
- Source channel breakdown (online vs walk-in)
- Status distribution and completion rates
- Bag size preferences
- Hourly booking patterns

## 🔍 Diagnostic Analysis — Why It Happened
Explain the causes behind observed trends:
- Compare current vs previous period — explain the growth or decline
- Identify what drove source channel changes
- Explain day-of-week patterns (weekday vs weekend demand)
- Correlate revenue changes with booking volume vs pricing
- Flag any anomalies or unusual patterns

## 📈 Predictive Analysis — What Will Happen
Forecast future performance based on the data trends:
- Project next period's booking volume and revenue
- Identify expected peak demand days
- Predict source channel trajectory (online growing or declining?)
- Estimate capacity requirements
- Flag potential risk scenarios

## 💡 Prescriptive Analysis — What To Do About It
Provide specific, actionable recommendations:
- Marketing and promotion strategies
- Staffing and operational adjustments
- Pricing optimization opportunities
- Channel investment priorities
- Customer experience improvements

RULES:
- Use specific numbers from the data, never vague statements
- Currency is PHP (Philippine Peso)
- Compare current vs previous period with percentage changes
- Keep each section focused and concise (3-5 bullet points each)
- Use bold for key metrics and percentages
- If data is insufficient (e.g., zero bookings), note the limitation honestly
PROMPT;
    }

    /**
     * Stream response from Ollama.
     */
    private function streamOllama(string $endpoint, string $model, string $systemPrompt, string $userMessage): void
    {
        $parsed = parse_url($endpoint);
        $baseUrl = ($parsed['scheme'] ?? 'http') . '://' . ($parsed['host'] ?? 'localhost') . (!empty($parsed['port']) ? ':' . $parsed['port'] : '');
        $chatUrl = $baseUrl . '/api/chat';

        try {
            $response = Http::timeout(180)->withOptions(['stream' => true])->post($chatUrl, [
                'model' => $model,
                'messages' => [
                    ['role' => 'system', 'content' => $systemPrompt],
                    ['role' => 'user', 'content' => $userMessage],
                ],
                'stream' => true,
            ]);

            if ($response->successful()) {
                $stream = $response->toPsrResponse()->getBody()->detach();
                while (!feof($stream)) {
                    $line = fgets($stream);
                    if ($line === false || empty(trim($line))) continue;

                    $data = json_decode($line, true);
                    if ($data && isset($data['message']['content'])) {
                        echo "data: " . json_encode(['text' => $data['message']['content']]) . "\n\n";
                        ob_flush();
                        flush();
                    }
                }
            } else {
                echo "data: " . json_encode(['text' => 'Failed to connect to AI model. Please check your AI Assistant settings.']) . "\n\n";
                ob_flush();
                flush();
            }
        } catch (\Exception $e) {
            echo "data: " . json_encode(['text' => 'AI connection error: ' . $e->getMessage()]) . "\n\n";
            ob_flush();
            flush();
        }
    }

    /**
     * Stream response from OpenAI-compatible endpoint.
     */
    private function streamOpenAI(string $endpoint, string $model, string $apiKey, string $systemPrompt, string $userMessage): void
    {
        $parsed = parse_url($endpoint);
        $baseUrl = ($parsed['scheme'] ?? 'https') . '://' . ($parsed['host'] ?? '');
        if (!empty($parsed['port'])) {
            $baseUrl .= ':' . $parsed['port'];
        }
        $chatUrl = rtrim($baseUrl, '/') . '/v1/chat/completions';

        $headers = [];
        if ($apiKey) {
            $headers['Authorization'] = 'Bearer ' . $apiKey;
        }

        try {
            $response = Http::withHeaders($headers)
                ->timeout(180)
                ->withOptions(['stream' => true])
                ->post($chatUrl, [
                    'model' => $model,
                    'messages' => [
                        ['role' => 'system', 'content' => $systemPrompt],
                        ['role' => 'user', 'content' => $userMessage],
                    ],
                    'stream' => true,
                ]);

            if ($response->successful()) {
                $stream = $response->toPsrResponse()->getBody()->detach();
                while (!feof($stream)) {
                    $line = fgets($stream);
                    if ($line === false) continue;

                    $line = trim($line);
                    if (str_starts_with($line, 'data: ')) {
                        $jsonStr = substr($line, 6);
                        if ($jsonStr === '[DONE]') continue;
                        $data = json_decode($jsonStr, true);
                        if ($data && isset($data['choices'][0]['delta']['content'])) {
                            echo "data: " . json_encode(['text' => $data['choices'][0]['delta']['content']]) . "\n\n";
                            ob_flush();
                            flush();
                        }
                    }
                }
            } else {
                echo "data: " . json_encode(['text' => 'AI API connection failed. Check your endpoint and API key in Settings.']) . "\n\n";
                ob_flush();
                flush();
            }
        } catch (\Exception $e) {
            echo "data: " . json_encode(['text' => 'AI Stream Error: ' . $e->getMessage()]) . "\n\n";
            ob_flush();
            flush();
        }
    }
}

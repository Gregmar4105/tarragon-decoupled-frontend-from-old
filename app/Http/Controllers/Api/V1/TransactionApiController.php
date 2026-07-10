<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\TransactionResource;
use App\Repositories\TransactionRepository;
use App\Services\TransactionService;
use Illuminate\Http\Request;

class TransactionApiController extends Controller
{
    public function __construct(
        protected TransactionRepository $repository,
        protected TransactionService $service
    ) {}

    /**
     * Get transaction ledger data and calculated stats.
     */
    public function index(Request $request)
    {
        $filters = $request->only(['start_date', 'end_date', 'source', 'method']);

        $query = $this->repository->getFilteredQuery($filters);
        $transactions = $query->get();

        return response()->json([
            'data' => TransactionResource::collection($transactions)->resolve(),
            'stats' => $this->service->calculateStats($query),
        ]);
    }

    /**
     * Export transaction ledger as CSV.
     */
    public function export(Request $request)
    {
        $filters = $request->only(['start_date', 'end_date', 'source', 'method']);
        $query = $this->repository->getFilteredQuery($filters);

        return $this->service->exportCsv($query);
    }
}

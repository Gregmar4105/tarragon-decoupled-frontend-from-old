<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Repositories\TransactionRepository;
use App\Services\TransactionService;
use App\Http\Resources\TransactionResource;

class TransactionController extends Controller
{
    private TransactionRepository $repository;
    private TransactionService $service;

    public function __construct(TransactionRepository $repository, TransactionService $service)
    {
        $this->repository = $repository;
        $this->service = $service;
    }

    public function index(Request $request)
    {
        $filters = $request->only(['start_date', 'end_date', 'source', 'method']);
        
        $query = $this->repository->getFilteredQuery($filters);
        
        // Retrieve data (Using get() to match existing UI compatibility without pagination for now)
        $transactions = $query->get();

        return Inertia::render('transactions/index', [
            'initialTransactions' => TransactionResource::collection($transactions)->resolve(),
            'stats' => $this->service->calculateStats($query),
            'filters' => $filters
        ]);
    }

    public function export(Request $request)
    {
        $filters = $request->only(['start_date', 'end_date', 'source', 'method']);
        $query = $this->repository->getFilteredQuery($filters);

        return $this->service->exportCsv($query);
    }
}

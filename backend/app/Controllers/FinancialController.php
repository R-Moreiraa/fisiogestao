<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Repositories\RedisRepository;
use App\Services\AuditLogService;

class FinancialController
{
    private RedisRepository $repo;
    private AuditLogService $audit;

    public function __construct()
    {
        $this->repo = new RedisRepository();
        $this->audit = new AuditLogService();
    }

    public function summary(): void
    {
        $transactions = $this->repo->all('transactions');
        $currentMonth = date('Y-m');

        $totalRevenue = 0.0;
        $totalExpenses = 0.0;
        $monthRevenue = 0.0;
        $monthExpenses = 0.0;
        $pendingReceivables = 0.0;
        $overdueReceivables = 0.0;

        $today = date('Y-m-d');

        foreach ($transactions as $tx) {
            $amount = (float)($tx['amount'] ?? 0);
            $type = $tx['type'] ?? 'receita';
            $status = $tx['status'] ?? 'pendente';
            $date = $tx['payment_date'] ?? $tx['due_date'] ?? substr($tx['created_at'] ?? '', 0, 10);

            if ($type === 'receita') {
                if ($status === 'pago') {
                    $totalRevenue += $amount;
                    if (str_starts_with($date, $currentMonth)) {
                        $monthRevenue += $amount;
                    }
                } elseif ($status === 'pendente') {
                    $pendingReceivables += $amount;
                    $dueDate = $tx['due_date'] ?? '';
                    if ($dueDate && $dueDate < $today) {
                        $overdueReceivables += $amount;
                    }
                }
            } elseif ($type === 'despesa') {
                if ($status === 'pago') {
                    $totalExpenses += $amount;
                    if (str_starts_with($date, $currentMonth)) {
                        $monthExpenses += $amount;
                    }
                }
            }
        }

        echo json_encode([
            'success' => true,
            'summary' => [
                'total_revenue' => $totalRevenue,
                'total_expenses' => $totalExpenses,
                'month_revenue' => $monthRevenue,
                'month_expenses' => $monthExpenses,
                'estimated_profit' => max(0, $monthRevenue - $monthExpenses),
                'pending_receivables' => $pendingReceivables,
                'overdue_receivables' => $overdueReceivables
            ]
        ]);
    }

    public function transactions(): void
    {
        $type = trim($_GET['type'] ?? ''); // receita, despesa
        $status = trim($_GET['status'] ?? ''); // pago, pendente, cancelado
        $patientId = trim($_GET['patient_id'] ?? '');

        $all = $this->repo->all('transactions');

        $filtered = array_filter($all, function($tx) use ($type, $status, $patientId) {
            if ($type !== '' && ($tx['type'] ?? '') !== $type) {
                return false;
            }
            if ($status !== '' && ($tx['status'] ?? '') !== $status) {
                return false;
            }
            if ($patientId !== '' && ($tx['patient_id'] ?? '') !== $patientId) {
                return false;
            }
            return true;
        });

        usort($filtered, fn($a, $b) => strcmp($b['created_at'] ?? '', $a['created_at'] ?? ''));

        echo json_encode(['success' => true, 'data' => array_values($filtered)]);
    }

    public function store(array $currentUser): void
    {
        $body = json_decode(file_get_contents('php://input'), true) ?: [];

        $type = $body['type'] ?? 'receita';
        $amount = (float)($body['amount'] ?? 0);
        $description = trim($body['description'] ?? '');

        if ($amount <= 0 || empty($description)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Valor e descrição são obrigatórios.']);
            return;
        }

        $receiptNumber = 'REC-' . date('Y') . '-' . str_pad((string)random_int(100, 9999), 5, '0', STR_PAD_LEFT);

        $txData = [
            'type' => $type, // receita, despesa
            'category' => $body['category'] ?? 'Atendimento Fisioterapêutico',
            'description' => $description,
            'patient_id' => $body['patient_id'] ?? null,
            'patient_name' => $body['patient_name'] ?? null,
            'amount' => $amount,
            'payment_method' => $body['payment_method'] ?? 'Pix', // Pix, Dinheiro, Cartão de Crédito, Cartão de Débito, Transferência
            'status' => $body['status'] ?? 'pago', // pago, pendente
            'payment_date' => ($body['status'] ?? 'pago') === 'pago' ? ($body['payment_date'] ?? date('Y-m-d')) : null,
            'due_date' => $body['due_date'] ?? null,
            'receipt_number' => $receiptNumber,
            'treatment_plan_id' => $body['treatment_plan_id'] ?? null,
            'notes' => $body['notes'] ?? ''
        ];

        $saved = $this->repo->save('transactions', $txData);

        if (!empty($saved['patient_id'])) {
            $this->repo->addToIndex("transactions:by_patient:{$saved['patient_id']}", $saved['id']);
        }

        $this->audit->log('create_transaction', 'transactions', $saved['id'], [
            'type' => $type,
            'amount' => $amount,
            'description' => $description
        ], $currentUser);

        echo json_encode([
            'success' => true,
            'message' => 'Lançamento financeiro registrado com sucesso!',
            'data' => $saved
        ]);
    }

    public function updateStatus(string $id, array $currentUser): void
    {
        $tx = $this->repo->find('transactions', $id);
        if (!$tx) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Lançamento não encontrado.']);
            return;
        }

        $body = json_decode(file_get_contents('php://input'), true) ?: [];
        $status = trim($body['status'] ?? 'pago');

        $tx['status'] = $status;
        if ($status === 'pago' && empty($tx['payment_date'])) {
            $tx['payment_date'] = date('Y-m-d');
        }

        $saved = $this->repo->save('transactions', $tx);
        $this->audit->log('update_transaction_status', 'transactions', $id, ['status' => $status], $currentUser);

        echo json_encode([
            'success' => true,
            'message' => 'Situação financeira atualizada com sucesso.',
            'data' => $saved
        ]);
    }
}


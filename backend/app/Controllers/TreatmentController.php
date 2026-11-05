<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Repositories\RedisRepository;
use App\Services\AuditLogService;

class TreatmentController
{
    private RedisRepository $repo;
    private AuditLogService $audit;

    public function __construct()
    {
        $this->repo = new RedisRepository();
        $this->audit = new AuditLogService();
    }

    public function index(): void
    {
        $patientId = trim($_GET['patient_id'] ?? '');
        $status = trim($_GET['status'] ?? '');

        $all = $this->repo->all('treatment_plans');

        $filtered = array_filter($all, function($t) use ($patientId, $status) {
            if ($patientId !== '' && ($t['patient_id'] ?? '') !== $patientId) {
                return false;
            }
            if ($status !== '' && ($t['status'] ?? '') !== $status) {
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

        $patientId = trim($body['patient_id'] ?? '');
        $totalSessions = max(1, (int)($body['total_sessions'] ?? 10));
        $title = trim($body['title'] ?? '');

        if (empty($patientId) || empty($title)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Informe o paciente e o título do tratamento.']);
            return;
        }

        $patient = $this->repo->find('patients', $patientId);
        $professionalId = $body['professional_id'] ?? ($currentUser['professional_id'] ?? 'pro_1');
        $pro = $this->repo->find('professionals', $professionalId);

        $planData = [
            'patient_id' => $patientId,
            'patient_name' => $patient['name'] ?? ($body['patient_name'] ?? 'Paciente'),
            'professional_id' => $professionalId,
            'professional_name' => $pro['name'] ?? ($body['professional_name'] ?? 'Fisioterapeuta'),
            'title' => $title,
            'diagnosis' => $body['diagnosis'] ?? '',
            'total_sessions' => $totalSessions,
            'completed_sessions' => 0,
            'remaining_sessions' => $totalSessions,
            'frequency' => $body['frequency'] ?? '2 vezes por semana',
            'status' => 'em_andamento',
            'start_date' => $body['start_date'] ?? date('Y-m-d'),
            'price' => (float)($body['price'] ?? 0.0),
            'shared_with_patient' => true,
            'therapeutic_goals' => $body['therapeutic_goals'] ?? ''
        ];

        $saved = $this->repo->save('treatment_plans', $planData);
        $this->repo->addToIndex("treatment_plans:by_patient:{$patientId}", $saved['id']);

        $this->audit->log('create_treatment_plan', 'treatment_plans', $saved['id'], [
            'patient' => $saved['patient_name'],
            'total_sessions' => $totalSessions
        ], $currentUser);

        echo json_encode([
            'success' => true,
            'message' => 'Plano de tratamento criado com sucesso!',
            'data' => $saved
        ]);
    }

    public function deductSession(string $id, array $currentUser): void
    {
        $plan = $this->repo->find('treatment_plans', $id);
        if (!$plan) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Plano de tratamento não encontrado.']);
            return;
        }

        $body = json_decode(file_get_contents('php://input'), true) ?: [];
        $appointmentId = $body['appointment_id'] ?? null;

        // Prevent duplicate deduction for the exact appointment if provided
        if ($appointmentId) {
            $deductionKey = "session_deducted:apt:{$appointmentId}";
            if ($this->repo->find('session_deductions', $appointmentId)) {
                http_response_code(409);
                echo json_encode(['success' => false, 'message' => 'Esta sessão já recebeu baixa anteriormente.']);
                return;
            }
        }

        $remaining = (int)($plan['remaining_sessions'] ?? 0);
        if ($remaining <= 0) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Não há sessões restantes neste plano de tratamento. Todas as sessões já foram realizadas.']);
            return;
        }

        // Controlled atomic deduction
        $plan['completed_sessions'] = ((int)($plan['completed_sessions'] ?? 0)) + 1;
        $plan['remaining_sessions'] = $remaining - 1;

        if ($plan['remaining_sessions'] === 0) {
            $plan['status'] = 'concluido';
            $plan['completion_date'] = date('Y-m-d');
        }

        $saved = $this->repo->save('treatment_plans', $plan);

        // Mark appointment deduction record if provided
        if ($appointmentId) {
            $this->repo->save('session_deductions', [
                'id' => $appointmentId,
                'treatment_plan_id' => $id,
                'deducted_at' => date('c'),
                'deducted_by' => $currentUser['name'] ?? 'Profissional'
            ]);
        }

        $this->audit->log('deduct_treatment_session', 'treatment_plans', $id, [
            'completed' => $saved['completed_sessions'],
            'remaining' => $saved['remaining_sessions'],
            'status' => $saved['status']
        ], $currentUser);

        echo json_encode([
            'success' => true,
            'message' => "Baixa de sessão realizada com sucesso! ({$saved['completed_sessions']}/{$saved['total_sessions']} concluídas)",
            'data' => $saved
        ]);
    }

    public function updateStatus(string $id, array $currentUser): void
    {
        $plan = $this->repo->find('treatment_plans', $id);
        if (!$plan) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Plano não encontrado.']);
            return;
        }

        $body = json_decode(file_get_contents('php://input'), true) ?: [];
        $status = trim($body['status'] ?? '');

        if (!in_array($status, ['em_andamento', 'concluido', 'suspenso'], true)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Status inválido.']);
            return;
        }

        $plan['status'] = $status;
        $saved = $this->repo->save('treatment_plans', $plan);

        $this->audit->log('change_treatment_status', 'treatment_plans', $id, ['status' => $status], $currentUser);

        echo json_encode([
            'success' => true,
            'message' => 'Status do tratamento atualizado com sucesso.',
            'data' => $saved
        ]);
    }
}


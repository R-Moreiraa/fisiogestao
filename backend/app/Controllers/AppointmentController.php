<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Repositories\RedisRepository;
use App\Services\AuditLogService;

class AppointmentController
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
        $date = trim($_GET['date'] ?? '');
        $startDate = trim($_GET['start_date'] ?? '');
        $endDate = trim($_GET['end_date'] ?? '');
        $professionalId = trim($_GET['professional_id'] ?? '');
        $patientId = trim($_GET['patient_id'] ?? '');
        $status = trim($_GET['status'] ?? '');

        $appointments = $this->repo->all('appointments');

        $filtered = array_filter($appointments, function($a) use ($date, $startDate, $endDate, $professionalId, $patientId, $status) {
            $aptDate = $a['date'] ?? '';

            if ($date !== '' && $aptDate !== $date) {
                return false;
            }
            if ($startDate !== '' && $aptDate < $startDate) {
                return false;
            }
            if ($endDate !== '' && $aptDate > $endDate) {
                return false;
            }
            if ($professionalId !== '' && ($a['professional_id'] ?? '') !== $professionalId) {
                return false;
            }
            if ($patientId !== '' && ($a['patient_id'] ?? '') !== $patientId) {
                return false;
            }
            if ($status !== '' && ($a['status'] ?? '') !== $status) {
                return false;
            }
            return true;
        });

        // Sort by date asc, time asc
        usort($filtered, function($a, $b) {
            $cmp = strcmp($a['date'] ?? '', $b['date'] ?? '');
            if ($cmp !== 0) return $cmp;
            return strcmp($a['time'] ?? '00:00', $b['time'] ?? '00:00');
        });

        echo json_encode([
            'success' => true,
            'data' => array_values($filtered)
        ]);
    }

    public function store(array $currentUser): void
    {
        $body = json_decode(file_get_contents('php://input'), true) ?: [];

        $patientId = trim($body['patient_id'] ?? '');
        $professionalId = trim($body['professional_id'] ?? '');
        $date = trim($body['date'] ?? '');
        $time = trim($body['time'] ?? '');
        $duration = (int)($body['duration_minutes'] ?? 50);

        if (empty($patientId) || empty($professionalId) || empty($date) || empty($time)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Paciente, profissional, data e horário são obrigatórios.']);
            return;
        }

        // Conflict check: Check whether professional or patient already has an overlapping appointment
        $conflict = $this->checkTimeConflict($professionalId, $patientId, $date, $time, $duration);
        if ($conflict) {
            http_response_code(409);
            echo json_encode([
                'success' => false,
                'message' => "Conflito de agenda detectado! {$conflict}"
            ]);
            return;
        }

        $patient = $this->repo->find('patients', $patientId);
        $professional = $this->repo->find('professionals', $professionalId);

        $appointmentData = [
            'patient_id' => $patientId,
            'patient_name' => $patient['name'] ?? ($body['patient_name'] ?? 'Paciente'),
            'professional_id' => $professionalId,
            'professional_name' => $professional['name'] ?? ($body['professional_name'] ?? 'Profissional'),
            'date' => $date,
            'time' => $time,
            'duration_minutes' => $duration,
            'service_type' => $body['service_type'] ?? 'Fisioterapia Individual',
            'procedure' => $body['procedure'] ?? 'Atendimento Clínico',
            'treatment_plan_id' => $body['treatment_plan_id'] ?? null,
            'room' => $body['room'] ?? 'Sala 01',
            'status' => $body['status'] ?? 'agendado', // agendado, confirmado, em_atendimento, realizado, falta, cancelado
            'notes' => $body['notes'] ?? ''
        ];

        $saved = $this->repo->save('appointments', $appointmentData);

        // Update secondary sets
        $this->repo->addToIndex("appointments:by_patient:{$patientId}", $saved['id']);
        $this->repo->addToIndex("appointments:by_pro:{$professionalId}", $saved['id']);
        $this->repo->addToIndex("appointments:by_date:{$date}", $saved['id']);

        $this->audit->log('create_appointment', 'appointments', $saved['id'], [
            'patient' => $saved['patient_name'],
            'date' => $date,
            'time' => $time
        ], $currentUser);

        echo json_encode([
            'success' => true,
            'message' => 'Agendamento cadastrado com sucesso!',
            'appointment' => $saved
        ]);
    }

    public function update(string $id, array $currentUser): void
    {
        $existing = $this->repo->find('appointments', $id);
        if (!$existing) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Agendamento não encontrado.']);
            return;
        }

        $body = json_decode(file_get_contents('php://input'), true) ?: [];

        $professionalId = trim($body['professional_id'] ?? $existing['professional_id']);
        $patientId = trim($body['patient_id'] ?? $existing['patient_id']);
        $date = trim($body['date'] ?? $existing['date']);
        $time = trim($body['time'] ?? $existing['time']);
        $duration = (int)($body['duration_minutes'] ?? $existing['duration_minutes'] ?? 50);

        // If date/time/pro changed, check conflict excluding this appointment ID
        if ($date !== $existing['date'] || $time !== $existing['time'] || $professionalId !== $existing['professional_id']) {
            $conflict = $this->checkTimeConflict($professionalId, $patientId, $date, $time, $duration, $id);
            if ($conflict) {
                http_response_code(409);
                echo json_encode(['success' => false, 'message' => "Conflito de agenda detectado! {$conflict}"]);
                return;
            }
        }

        foreach ($body as $key => $val) {
            if ($key !== 'id' && $key !== 'created_at') {
                $existing[$key] = $val;
            }
        }

        $saved = $this->repo->save('appointments', $existing);
        $this->audit->log('update_appointment', 'appointments', $id, ['date' => $saved['date'], 'time' => $saved['time']], $currentUser);

        echo json_encode([
            'success' => true,
            'message' => 'Agendamento atualizado com sucesso.',
            'appointment' => $saved
        ]);
    }

    public function updateStatus(string $id, array $currentUser): void
    {
        $existing = $this->repo->find('appointments', $id);
        if (!$existing) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Agendamento não encontrado.']);
            return;
        }

        $body = json_decode(file_get_contents('php://input'), true) ?: [];
        $status = trim($body['status'] ?? '');

        $validStatuses = ['agendado', 'confirmado', 'em_atendimento', 'realizado', 'falta', 'cancelado'];
        if (!in_array($status, $validStatuses, true)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Status inválido.']);
            return;
        }

        $existing['status'] = $status;
        $saved = $this->repo->save('appointments', $existing);

        $this->audit->log('change_appointment_status', 'appointments', $id, ['status' => $status], $currentUser);

        echo json_encode([
            'success' => true,
            'message' => "Status alterado para '{$status}' com sucesso.",
            'appointment' => $saved
        ]);
    }

    public function delete(string $id, array $currentUser): void
    {
        $existing = $this->repo->find('appointments', $id);
        if (!$existing) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Agendamento não encontrado.']);
            return;
        }

        $this->repo->delete('appointments', $id);
        $this->audit->log('delete_appointment', 'appointments', $id, ['patient' => $existing['patient_name'] ?? ''], $currentUser);

        echo json_encode(['success' => true, 'message' => 'Agendamento excluído com sucesso.']);
    }

    private function checkTimeConflict(string $proId, string $patientId, string $date, string $time, int $duration, ?string $excludeId = null): ?string
    {
        $all = $this->repo->all('appointments');
        $newStart = strtotime("{$date} {$time}");
        $newEnd = $newStart + ($duration * 60);

        foreach ($all as $a) {
            if ($excludeId && ($a['id'] ?? '') === $excludeId) {
                continue;
            }
            if (($a['status'] ?? '') === 'cancelado') {
                continue;
            }
            if (($a['date'] ?? '') !== $date) {
                continue;
            }

            $existingStart = strtotime("{$a['date']} {$a['time']}");
            $existingDuration = (int)($a['duration_minutes'] ?? 50);
            $existingEnd = $existingStart + ($existingDuration * 60);

            // Overlap condition
            if ($newStart < $existingEnd && $newEnd > $existingStart) {
                if (($a['professional_id'] ?? '') === $proId) {
                    $proName = $a['professional_name'] ?? 'O profissional';
                    return "{$proName} já possui um atendimento das {$a['time']} às " . date('H:i', $existingEnd) . ".";
                }
                if (($a['patient_id'] ?? '') === $patientId) {
                    $patientName = $a['patient_name'] ?? 'Este paciente';
                    return "{$patientName} já possui um agendamento marcado para o mesmo horário.";
                }
            }
        }

        return null;
    }
}


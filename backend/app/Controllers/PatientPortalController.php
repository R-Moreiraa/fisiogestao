<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Repositories\RedisRepository;
use App\Services\AuditLogService;
use App\Services\AuthService;

class PatientPortalController
{
    private RedisRepository $repo;
    private AuditLogService $audit;
    private AuthService $auth;

    public function __construct()
    {
        $this->repo = new RedisRepository();
        $this->audit = new AuditLogService();
        $this->auth = new AuthService();
    }

    private function getPatientId(array $currentUser): string
    {
        $patientId = $currentUser['patient_id'] ?? null;
        if (!$patientId) {
            // Find by user email or cpf
            $patients = $this->repo->all('patients');
            foreach ($patients as $p) {
                if (!empty($currentUser['email']) && strcasecmp($p['email'] ?? '', $currentUser['email']) === 0) {
                    return $p['id'];
                }
            }
            return 'pat_1'; // fallback sample
        }
        return $patientId;
    }

    public function dashboard(array $currentUser): void
    {
        $patientId = $this->getPatientId($currentUser);
        $patient = $this->repo->find('patients', $patientId);

        $today = date('Y-m-d');
        $allApts = $this->repo->all('appointments');
        $myApts = array_values(array_filter($allApts, fn($a) => ($a['patient_id'] ?? '') === $patientId));

        // Find next upcoming appointment
        $futureApts = array_filter($myApts, fn($a) => 
            (($a['date'] ?? '') > $today || (($a['date'] ?? '') === $today && ($a['time'] ?? '00:00') >= date('H:i'))) &&
            in_array($a['status'] ?? '', ['agendado', 'confirmado'], true)
        );
        usort($futureApts, fn($a, $b) => strcmp(($a['date'] . $a['time']), ($b['date'] . $b['time'])));
        $nextAppointment = !empty($futureApts) ? reset($futureApts) : null;

        // Current active treatment plan
        $allPlans = $this->repo->all('treatment_plans');
        $myPlans = array_values(array_filter($allPlans, fn($p) => ($p['patient_id'] ?? '') === $patientId && ($p['status'] ?? '') === 'em_andamento'));
        $activePlan = !empty($myPlans) ? $myPlans[0] : null;

        // Evolutions (shared only)
        $allEvos = $this->repo->all('clinical_evolutions');
        $myEvos = array_values(array_filter($allEvos, fn($e) => 
            ($e['patient_id'] ?? '') === $patientId && ($e['shared_with_patient'] ?? true)
        ));
        usort($myEvos, fn($a, $b) => strcmp($b['session_date'] ?? $b['created_at'] ?? '', $a['session_date'] ?? $a['created_at'] ?? ''));

        // Financial
        $allTx = $this->repo->all('transactions');
        $myTx = array_values(array_filter($allTx, fn($t) => ($t['patient_id'] ?? '') === $patientId));
        $pendingAmount = 0.0;
        foreach ($myTx as $t) {
            if (($t['type'] ?? '') === 'receita' && ($t['status'] ?? '') === 'pendente') {
                $pendingAmount += (float)($t['amount'] ?? 0);
            }
        }

        echo json_encode([
            'success' => true,
            'patient' => $patient,
            'next_appointment' => $nextAppointment,
            'active_treatment' => $activePlan,
            'recent_evolutions' => array_slice($myEvos, 0, 5),
            'pending_payment_amount' => $pendingAmount,
            'appointments_count' => count($myApts)
        ]);
    }

    public function appointments(array $currentUser): void
    {
        $patientId = $this->getPatientId($currentUser);
        $allApts = $this->repo->all('appointments');
        $myApts = array_values(array_filter($allApts, fn($a) => ($a['patient_id'] ?? '') === $patientId));

        usort($myApts, fn($a, $b) => strcmp($b['date'] . $b['time'], $a['date'] . $a['time']));

        echo json_encode(['success' => true, 'data' => $myApts]);
    }

    public function requestReschedule(array $currentUser): void
    {
        $patientId = $this->getPatientId($currentUser);
        $body = json_decode(file_get_contents('php://input'), true) ?: [];

        $appointmentId = $body['appointment_id'] ?? '';
        $type = $body['request_type'] ?? 'reagendamento'; // reagendamento, cancelamento
        $reason = trim($body['reason'] ?? '');
        $preferredDate = $body['preferred_date'] ?? '';

        if (empty($appointmentId) || empty($reason)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Informe o agendamento e o motivo da solicitação.']);
            return;
        }

        $apt = $this->repo->find('appointments', $appointmentId);
        if (!$apt || ($apt['patient_id'] ?? '') !== $patientId) {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'Agendamento inválido.']);
            return;
        }

        // Store request for clinic management
        $rescheduleData = [
            'patient_id' => $patientId,
            'patient_name' => $currentUser['name'] ?? 'Paciente',
            'appointment_id' => $appointmentId,
            'original_date' => $apt['date'],
            'original_time' => $apt['time'],
            'type' => $type,
            'reason' => $reason,
            'preferred_date' => $preferredDate,
            'status' => 'pendente_aprovacao'
        ];

        $saved = $this->repo->save('reschedule_requests', $rescheduleData);

        // Update appointment notes to reflect the pending request
        $apt['reschedule_pending'] = true;
        $apt['reschedule_request_id'] = $saved['id'];
        $this->repo->save('appointments', $apt);

        $this->audit->log('patient_reschedule_request', 'reschedule_requests', $saved['id'], [
            'type' => $type,
            'reason' => $reason
        ], $currentUser);

        echo json_encode([
            'success' => true,
            'message' => 'Sua solicitação foi enviada para a recepção da clínica e será analisada com prioridade.',
            'data' => $saved
        ]);
    }

    public function treatments(array $currentUser): void
    {
        $patientId = $this->getPatientId($currentUser);
        $all = $this->repo->all('treatment_plans');
        $myPlans = array_values(array_filter($all, fn($p) => ($p['patient_id'] ?? '') === $patientId && ($p['shared_with_patient'] ?? true)));

        usort($myPlans, fn($a, $b) => strcmp($b['created_at'] ?? '', $a['created_at'] ?? ''));

        echo json_encode(['success' => true, 'data' => $myPlans]);
    }

    public function clinicalHistory(array $currentUser): void
    {
        $patientId = $this->getPatientId($currentUser);
        $all = $this->repo->all('clinical_evolutions');
        // Only return evolutions shared by physiotherapist
        $myEvos = array_values(array_filter($all, fn($e) => 
            ($e['patient_id'] ?? '') === $patientId && ($e['shared_with_patient'] ?? true)
        ));

        usort($myEvos, fn($a, $b) => strcmp($b['session_date'] ?? $b['created_at'] ?? '', $a['session_date'] ?? $a['created_at'] ?? ''));

        echo json_encode(['success' => true, 'data' => $myEvos]);
    }

    public function financial(array $currentUser): void
    {
        $patientId = $this->getPatientId($currentUser);
        $all = $this->repo->all('transactions');
        $myTx = array_values(array_filter($all, fn($t) => ($t['patient_id'] ?? '') === $patientId));

        usort($myTx, fn($a, $b) => strcmp($b['created_at'] ?? '', $a['created_at'] ?? ''));

        echo json_encode(['success' => true, 'data' => $myTx]);
    }

    public function updateProfile(array $currentUser): void
    {
        $patientId = $this->getPatientId($currentUser);
        $patient = $this->repo->find('patients', $patientId);
        if (!$patient) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Paciente não encontrado.']);
            return;
        }

        $body = json_decode(file_get_contents('php://input'), true) ?: [];

        if (isset($body['phone'])) $patient['phone'] = trim($body['phone']);
        if (isset($body['whatsapp'])) $patient['whatsapp'] = trim($body['whatsapp']);
        if (isset($body['emergency_contact'])) $patient['emergency_contact'] = trim($body['emergency_contact']);
        if (isset($body['address'])) $patient['address'] = trim($body['address']);

        // Update password if requested
        if (!empty($body['new_password'])) {
            $user = $this->repo->find('users', $currentUser['id']);
            if ($user) {
                $user['password_hash'] = $this->auth->hashPassword($body['new_password']);
                $this->repo->save('users', $user);
            }
        }

        $saved = $this->repo->save('patients', $patient);
        $this->audit->log('patient_update_profile', 'patients', $patientId, [], $currentUser);

        echo json_encode([
            'success' => true,
            'message' => 'Seus dados foram atualizados com sucesso.',
            'patient' => $saved
        ]);
    }
}


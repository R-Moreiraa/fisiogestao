<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Repositories\RedisRepository;
use App\Services\AuditLogService;

class WebRequestController
{
    private RedisRepository $repo;
    private AuditLogService $audit;

    public function __construct()
    {
        $this->repo = new RedisRepository();
        $this->audit = new AuditLogService();
    }

    // Public endpoint called from Landing Page
    public function submitPublicRequest(): void
    {
        $body = json_decode(file_get_contents('php://input'), true) ?: [];

        $name = trim($body['name'] ?? '');
        $phone = trim($body['phone'] ?? '');
        $email = trim($body['email'] ?? '');
        $specialty = trim($body['specialty'] ?? 'Fisioterapia Traumato-Ortopédica');
        $preferredShift = trim($body['preferred_shift'] ?? 'Manhã');
        $preferredDate = trim($body['preferred_date'] ?? date('Y-m-d', strtotime('+2 days')));
        $message = trim($body['message'] ?? '');

        if (empty($name) || empty($phone)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Por favor, informe seu nome e telefone/WhatsApp para contato.']);
            return;
        }

        $requestData = [
            'name' => $name,
            'phone' => $phone,
            'email' => $email,
            'specialty' => $specialty,
            'preferred_shift' => $preferredShift,
            'preferred_date' => $preferredDate,
            'message' => $message,
            'status' => 'nova' // nova, em_analise, em_contato, confirmada, cancelada
        ];

        $saved = $this->repo->save('web_requests', $requestData);

        $this->audit->log('public_appointment_request', 'web_requests', $saved['id'], [
            'name' => $name,
            'phone' => $phone,
            'specialty' => $specialty
        ]);

        echo json_encode([
            'success' => true,
            'message' => 'Solicitação enviada com sucesso! Nossa equipe entrará em contato em breve para confirmar seu horário.',
            'request_id' => $saved['id']
        ]);
    }

    // Private management list
    public function index(): void
    {
        $status = trim($_GET['status'] ?? '');
        $all = $this->repo->all('web_requests');

        $filtered = array_filter($all, function($r) use ($status) {
            if ($status !== '' && ($r['status'] ?? '') !== $status) {
                return false;
            }
            return true;
        });

        usort($filtered, fn($a, $b) => strcmp($b['created_at'] ?? '', $a['created_at'] ?? ''));

        echo json_encode(['success' => true, 'data' => array_values($filtered)]);
    }

    public function updateStatus(string $id, array $currentUser): void
    {
        $req = $this->repo->find('web_requests', $id);
        if (!$req) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Solicitação não encontrada.']);
            return;
        }

        $body = json_decode(file_get_contents('php://input'), true) ?: [];
        $status = trim($body['status'] ?? '');

        $req['status'] = $status;
        $saved = $this->repo->save('web_requests', $req);

        $this->audit->log('update_web_request_status', 'web_requests', $id, ['status' => $status], $currentUser);

        echo json_encode([
            'success' => true,
            'message' => 'Situação da solicitação atualizada.',
            'data' => $saved
        ]);
    }

    // Convert web request to real patient and real appointment
    public function convertToAppointment(string $id, array $currentUser): void
    {
        $req = $this->repo->find('web_requests', $id);
        if (!$req) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Solicitação não encontrada.']);
            return;
        }

        $body = json_decode(file_get_contents('php://input'), true) ?: [];
        $professionalId = $body['professional_id'] ?? 'pro_1';
        $date = $body['date'] ?? ($req['preferred_date'] ?? date('Y-m-d'));
        $time = $body['time'] ?? '14:00';

        // 1. Check or create patient
        $allPatients = $this->repo->all('patients');
        $patient = null;
        foreach ($allPatients as $p) {
            if (
                (!empty($req['email']) && strcasecmp($p['email'] ?? '', $req['email']) === 0) ||
                (!empty($req['phone']) && ($p['phone'] ?? '') === $req['phone'])
            ) {
                $patient = $p;
                break;
            }
        }

        if (!$patient) {
            $patient = $this->repo->save('patients', [
                'name' => $req['name'],
                'phone' => $req['phone'],
                'whatsapp' => $req['phone'],
                'email' => $req['email'] ?? '',
                'clinical_notes' => 'Paciente originado da solicitação web da Landing Page: ' . ($req['message'] ?? ''),
                'status' => 'ativo'
            ]);
        }

        $pro = $this->repo->find('professionals', $professionalId);

        // 2. Create official appointment
        $apt = $this->repo->save('appointments', [
            'patient_id' => $patient['id'],
            'patient_name' => $patient['name'],
            'professional_id' => $professionalId,
            'professional_name' => $pro['name'] ?? 'Dr. Roberto Sullivan',
            'date' => $date,
            'time' => $time,
            'duration_minutes' => 50,
            'service_type' => 'Avaliação Inicial (' . ($req['specialty'] ?? 'Fisioterapia') . ')',
            'procedure' => 'Anamnese & Avaliação Funcional',
            'room' => 'Sala 01 - Avaliação',
            'status' => 'confirmado',
            'notes' => 'Agendamento originado de solicitação web.'
        ]);

        // 3. Mark web request as confirmada
        $req['status'] = 'confirmada';
        $req['converted_appointment_id'] = $apt['id'];
        $this->repo->save('web_requests', $req);

        $this->audit->log('convert_web_request', 'web_requests', $id, [
            'patient_id' => $patient['id'],
            'appointment_id' => $apt['id']
        ], $currentUser);

        echo json_encode([
            'success' => true,
            'message' => 'Solicitação confirmada e convertida em agendamento oficial com sucesso!',
            'appointment' => $apt,
            'patient' => $patient
        ]);
    }
}


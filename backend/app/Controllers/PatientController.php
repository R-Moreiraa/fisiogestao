<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Repositories\RedisRepository;
use App\Services\AuditLogService;
use App\Services\AuthService;
use App\Services\UpstashRedisClient;

class PatientController
{
    private RedisRepository $repo;
    private AuditLogService $audit;
    private AuthService $auth;
    private UpstashRedisClient $redis;

    public function __construct()
    {
        $this->repo = new RedisRepository();
        $this->audit = new AuditLogService();
        $this->auth = new AuthService();
        $this->redis = UpstashRedisClient::getInstance();
    }

    public function index(): void
    {
        $search = trim($_GET['search'] ?? '');
        $status = trim($_GET['status'] ?? '');
        $page = max(1, (int)($_GET['page'] ?? 1));
        $limit = max(1, min(100, (int)($_GET['limit'] ?? 20)));

        $allPatients = $this->repo->all('patients');

        // Filter
        $filtered = array_filter($allPatients, function($p) use ($search, $status) {
            if ($status !== '' && ($p['status'] ?? 'ativo') !== $status) {
                return false;
            }
            if ($search !== '') {
                $needle = mb_strtolower($search, 'UTF-8');
                $name = mb_strtolower($p['name'] ?? '', 'UTF-8');
                $cpf = $p['cpf'] ?? '';
                $phone = $p['phone'] ?? '';
                $email = mb_strtolower($p['email'] ?? '', 'UTF-8');

                if (
                    str_contains($name, $needle) ||
                    str_contains($cpf, $search) ||
                    str_contains($phone, $search) ||
                    str_contains($email, $needle)
                ) {
                    return true;
                }
                return false;
            }
            return true;
        });

        // Sort by created_at desc
        usort($filtered, fn($a, $b) => strcmp($b['created_at'] ?? '', $a['created_at'] ?? ''));

        $total = count($filtered);
        $offset = ($page - 1) * $limit;
        $items = array_slice($filtered, $offset, $limit);

        echo json_encode([
            'success' => true,
            'data' => array_values($items),
            'pagination' => [
                'total' => $total,
                'page' => $page,
                'limit' => $limit,
                'pages' => ceil($total / $limit)
            ]
        ]);
    }

    public function show(string $id): void
    {
        $patient = $this->repo->find('patients', $id);
        if (!$patient) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Paciente não encontrado.']);
            return;
        }

        // Fetch related data for individual profile tabs
        $allRecords = $this->repo->all('medical_records');
        $patientRecords = array_values(array_filter($allRecords, fn($r) => ($r['patient_id'] ?? '') === $id));
        usort($patientRecords, fn($a, $b) => strcmp($b['created_at'] ?? '', $a['created_at'] ?? ''));

        $allEvolutions = $this->repo->all('clinical_evolutions');
        $patientEvolutions = array_values(array_filter($allEvolutions, fn($e) => ($e['patient_id'] ?? '') === $id));
        usort($patientEvolutions, fn($a, $b) => strcmp($b['session_date'] ?? $b['created_at'] ?? '', $a['session_date'] ?? $a['created_at'] ?? ''));

        $allTreatments = $this->repo->all('treatment_plans');
        $patientTreatments = array_values(array_filter($allTreatments, fn($t) => ($t['patient_id'] ?? '') === $id));
        usort($patientTreatments, fn($a, $b) => strcmp($b['created_at'] ?? '', $a['created_at'] ?? ''));

        $allAppointments = $this->repo->all('appointments');
        $patientAppointments = array_values(array_filter($allAppointments, fn($a) => ($a['patient_id'] ?? '') === $id));
        usort($patientAppointments, fn($a, $b) => strcmp($b['date'] ?? '', $a['date'] ?? ''));

        $allTransactions = $this->repo->all('transactions');
        $patientTransactions = array_values(array_filter($allTransactions, fn($tx) => ($tx['patient_id'] ?? '') === $id));
        usort($patientTransactions, fn($a, $b) => strcmp($b['created_at'] ?? '', $a['created_at'] ?? ''));

        echo json_encode([
            'success' => true,
            'patient' => $patient,
            'medical_records' => $patientRecords,
            'clinical_evolutions' => $patientEvolutions,
            'treatment_plans' => $patientTreatments,
            'appointments' => $patientAppointments,
            'transactions' => $patientTransactions
        ]);
    }

    public function store(array $currentUser): void
    {
        $body = json_decode(file_get_contents('php://input'), true) ?: [];

        $name = trim($body['name'] ?? '');
        $cpf = trim($body['cpf'] ?? '');
        $phone = trim($body['phone'] ?? '');
        $email = trim($body['email'] ?? '');

        if (empty($name) || empty($phone)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Nome completo e telefone são obrigatórios.']);
            return;
        }

        // Check CPF duplication if provided
        if (!empty($cpf)) {
            $cleanCpf = preg_replace('/\D/', '', $cpf);
            $existingId = $this->redis->get("patients:by_cpf:{$cleanCpf}");
            if ($existingId) {
                http_response_code(409);
                echo json_encode(['success' => false, 'message' => 'Já existe um paciente cadastrado com este CPF.']);
                return;
            }
        }

        $patientData = [
            'name' => $name,
            'cpf' => $cpf,
            'birth_date' => $body['birth_date'] ?? null,
            'phone' => $phone,
            'whatsapp' => $body['whatsapp'] ?? $phone,
            'email' => $email,
            'address' => $body['address'] ?? '',
            'profession' => $body['profession'] ?? '',
            'emergency_contact' => $body['emergency_contact'] ?? '',
            'insurance' => $body['insurance'] ?? 'Particular',
            'clinical_notes' => $body['clinical_notes'] ?? '',
            'pain_score' => (int)($body['pain_score'] ?? 0),
            'status' => 'ativo',
            'weight' => $body['weight'] ?? '',
            'height' => $body['height'] ?? ''
        ];

        $saved = $this->repo->save('patients', $patientData);

        if (!empty($cpf)) {
            $cleanCpf = preg_replace('/\D/', '', $cpf);
            $this->redis->set("patients:by_cpf:{$cleanCpf}", $saved['id']);
        }

        // Auto create patient user account if requested or default password
        if (!empty($email) || !empty($cpf)) {
            $userCpfClean = preg_replace('/\D/', '', $cpf);
            $userPassword = !empty($userCpfClean) ? substr($userCpfClean, 0, 6) : 'paciente123';
            
            $userData = [
                'id' => 'user_pat_' . $saved['id'],
                'name' => $name,
                'email' => $email ?: "paciente_{$saved['id']}@clinica.local",
                'cpf' => $cpf,
                'password_hash' => $this->auth->hashPassword($userPassword),
                'role' => 'paciente',
                'patient_id' => $saved['id'],
                'status' => 'ativo'
            ];
            $this->repo->save('users', $userData);
        }

        $this->audit->log('create_patient', 'patients', $saved['id'], ['name' => $name], $currentUser);

        echo json_encode([
            'success' => true,
            'message' => 'Paciente cadastrado com sucesso!',
            'patient' => $saved
        ]);
    }

    public function update(string $id, array $currentUser): void
    {
        $existing = $this->repo->find('patients', $id);
        if (!$existing) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Paciente não encontrado.']);
            return;
        }

        $body = json_decode(file_get_contents('php://input'), true) ?: [];

        foreach ($body as $key => $val) {
            if ($key !== 'id' && $key !== 'created_at') {
                $existing[$key] = $val;
            }
        }

        $saved = $this->repo->save('patients', $existing);
        $this->audit->log('update_patient', 'patients', $id, ['name' => $saved['name']], $currentUser);

        echo json_encode([
            'success' => true,
            'message' => 'Dados do paciente atualizados com sucesso.',
            'patient' => $saved
        ]);
    }

    public function delete(string $id, array $currentUser): void
    {
        $existing = $this->repo->find('patients', $id);
        if (!$existing) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Paciente não encontrado.']);
            return;
        }

        // Soft delete / inactivate
        $existing['status'] = 'inativo';
        $this->repo->save('patients', $existing);

        $this->audit->log('inactivate_patient', 'patients', $id, ['name' => $existing['name']], $currentUser);

        echo json_encode(['success' => true, 'message' => 'Paciente inativado com sucesso.']);
    }
}


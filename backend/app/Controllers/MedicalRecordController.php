<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Repositories\RedisRepository;
use App\Services\AuditLogService;

class MedicalRecordController
{
    private RedisRepository $repo;
    private AuditLogService $audit;

    public function __construct()
    {
        $this->repo = new RedisRepository();
        $this->audit = new AuditLogService();
    }

    public function getByPatient(string $patientId): void
    {
        $allRecords = $this->repo->all('medical_records');
        $filtered = array_values(array_filter($allRecords, fn($r) => ($r['patient_id'] ?? '') === $patientId));
        usort($filtered, fn($a, $b) => strcmp($b['created_at'] ?? '', $a['created_at'] ?? ''));

        echo json_encode(['success' => true, 'data' => $filtered]);
    }

    public function storeRecord(string $patientId, array $currentUser): void
    {
        $patient = $this->repo->find('patients', $patientId);
        if (!$patient) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Paciente não encontrado.']);
            return;
        }

        $body = json_decode(file_get_contents('php://input'), true) ?: [];

        $recordData = [
            'patient_id' => $patientId,
            'professional_id' => $currentUser['professional_id'] ?? ($currentUser['id'] ?? 'pro_1'),
            'professional_name' => $currentUser['name'] ?? 'Fisioterapeuta',
            'chief_complaint' => $body['chief_complaint'] ?? '',
            'anamnesis' => $body['anamnesis'] ?? '',
            'clinical_history' => $body['clinical_history'] ?? '',
            'injuries_history' => $body['injuries_history'] ?? '',
            'postural_assessment' => $body['postural_assessment'] ?? '',
            'functional_assessment' => $body['functional_assessment'] ?? '',
            'mobility' => $body['mobility'] ?? '',
            'muscle_strength' => $body['muscle_strength'] ?? '',
            'pain_scale' => (int)($body['pain_scale'] ?? 0),
            'physio_diagnosis' => $body['physio_diagnosis'] ?? '',
            'therapeutic_goals' => $body['therapeutic_goals'] ?? '',
            'treatment_plan' => $body['treatment_plan'] ?? ''
        ];

        $saved = $this->repo->save('medical_records', $recordData);
        $this->repo->addToIndex("medical_records:by_patient:{$patientId}", $saved['id']);

        // Update patient's current pain score
        if (isset($body['pain_scale'])) {
            $patient['pain_score'] = (int)$body['pain_scale'];
            $this->repo->save('patients', $patient);
        }

        $this->audit->log('create_medical_record', 'medical_records', $saved['id'], [
            'patient_id' => $patientId,
            'diagnosis' => $saved['physio_diagnosis']
        ], $currentUser);

        echo json_encode([
            'success' => true,
            'message' => 'Prontuário fisioterapêutico registrado com sucesso!',
            'data' => $saved
        ]);
    }

    public function getEvolutionsByPatient(string $patientId): void
    {
        $all = $this->repo->all('clinical_evolutions');
        $filtered = array_values(array_filter($all, fn($e) => ($e['patient_id'] ?? '') === $patientId));
        usort($filtered, fn($a, $b) => strcmp($b['session_date'] ?? $b['created_at'] ?? '', $a['session_date'] ?? $a['created_at'] ?? ''));

        echo json_encode(['success' => true, 'data' => $filtered]);
    }

    public function storeEvolution(string $patientId, array $currentUser): void
    {
        $patient = $this->repo->find('patients', $patientId);
        if (!$patient) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Paciente não encontrado.']);
            return;
        }

        $body = json_decode(file_get_contents('php://input'), true) ?: [];

        $treatmentPlanId = $body['treatment_plan_id'] ?? null;
        $sessionDate = $body['session_date'] ?? date('Y-m-d');
        $painBefore = (int)($body['pain_before'] ?? 0);
        $painAfter = (int)($body['pain_after'] ?? 0);

        // Fetch current session count for this treatment plan
        $sessionNumber = 1;
        if ($treatmentPlanId) {
            $plan = $this->repo->find('treatment_plans', $treatmentPlanId);
            if ($plan) {
                $sessionNumber = ((int)($plan['completed_sessions'] ?? 0)) + 1;
            }
        }

        $evolutionData = [
            'patient_id' => $patientId,
            'treatment_plan_id' => $treatmentPlanId,
            'session_number' => (int)($body['session_number'] ?? $sessionNumber),
            'session_date' => $sessionDate,
            'professional_id' => $currentUser['professional_id'] ?? ($currentUser['id'] ?? 'pro_1'),
            'professional_name' => $currentUser['name'] ?? 'Fisioterapeuta Responsável',
            'pain_before' => $painBefore,
            'pain_after' => $painAfter,
            'procedures' => $body['procedures'] ?? '',
            'conduct' => $body['conduct'] ?? '',
            'patient_response' => $body['patient_response'] ?? '',
            'notes' => $body['notes'] ?? '',
            'next_recommendations' => $body['next_recommendations'] ?? '',
            'shared_with_patient' => (bool)($body['shared_with_patient'] ?? true)
        ];

        // Immutable save: each evolution receives a unique ID, appending to history
        $saved = $this->repo->save('clinical_evolutions', $evolutionData);
        $this->repo->addToIndex("clinical_evolutions:by_patient:{$patientId}", $saved['id']);

        if ($treatmentPlanId) {
            $this->repo->addToIndex("clinical_evolutions:by_treatment:{$treatmentPlanId}", $saved['id']);
        }

        // Update patient pain score
        $patient['pain_score'] = $painAfter;
        $this->repo->save('patients', $patient);

        $this->audit->log('create_clinical_evolution', 'clinical_evolutions', $saved['id'], [
            'patient_id' => $patientId,
            'session_number' => $saved['session_number'],
            'pain_before' => $painBefore,
            'pain_after' => $painAfter
        ], $currentUser);

        echo json_encode([
            'success' => true,
            'message' => 'Evolução clínica registrada e anexada ao prontuário!',
            'data' => $saved
        ]);
    }
}


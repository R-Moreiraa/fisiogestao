<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Repositories\RedisRepository;

class ReportController
{
    private RedisRepository $repo;

    public function __construct()
    {
        $this->repo = new RedisRepository();
    }

    public function getData(): void
    {
        $startDate = trim($_GET['start_date'] ?? date('Y-m-01'));
        $endDate = trim($_GET['end_date'] ?? date('Y-m-t'));
        $professionalId = trim($_GET['professional_id'] ?? '');
        $patientId = trim($_GET['patient_id'] ?? '');

        $appointments = $this->repo->all('appointments');
        $patients = $this->repo->all('patients');
        $transactions = $this->repo->all('transactions');
        $evolutions = $this->repo->all('clinical_evolutions');

        // Filter appointments
        $filteredApts = array_filter($appointments, function($a) use ($startDate, $endDate, $professionalId, $patientId) {
            $d = $a['date'] ?? '';
            if ($startDate !== '' && $d < $startDate) return false;
            if ($endDate !== '' && $d > $endDate) return false;
            if ($professionalId !== '' && ($a['professional_id'] ?? '') !== $professionalId) return false;
            if ($patientId !== '' && ($a['patient_id'] ?? '') !== $patientId) return false;
            return true;
        });

        $realizados = 0;
        $faltas = 0;
        $cancelados = 0;
        $agendados = 0;

        foreach ($filteredApts as $a) {
            $st = $a['status'] ?? 'agendado';
            if ($st === 'realizado') $realizados++;
            elseif ($st === 'falta') $faltas++;
            elseif ($st === 'cancelado') $cancelados++;
            else $agendados++;
        }

        // Financial totals in period
        $revenue = 0.0;
        $expenses = 0.0;
        $pending = 0.0;

        foreach ($transactions as $tx) {
            $d = $tx['payment_date'] ?? $tx['due_date'] ?? substr($tx['created_at'] ?? '', 0, 10);
            if ($startDate !== '' && $d < $startDate) continue;
            if ($endDate !== '' && $d > $endDate) continue;
            if ($patientId !== '' && ($tx['patient_id'] ?? '') !== $patientId) continue;

            $amt = (float)($tx['amount'] ?? 0);
            if (($tx['type'] ?? '') === 'receita') {
                if (($tx['status'] ?? '') === 'pago') $revenue += $amt;
                elseif (($tx['status'] ?? '') === 'pendente') $pending += $amt;
            } elseif (($tx['type'] ?? '') === 'despesa') {
                if (($tx['status'] ?? '') === 'pago') $expenses += $amt;
            }
        }

        echo json_encode([
            'success' => true,
            'period' => ['start' => $startDate, 'end' => $endDate],
            'metrics' => [
                'total_appointments' => count($filteredApts),
                'completed' => $realizados,
                'absences' => $faltas,
                'cancellations' => $cancelados,
                'scheduled' => $agendados,
                'revenue' => $revenue,
                'expenses' => $expenses,
                'profit' => max(0, $revenue - $expenses),
                'pending' => $pending
            ],
            'appointments' => array_values($filteredApts)
        ]);
    }

    public function exportCsv(): void
    {
        $startDate = trim($_GET['start_date'] ?? date('Y-m-01'));
        $endDate = trim($_GET['end_date'] ?? date('Y-m-t'));

        $appointments = $this->repo->all('appointments');

        $filteredApts = array_filter($appointments, function($a) use ($startDate, $endDate) {
            $d = $a['date'] ?? '';
            return ($d >= $startDate && $d <= $endDate);
        });

        header('Content-Type: text/csv; charset=utf-8');
        header('Content-Disposition: attachment; filename=relatorio_fisioterapia_' . date('Ymd_His') . '.csv');

        $output = fopen('php://output', 'w');
        // UTF-8 BOM for Microsoft Excel
        fputs($output, "\xEF\xBB\xBF");

        fputcsv($output, ['ID', 'Data', 'Horario', 'Paciente', 'Profissional', 'Procedimento', 'Status', 'Sala'], ';');

        foreach ($filteredApts as $a) {
            fputcsv($output, [
                $a['id'] ?? '',
                $a['date'] ?? '',
                $a['time'] ?? '',
                $a['patient_name'] ?? '',
                $a['professional_name'] ?? '',
                $a['procedure'] ?? $a['service_type'] ?? '',
                $a['status'] ?? '',
                $a['room'] ?? ''
            ], ';');
        }

        fclose($output);
        exit;
    }
}


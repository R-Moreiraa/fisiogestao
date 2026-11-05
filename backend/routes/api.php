<?php

declare(strict_types=1);

use App\Router;
use App\Controllers\AuthController;
use App\Controllers\DashboardController;
use App\Controllers\PatientController;
use App\Controllers\AppointmentController;
use App\Controllers\MedicalRecordController;
use App\Controllers\TreatmentController;
use App\Controllers\FinancialController;
use App\Controllers\ProfessionalController;
use App\Controllers\WebRequestController;
use App\Controllers\SettingController;
use App\Controllers\ReportController;
use App\Controllers\PatientPortalController;

$router = new Router();

// ================= PUBLIC ROUTES =================
$router->get('/api/health', function() {
    echo json_encode([
        'status' => 'online',
        'service' => 'FisioGestão SaaS Backend API',
        'php_version' => PHP_VERSION,
        'timestamp' => date('c')
    ]);
});

// Clinic & CMS Public Info
$router->get('/api/public/clinic-info', [SettingController::class, 'getPublicClinicInfo']);

// Public Appointment Request (Landing Page form)
$router->post('/api/public/appointment-requests', [WebRequestController::class, 'submitPublicRequest']);

// Auth Endpoints
$router->post('/api/auth/login', [AuthController::class, 'login']);
$router->post('/api/auth/login-patient', [AuthController::class, 'loginPatient']);
$router->post('/api/auth/forgot-password', [AuthController::class, 'forgotPassword']);
$router->get('/api/auth/me', [AuthController::class, 'me'], []);

// ================= CLINIC MANAGEMENT ROUTES (Gestão) =================
// Dashboard
$router->get('/api/dashboard/summary', [DashboardController::class, 'summary'], ['admin', 'fisioterapeuta', 'recepcionista']);

// Patients
$router->get('/api/patients', [PatientController::class, 'index'], ['admin', 'fisioterapeuta', 'recepcionista']);
$router->get('/api/patients/{id}', [PatientController::class, 'show'], ['admin', 'fisioterapeuta', 'recepcionista']);
$router->post('/api/patients', [PatientController::class, 'store'], ['admin', 'fisioterapeuta', 'recepcionista']);
$router->put('/api/patients/{id}', [PatientController::class, 'update'], ['admin', 'fisioterapeuta', 'recepcionista']);
$router->delete('/api/patients/{id}', [PatientController::class, 'delete'], ['admin']);

// Appointments
$router->get('/api/appointments', [AppointmentController::class, 'index'], ['admin', 'fisioterapeuta', 'recepcionista']);
$router->post('/api/appointments', [AppointmentController::class, 'store'], ['admin', 'fisioterapeuta', 'recepcionista']);
$router->put('/api/appointments/{id}', [AppointmentController::class, 'update'], ['admin', 'fisioterapeuta', 'recepcionista']);
$router->patch('/api/appointments/{id}/status', [AppointmentController::class, 'updateStatus'], ['admin', 'fisioterapeuta', 'recepcionista']);
$router->delete('/api/appointments/{id}', [AppointmentController::class, 'delete'], ['admin', 'recepcionista']);

// Medical Records & Clinical Evolutions
$router->get('/api/patients/{id}/medical-records', [MedicalRecordController::class, 'getByPatient'], ['admin', 'fisioterapeuta']);
$router->post('/api/patients/{id}/medical-records', [MedicalRecordController::class, 'storeRecord'], ['admin', 'fisioterapeuta']);
$router->get('/api/patients/{id}/evolutions', [MedicalRecordController::class, 'getEvolutionsByPatient'], ['admin', 'fisioterapeuta']);
$router->post('/api/patients/{id}/evolutions', [MedicalRecordController::class, 'storeEvolution'], ['admin', 'fisioterapeuta']);

// Treatments & Sessions
$router->get('/api/treatments', [TreatmentController::class, 'index'], ['admin', 'fisioterapeuta', 'recepcionista']);
$router->post('/api/treatments', [TreatmentController::class, 'store'], ['admin', 'fisioterapeuta']);
$router->post('/api/treatments/{id}/deduct-session', [TreatmentController::class, 'deductSession'], ['admin', 'fisioterapeuta', 'recepcionista']);
$router->patch('/api/treatments/{id}/status', [TreatmentController::class, 'updateStatus'], ['admin', 'fisioterapeuta']);

// Financial
$router->get('/api/financial/summary', [FinancialController::class, 'summary'], ['admin', 'recepcionista']);
$router->get('/api/financial/transactions', [FinancialController::class, 'transactions'], ['admin', 'recepcionista']);
$router->post('/api/financial/transactions', [FinancialController::class, 'store'], ['admin', 'recepcionista']);
$router->patch('/api/financial/transactions/{id}/status', [FinancialController::class, 'updateStatus'], ['admin', 'recepcionista']);

// Professionals
$router->get('/api/professionals', [ProfessionalController::class, 'index'], ['admin', 'fisioterapeuta', 'recepcionista']);
$router->post('/api/professionals', [ProfessionalController::class, 'store'], ['admin']);
$router->put('/api/professionals/{id}', [ProfessionalController::class, 'update'], ['admin']);

// Web Requests (Landing Page leads management)
$router->get('/api/web-requests', [WebRequestController::class, 'index'], ['admin', 'recepcionista']);
$router->patch('/api/web-requests/{id}/status', [WebRequestController::class, 'updateStatus'], ['admin', 'recepcionista']);
$router->post('/api/web-requests/{id}/convert-to-appointment', [WebRequestController::class, 'convertToAppointment'], ['admin', 'recepcionista']);

// Reports
$router->get('/api/reports/data', [ReportController::class, 'getData'], ['admin', 'recepcionista', 'fisioterapeuta']);
$router->get('/api/reports/export-csv', [ReportController::class, 'exportCsv'], ['admin', 'recepcionista', 'fisioterapeuta']);

// Settings & CMS
$router->get('/api/settings', [SettingController::class, 'getSettings'], ['admin']);
$router->put('/api/settings/clinic', [SettingController::class, 'updateClinicSettings'], ['admin']);
$router->put('/api/settings/landing', [SettingController::class, 'updateLandingCms'], ['admin']);

// ================= PATIENT PORTAL ROUTES =================
$router->get('/api/patient/dashboard', [PatientPortalController::class, 'dashboard'], ['paciente']);
$router->get('/api/patient/appointments', [PatientPortalController::class, 'appointments'], ['paciente']);
$router->post('/api/patient/request-reschedule', [PatientPortalController::class, 'requestReschedule'], ['paciente']);
$router->get('/api/patient/treatments', [PatientPortalController::class, 'treatments'], ['paciente']);
$router->get('/api/patient/clinical-history', [PatientPortalController::class, 'clinicalHistory'], ['paciente']);
$router->get('/api/patient/financial', [PatientPortalController::class, 'financial'], ['paciente']);
$router->put('/api/patient/profile', [PatientPortalController::class, 'updateProfile'], ['paciente']);

return $router;


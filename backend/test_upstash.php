<?php

declare(strict_types=1);

spl_autoload_register(function ($class) {
    $prefix = 'App\\';
    $baseDir = __DIR__ . '/app/';

    $len = strlen($prefix);
    if (strncmp($prefix, $class, $len) !== 0) {
        return;
    }

    $relativeClass = substr($class, $len);
    $file = $baseDir . str_replace('\\', '/', $relativeClass) . '.php';

    if (file_exists($file)) {
        require_once $file;
    }
});

use App\Config\Config;
use App\Services\UpstashRedisClient;
use App\Services\SeedService;

echo "===============================================\n";
echo "  FisioGestão - Verificador de Upstash Redis   \n";
echo "===============================================\n\n";

Config::load();

$url = Config::get('UPSTASH_REDIS_REST_URL');
$token = Config::get('UPSTASH_REDIS_REST_TOKEN');

if (empty($url) || empty($token)) {
    echo "[AVISO] As credenciais UPSTASH_REDIS_REST_URL e/ou UPSTASH_REDIS_REST_TOKEN não estão preenchidas.\n";
    echo "O backend está operando com persistência local em backend/storage/redis_data.json.\n\n";
    echo "Para conectar ao Upstash Cloud:\n";
    echo "1. Crie um banco Redis em https://console.upstash.com (gratuito)\n";
    echo "2. Na aba 'REST API', copie UPSTASH_REDIS_REST_URL e UPSTASH_REDIS_REST_TOKEN\n";
    echo "3. Preencha no arquivo backend/.env ou passe como variáveis de ambiente\n";
    exit(0);
}

echo "URL: " . substr($url, 0, 35) . "...\n";
echo "Token: " . substr($token, 0, 15) . "...\n\n";
echo "Testando conexão com Upstash Cloud via REST API...\n";

try {
    $redis = UpstashRedisClient::getInstance();
    
    // Test PING
    $ping = $redis->execute(['PING']);
    echo "PING -> " . json_encode($ping) . "\n";
    
    // Test SET & GET
    $testKey = 'fisio:test_connection:' . time();
    $redis->execute(['SET', $testKey, 'ok']);
    $val = $redis->execute(['GET', $testKey]);
    $redis->execute(['DEL', $testKey]);
    
    if ($val === 'ok') {
        echo "[SUCESSO] Conexão com Upstash Redis estabelecida com sucesso!\n\n";
        
        echo "Verificando dados no Upstash...\n";
        $seeder = new SeedService();
        $seeder->seedIfEmpty();
        
        $userCount = count($redis->smembers('users:all'));
        $patientCount = count($redis->smembers('patients:all'));
        $appointmentCount = count($redis->smembers('appointments:all'));
        
        echo "Status dos dados no Upstash:\n";
        echo " - Usuários: $userCount\n";
        echo " - Pacientes: $patientCount\n";
        echo " - Agendamentos: $appointmentCount\n\n";
        echo "[TUDO PRONTO] O banco de dados Upstash está 100% operacional e populado!\n";
    } else {
        echo "[ERRO] Não foi possível verificar a resposta da gravação no Upstash.\n";
    }
} catch (\Throwable $e) {
    echo "[FALHA NA CONEXÃO] Erro: " . $e->getMessage() . "\n";
}

<?php

declare(strict_types=1);

namespace App\Services;

use App\Repositories\RedisRepository;

class SeedService
{
    private UpstashRedisClient $redis;
    private AuthService $auth;
    private RedisRepository $repo;

    public function __construct()
    {
        $this->redis = UpstashRedisClient::getInstance();
        $this->auth = new AuthService();
        $this->repo = new RedisRepository();
    }

    public function seedIfEmpty(): void
    {
        $existingUsers = $this->redis->smembers('users:all');
        if (!empty($existingUsers)) {
            return;
        }

        $this->forceSeed();
    }

    public function forceSeed(): void
    {
        // 1. Settings & CMS
        $clinicSettings = [
            'id' => 'clinic_settings',
            'clinic_name' => 'FisioPrime Reabilitação Integrada',
            'cnpj' => '12.345.678/0001-90',
            'phone' => '(11) 3289-4000',
            'whatsapp' => '(11) 98765-4321',
            'email' => 'contato@fisioprime.com.br',
            'address' => 'Av. Paulista, 1578 - 14º andar, Bela Vista, São Paulo - SP',
            'operating_hours' => 'Segunda a Sexta: 07h às 21h | Sábados: 08h às 14h',
            'default_session_duration' => 50,
            'payment_methods' => ['Pix', 'Cartão de Crédito', 'Cartão de Débito', 'Dinheiro', 'Transferência Bancária'],
            'created_at' => date('c'),
            'updated_at' => date('c')
        ];
        $this->redis->setJson('settings:clinic', $clinicSettings);

        $landingCms = [
            'hero_title' => 'Movimento, saúde e qualidade de vida em cada etapa da sua recuperação.',
            'hero_subtitle' => 'Tratamento fisioterapêutico individualizado e humanizado com foco em resultados reais e prevenção de recidivas.',
            'hero_badge' => 'Referência em Fisioterapia & Reabilitação Avançada',
            'about_title' => 'Cuidando de pessoas, restaurando movimentos e devolvendo bem-estar.',
            'about_description' => 'A FisioPrime nasceu do compromisso de transformar a experiência de reabilitação. Combinamos tecnologia de ponta, avaliação biomecânica criteriosa e atendimento estritamente individualizado (1 paciente por fisioterapeuta) para acelerar a sua recuperação com segurança.',
            'differentials' => [
                ['title' => 'Atendimento 100% Individualizado', 'desc' => 'Dedicação exclusiva do fisioterapeuta durante toda a sua sessão.'],
                ['title' => 'Avaliação Biomecânica Detalhada', 'desc' => 'Diagnóstico funcional preciso para atuar na causa raiz da dor.'],
                ['title' => 'Estrutura Completa & Moderna', 'desc' => 'Equipamentos de eletroterapia de última geração, cinesioterapia e pilates clínico.'],
                ['title' => 'Acompanhamento Digital em Tempo Real', 'desc' => 'Acesso ao Portal do Paciente para visualizar sua evolução, treinos e histórico.']
            ],
            'specialties' => [
                [
                    'id' => 'esp_1',
                    'title' => 'Fisioterapia Traumato-Ortopédica',
                    'desc' => 'Reabilitação de fraturas, entorses, tendinites, bursites e dores articulares com ganho de força e amplitude.',
                    'icon' => 'Activity',
                    'image' => 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&auto=format&fit=crop&q=80'
                ],
                [
                    'id' => 'esp_2',
                    'title' => 'Reabilitação Pós-Operatória',
                    'desc' => 'Recuperação especializada pós cirurgia de LCA, próteses de quadril e joelho, menisco e manguito rotador.',
                    'icon' => 'ShieldCheck',
                    'image' => 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=600&auto=format&fit=crop&q=80'
                ],
                [
                    'id' => 'esp_3',
                    'title' => 'Tratamento de Coluna Vertebral',
                    'desc' => 'Cuidado avançado para hérnia de disco, lombalgia crônica, ciatalgia, cervicalgia e desvios posturais.',
                    'icon' => 'Zap',
                    'image' => 'https://images.unsplash.com/photo-1598256989800-fe5f95da9787?w=600&auto=format&fit=crop&q=80'
                ],
                [
                    'id' => 'esp_4',
                    'title' => 'Fisioterapia Esportiva & Performance',
                    'desc' => 'Recuperação rápida para atletas amadores e profissionais, prevenindo recidivas e otimizando o gesto esportivo.',
                    'icon' => 'Flame',
                    'image' => 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80'
                ],
                [
                    'id' => 'esp_5',
                    'title' => 'Pilates Clínico & Reabilitação Postural',
                    'desc' => 'Fortalecimento do core, reeducação postural e ganho de flexibilidade supervisionada em aparelhos Reformer.',
                    'icon' => 'Heart',
                    'image' => 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&auto=format&fit=crop&q=80'
                ],
                [
                    'id' => 'esp_6',
                    'title' => 'Fisioterapia Neurológica & Vestibular',
                    'desc' => 'Recuperação funcional pós-AVC, Parkinson e tratamento especializado de labirintite, tonturas e desequilíbrios.',
                    'icon' => 'Compass',
                    'image' => 'https://images.unsplash.com/photo-1581056771107-24ca5f033842?w=600&auto=format&fit=crop&q=80'
                ]
            ],
            'treatment_programs' => [
                [
                    'title' => 'Terapia Manual & Liberação Miofascial',
                    'category' => 'Alívio Imediato da Dor',
                    'desc' => 'Técnicas manuais de tração articular, Maitland e desativação de pontos-gatilho para alívio de tensões profundas.',
                    'image' => 'https://images.unsplash.com/photo-1598256989800-fe5f95da9787?w=800&auto=format&fit=crop&q=80'
                ],
                [
                    'title' => 'Cinesioterapia & Fortalecimento Ativo',
                    'category' => 'Recuperação Funcional',
                    'desc' => 'Exercícios terapêuticos específicos com faixas elásticas, halteres leves e propriocepção individualizada 1:1.',
                    'image' => 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&auto=format&fit=crop&q=80'
                ],
                [
                    'title' => 'Pilates Clínico Supervisionado',
                    'category' => 'Estabilização Segmentar',
                    'desc' => 'Estúdio completo com Reformer, Cadillac e Barrel para reeducação biomecânica da coluna e articulações.',
                    'image' => 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&auto=format&fit=crop&q=80'
                ],
                [
                    'title' => 'Eletroterapia & Analgesia',
                    'category' => 'Tecnologia em Saúde',
                    'desc' => 'Recursos eletroterapêuticos de precisão (TENS, FES, Laser e Ultrassom) para aceleração cicatricial e controle inflamatório.',
                    'image' => 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&auto=format&fit=crop&q=80'
                ],
                [
                    'title' => 'Recovery Esportivo & Prevenção',
                    'category' => 'Desempenho & Atletas',
                    'desc' => 'Protocolos avançados com botas pneumáticas de compressão e técnicas de regeneração neuromuscular.',
                    'image' => 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80'
                ],
                [
                    'title' => 'Avaliação Biomecânica 3D',
                    'category' => 'Diagnóstico Preciso',
                    'desc' => 'Análise minuciosa de mobilidade, goniometria articular, testes ortopédicos e identificação da causa raiz dos sintomas.',
                    'image' => 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=80'
                ]
            ],
            'locations' => [
                ['name' => 'Unidade Jardins', 'address' => 'Alameda Santos, 1100 - Conjunto 81, Jardins, São Paulo', 'phone' => '(11) 3289-4001'],
                ['name' => 'Unidade Itaim Bibi', 'address' => 'Rua Joaquim Floriano, 466 - Sala 102, Itaim Bibi, São Paulo', 'phone' => '(11) 3289-4002'],
                ['name' => 'Unidade Moema', 'address' => 'Av. Ibirapuera, 2907 - 5º andar, Moema, São Paulo', 'phone' => '(11) 3289-4003']
            ],
            'testimonials' => [
                [
                    'name' => 'Mariana Silveira',
                    'treatment' => 'Pós-op LCA Joelho Direito',
                    'avatar' => 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
                    'text' => 'Após romper o LCA no vôlei, fiquei apreensiva com o retorno. Na FisioPrime a equipe foi incrível! Em 6 meses já estava correndo sem dor e com a musculatura totalmente fortalecida.',
                    'rating' => 5
                ],
                [
                    'name' => 'Carlos Roberto Mendes',
                    'treatment' => 'Lombalgia Mecânica Crônica',
                    'avatar' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
                    'text' => 'Sofria com dores na lombar há mais de 4 anos trabalhando sentado. O plano de pilates clínico e a terapia manual mudaram minha rotina. Hoje trabalho o dia todo sem desconforto.',
                    'rating' => 5
                ],
                [
                    'name' => 'Luciana Fontes',
                    'treatment' => 'Tendinopatia do Manguito Rotador',
                    'avatar' => 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
                    'text' => 'Excelente atendimento, clínica impecável e pontualidade exemplar. O portal do paciente facilita muito acompanhar as sessões e meus exercícios passados pelo fisio.',
                    'rating' => 5
                ]
            ]
        ];
        $this->redis->setJson('settings:landing_page', $landingCms);

        // 2. Professionals
        $professionals = [
            [
                'id' => 'pro_1',
                'name' => 'Dr. Roberto Sullivan',
                'cpf' => '111.222.333-44',
                'crefito' => '112233-F/SP',
                'specialty' => 'Traumato-Ortopedia e Esportiva',
                'phone' => '(11) 98765-4321',
                'email' => 'admin@fisiogestao.com.br',
                'avatar' => 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&auto=format&fit=crop&q=80',
                'bio' => 'Especialista em reabilitação ortopédica e recuperação de atletas pelo HCFMUSP. Mais de 12 anos de experiência clínica.',
                'status' => 'ativo',
                'available_hours' => 'Seg-Sex: 08:00 - 18:00'
            ],
            [
                'id' => 'pro_2',
                'name' => 'Dra. Camila Duarte',
                'cpf' => '222.333.444-55',
                'crefito' => '123456-F/SP',
                'specialty' => 'Coluna Vertebral e Pilates Clínico',
                'phone' => '(11) 99876-5432',
                'email' => 'dra.camila@fisiogestao.com.br',
                'avatar' => 'https://images.unsplash.com/photo-1594824813583-4318c4c77ea1?w=300&auto=format&fit=crop&q=80',
                'bio' => 'Mestre em Fisioterapia com foco em disfunções da coluna vertebral e estabilização lombar segmentar.',
                'status' => 'ativo',
                'available_hours' => 'Seg-Sex: 07:00 - 16:00'
            ],
            [
                'id' => 'pro_3',
                'name' => 'Dr. Salman Hossain',
                'cpf' => '333.444.555-66',
                'crefito' => '223344-F/SP',
                'specialty' => 'Fisioterapia Neurológica e Vestibular',
                'phone' => '(11) 97654-3210',
                'email' => 'dr.salman@fisiogestao.com.br',
                'avatar' => 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=300&auto=format&fit=crop&q=80',
                'bio' => 'Dedicado à neuro-reabilitação funcional e reabilitação vestibular de distúrbios de equilíbrio.',
                'status' => 'ativo',
                'available_hours' => 'Seg-Sex: 09:00 - 19:00'
            ]
        ];

        foreach ($professionals as $pro) {
            $this->repo->save('professionals', $pro);
        }

        // 3. System Users
        $users = [
            [
                'id' => 'user_admin',
                'name' => 'Dr. Roberto Sullivan',
                'email' => 'admin@fisiogestao.com.br',
                'cpf' => '111.222.333-44',
                'password_hash' => $this->auth->hashPassword('admin123'),
                'role' => 'admin',
                'professional_id' => 'pro_1',
                'status' => 'ativo'
            ],
            [
                'id' => 'user_fisio',
                'name' => 'Dra. Camila Duarte',
                'email' => 'dra.camila@fisiogestao.com.br',
                'cpf' => '222.333.444-55',
                'password_hash' => $this->auth->hashPassword('fisio123'),
                'role' => 'fisioterapeuta',
                'professional_id' => 'pro_2',
                'status' => 'ativo'
            ],
            [
                'id' => 'user_recepcao',
                'name' => 'Ana Paula Mendes',
                'email' => 'recepcao@fisiogestao.com.br',
                'cpf' => '444.555.666-77',
                'password_hash' => $this->auth->hashPassword('recepcao123'),
                'role' => 'recepcionista',
                'status' => 'ativo'
            ],
            [
                'id' => 'user_paciente_1',
                'name' => 'João Carlos da Silva',
                'email' => 'joao.silva@email.com',
                'cpf' => '123.456.789-00',
                'password_hash' => $this->auth->hashPassword('paciente123'),
                'role' => 'paciente',
                'patient_id' => 'pat_1',
                'status' => 'ativo'
            ],
            [
                'id' => 'user_paciente_2',
                'name' => 'Mariana Costa',
                'email' => 'mariana.costa@email.com',
                'cpf' => '234.567.890-11',
                'password_hash' => $this->auth->hashPassword('paciente123'),
                'role' => 'paciente',
                'patient_id' => 'pat_2',
                'status' => 'ativo'
            ]
        ];

        foreach ($users as $u) {
            $this->repo->save('users', $u);
            $this->redis->set("users:by_email:{$u['email']}", $u['id']);
            if (!empty($u['cpf'])) {
                $cleanCpf = preg_replace('/\D/', '', $u['cpf']);
                $this->redis->set("users:by_cpf:{$cleanCpf}", $u['id']);
            }
        }

        // 4. Patients
        $patients = [
            [
                'id' => 'pat_1',
                'name' => 'João Carlos da Silva',
                'cpf' => '123.456.789-00',
                'birth_date' => '1985-06-15',
                'phone' => '(11) 98111-2233',
                'whatsapp' => '(11) 98111-2233',
                'email' => 'joao.silva@email.com',
                'profession' => 'Engenheiro de Software',
                'emergency_contact' => 'Carla Silva (Esposa) - (11) 98222-3344',
                'insurance' => 'Bradesco Saúde Top Nacional',
                'address' => 'Rua Oscar Freire, 1200 - Apto 42, Cerqueira César, São Paulo - SP',
                'status' => 'ativo',
                'clinical_notes' => 'Paciente com histórico de dor lombar crônica há 2 anos após rotina intensa de home office. Sem déficits neurológicos.',
                'pain_score' => 4,
                'weight' => '78 kg',
                'height' => '1.79 m'
            ],
            [
                'id' => 'pat_2',
                'name' => 'Mariana Costa',
                'cpf' => '234.567.890-11',
                'birth_date' => '1996-03-22',
                'phone' => '(11) 97222-4455',
                'whatsapp' => '(11) 97222-4455',
                'email' => 'mariana.costa@email.com',
                'profession' => 'Advogada',
                'emergency_contact' => 'Paulo Costa (Pai) - (11) 97333-5566',
                'insurance' => 'SulAmérica Especial',
                'address' => 'Rua Bela Cintra, 890 - Consolação, São Paulo - SP',
                'status' => 'ativo',
                'clinical_notes' => 'Pós-operatório de reconstrução de LCA no joelho direito há 5 semanas. Enxerto de tendão patelar. Em ganho de flexão e extensão completa.',
                'pain_score' => 3,
                'weight' => '62 kg',
                'height' => '1.68 m'
            ],
            [
                'id' => 'pat_3',
                'name' => 'Carlos Eduardo Santos',
                'cpf' => '345.678.901-22',
                'birth_date' => '1978-11-04',
                'phone' => '(11) 96333-7788',
                'whatsapp' => '(11) 96333-7788',
                'email' => 'carlos.edu@empresa.com.br',
                'profession' => 'Diretor Comercial',
                'emergency_contact' => 'Renata Santos (Irmã) - (11) 96444-8899',
                'insurance' => 'Amil 500',
                'address' => 'Av. Faria Lima, 2000 - Itaim, São Paulo - SP',
                'status' => 'ativo',
                'clinical_notes' => 'Tendinopatia do supraespinal no ombro esquerdo. Tratamento completado com sucesso. Alta com orientações ergonômicas.',
                'pain_score' => 1,
                'weight' => '84 kg',
                'height' => '1.82 m'
            ],
            [
                'id' => 'pat_4',
                'name' => 'Beatriz Albuquerque',
                'cpf' => '456.789.012-33',
                'birth_date' => '1992-09-10',
                'phone' => '(11) 95444-9900',
                'whatsapp' => '(11) 95444-9900',
                'email' => 'beatriz.albu@gmail.com',
                'profession' => 'Designer Gráfica',
                'emergency_contact' => 'Marcos Lima (Noivo) - (11) 95555-0011',
                'insurance' => 'Particular',
                'address' => 'Rua Pamplona, 650 - Bela Vista, São Paulo - SP',
                'status' => 'ativo',
                'clinical_notes' => 'Cervicalgia com irradiação interescapular e pontos-gatilho miofasciais nos trapézios superiores.',
                'pain_score' => 5,
                'weight' => '57 kg',
                'height' => '1.63 m'
            ],
            [
                'id' => 'pat_5',
                'name' => 'Fernando Dias de Carvalho',
                'cpf' => '567.890.123-44',
                'birth_date' => '1989-01-28',
                'phone' => '(11) 94555-1122',
                'whatsapp' => '(11) 94555-1122',
                'email' => 'fernando.dias@tech.com',
                'profession' => 'Analista Financeiro / Corredor',
                'emergency_contact' => 'Sílvia Dias (Mãe) - (11) 94666-2233',
                'insurance' => 'NotreDame Intermédica',
                'address' => 'Rua dos Pinheiros, 340 - Pinheiros, São Paulo - SP',
                'status' => 'ativo',
                'clinical_notes' => 'Fisioterapia esportiva preventiva para maratona. Fasciíte plantar bilateral incipiente.',
                'pain_score' => 2,
                'weight' => '71 kg',
                'height' => '1.75 m'
            ]
        ];

        foreach ($patients as $p) {
            $this->repo->save('patients', $p);
            $cleanCpf = preg_replace('/\D/', '', $p['cpf']);
            $this->redis->set("patients:by_cpf:{$cleanCpf}", $p['id']);
        }

        // 5. Treatment Plans
        $treatments = [
            [
                'id' => 'plan_1',
                'patient_id' => 'pat_1',
                'patient_name' => 'João Carlos da Silva',
                'professional_id' => 'pro_2',
                'professional_name' => 'Dra. Camila Duarte',
                'title' => 'Reabilitação Lombar & Estabilização Segmentar',
                'diagnosis' => 'Lombalgia Mecânica Crônica Postural (CID M54.5)',
                'total_sessions' => 10,
                'completed_sessions' => 6,
                'remaining_sessions' => 4,
                'frequency' => '2 vezes por semana',
                'status' => 'em_andamento',
                'start_date' => date('Y-m-d', strtotime('-3 weeks')),
                'price' => 1800.00,
                'shared_with_patient' => true,
                'therapeutic_goals' => 'Alívio da dor na região lombar (reduzir EVA <= 2), fortalecimento da musculatura estabilizadora profunda (transverso do abdômen e multífidos), recuperação da mobilidade pélvica e correção ergonômica.'
            ],
            [
                'id' => 'plan_2',
                'patient_id' => 'pat_2',
                'patient_name' => 'Mariana Costa',
                'professional_id' => 'pro_1',
                'professional_name' => 'Dr. Roberto Sullivan',
                'title' => 'Reabilitação Pós-Operatória de LCA (Joelho Direito)',
                'diagnosis' => 'Pós-reconstrução cirúrgica de LCA (CID M23.6)',
                'total_sessions' => 20,
                'completed_sessions' => 8,
                'remaining_sessions' => 12,
                'frequency' => '3 vezes por semana',
                'status' => 'em_andamento',
                'start_date' => date('Y-m-d', strtotime('-4 weeks')),
                'price' => 3600.00,
                'shared_with_patient' => true,
                'therapeutic_goals' => 'Ganho de amplitude de movimento completa (0-135°), controle do edema periarticular, reativação muscular do quadríceps e estabilidade unipodal progressiva.'
            ],
            [
                'id' => 'plan_3',
                'patient_id' => 'pat_3',
                'patient_name' => 'Carlos Eduardo Santos',
                'professional_id' => 'pro_1',
                'professional_name' => 'Dr. Roberto Sullivan',
                'title' => 'Recuperação Funcional de Ombro (Manguito Rotador)',
                'diagnosis' => 'Tendinopatia do Supraespinal (CID M75.1)',
                'total_sessions' => 10,
                'completed_sessions' => 10,
                'remaining_sessions' => 0,
                'frequency' => '2 vezes por semana',
                'status' => 'concluido',
                'start_date' => date('Y-m-d', strtotime('-8 weeks')),
                'price' => 1800.00,
                'shared_with_patient' => true,
                'therapeutic_goals' => 'Extinção do arco doloroso, reequilíbrio escapulotorácico e fortalecimento dos rotadores externos e serrátil anterior.'
            ]
        ];

        foreach ($treatments as $t) {
            $this->repo->save('treatment_plans', $t);
            $this->redis->sadd("treatment_plans:by_patient:{$t['patient_id']}", $t['id']);
        }

        // 6. Medical Records (Prontuários)
        $medicalRecord = [
            'id' => 'mr_1',
            'patient_id' => 'pat_1',
            'professional_id' => 'pro_2',
            'professional_name' => 'Dra. Camila Duarte',
            'chief_complaint' => 'Dor constante na região lombar baixa, que piora ao permanecer sentado por mais de 40 minutos em frente ao computador.',
            'anamnesis' => 'Paciente relata início dos sintomas há cerca de 2 anos, com piora progressiva nos últimos 3 meses. Nega irradiação para membros inferiores, dormências ou parestesias. Pratica musculação 2x por semana sem orientação especializada.',
            'pain_scale' => 6,
            'postural_assessment' => 'Hiperlordose lombar moderada, anteversão pélvica, protração de ombros e anteriorização da cabeça.',
            'functional_assessment' => 'Teste de Lasègue negativo bilateralmente. Teste de Schober positivo com restrição de flexão lombar. Fraqueza de glúteo médio e encurtamento de isquiossurais e iliopsoas.',
            'mobility' => 'Restrição nos últimos 20% de flexão e extensão do tronco com dor referida em L4-L5.',
            'muscle_strength' => 'Grau 4 para extensores de tronco; Grau 3+ para estabilizadores do core e glúteo médio.',
            'physio_diagnosis' => 'Disfunção biomecânica lombo-pélvica com síndrome cruzada inferior e instabilidade segmentar.',
            'therapeutic_goals' => '1. Reduzir dor de EVA 6 para <= 2 em 4 semanas. 2. Aumentar flexibilidade dos flexores de quadril. 3. Ativar transverso e multífidos. 4. Retorno ao trabalho sem dor.',
            'treatment_plan' => 'Cinesioterapia motora específica, liberação miofascial lombar, estabilização central baseada em Pilates Clínico, orientações ergonômicas de posto de trabalho.',
            'created_at' => date('c', strtotime('-3 weeks')),
            'updated_at' => date('c', strtotime('-3 weeks'))
        ];
        $this->repo->save('medical_records', $medicalRecord);
        $this->redis->sadd("medical_records:by_patient:pat_1", $medicalRecord['id']);

        // 7. Clinical Evolutions (Evoluções por sessão - Histórico cronológico e rastreabilidade)
        $evolutions = [
            [
                'id' => 'evo_1',
                'patient_id' => 'pat_1',
                'treatment_plan_id' => 'plan_1',
                'session_number' => 1,
                'session_date' => date('Y-m-d', strtotime('-18 days')),
                'professional_name' => 'Dra. Camila Duarte',
                'professional_id' => 'pro_2',
                'pain_before' => 6,
                'pain_after' => 4,
                'procedures' => 'Terapia manual lombar com tração oscilatória, liberação miofascial do quadrado lombar e glúteos, reeducação respiratória diafragmática.',
                'conduct' => 'Início de exercícios de ativação do transverso abdominal em decúbito dorsal (dead bug modificado) e ponte sobre os ombros isométrica.',
                'patient_response' => 'Paciente relatou sensação imediata de descompressão lombar. Boa adesão e compreensão dos comandos respiratórios.',
                'notes' => 'Orientado a levantar-se a cada 50 minutos de trabalho sentado.',
                'next_recommendations' => 'Manter ativação postural no dia a dia. Evitar carregar pesos com flexão direta do tronco.',
                'shared_with_patient' => true
            ],
            [
                'id' => 'evo_2',
                'patient_id' => 'pat_1',
                'treatment_plan_id' => 'plan_1',
                'session_number' => 2,
                'session_date' => date('Y-m-d', strtotime('-14 days')),
                'professional_name' => 'Dra. Camila Duarte',
                'professional_id' => 'pro_2',
                'pain_before' => 5,
                'pain_after' => 3,
                'procedures' => 'Alongamento passivo de isquiossurais e psoas com técnica de contração-relaxamento. Mobilização lombar Maitland grau III.',
                'conduct' => 'Progressão para ponte unipodal e bird-dog com ênfase na dissociação de cintura pélvica.',
                'patient_response' => 'Sem dor durante a execução. Conseguiu manter contração do core de forma satisfatória.',
                'notes' => 'Relatou melhora no final de semana, tolerando 1 hora de caminhada sem sintomas.',
                'next_recommendations' => 'Realizar exercícios domiciliares de alongamento de psoas 2x ao dia.',
                'shared_with_patient' => true
            ],
            [
                'id' => 'evo_3',
                'patient_id' => 'pat_1',
                'treatment_plan_id' => 'plan_1',
                'session_number' => 3,
                'session_date' => date('Y-m-d', strtotime('-10 days')),
                'professional_name' => 'Dra. Camila Duarte',
                'professional_id' => 'pro_2',
                'pain_before' => 4,
                'pain_after' => 2,
                'procedures' => 'Cinesioterapia no Reformer (Pilates Clínico): footwork com mola moderada, pelvic curl e bridging.',
                'conduct' => 'Exercícios funcionais de agachamento com apoio na parede e alinhamento biomecânico de joelhos e pelve.',
                'patient_response' => 'Paciente demonstrou excelente resposta neuromuscular e ausência de compensações axiais.',
                'notes' => 'Dor ao final da sessão reduzida significativamente (EVA 2).',
                'next_recommendations' => 'Manter hidratação adequada e pausas ativas na empresa.',
                'shared_with_patient' => true
            ],
            [
                'id' => 'evo_4',
                'patient_id' => 'pat_1',
                'treatment_plan_id' => 'plan_1',
                'session_number' => 4,
                'session_date' => date('Y-m-d', strtotime('-7 days')),
                'professional_name' => 'Dra. Camila Duarte',
                'professional_id' => 'pro_2',
                'pain_before' => 3,
                'pain_after' => 1,
                'procedures' => 'Treino propioceptivo no disco de equilíbrio, fortalecimento de rotadores de quadril com miniband, prancha lateral modificada.',
                'conduct' => 'Treino resistido progressivo de membros inferiores com foco em glúteo máximo e médio.',
                'patient_response' => 'Tolerou o aumento de carga sem queixas. Relata não ter precisado de analgésicos nos últimos 10 dias.',
                'notes' => 'Evolução muito favorável. Paciente muito motivado.',
                'next_recommendations' => 'Progredir caminhadas para 40 minutos contínuos.',
                'shared_with_patient' => true
            ],
            [
                'id' => 'evo_5',
                'patient_id' => 'pat_1',
                'treatment_plan_id' => 'plan_1',
                'session_number' => 5,
                'session_date' => date('Y-m-d', strtotime('-4 days')),
                'professional_name' => 'Dra. Camila Duarte',
                'professional_id' => 'pro_2',
                'pain_before' => 3,
                'pain_after' => 1,
                'procedures' => 'Terapia manual miofascial em iliotibial e quadrado lombar. Fortalecimento excêntrico de posteriores.',
                'conduct' => 'Treino funcional dinâmico simulando levantamento ergonômico de objetos.',
                'patient_response' => 'Boa coordenação lombo-pélvica e sem dores residuais pós-treino.',
                'notes' => 'Quadro estável com controle excelente da dor.',
                'next_recommendations' => 'Continuar série de exercícios posturais em casa.',
                'shared_with_patient' => true
            ],
            [
                'id' => 'evo_6',
                'patient_id' => 'pat_1',
                'treatment_plan_id' => 'plan_1',
                'session_number' => 6,
                'session_date' => date('Y-m-d', strtotime('-1 day')),
                'professional_name' => 'Dra. Camila Duarte',
                'professional_id' => 'pro_2',
                'pain_before' => 2,
                'pain_after' => 0,
                'procedures' => 'Pilates clínico avançado com trabalho de instabilidade e coordenação em cadeia cinética fechada.',
                'conduct' => 'Fortalecimento do complexo pélvico e reavaliação de mobilidade lombar (Schober normalizado).',
                'patient_response' => 'Paciente sem qualquer queixa de dor ao término da sessão.',
                'notes' => 'Restam 4 sessões contratadas para consolidação da força e alta programada.',
                'next_recommendations' => 'Agendada próxima sessão para após amanhã.',
                'shared_with_patient' => true
            ]
        ];

        foreach ($evolutions as $evo) {
            $this->repo->save('clinical_evolutions', $evo);
            $this->redis->sadd("clinical_evolutions:by_patient:{$evo['patient_id']}", $evo['id']);
            $this->redis->sadd("clinical_evolutions:by_treatment:{$evo['treatment_plan_id']}", $evo['id']);
        }

        // 8. Appointments (Hoje, próximos dias e histórico)
        $todayStr = date('Y-m-d');
        $tomorrowStr = date('Y-m-d', strtotime('+1 day'));
        $dayAfterStr = date('Y-m-d', strtotime('+2 days'));
        $yesterdayStr = date('Y-m-d', strtotime('-1 day'));

        $appointments = [
            [
                'id' => 'apt_today_1',
                'patient_id' => 'pat_1',
                'patient_name' => 'João Carlos da Silva',
                'professional_id' => 'pro_2',
                'professional_name' => 'Dra. Camila Duarte',
                'date' => $todayStr,
                'time' => '09:00',
                'duration_minutes' => 50,
                'service_type' => 'Sessão de Fisioterapia Lombar',
                'procedure' => 'Pilates Clínico & Estabilização',
                'treatment_plan_id' => 'plan_1',
                'status' => 'confirmado',
                'notes' => 'Sessão nº 7 do pacote.',
                'room' => 'Sala 02 - Pilates Clínico'
            ],
            [
                'id' => 'apt_today_2',
                'patient_id' => 'pat_2',
                'patient_name' => 'Mariana Costa',
                'professional_id' => 'pro_1',
                'professional_name' => 'Dr. Roberto Sullivan',
                'date' => $todayStr,
                'time' => '10:30',
                'duration_minutes' => 50,
                'service_type' => 'Reabilitação de Joelho Pós-LCA',
                'procedure' => 'Cinesioterapia & Fortalecimento de Quadríceps',
                'treatment_plan_id' => 'plan_2',
                'status' => 'em_atendimento',
                'notes' => 'Foco no ganho dos últimos graus de flexão.',
                'room' => 'Box 01 - Traumato-Ortopedia'
            ],
            [
                'id' => 'apt_today_3',
                'patient_id' => 'pat_4',
                'patient_name' => 'Beatriz Albuquerque',
                'professional_id' => 'pro_2',
                'professional_name' => 'Dra. Camila Duarte',
                'date' => $todayStr,
                'time' => '14:00',
                'duration_minutes' => 50,
                'service_type' => 'Fisioterapia Cervical & Postural',
                'procedure' => 'Terapia Manual e Desativação de Pontos Gatilho',
                'status' => 'agendado',
                'notes' => 'Paciente relata tensão cervical elevada devido a prazos no trabalho.',
                'room' => 'Sala 03 - Terapia Manual'
            ],
            [
                'id' => 'apt_today_4',
                'patient_id' => 'pat_5',
                'patient_name' => 'Fernando Dias de Carvalho',
                'professional_id' => 'pro_1',
                'professional_name' => 'Dr. Roberto Sullivan',
                'date' => $todayStr,
                'time' => '16:00',
                'duration_minutes' => 50,
                'service_type' => 'Fisioterapia Esportiva Preventiva',
                'procedure' => 'Bota de compressão pneumática & Liberação miofascial plantar',
                'status' => 'agendado',
                'notes' => 'Preparação para treino longo de corrida no sábado.',
                'room' => 'Box 02 - Recovery Esportivo'
            ],
            [
                'id' => 'apt_tomorrow_1',
                'patient_id' => 'pat_1',
                'patient_name' => 'João Carlos da Silva',
                'professional_id' => 'pro_2',
                'professional_name' => 'Dra. Camila Duarte',
                'date' => $dayAfterStr,
                'time' => '09:00',
                'duration_minutes' => 50,
                'service_type' => 'Sessão de Fisioterapia Lombar',
                'procedure' => 'Pilates Clínico & Estabilização',
                'treatment_plan_id' => 'plan_1',
                'status' => 'agendado',
                'notes' => 'Sessão nº 8 do pacote.',
                'room' => 'Sala 02 - Pilates Clínico'
            ],
            [
                'id' => 'apt_past_1',
                'patient_id' => 'pat_1',
                'patient_name' => 'João Carlos da Silva',
                'professional_id' => 'pro_2',
                'professional_name' => 'Dra. Camila Duarte',
                'date' => $yesterdayStr,
                'time' => '09:00',
                'duration_minutes' => 50,
                'service_type' => 'Sessão de Fisioterapia Lombar',
                'procedure' => 'Cinesioterapia lombar',
                'treatment_plan_id' => 'plan_1',
                'status' => 'realizado',
                'notes' => 'Realizada com sucesso e registrada na evolução clínica.',
                'room' => 'Sala 02 - Pilates Clínico'
            ]
        ];

        foreach ($appointments as $apt) {
            $this->repo->save('appointments', $apt);
            $this->redis->sadd("appointments:by_patient:{$apt['patient_id']}", $apt['id']);
            $this->redis->sadd("appointments:by_pro:{$apt['professional_id']}", $apt['id']);
            $this->redis->sadd("appointments:by_date:{$apt['date']}", $apt['id']);
        }

        // 9. Financial Transactions (Contas a receber, recebidos e despesas)
        $transactions = [
            [
                'id' => 'tx_1',
                'type' => 'receita',
                'category' => 'Pacote de Fisioterapia (10 sessões)',
                'description' => 'Pacote Reabilitação Lombar - João Carlos da Silva',
                'patient_id' => 'pat_1',
                'patient_name' => 'João Carlos da Silva',
                'amount' => 1800.00,
                'payment_method' => 'Pix',
                'status' => 'pago',
                'payment_date' => date('Y-m-d', strtotime('-3 weeks')),
                'receipt_number' => 'REC-2025-00124',
                'treatment_plan_id' => 'plan_1'
            ],
            [
                'id' => 'tx_2',
                'type' => 'receita',
                'category' => 'Pacote de Fisioterapia (20 sessões)',
                'description' => 'Pacote Pós-Operatório LCA - Mariana Costa (Parcela 1/2)',
                'patient_id' => 'pat_2',
                'patient_name' => 'Mariana Costa',
                'amount' => 1800.00,
                'payment_method' => 'Cartão de Crédito',
                'status' => 'pago',
                'payment_date' => date('Y-m-d', strtotime('-4 weeks')),
                'receipt_number' => 'REC-2025-00098',
                'treatment_plan_id' => 'plan_2'
            ],
            [
                'id' => 'tx_3',
                'type' => 'receita',
                'category' => 'Pacote de Fisioterapia (20 sessões)',
                'description' => 'Pacote Pós-Operatório LCA - Mariana Costa (Parcela 2/2)',
                'patient_id' => 'pat_2',
                'patient_name' => 'Mariana Costa',
                'amount' => 1800.00,
                'payment_method' => 'Boleto / Pix',
                'status' => 'pendente',
                'due_date' => date('Y-m-d', strtotime('+5 days')),
                'treatment_plan_id' => 'plan_2'
            ],
            [
                'id' => 'tx_4',
                'type' => 'receita',
                'category' => 'Sessão Avulsa de Avaliação',
                'description' => 'Avaliação Fisioterapêutica Inicial - Beatriz Albuquerque',
                'patient_id' => 'pat_4',
                'patient_name' => 'Beatriz Albuquerque',
                'amount' => 250.00,
                'payment_method' => 'Pix',
                'status' => 'pago',
                'payment_date' => date('Y-m-d', strtotime('-5 days')),
                'receipt_number' => 'REC-2025-00142'
            ],
            [
                'id' => 'tx_5',
                'type' => 'despesa',
                'category' => 'Aluguel & Condomínio',
                'description' => 'Aluguel do Consultório - Conjunto Paulista',
                'amount' => 4500.00,
                'payment_method' => 'Transferência Bancária',
                'status' => 'pago',
                'payment_date' => date('Y-m-d', strtotime('-10 days'))
            ],
            [
                'id' => 'tx_6',
                'type' => 'despesa',
                'category' => 'Insumos Clínicos',
                'description' => 'Eletrodos descartáveis TENS, therabands e gel condutor',
                'amount' => 640.00,
                'payment_method' => 'Cartão de Débito',
                'status' => 'pago',
                'payment_date' => date('Y-m-d', strtotime('-15 days'))
            ],
            [
                'id' => 'tx_7',
                'type' => 'despesa',
                'category' => 'Sistemas & Software',
                'description' => 'Hospedagem em Nuvem e Certificados Digitais',
                'amount' => 280.00,
                'payment_method' => 'Cartão de Crédito',
                'status' => 'pago',
                'payment_date' => date('Y-m-d', strtotime('-2 days'))
            ]
        ];

        foreach ($transactions as $tx) {
            $this->repo->save('transactions', $tx);
            if (!empty($tx['patient_id'])) {
                $this->redis->sadd("transactions:by_patient:{$tx['patient_id']}", $tx['id']);
            }
        }

        // 10. Web Requests (Solicitações vindas da Landing Page)
        $requests = [
            [
                'id' => 'req_1',
                'name' => 'Rodrigo Vasconcelos',
                'phone' => '(11) 99123-4567',
                'email' => 'rodrigo.vasc@gmail.com',
                'specialty' => 'Fisioterapia Traumato-Ortopédica',
                'preferred_shift' => 'Manhã',
                'preferred_date' => date('Y-m-d', strtotime('+3 days')),
                'message' => 'Sinto dores no joelho após correr 5km. Gostaria de agendar uma avaliação inicial.',
                'status' => 'nova', // nova, em_contato, confirmada, cancelada
                'created_at' => date('c', strtotime('-2 hours'))
            ],
            [
                'id' => 'req_2',
                'name' => 'Juliana Meirelles',
                'phone' => '(11) 98234-5678',
                'email' => 'juliana.meirelles@outlook.com',
                'specialty' => 'Tratamento de Coluna Vertebral',
                'preferred_shift' => 'Tarde',
                'preferred_date' => date('Y-m-d', strtotime('+2 days')),
                'message' => 'Fiz ressonância magnética que acusou protusão discal em L5-S1. Quero iniciar pilates clínico e fisioterapia.',
                'status' => 'em_contato',
                'created_at' => date('c', strtotime('-1 day'))
            ]
        ];

        foreach ($requests as $r) {
            $this->repo->save('web_requests', $r);
        }
    }
}


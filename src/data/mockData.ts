export type BeltRank = 'white' | 'blue' | 'purple' | 'brown' | 'black';

export interface Athlete {
  id: string;
  username: string;
  name: string;
  belt: BeltRank;
  academy: string;
  city: string;
  country: string;
  countryFlag: string;
  bio_pt: string;
  bio_en: string;
  photo: string;
  coverPhoto: string;
  subscribers: number;
  monthlyPrice: number;
  quarterlyPrice: number;
  annualPrice: number;
  contentCount: number;
}

export interface ContentItem {
  id: string;
  type: 'drill' | 'position' | 'plan' | 'live';
  title_pt: string;
  title_en: string;
  description_pt: string;
  description_en: string;
  thumbnail: string;
  duration?: string;
  athleteId: string;
  athleteName: string;
  athleteBelt: BeltRank;
  athletePhoto: string;
  createdAt: string;
  locked: boolean;
  liveDate?: string;
}

export const mockAthletes: Athlete[] = [
  {
    id: '1',
    username: 'lucasbarbosa',
    name: 'Lucas Barbosa',
    belt: 'black',
    academy: 'Atos Jiu-Jitsu',
    city: 'São Paulo',
    country: 'Brazil',
    countryFlag: '🇧🇷',
    bio_pt: 'Faixa preta 3º grau. Campeão mundial IBJJF 2022. Especialista em guarda De La Riva e raspagens dinâmicas. Treinando atletas de elite há mais de 10 anos.',
    bio_en: 'Third-degree black belt. IBJJF World Champion 2022. Specialist in De La Riva guard and dynamic sweeps. Training elite athletes for over 10 years.',
    photo: '',
    coverPhoto: '',
    subscribers: 127,
    monthlyPrice: 39,
    quarterlyPrice: 99,
    annualPrice: 349,
    contentCount: 84,
  },
  {
    id: '2',
    username: 'anasilva',
    name: 'Ana Silva',
    belt: 'brown',
    academy: 'Alliance BJJ',
    city: 'Rio de Janeiro',
    country: 'Brazil',
    countryFlag: '🇧🇷',
    bio_pt: 'Faixa marrom competidora. Especialista em triângulos e finalizações do guard bottom. Medalha de ouro no Pan-Americano 2023.',
    bio_en: 'Competitive brown belt. Triangle and bottom guard submission specialist. Pan-American Gold Medalist 2023.',
    photo: '',
    coverPhoto: '',
    subscribers: 89,
    monthlyPrice: 29,
    quarterlyPrice: 79,
    annualPrice: 279,
    contentCount: 56,
  },
  {
    id: '3',
    username: 'rafaelmendes',
    name: 'Rafael Mendes',
    belt: 'black',
    academy: 'Art of Jiu-Jitsu',
    city: 'Curitiba',
    country: 'Brazil',
    countryFlag: '🇧🇷',
    bio_pt: 'Múltiplo campeão mundial. Berimbolo e passagem de guarda moderna. Referência no jiu-jitsu competitivo.',
    bio_en: 'Multiple-time world champion. Berimbolo and modern guard passing. A reference in competitive jiu-jitsu.',
    photo: '',
    coverPhoto: '',
    subscribers: 342,
    monthlyPrice: 49,
    quarterlyPrice: 129,
    annualPrice: 449,
    contentCount: 156,
  },
  {
    id: '4',
    username: 'felipecosta',
    name: 'Felipe Costa',
    belt: 'purple',
    academy: 'Gracie Barra',
    city: 'Belo Horizonte',
    country: 'Brazil',
    countryFlag: '🇧🇷',
    bio_pt: 'Faixa roxa em ascensão. Foco em no-gi e leg locks. Competidor ativo no circuito ADCC.',
    bio_en: 'Rising purple belt. Focus on no-gi and leg locks. Active competitor on the ADCC circuit.',
    photo: '',
    coverPhoto: '',
    subscribers: 45,
    monthlyPrice: 19,
    quarterlyPrice: 49,
    annualPrice: 179,
    contentCount: 28,
  },
  {
    id: '5',
    username: 'camilaoliveira',
    name: 'Camila Oliveira',
    belt: 'black',
    academy: 'CheckMat',
    city: 'Salvador',
    country: 'Brazil',
    countryFlag: '🇧🇷',
    bio_pt: 'Faixa preta e professora. Especialista em defesa pessoal feminina e jiu-jitsu para iniciantes.',
    bio_en: 'Black belt and instructor. Specialist in women\'s self-defense and beginner jiu-jitsu.',
    photo: '',
    coverPhoto: '',
    subscribers: 203,
    monthlyPrice: 35,
    quarterlyPrice: 89,
    annualPrice: 319,
    contentCount: 112,
  },
  {
    id: '6',
    username: 'tiagoalves',
    name: 'Tiago Alves',
    belt: 'blue',
    academy: 'Nova União',
    city: 'Recife',
    country: 'Brazil',
    countryFlag: '🇧🇷',
    bio_pt: 'Faixa azul dedicado. Compartilhando minha jornada no jiu-jitsu e técnicas que aprendo no dia a dia.',
    bio_en: 'Dedicated blue belt. Sharing my jiu-jitsu journey and techniques I learn day by day.',
    photo: '',
    coverPhoto: '',
    subscribers: 18,
    monthlyPrice: 15,
    quarterlyPrice: 39,
    annualPrice: 139,
    contentCount: 12,
  },
];

export const mockContent: ContentItem[] = [
  {
    id: 'c1',
    type: 'drill',
    title_pt: 'Raspagem de Gancho — Detalhe do Quadril',
    title_en: 'Hook Sweep — Hip Detail',
    description_pt: 'Detalhes fundamentais do posicionamento do quadril para a raspagem de gancho.',
    description_en: 'Fundamental hip positioning details for the hook sweep.',
    thumbnail: '',
    duration: '3:45',
    athleteId: '1',
    athleteName: 'Lucas Barbosa',
    athleteBelt: 'black',
    athletePhoto: '',
    createdAt: '2024-03-10',
    locked: false,
  },
  {
    id: 'c2',
    type: 'position',
    title_pt: 'Guarda De La Riva — Controle Completo',
    title_en: 'De La Riva Guard — Full Control',
    description_pt: 'Como estabelecer e manter o controle total na guarda De La Riva.',
    description_en: 'How to establish and maintain full control in De La Riva guard.',
    thumbnail: '',
    duration: '8:12',
    athleteId: '1',
    athleteName: 'Lucas Barbosa',
    athleteBelt: 'black',
    athletePhoto: '',
    createdAt: '2024-03-08',
    locked: true,
  },
  {
    id: 'c3',
    type: 'plan',
    title_pt: 'Planilha Semanal — Foco em Raspagens',
    title_en: 'Weekly Training Plan — Sweep Focus',
    description_pt: 'Plano de treino semanal focado em raspagens para competidores.',
    description_en: 'Weekly training plan focused on sweeps for competitors.',
    thumbnail: '',
    athleteId: '1',
    athleteName: 'Lucas Barbosa',
    athleteBelt: 'black',
    athletePhoto: '',
    createdAt: '2024-03-05',
    locked: true,
  },
  {
    id: 'c4',
    type: 'live',
    title_pt: 'Live — Perguntas e Respostas sobre Competição',
    title_en: 'Live — Competition Q&A',
    description_pt: 'Sessão ao vivo para tirar dúvidas sobre preparação para campeonatos.',
    description_en: 'Live session to answer questions about championship preparation.',
    thumbnail: '',
    athleteId: '1',
    athleteName: 'Lucas Barbosa',
    athleteBelt: 'black',
    athletePhoto: '',
    createdAt: '2024-03-15',
    locked: false,
    liveDate: '2024-03-20T19:00:00',
  },
  {
    id: 'c5',
    type: 'drill',
    title_pt: 'Triângulo do Guard Bottom — Setup Perfeito',
    title_en: 'Bottom Guard Triangle — Perfect Setup',
    description_pt: 'O setup perfeito para o triângulo partindo da guarda fechada.',
    description_en: 'The perfect setup for the triangle from closed guard.',
    thumbnail: '',
    duration: '5:30',
    athleteId: '2',
    athleteName: 'Ana Silva',
    athleteBelt: 'brown',
    athletePhoto: '',
    createdAt: '2024-03-09',
    locked: false,
  },
  {
    id: 'c6',
    type: 'drill',
    title_pt: 'Berimbolo — Entrada e Finalização',
    title_en: 'Berimbolo — Entry and Finish',
    description_pt: 'Sequência completa de berimbolo com detalhes de entrada e finalização nas costas.',
    description_en: 'Complete berimbolo sequence with entry details and back finish.',
    thumbnail: '',
    duration: '6:20',
    athleteId: '3',
    athleteName: 'Rafael Mendes',
    athleteBelt: 'black',
    athletePhoto: '',
    createdAt: '2024-03-11',
    locked: true,
  },
];

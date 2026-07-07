// ─────────────────────────────────────────────
// 게임 정적 데이터: 클래스, 스킬트리, 장비, 몬스터
// ─────────────────────────────────────────────

const CLASSES = {
  warrior: {
    name: '발더', cls: '전사', emoji: '🛡️', sprite: 'hero_warrior',
    base: { hp: 120, mp: 30, atk: 16, def: 14, mag: 4, spd: 8, crit: 5 },
    growth: { hp: 18, mp: 3, atk: 3.2, def: 2.6, mag: 0.5, spd: 0.8, crit: 0.2 },
  },
  rogue: {
    name: '실피', cls: '도적', emoji: '🗡️', sprite: 'hero_rogue',
    base: { hp: 90, mp: 40, atk: 14, def: 8, mag: 6, spd: 15, crit: 15 },
    growth: { hp: 12, mp: 4, atk: 2.8, def: 1.4, mag: 0.8, spd: 1.6, crit: 0.6 },
  },
  mage: {
    name: '메릴', cls: '마법사', emoji: '🔮', sprite: 'hero_mage',
    base: { hp: 70, mp: 80, atk: 6, def: 6, mag: 20, spd: 10, crit: 8 },
    growth: { hp: 9, mp: 9, atk: 0.8, def: 1.0, mag: 3.5, spd: 1.0, crit: 0.3 },
  },
  cleric: {
    name: '루나', cls: '성직자', emoji: '✨', sprite: 'hero_cleric',
    base: { hp: 85, mp: 70, atk: 8, def: 10, mag: 16, spd: 9, crit: 5 },
    growth: { hp: 11, mp: 8, atk: 1.2, def: 1.8, mag: 2.8, spd: 0.9, crit: 0.2 },
  },
};

// 스킬 정의
// type: active | passive
// kind: phys(atk 기반) | mag(mag 기반) | heal | buff
// target: enemy | all-enemies | ally | all-allies | self
const SKILLS = {
  // ── 전사 ──
  power_strike: { name: '강타', type: 'active', kind: 'phys', target: 'enemy', mult: 1.6, mp: 8, desc: '적 하나에게 160% 물리 피해' },
  whirlwind:    { name: '회전베기', type: 'active', kind: 'phys', target: 'all-enemies', mult: 1.0, mp: 14, desc: '모든 적에게 100% 물리 피해' },
  rage_blow:    { name: '분노의 일격', type: 'active', kind: 'phys', target: 'enemy', mult: 2.5, mp: 22, desc: '적 하나에게 250% 물리 피해' },
  iron_wall:    { name: '철벽', type: 'passive', stat: 'def', pct: 20, desc: '방어력 +20%' },
  taunt_guard:  { name: '수호의 함성', type: 'active', kind: 'buff', target: 'all-allies', buff: { stat: 'def', pct: 30, turns: 3 }, mp: 12, desc: '3턴간 아군 전체 방어력 +30%' },
  undying:      { name: '불굴', type: 'passive', stat: 'hp', pct: 15, desc: '최대 생명력 +15%' },
  // ── 도적 ──
  vital_stab:   { name: '급소 찌르기', type: 'active', kind: 'phys', target: 'enemy', mult: 1.5, critBonus: 25, mp: 8, desc: '150% 피해, 치명타 확률 +25%p' },
  poison_blade: { name: '독칼', type: 'active', kind: 'phys', target: 'enemy', mult: 1.2, dot: { pct: 0.5, turns: 3 }, mp: 12, desc: '120% 피해 + 3턴간 중독' },
  shadow_kill:  { name: '그림자 일격', type: 'active', kind: 'phys', target: 'enemy', mult: 2.2, critBonus: 100, mp: 20, desc: '220% 피해, 반드시 치명타' },
  swiftness:    { name: '신속', type: 'passive', stat: 'spd', pct: 20, desc: '속도 +20%' },
  double_hit:   { name: '연속 공격', type: 'active', kind: 'phys', target: 'enemy', mult: 0.9, hits: 2, mp: 10, desc: '90% 피해로 2회 공격' },
  keen_eye:     { name: '예리한 눈', type: 'passive', stat: 'crit', pct: 40, desc: '치명타 확률 +40%' },
  // ── 마법사 ──
  fireball:     { name: '파이어볼', type: 'active', kind: 'mag', target: 'enemy', mult: 1.8, mp: 10, desc: '적 하나에게 180% 마법 피해' },
  flame_burst:  { name: '화염 폭발', type: 'active', kind: 'mag', target: 'all-enemies', mult: 1.3, mp: 20, desc: '모든 적에게 130% 마법 피해' },
  meteor:       { name: '메테오', type: 'active', kind: 'mag', target: 'all-enemies', mult: 2.2, mp: 34, desc: '모든 적에게 220% 마법 피해' },
  mana_spring:  { name: '마나샘', type: 'passive', stat: 'mp', pct: 30, desc: '최대 마나 +30%' },
  arcane_amp:   { name: '마력 증폭', type: 'passive', stat: 'mag', pct: 20, desc: '마력 +20%' },
  arcane_nova:  { name: '비전 폭발', type: 'active', kind: 'mag', target: 'enemy', mult: 3.2, mp: 30, desc: '적 하나에게 320% 마법 피해' },
  // ── 성직자 ──
  heal:         { name: '치유', type: 'active', kind: 'heal', target: 'ally', mult: 2.0, mp: 10, desc: '아군 하나의 생명력 회복 (마력 200%)' },
  blessing:     { name: '축복', type: 'active', kind: 'buff', target: 'all-allies', buff: { stat: 'atk', pct: 25, turns: 3 }, mp: 16, desc: '3턴간 아군 전체 공격력 +25%' },
  mass_heal:    { name: '대치유', type: 'active', kind: 'heal', target: 'all-allies', mult: 1.4, mp: 26, desc: '아군 전체 회복 (마력 140%)' },
  holy_strike:  { name: '성스러운 일격', type: 'active', kind: 'mag', target: 'enemy', mult: 1.4, mp: 8, desc: '적 하나에게 140% 신성 피해' },
  retribution:  { name: '응징', type: 'passive', stat: 'mag', pct: 15, desc: '마력 +15%' },
  judgement:    { name: '심판의 빛', type: 'active', kind: 'mag', target: 'all-enemies', mult: 1.8, mp: 28, desc: '모든 적에게 180% 신성 피해' },
};

// 클래스별 스킬트리: 2갈래 × 3티어, 이전 노드를 배워야 다음 노드 해금
const SKILL_TREES = {
  warrior: [
    { title: '무기술', nodes: ['power_strike', 'whirlwind', 'rage_blow'] },
    { title: '수호',   nodes: ['iron_wall', 'taunt_guard', 'undying'] },
  ],
  rogue: [
    { title: '암살',   nodes: ['vital_stab', 'poison_blade', 'shadow_kill'] },
    { title: '민첩',   nodes: ['swiftness', 'double_hit', 'keen_eye'] },
  ],
  mage: [
    { title: '화염',   nodes: ['fireball', 'flame_burst', 'meteor'] },
    { title: '비전',   nodes: ['mana_spring', 'arcane_amp', 'arcane_nova'] },
  ],
  cleric: [
    { title: '신성',   nodes: ['heal', 'blessing', 'mass_heal'] },
    { title: '심판',   nodes: ['holy_strike', 'retribution', 'judgement'] },
  ],
};

// ── 장비 ──
const RARITIES = [
  { id: 'common', name: '일반',   mult: 1.0, affixes: 0, weight: 50, sell: 20 },
  { id: 'magic',  name: '마법',   mult: 1.25, affixes: 1, weight: 30, sell: 60 },
  { id: 'rare',   name: '레어',   mult: 1.55, affixes: 2, weight: 13, sell: 180 },
  { id: 'epic',   name: '에픽',   mult: 2.0, affixes: 3, weight: 5, sell: 500 },
  { id: 'legend', name: '레전드', mult: 2.6, affixes: 4, weight: 2, sell: 1500 },
];

const BASE_ITEMS = {
  weapon: [
    { name: '장검', emoji: '🗡️', stat: 'atk', sprite: 'item_sword' },
    { name: '전투도끼', emoji: '🪓', stat: 'atk', sprite: 'item_axe' },
    { name: '마법지팡이', emoji: '🪄', stat: 'mag', sprite: 'item_staff' },
    { name: '단검', emoji: '🔪', stat: 'atk', sprite: 'item_dagger' },
  ],
  armor: [
    { name: '판금갑옷', emoji: '🛡️', stat: 'def', sprite: 'item_plate' },
    { name: '가죽갑옷', emoji: '🥋', stat: 'def', sprite: 'item_leather' },
    { name: '로브', emoji: '🧥', stat: 'def', sprite: 'item_robe' },
  ],
  accessory: [
    { name: '반지', emoji: '💍', stat: 'crit', sprite: 'item_ring' },
    { name: '목걸이', emoji: '📿', stat: 'mag', sprite: 'item_amulet' },
    { name: '부적', emoji: '🧿', stat: 'hp', sprite: 'item_charm' },
  ],
};

const AFFIX_POOL = ['hp', 'mp', 'atk', 'def', 'mag', 'spd', 'crit'];

// 레전드 전용 접두어
const LEGEND_PREFIX = ['용살자의', '심연의', '태초의', '왕의', '별빛의'];
const STAT_NAMES = { hp: '생명력', mp: '마나', atk: '공격력', def: '방어력', mag: '마력', spd: '속도', crit: '치명타' };

// ── 몬스터 ──
const ENEMIES = [
  { name: '고블린', emoji: '👺', sprite: 'goblin', hp: 45, atk: 10, def: 4, mag: 0, spd: 9, minFloor: 1 },
  { name: '늑대', emoji: '🐺', sprite: 'wolf', hp: 55, atk: 12, def: 3, mag: 0, spd: 13, minFloor: 1 },
  { name: '슬라임', emoji: '🟢', sprite: 'slime', hp: 70, atk: 8, def: 8, mag: 0, spd: 5, minFloor: 1 },
  { name: '해골병사', emoji: '💀', sprite: 'skeleton', hp: 65, atk: 14, def: 7, mag: 0, spd: 8, minFloor: 3 },
  { name: '오크', emoji: '👹', sprite: 'orc', hp: 90, atk: 17, def: 9, mag: 0, spd: 7, minFloor: 4 },
  { name: '박쥐떼', emoji: '🦇', sprite: 'bat', hp: 50, atk: 13, def: 2, mag: 0, spd: 17, minFloor: 4 },
  { name: '암흑술사', emoji: '🧙', sprite: 'darkmage', hp: 70, atk: 6, def: 5, mag: 18, spd: 10, minFloor: 6 },
  { name: '거미여왕', emoji: '🕷️', sprite: 'spider', hp: 85, atk: 16, def: 8, mag: 6, spd: 12, minFloor: 7 },
  { name: '트롤', emoji: '🧌', sprite: 'troll', hp: 140, atk: 20, def: 12, mag: 0, spd: 5, minFloor: 8 },
  { name: '가고일', emoji: '🗿', sprite: 'gargoyle', hp: 110, atk: 18, def: 16, mag: 4, spd: 8, minFloor: 10 },
  { name: '망령기사', emoji: '⚔️', sprite: 'wraith', hp: 120, atk: 24, def: 12, mag: 8, spd: 11, minFloor: 12 },
  { name: '키메라', emoji: '🦁', sprite: 'chimera', hp: 150, atk: 26, def: 12, mag: 12, spd: 13, minFloor: 14 },
];

const BOSSES = [
  { name: '고블린 족장', emoji: '👺', sprite: 'boss_goblin', hp: 260, atk: 20, def: 10, mag: 0, spd: 10 },
  { name: '해골 군주', emoji: '☠️', sprite: 'boss_skeleton', hp: 380, atk: 26, def: 14, mag: 10, spd: 11 },
  { name: '심연의 마녀', emoji: '🧙‍♀️', sprite: 'boss_witch', hp: 460, atk: 14, def: 12, mag: 30, spd: 13 },
  { name: '서리 거인', emoji: '🧊', sprite: 'boss_giant', hp: 650, atk: 34, def: 20, mag: 8, spd: 8 },
  { name: '흑염룡', emoji: '🐉', sprite: 'boss_dragon', hp: 900, atk: 42, def: 24, mag: 24, spd: 14 },
];

const FLOOR_DESCS = [
  '이끼 낀 돌계단이 어둠 속으로 이어진다.',
  '벽에 걸린 횃불이 낯선 그림자를 만든다.',
  '차가운 바람이 탑 위쪽에서 불어온다.',
  '오래된 전투의 흔적이 바닥에 남아 있다.',
  '어디선가 낮은 울음소리가 들려온다.',
];

const BATTLES_PER_FLOOR = 3;

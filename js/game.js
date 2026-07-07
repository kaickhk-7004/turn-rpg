// ─────────────────────────────────────────────
// 게임 상태, 성장(레벨/스킬트리), 장비, 저장/불러오기
// ─────────────────────────────────────────────

const SAVE_KEY = 'turn-rpg-save-v1';
let G = null; // 전역 게임 상태

function newGame() {
  G = {
    floor: 1,
    battleInFloor: 0, // 이번 층에서 이긴 전투 수
    gold: 100,
    potions: 3,
    inventory: [], // 미장착 장비
    heroes: Object.keys(CLASSES).map(clsId => makeHero(clsId)),
  };
  saveGame();
}

function makeHero(clsId) {
  const c = CLASSES[clsId];
  const h = {
    clsId,
    level: 1,
    xp: 0,
    skillPoints: 1,
    learned: {},
    equip: { weapon: null, armor: null, accessory: null },
    curHp: 0, curMp: 0,
  };
  const s = heroStats(h);
  h.curHp = s.hp;
  h.curMp = s.mp;
  return h;
}

// 파생 능력치 = 기본 + 성장 + 장비 + 패시브
function heroStats(h) {
  const c = CLASSES[h.clsId];
  const s = {};
  for (const k in c.base) {
    s[k] = Math.round(c.base[k] + c.growth[k] * (h.level - 1));
  }
  // 장비 보너스
  for (const slot in h.equip) {
    const it = h.equip[slot];
    if (!it) continue;
    for (const k in it.stats) s[k] += it.stats[k];
  }
  // 패시브 스킬 (%) — 레벨 비례 강화
  for (const skId in h.learned) {
    const sk = SKILLS[skId];
    if (sk.type === 'passive') {
      s[sk.stat] = Math.round(s[sk.stat] * (1 + passivePct(sk, skillLevel(h, skId)) / 100));
    }
  }
  return s;
}

// 스킬 레벨 (구버전 세이브의 true는 1로 취급)
function skillLevel(h, skillId) {
  const v = h.learned[skillId];
  return v === true ? 1 : (v || 0);
}

// 레벨 반영 수치
function passivePct(sk, lv) { return Math.round(sk.pct * (1 + PASSIVE_LV_BONUS * (Math.max(lv, 1) - 1))); }
function activeMult(sk, lv) { return sk.mult * (1 + ACTIVE_LV_BONUS * (Math.max(lv, 1) - 1)); }

function xpNeeded(level) {
  return Math.round(80 * level * Math.pow(1.15, level - 1));
}

// 경험치 획득 → 레벨업 목록 반환
function gainXp(h, amount) {
  const ups = [];
  h.xp += amount;
  while (h.xp >= xpNeeded(h.level)) {
    h.xp -= xpNeeded(h.level);
    h.level += 1;
    h.skillPoints += 1;
    const s = heroStats(h);
    h.curHp = s.hp; // 레벨업 시 전체 회복
    h.curMp = s.mp;
    ups.push(h.level);
  }
  return ups;
}

// 스킬트리: 배울 수 있는지 (이전 노드 선행 + 포인트)
function canLearn(h, skillId) {
  if (h.learned[skillId] || h.skillPoints < 1) return false;
  const tree = SKILL_TREES[h.clsId];
  for (const branch of tree) {
    const idx = branch.nodes.indexOf(skillId);
    if (idx === -1) continue;
    if (idx === 0) return true;
    return !!h.learned[branch.nodes[idx - 1]];
  }
  return false;
}

function learnSkill(h, skillId) {
  if (!canLearn(h, skillId)) return false;
  h.learned[skillId] = 1;
  h.skillPoints -= 1;
  // 패시브로 최대치가 오르면 현재치도 비례 유지
  const s = heroStats(h);
  h.curHp = Math.min(h.curHp, s.hp);
  h.curMp = Math.min(h.curMp, s.mp);
  saveGame();
  return true;
}

// 배운 스킬 강화
function canUpgrade(h, skillId) {
  const lv = skillLevel(h, skillId);
  return lv >= 1 && lv < MAX_SKILL_LV && h.skillPoints >= 1;
}

function upgradeSkill(h, skillId) {
  if (!canUpgrade(h, skillId)) return false;
  h.learned[skillId] = skillLevel(h, skillId) + 1;
  h.skillPoints -= 1;
  saveGame();
  return true;
}

// ── 장비 생성 ──
function rollRarity(bonusWeight = 0) {
  // bonusWeight: 보스 보상 등에서 상위 등급 확률 가중
  const pool = RARITIES.map((r, i) => ({ r, w: r.weight + (i >= 2 ? bonusWeight : 0) }));
  const total = pool.reduce((a, p) => a + p.w, 0);
  let roll = Math.random() * total;
  for (const p of pool) {
    roll -= p.w;
    if (roll <= 0) return p.r;
  }
  return RARITIES[0];
}

function makeItem(floor, bonusWeight = 0) {
  const slots = Object.keys(BASE_ITEMS);
  const slot = slots[Math.floor(Math.random() * slots.length)];
  const base = BASE_ITEMS[slot][Math.floor(Math.random() * BASE_ITEMS[slot].length)];
  const rarity = rollRarity(bonusWeight);

  const mainVal = Math.max(1, Math.round((3 + floor * 1.6) * rarity.mult));
  const stats = { [base.stat]: mainVal };

  // 등급별 부가 옵션
  const affixes = [...AFFIX_POOL].sort(() => Math.random() - 0.5).slice(0, rarity.affixes);
  for (const a of affixes) {
    const v = Math.max(1, Math.round((2 + floor * 0.8) * rarity.mult * (a === 'hp' || a === 'mp' ? 3 : 1)));
    stats[a] = (stats[a] || 0) + v;
  }

  let name = `${base.name}`;
  if (rarity.id === 'magic') name = `마법의 ${name}`;
  if (rarity.id === 'rare') name = `정교한 ${name}`;
  if (rarity.id === 'epic') name = `영웅의 ${name}`;
  if (rarity.id === 'legend') name = `${LEGEND_PREFIX[Math.floor(Math.random() * LEGEND_PREFIX.length)]} ${name}`;

  return {
    id: Date.now() + '-' + Math.floor(Math.random() * 1e6),
    name, slot, emoji: base.emoji, sprite: base.sprite,
    rarity: rarity.id, rarityName: rarity.name,
    stats, sell: rarity.sell + floor * 5,
  };
}

function equipItem(h, item) {
  const prev = h.equip[item.slot];
  h.equip[item.slot] = item;
  G.inventory = G.inventory.filter(i => i.id !== item.id);
  if (prev) G.inventory.push(prev);
  const s = heroStats(h);
  h.curHp = Math.min(h.curHp, s.hp);
  h.curMp = Math.min(h.curMp, s.mp);
  saveGame();
}

function sellItem(item) {
  G.inventory = G.inventory.filter(i => i.id !== item.id);
  G.gold += item.sell;
  saveGame();
}

function itemStatText(item) {
  return Object.entries(item.stats).map(([k, v]) => `${STAT_NAMES[k]} +${v}`).join(' · ');
}

// ── 저장/불러오기 ──
function saveGame() {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(G)); } catch (e) { /* 사파리 프라이빗 모드 등 */ }
}

function loadGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return false;
    G = JSON.parse(raw);
    return true;
  } catch (e) { return false; }
}

function hasSave() {
  try { return !!localStorage.getItem(SAVE_KEY); } catch (e) { return false; }
}

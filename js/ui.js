// ─────────────────────────────────────────────
// 화면 렌더링과 입력 처리
// ─────────────────────────────────────────────

const $ = sel => document.querySelector(sel);
const $$ = sel => document.querySelectorAll(sel);

let pendingAction = null; // { unit, type: 'attack'|'skill', skillId }
let detailHero = null;    // 상세 화면에 표시 중인 영웅

// 스프라이트가 있으면 픽셀아트 이미지, 없으면 이모지로
function iconHTML(obj, size) {
  if (obj && obj.sprite) {
    return `<img class="sprite" src="assets/sprites/${obj.sprite}.png" width="${size}" height="${size}" alt="">`;
  }
  return `<span style="font-size:${Math.round(size * 0.85)}px">${obj ? obj.emoji : ''}</span>`;
}

// ── 화면 전환 ──
function showScreen(id) {
  $$('.screen').forEach(s => s.classList.remove('active'));
  $(`#screen-${id}`).classList.add('active');
  $$('.nav-btn').forEach(b => b.classList.toggle('active', b.dataset.screen === id));
  $('#bottom-nav').classList.toggle('hidden', id === 'title' || id === 'battle');
  if (id === 'main') renderMain();
  if (id === 'party') renderParty();
  if (id === 'bag') renderBag();
}

// ── 타이틀 ──
function initTitle() {
  if (hasSave()) $('#btn-continue').classList.remove('hidden');
  $('#btn-continue').onclick = () => { loadGame(); showScreen('main'); };
  $('#btn-newgame').onclick = () => {
    if (hasSave() && !confirm('저장된 모험이 있습니다. 새로 시작할까요?')) return;
    newGame();
    showScreen('main');
  };
}

// ── 메인 ──
function renderMain() {
  $('#main-floor').textContent = `${G.floor}층${isBossFloor(G.floor) ? ' 👑 보스' : ''}`;
  $('#main-gold').textContent = `🪙 ${G.gold}`;
  $('#main-desc').textContent = FLOOR_DESCS[G.floor % FLOOR_DESCS.length];

  const prog = $('#main-progress');
  prog.innerHTML = '';
  const total = isBossFloor(G.floor) ? 1 : BATTLES_PER_FLOOR;
  for (let i = 0; i < total; i++) {
    const dot = document.createElement('div');
    dot.className = 'progress-dot' + (isBossFloor(G.floor) ? ' boss' : '') + (i < G.battleInFloor ? ' done' : '');
    prog.appendChild(dot);
  }

  const strip = $('#party-strip');
  strip.innerHTML = '';
  for (const h of G.heroes) {
    const c = CLASSES[h.clsId];
    const s = heroStats(h);
    const div = document.createElement('div');
    div.className = 'strip-hero';
    div.innerHTML = `
      <div class="emoji">${iconHTML(c, 32)}</div>
      <div class="name">${c.name}</div>
      <div class="lv">Lv.${h.level}</div>
      <div class="bar bar-hp"><div class="bar-fill" style="width:${(h.curHp / s.hp) * 100}%"></div></div>
    `;
    strip.appendChild(div);
  }
}

// ── 전투 화면 ──
function uiBattleInit() {
  showScreen('battle');
  $('#battle-log').innerHTML = '';
  $('#battle-result').classList.add('hidden');
  uiHideActionBar();
  uiBattleRender();
}

function uiBattleHeader() {
  $('#battle-floor').textContent = `${G.floor}층`;
  $('#battle-round').textContent = `ROUND ${B.round}`;
}

function uiBattleRender() {
  const ea = $('#enemy-area');
  ea.innerHTML = '';
  B.enemies.forEach((u, i) => {
    const div = document.createElement('div');
    div.className = 'enemy-card' + (u.isBoss ? ' boss' : '') + (u.curHp <= 0 ? ' dead' : '');
    div.dataset.enemyIdx = i;
    div.innerHTML = `
      <div class="emoji">${iconHTML(u, u.isBoss ? 72 : 44)}</div>
      <div class="name">${u.name}</div>
      <div class="bar bar-hp"><div class="bar-fill" style="width:${(u.curHp / u.stats.hp) * 100}%"></div></div>
      <div class="hp-num">${u.curHp}/${u.stats.hp}</div>
    `;
    div.onclick = () => onEnemyTap(u);
    ea.appendChild(div);
    u.el = div;
  });

  const ha = $('#hero-area');
  ha.innerHTML = '';
  B.heroes.forEach((u, i) => {
    const div = document.createElement('div');
    div.className = 'hero-card' + (u.curHp <= 0 ? ' dead' : '');
    div.dataset.heroIdx = i;
    div.innerHTML = `
      <div class="emoji">${iconHTML(u, 30)}</div>
      <div class="info">
        <div class="name">${u.name} <span style="color:var(--text-dim)">Lv.${u.hero.level}</span></div>
        <div class="bar bar-hp"><div class="bar-fill" style="width:${(u.curHp / u.stats.hp) * 100}%"></div></div>
        <div class="bar bar-mp"><div class="bar-fill" style="width:${(u.curMp / u.stats.mp) * 100}%"></div></div>
        <div class="nums">${u.curHp}/${u.stats.hp} · MP ${u.curMp}</div>
      </div>
    `;
    div.onclick = () => onHeroTap(u);
    ha.appendChild(div);
    u.el = div;
  });

  // 대상 선택 하이라이트 유지
  if (pendingAction) highlightTargets();
}

function logLine(text, cls = '') {
  const log = $('#battle-log');
  const div = document.createElement('div');
  if (cls) div.className = `log-${cls}`;
  div.textContent = text;
  log.appendChild(div);
  log.scrollTop = log.scrollHeight;
}

function uiFloater(unit, text, cls) {
  if (!unit.el) return;
  const f = document.createElement('div');
  f.className = `floater ${cls}`;
  f.textContent = text;
  unit.el.appendChild(f);
  setTimeout(() => f.remove(), 900);
}

function uiShake(unit) {
  if (!unit.el) return;
  unit.el.classList.add('shake');
  setTimeout(() => unit.el && unit.el.classList.remove('shake'), 350);
}

function uiEnemyActing(unit, on) {
  if (!unit.el) return;
  unit.el.classList.toggle('acting', on);
}

// ── 행동 선택 ──
function uiShowActionBar(u) {
  uiBattleRender();
  if (u.el) u.el.classList.add('active-turn');
  pendingAction = null;
  $('#action-bar').classList.remove('hidden');
  $('#action-hero-name').innerHTML = `${iconHTML(u, 18)} ${u.name}의 턴`;
  $('#skill-select').classList.add('hidden');
  $('#target-hint').classList.add('hidden');

  const potionBtn = $('[data-action="potion"]');
  potionBtn.disabled = G.potions < 1;
  potionBtn.textContent = `🧪 물약 (${G.potions})`;

  $$('.btn-action').forEach(btn => {
    btn.onclick = () => onActionButton(u, btn.dataset.action);
  });
}

function uiHideActionBar() {
  pendingAction = null;
  $('#action-bar').classList.add('hidden');
}

function onActionButton(u, action) {
  $('#skill-select').classList.add('hidden');
  $('#target-hint').classList.add('hidden');
  clearHighlights();

  if (action === 'attack') {
    pendingAction = { unit: u, type: 'attack', targetSide: 'enemy' };
    askTarget();
  } else if (action === 'defend') {
    heroDefend(u);
  } else if (action === 'potion') {
    heroPotion(u);
  } else if (action === 'skill') {
    showSkillSelect(u);
  }
}

function showSkillSelect(u) {
  const box = $('#skill-select');
  box.innerHTML = '';
  const actives = Object.keys(u.hero.learned).filter(id => SKILLS[id].type === 'active');
  if (actives.length === 0) {
    box.innerHTML = '<div style="text-align:center;color:var(--text-dim);font-size:13px;padding:8px">배운 액티브 스킬이 없습니다. 스킬트리에서 배워보세요!</div>';
    box.classList.remove('hidden');
    return;
  }
  for (const id of actives) {
    const sk = SKILLS[id];
    const btn = document.createElement('button');
    btn.className = 'skill-option' + (u.curMp < sk.mp ? ' no-mp' : '');
    btn.innerHTML = `<span>${sk.name} <span style="color:var(--accent);font-size:11px">Lv.${skillLevel(u.hero, id)}</span></span><span class="mp-cost">MP ${sk.mp}</span>`;
    btn.title = sk.desc;
    btn.onclick = () => {
      box.classList.add('hidden');
      if (sk.target === 'enemy') {
        pendingAction = { unit: u, type: 'skill', skillId: id, targetSide: 'enemy' };
        askTarget();
      } else if (sk.target === 'ally') {
        pendingAction = { unit: u, type: 'skill', skillId: id, targetSide: 'hero' };
        askTarget();
      } else {
        heroSkill(u, id, null); // 전체 대상
      }
    };
    box.appendChild(btn);
  }
  box.classList.remove('hidden');
}

function askTarget() {
  $('#target-hint').classList.remove('hidden');
  highlightTargets();
}

function highlightTargets() {
  clearHighlights();
  if (!pendingAction) return;
  if (pendingAction.targetSide === 'enemy') {
    B.enemies.forEach(u => { if (u.curHp > 0 && u.el) u.el.classList.add('targetable'); });
  } else {
    B.heroes.forEach(u => { if (u.curHp > 0 && u.el) u.el.classList.add('targetable'); });
  }
}

function clearHighlights() {
  $$('.targetable').forEach(el => el.classList.remove('targetable'));
}

function onEnemyTap(u) {
  if (!pendingAction || pendingAction.targetSide !== 'enemy' || u.curHp <= 0) return;
  const pa = pendingAction;
  pendingAction = null;
  clearHighlights();
  if (pa.type === 'attack') heroAttack(pa.unit, u);
  else heroSkill(pa.unit, pa.skillId, u);
}

function onHeroTap(u) {
  if (!pendingAction || pendingAction.targetSide !== 'hero' || u.curHp <= 0) return;
  const pa = pendingAction;
  pendingAction = null;
  clearHighlights();
  heroSkill(pa.unit, pa.skillId, u);
}

// ── 전투 결과 ──
function uiShowResult(won, data) {
  uiHideActionBar();
  const box = $('#battle-result');
  if (won) {
    let html = `<h2>⚔️ 승리!</h2>
      <div class="reward-line">🪙 ${data.gold} 골드 · ✨ ${data.xp} 경험치</div>`;
    if (data.levelUps.length > 0) {
      html += `<div class="reward-line" style="color:var(--xp)">🎉 레벨 업! ${data.levelUps.join(' · ')}</div>`;
    }
    if (data.drop) {
      html += `<div class="reward-line rb-${data.drop.rarity}" style="padding-left:8px">
        ${iconHTML(data.drop, 24)} <span class="r-${data.drop.rarity}">[${data.drop.rarityName}] ${data.drop.name}</span><br>
        <span style="font-size:12px;color:var(--text-dim)">${itemStatText(data.drop)}</span>
      </div>`;
    }
    html += `<button class="btn btn-primary btn-large" onclick="showScreen('main')">계속</button>`;
    box.innerHTML = html;
  } else {
    box.innerHTML = `<h2 style="color:var(--hp)">💀 패배...</h2>
      <div class="reward-line">🪙 ${data.lost} 골드를 잃었다</div>
      <div class="reward-line" style="font-size:13px;color:var(--text-dim)">파티가 절반의 체력으로 회복되었습니다.<br>장비를 정비하고 다시 도전하세요!</div>
      <button class="btn btn-large" onclick="showScreen('main')">돌아가기</button>`;
  }
  box.classList.remove('hidden');
}

// ── 파티 ──
function renderParty() {
  $('#party-gold').textContent = `🪙 ${G.gold}`;
  const list = $('#party-list');
  list.innerHTML = '';
  for (const h of G.heroes) {
    const c = CLASSES[h.clsId];
    const s = heroStats(h);
    const row = document.createElement('div');
    row.className = 'party-row';
    row.innerHTML = `
      <div class="emoji">${iconHTML(c, 40)}</div>
      <div class="info">
        <div class="name">${c.name} <span class="cls">${c.cls}</span>
          ${h.skillPoints > 0 ? `<span class="sp-badge">SP ${h.skillPoints}</span>` : ''}
        </div>
        <div class="bar bar-hp"><div class="bar-fill" style="width:${(h.curHp / s.hp) * 100}%"></div></div>
        <div class="bar bar-xp"><div class="bar-fill" style="width:${(h.xp / xpNeeded(h.level)) * 100}%"></div></div>
      </div>
      <div class="lv">Lv.${h.level}</div>
    `;
    row.onclick = () => { detailHero = h; renderHeroDetail(); showScreen('hero'); };
    list.appendChild(row);
  }
}

// ── 영웅 상세 ──
function renderHeroDetail() {
  const h = detailHero;
  const c = CLASSES[h.clsId];
  $('#hero-detail-name').innerHTML = `${iconHTML(c, 20)} ${c.name} · ${c.cls} Lv.${h.level}`;
  renderHeroStats();
  renderHeroEquip();
  renderHeroTree();
}

function renderHeroStats() {
  const h = detailHero;
  const s = heroStats(h);
  const base = CLASSES[h.clsId].base;
  const growth = CLASSES[h.clsId].growth;
  const tab = $('#hero-tab-stats');
  const rows = ['hp', 'mp', 'atk', 'def', 'mag', 'spd', 'crit'].map(k => {
    const pure = Math.round(base[k] + growth[k] * (h.level - 1));
    const bonus = s[k] - pure;
    return `<div class="stat-cell">
      <span class="label">${STAT_NAMES[k]}</span>
      <span>${s[k]}${bonus > 0 ? ` <span class="bonus">(+${bonus})</span>` : ''}</span>
    </div>`;
  }).join('');
  tab.innerHTML = `
    <div class="stat-cell"><span class="label">경험치</span><span>${h.xp} / ${xpNeeded(h.level)}</span></div>
    <div class="stat-grid">${rows}</div>
  `;
}

function renderHeroEquip() {
  const h = detailHero;
  const tab = $('#hero-tab-equip');
  const slotNames = { weapon: '무기', armor: '방어구', accessory: '장신구' };
  tab.innerHTML = '';
  for (const slot of ['weapon', 'armor', 'accessory']) {
    const it = h.equip[slot];
    const div = document.createElement('div');
    div.className = 'equip-slot' + (it ? ` rb-${it.rarity}` : '');
    if (it) {
      div.innerHTML = `
        <span class="slot-name">${slotNames[slot]}</span>
        ${iconHTML(it, 28)}
        <div style="flex:1">
          <div class="item-name r-${it.rarity}">[${it.rarityName}] ${it.name}</div>
          <div class="item-stats">${itemStatText(it)}</div>
        </div>
      `;
    } else {
      div.innerHTML = `<span class="slot-name">${slotNames[slot]}</span><span style="color:var(--text-dim);font-size:13px">비어 있음 — 가방에서 장착</span>`;
    }
    tab.appendChild(div);
  }
}

// 현재 레벨 기준 효과 요약
function skillEffectText(sk, lv) {
  if (sk.type === 'passive') return `${STAT_NAMES[sk.stat]} +${passivePct(sk, lv)}%`;
  if (sk.kind === 'buff') return `${STAT_NAMES[sk.buff.stat]} +${passivePct(sk.buff, lv)}% (${sk.buff.turns}턴)`;
  const pct = Math.round(activeMult(sk, lv) * 100);
  return sk.kind === 'heal' ? `회복량 마력의 ${pct}%` : `위력 ${pct}%${sk.hits ? ` ×${sk.hits}회` : ''}`;
}

function renderHeroTree() {
  const h = detailHero;
  const tab = $('#hero-tab-tree');
  const tree = SKILL_TREES[h.clsId];
  let html = `<div class="tree-sp">스킬 포인트: ${h.skillPoints}</div><div class="tree-branches">`;
  for (const branch of tree) {
    html += `<div class="tree-branch"><div class="branch-title">${branch.title}</div>`;
    branch.nodes.forEach((id, i) => {
      const sk = SKILLS[id];
      const lv = skillLevel(h, id);
      const learned = lv >= 1;
      const learnable = canLearn(h, id);
      const upgradable = canUpgrade(h, id);
      const locked = !learned && !learnable;
      html += `${i > 0 ? '<div class="tree-arrow">▼</div>' : ''}
        <div class="tree-node ${learned ? 'learned' : ''} ${learnable ? 'learnable' : ''} ${upgradable ? 'upgradable' : ''} ${locked ? 'locked' : ''}" data-skill="${id}">
          <div class="sk-name">${sk.name}${learned ? ` <span class="lv-badge">Lv.${lv}/${MAX_SKILL_LV}</span>` : ''}</div>
          <div class="sk-desc">${learned ? skillEffectText(sk, lv) : sk.desc}</div>
          <div class="sk-type">${sk.type === 'active' ? `액티브 · MP ${sk.mp}` : '패시브'}</div>
        </div>`;
    });
    html += '</div>';
  }
  html += '</div>';
  tab.innerHTML = html;

  tab.querySelectorAll('.tree-node.learnable').forEach(node => {
    node.onclick = () => {
      const id = node.dataset.skill;
      const sk = SKILLS[id];
      showModal(`
        <h3>${sk.name} 배우기</h3>
        <p>${sk.desc}</p>
        <p style="color:var(--accent)">스킬 포인트 1 사용</p>
        <button class="btn btn-primary" id="modal-confirm">배운다</button>
        <button class="btn" id="modal-cancel">취소</button>
      `);
      $('#modal-confirm').onclick = () => { learnSkill(detailHero, id); hideModal(); renderHeroDetail(); };
      $('#modal-cancel').onclick = hideModal;
    };
  });

  tab.querySelectorAll('.tree-node.upgradable').forEach(node => {
    node.onclick = () => {
      const id = node.dataset.skill;
      const sk = SKILLS[id];
      const lv = skillLevel(detailHero, id);
      showModal(`
        <h3>${sk.name} 강화 (Lv.${lv} → ${lv + 1})</h3>
        <p>현재: ${skillEffectText(sk, lv)}<br>강화 후: <span style="color:var(--xp)">${skillEffectText(sk, lv + 1)}</span></p>
        <p style="color:var(--accent)">스킬 포인트 1 사용</p>
        <button class="btn btn-primary" id="modal-confirm">강화한다</button>
        <button class="btn" id="modal-cancel">취소</button>
      `);
      $('#modal-confirm').onclick = () => { upgradeSkill(detailHero, id); hideModal(); renderHeroDetail(); };
      $('#modal-cancel').onclick = hideModal;
    };
  });
}

// ── 가방 ──
function renderBag() {
  $('#bag-gold').textContent = `🪙 ${G.gold}`;
  $('#bag-potions').textContent = `보유: ${G.potions}개`;
  $('#btn-buy-potion').disabled = G.gold < 50;
  $('#btn-buy-potion').onclick = () => {
    if (G.gold < 50) return;
    G.gold -= 50;
    G.potions += 1;
    saveGame();
    renderBag();
  };

  const list = $('#bag-list');
  list.innerHTML = '';
  if (G.inventory.length === 0) {
    list.innerHTML = '<div class="bag-empty">장비가 없습니다.<br>전투에서 장비를 획득하세요!</div>';
    return;
  }
  const rarityOrder = { legend: 0, epic: 1, rare: 2, magic: 3, common: 4 };
  const sorted = [...G.inventory].sort((a, b) => rarityOrder[a.rarity] - rarityOrder[b.rarity]);
  for (const it of sorted) {
    const div = document.createElement('div');
    div.className = `bag-item rb-${it.rarity}`;
    div.innerHTML = `
      ${iconHTML(it, 30)}
      <div class="item-info">
        <div class="item-name r-${it.rarity}">[${it.rarityName}] ${it.name}</div>
        <div class="item-stats">${itemStatText(it)}</div>
      </div>
      <button class="btn btn-small btn-equip">장착</button>
      <button class="btn btn-small btn-sell">💰${it.sell}</button>
    `;
    div.querySelector('.btn-equip').onclick = () => chooseEquipHero(it);
    div.querySelector('.btn-sell').onclick = () => {
      sellItem(it);
      renderBag();
    };
    list.appendChild(div);
  }
}

function chooseEquipHero(item) {
  const slotNames = { weapon: '무기', armor: '방어구', accessory: '장신구' };
  let html = `<h3>${iconHTML(item, 24)} 누가 장착할까요?</h3>
    <p class="r-${item.rarity}">[${item.rarityName}] ${item.name}</p>
    <p>${itemStatText(item)} · ${slotNames[item.slot]}</p>`;
  G.heroes.forEach((h, i) => {
    const c = CLASSES[h.clsId];
    const cur = h.equip[item.slot];
    html += `<button class="btn" data-hero="${i}">${iconHTML(c, 20)} ${c.name}
      <span style="font-size:11px;color:var(--text-dim)">${cur ? `(현재: ${cur.name})` : '(비어 있음)'}</span>
    </button>`;
  });
  html += `<button class="btn" id="modal-cancel">취소</button>`;
  showModal(html);
  $$('#modal-content [data-hero]').forEach(btn => {
    btn.onclick = () => {
      equipItem(G.heroes[btn.dataset.hero], item);
      hideModal();
      renderBag();
    };
  });
  $('#modal-cancel').onclick = hideModal;
}

// ── 모달 ──
function showModal(html) {
  $('#modal-content').innerHTML = html;
  $('#modal').classList.remove('hidden');
}
function hideModal() {
  $('#modal').classList.add('hidden');
}

// ── 초기화 ──
document.addEventListener('DOMContentLoaded', () => {
  initTitle();

  $$('.nav-btn').forEach(btn => {
    btn.onclick = () => showScreen(btn.dataset.screen);
  });

  $('#btn-battle').onclick = () => startBattle();
  $('#btn-hero-back').onclick = () => showScreen('party');

  $$('.tab-btn').forEach(btn => {
    btn.onclick = () => {
      $$('.tab-btn').forEach(b => b.classList.remove('active'));
      $$('.hero-tab').forEach(t => t.classList.remove('active'));
      btn.classList.add('active');
      $(`#hero-tab-${btn.dataset.tab}`).classList.add('active');
    };
  });

  $('#modal').onclick = (e) => { if (e.target.id === 'modal') hideModal(); };
});

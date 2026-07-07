// ─────────────────────────────────────────────
// 전투 엔진: 속도 기반 턴제, 버프/중독, 적 AI
// ─────────────────────────────────────────────

let B = null; // 전투 상태

function isBossFloor(floor) { return floor % 5 === 0; }

function floorMult(floor) { return 1 + (floor - 1) * 0.17; }

function makeEnemyUnit(def, floor, isBoss) {
  const m = floorMult(floor);
  return {
    side: 'enemy', isBoss,
    name: def.name, emoji: def.emoji, sprite: def.sprite,
    stats: {
      hp: Math.round(def.hp * m),
      atk: Math.round(def.atk * m),
      def: Math.round(def.def * m),
      mag: Math.round(def.mag * m),
      spd: Math.round(def.spd * (1 + (floor - 1) * 0.05)),
      crit: 5,
    },
    curHp: 0, buffs: [], dots: [], defending: false,
  };
}

function buildEnemies(floor) {
  if (isBossFloor(floor)) {
    const boss = BOSSES[Math.min(Math.floor(floor / 5) - 1, BOSSES.length - 1)];
    const u = makeEnemyUnit(boss, floor, true);
    u.curHp = u.stats.hp;
    return [u];
  }
  const pool = ENEMIES.filter(e => e.minFloor <= floor);
  const count = floor < 3 ? 2 : (Math.random() < 0.5 ? 2 : 3);
  const list = [];
  for (let i = 0; i < count; i++) {
    const def = pool[Math.floor(Math.random() * pool.length)];
    const u = makeEnemyUnit(def, floor, false);
    u.curHp = u.stats.hp;
    list.push(u);
  }
  return list;
}

function makeHeroUnit(h) {
  return {
    side: 'hero', hero: h,
    name: CLASSES[h.clsId].name, cls: CLASSES[h.clsId].cls, emoji: CLASSES[h.clsId].emoji, sprite: CLASSES[h.clsId].sprite,
    stats: heroStats(h),
    curHp: h.curHp, curMp: h.curMp,
    buffs: [], dots: [], defending: false,
  };
}

function startBattle() {
  B = {
    heroes: G.heroes.map(makeHeroUnit),
    enemies: buildEnemies(G.floor),
    round: 0,
    queue: [],
    over: false,
  };
  uiBattleInit();
  logLine(`${G.floor}층 — ${isBossFloor(G.floor) ? '보스 출현!' : '적이 나타났다!'}`, 'sys');
  nextRound();
}

function aliveUnits(side) {
  const arr = side === 'hero' ? B.heroes : B.enemies;
  return arr.filter(u => u.curHp > 0);
}

function effStat(u, stat) {
  let v = u.stats[stat];
  for (const b of u.buffs) {
    if (b.stat === stat) v = Math.round(v * (1 + b.pct / 100));
  }
  if (stat === 'def' && u.defending) v = Math.round(v * 1.6);
  return v;
}

function nextRound() {
  B.round += 1;
  B.queue = [...aliveUnits('hero'), ...aliveUnits('enemy')]
    .sort((a, b) => effStat(b, 'spd') - effStat(a, 'spd'));
  uiBattleHeader();
  nextTurn();
}

function nextTurn() {
  if (checkBattleEnd()) return;
  if (B.queue.length === 0) return nextRound();
  const u = B.queue.shift();
  if (u.curHp <= 0) return nextTurn();

  u.defending = false;

  // 중독 등 지속 피해
  if (u.dots.length > 0) {
    let total = 0;
    for (const d of u.dots) { total += d.dmg; d.turns -= 1; }
    u.dots = u.dots.filter(d => d.turns > 0);
    if (total > 0) {
      u.curHp = Math.max(0, u.curHp - total);
      logLine(`☠️ ${u.name}이(가) 중독으로 ${total} 피해!`, 'dmg');
      uiFloater(u, `-${total}`, 'dmg');
      uiBattleRender();
      if (u.curHp <= 0) {
        logLine(`${u.name} 쓰러짐!`, 'sys');
        return setTimeout(nextTurn, 500);
      }
    }
  }

  // 버프 지속시간 감소
  for (const b of u.buffs) b.turns -= 1;
  u.buffs = u.buffs.filter(b => b.turns > 0);

  if (u.side === 'hero') {
    uiShowActionBar(u);
  } else {
    uiBattleRender();
    setTimeout(() => enemyAct(u), 650);
  }
}

// ── 데미지 계산 ──
function calcDamage(att, def, mult, kind, critBonus = 0) {
  const atkStat = kind === 'mag' ? effStat(att, 'mag') : effStat(att, 'atk');
  const defStat = kind === 'mag' ? effStat(def, 'def') * 0.25 : effStat(def, 'def') * 0.5;
  let dmg = Math.max(1, atkStat * mult - defStat);
  dmg *= 0.85 + Math.random() * 0.3; // ±15% 변동
  const critChance = Math.min(100, effStat(att, 'crit') + critBonus);
  const isCrit = Math.random() * 100 < critChance;
  if (isCrit) dmg *= 1.5;
  return { dmg: Math.round(dmg), isCrit };
}

function applyDamage(att, target, mult, kind, opts = {}) {
  const { dmg, isCrit } = calcDamage(att, target, mult, kind, opts.critBonus || 0);
  target.curHp = Math.max(0, target.curHp - dmg);
  uiFloater(target, isCrit ? `💥${dmg}` : `-${dmg}`, isCrit ? 'crit' : 'dmg');
  uiShake(target);
  logLine(`${att.name} → ${target.name} ${dmg} 피해${isCrit ? ' (치명타!)' : ''}`, 'dmg');
  if (opts.dot) {
    const dotDmg = Math.max(1, Math.round(effStat(att, 'atk') * opts.dot.pct));
    target.dots.push({ dmg: dotDmg, turns: opts.dot.turns });
    logLine(`${target.name}이(가) 중독되었다! (${opts.dot.turns}턴)`, 'sys');
  }
  if (target.curHp <= 0) logLine(`${target.name} 쓰러짐!`, 'sys');
  return dmg;
}

// ── 플레이어 행동 ──
function heroAttack(u, target) {
  applyDamage(u, target, 1.0, 'phys');
  endHeroTurn(u);
}

function heroDefend(u) {
  u.defending = true;
  logLine(`${u.name}이(가) 방어 태세를 취한다.`, 'sys');
  endHeroTurn(u);
}

function heroPotion(u) {
  if (G.potions < 1) return;
  G.potions -= 1;
  const heal = Math.round(u.stats.hp * 0.5);
  u.curHp = Math.min(u.stats.hp, u.curHp + heal);
  uiFloater(u, `+${heal}`, 'heal');
  logLine(`🧪 ${u.name}이(가) 물약으로 ${heal} 회복!`, 'heal');
  endHeroTurn(u);
}

function heroSkill(u, skillId, target) {
  const sk = SKILLS[skillId];
  const lv = skillLevel(u.hero, skillId);
  u.curMp -= sk.mp;

  if (sk.kind === 'heal') {
    const targets = sk.target === 'all-allies' ? aliveUnits('hero') : [target];
    for (const t of targets) {
      const heal = Math.round(effStat(u, 'mag') * activeMult(sk, lv));
      t.curHp = Math.min(t.stats.hp, t.curHp + heal);
      uiFloater(t, `+${heal}`, 'heal');
      logLine(`✨ ${u.name}의 ${sk.name} Lv.${lv}! ${t.name} ${heal} 회복`, 'heal');
    }
  } else if (sk.kind === 'buff') {
    const pct = passivePct(sk.buff, lv);
    const targets = sk.target === 'all-allies' ? aliveUnits('hero') : [target];
    for (const t of targets) {
      t.buffs.push({ ...sk.buff, pct });
    }
    logLine(`✨ ${u.name}의 ${sk.name} Lv.${lv}! 아군 ${STAT_NAMES[sk.buff.stat]} +${pct}% (${sk.buff.turns}턴)`, 'sys');
  } else {
    const targets = sk.target === 'all-enemies' ? aliveUnits('enemy') : [target];
    const hits = sk.hits || 1;
    const dot = sk.dot ? { ...sk.dot, pct: sk.dot.pct * (1 + ACTIVE_LV_BONUS * (lv - 1)) } : undefined;
    for (const t of targets) {
      for (let i = 0; i < hits; i++) {
        if (t.curHp <= 0) break;
        applyDamage(u, t, activeMult(sk, lv), sk.kind, { critBonus: sk.critBonus || 0, dot });
      }
    }
  }
  endHeroTurn(u);
}

function endHeroTurn(u) {
  syncHero(u);
  uiHideActionBar();
  uiBattleRender();
  setTimeout(nextTurn, 550);
}

function syncHero(u) {
  if (u.side !== 'hero') return;
  u.hero.curHp = u.curHp;
  u.hero.curMp = u.curMp;
}

// ── 적 AI ──
function enemyAct(u) {
  if (B.over) return;
  const targets = aliveUnits('hero');
  if (targets.length === 0) return checkBattleEnd() ? undefined : nextTurn();

  uiEnemyActing(u, true);

  const isMagUser = u.stats.mag > u.stats.atk;
  // 보스는 3라운드마다 전체 공격
  if (u.isBoss && B.round % 3 === 0) {
    logLine(`💢 ${u.name}의 광역 공격!`, 'sys');
    for (const t of targets) {
      applyDamage(u, t, 0.8, isMagUser ? 'mag' : 'phys');
      syncHero(t);
    }
  } else {
    const t = targets[Math.floor(Math.random() * targets.length)];
    const mult = isMagUser ? 1.4 : 1.0;
    applyDamage(u, t, mult, isMagUser ? 'mag' : 'phys');
    syncHero(t);
  }

  uiBattleRender();
  setTimeout(() => {
    uiEnemyActing(u, false);
    nextTurn();
  }, 550);
}

// ── 종료 판정/보상 ──
function checkBattleEnd() {
  if (B.over) return true;
  if (aliveUnits('enemy').length === 0) {
    B.over = true;
    setTimeout(victory, 600);
    return true;
  }
  if (aliveUnits('hero').length === 0) {
    B.over = true;
    setTimeout(defeat, 600);
    return true;
  }
  return false;
}

function victory() {
  const boss = isBossFloor(G.floor);
  const enemyCount = B.enemies.length;
  const gold = Math.round((25 + G.floor * 12) * enemyCount * (boss ? 3 : 1));
  const xp = Math.round((30 + G.floor * 14) * enemyCount * (boss ? 3 : 1));
  G.gold += gold;

  const levelUps = [];
  for (const h of G.heroes) {
    const ups = gainXp(h, xp);
    if (ups.length > 0) levelUps.push(`${CLASSES[h.clsId].name} Lv.${h.level}!`);
  }

  // 전투 후 소량 회복
  for (const h of G.heroes) {
    const s = heroStats(h);
    h.curHp = Math.min(s.hp, Math.max(h.curHp, 0) + Math.round(s.hp * 0.25));
    h.curMp = Math.min(s.mp, h.curMp + Math.round(s.mp * 0.25));
  }

  // 드랍
  let drop = null;
  if (boss || Math.random() < 0.45) {
    drop = makeItem(G.floor, boss ? 20 : 0);
    G.inventory.push(drop);
  }

  // 진행
  if (boss || G.battleInFloor + 1 >= BATTLES_PER_FLOOR) {
    G.floor += 1;
    G.battleInFloor = 0;
  } else {
    G.battleInFloor += 1;
  }

  saveGame();
  uiShowResult(true, { gold, xp, drop, levelUps });
}

function defeat() {
  // 패배: 층 유지, 골드 30% 손실, 파티 절반 회복으로 부활
  const lost = Math.round(G.gold * 0.3);
  G.gold -= lost;
  for (const h of G.heroes) {
    const s = heroStats(h);
    h.curHp = Math.round(s.hp * 0.5);
    h.curMp = Math.round(s.mp * 0.5);
  }
  saveGame();
  uiShowResult(false, { lost });
}

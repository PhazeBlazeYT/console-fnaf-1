(() => {
  const oldRoot = document.getElementById('night-watch-overlay');
  const oldStyle = document.getElementById('night-watch-style');
  if (oldRoot) oldRoot.remove();
  if (oldStyle) oldStyle.remove();

  const style = document.createElement('style');
  style.id = 'night-watch-style';
  style.textContent = `
    @keyframes flicker { 0%,100%{opacity:.95} 52%{opacity:.82} 58%{opacity:1} }
    @keyframes sweep { from { background-position: 0 0; } to { background-position: 220px 140px; } }
    @keyframes blinkWarn { 0%,100%{opacity:.25} 50%{opacity:.8} }
    @keyframes camIn { from { transform: scaleY(.03); opacity:0; } to { transform: scaleY(1); opacity:1; } }
    @keyframes camOut { from { transform: scaleY(1); opacity:1; } to { transform: scaleY(.03); opacity:0; } }

    #night-watch-overlay {
      position: fixed; inset: 0; z-index: 2147483647;
      display: grid; grid-template-rows: 44px 1fr 82px;
      color: #d8dde6; font-family: Verdana, Geneva, Tahoma, sans-serif;
      background: radial-gradient(circle at center, #0d0f13, #020305 70%);
      user-select: none;
    }
    #nw-top {
      display: grid; grid-template-columns: 1fr auto auto auto; gap: 12px; align-items: center;
      padding: 0 12px; border-bottom: 1px solid #2e3544; background: #090c12; font-size: 13px;
    }
    #night-title { color: #b9c6dc; letter-spacing: .7px; font-weight: 700; }
    #clock, #night-label, #power-label { font-weight: 700; }
    #cast {
      grid-column: 1 / -1;
      display: flex; gap: 8px; flex-wrap: wrap;
      padding-bottom: 6px;
      font-size: 11px;
    }
    .cast-chip {
      border: 1px solid #3d475a;
      background: #111722;
      color: #dbe4f5;
      padding: 2px 6px;
      border-radius: 4px;
      display: inline-flex;
      gap: 4px;
      align-items: center;
      white-space: nowrap;
    }

    #nw-scene { position: relative; overflow: hidden; background: #05070c; }
    #noise {
      position: absolute; inset: 0; pointer-events: none; z-index: 30;
      background-image:
        linear-gradient(rgba(255,255,255,.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,.02) 1px, transparent 1px);
      background-size: 3px 3px, 4px 4px;
      animation: flicker 1.2s infinite steps(2), sweep 6s linear infinite;
      mix-blend-mode: screen;
    }

    .panel { position: absolute; inset: 0; display: none; }
    .panel.active { display: block; }

    #office-panel { background: #020407; }
    #office-canvas, #cam-canvas { width: 100%; height: 100%; display: block; }

    #cam-panel { transform-origin: 50% 50%; }
    #cam-panel.opening { animation: camIn .15s ease-out; }
    #cam-panel.closing { animation: camOut .12s ease-in; }
    #cam-overlay {
      position: absolute; inset: 0; pointer-events: none;
      background: radial-gradient(circle at center, transparent 34%, rgba(0,0,0,.56) 100%);
      z-index: 4;
    }
    #cam-transition {
      position: absolute; inset: 0; pointer-events: none; z-index: 5; opacity: 0;
      background: repeating-linear-gradient(to bottom, rgba(255,255,255,.09), rgba(255,255,255,.09) 2px, rgba(0,0,0,.18) 3px, rgba(0,0,0,.18) 6px);
    }
    #cam-hud {
      position: absolute; top: 10px; left: 12px; z-index: 6;
      text-shadow: 0 0 8px #000; font-size: 13px;
    }
    #cam-name { font-size: 17px; margin-bottom: 3px; }

    #cam-map {
      position: absolute; bottom: 12px; right: 12px; z-index: 7;
      width: 384px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px;
    }
    .cam-btn {
      border: 1px solid #657189; background: #141a24; color: #dce3f1;
      height: 32px; font-size: 11px; cursor: pointer;
    }
    .cam-btn.active { background: #2a3a1f; border-color: #a4dc7b; }

    #office-controls {
      position: absolute; inset: 0; pointer-events: none; z-index: 10;
      display: grid; grid-template-columns: 112px 1fr 112px;
    }
    .door-stack {
      pointer-events: auto;
      display: grid; grid-template-rows: 1fr auto auto auto auto;
      justify-items: center; align-items: end;
      padding: 10px 8px 12px;
      background: linear-gradient(180deg, rgba(11,16,26,.7), rgba(7,10,16,.56));
      border-right: 1px solid rgba(80,95,122,.45);
    }
    .door-stack.right { border-right: 0; border-left: 1px solid rgba(80,95,122,.45); }

    .ctrl-btn {
      width: 84px; height: 30px; margin-top: 6px;
      border: 1px solid #67738a; background: #1b2231; color: #e0e6f4; cursor: pointer;
      font-size: 12px;
    }
    .ctrl-btn.active { background: #35532a; border-color: #b0e27b; }

    #center-hud {
      pointer-events: none;
      display: grid; grid-template-rows: auto auto 1fr auto;
      padding: 12px; color: #e8edf7; text-shadow: 0 0 8px #000;
    }
    #status { font-size: 13px; }
    #presence { font-size: 22px; align-self: center; justify-self: center; }
    #tips { justify-self: center; font-size: 12px; color: #b2bfd4; }

    #powerout { position: absolute; inset: 0; pointer-events: none; background: #000; opacity: 0; z-index: 20; }
    #warn {
      position: absolute; top: 8px; right: 10px; z-index: 15;
      color: #ff8b8b; font-size: 12px; opacity: 0; animation: blinkWarn .5s infinite;
    }

    #nw-bottom {
      display: grid; grid-template-columns: 140px 1fr 200px 110px;
      gap: 10px; align-items: center;
      padding: 10px 12px; border-top: 1px solid #2e3544; background: #090c12;
    }
    #power-wrap { height: 18px; border: 1px solid #687791; background: #141a26; }
    #power-fill { height: 100%; width: 100%; background: linear-gradient(90deg,#397b2a,#a9df5a); transition: width .12s linear; }
    #usage { text-align: right; font-size: 13px; }
    #cam-toggle, #close-btn {
      height: 34px; border: 1px solid #667289; background: #192132; color: #e6ebf8; cursor: pointer;
    }
    #cam-toggle.active { background: #395428; }
    #close-btn { background: #2b1a1e; border-color: #875660; }

    #result {
      position: absolute; inset: 0; display: none; place-items: center; z-index: 40;
      background: rgba(0,0,0,.86); text-align: center;
    }
    #result.show { display: grid; }
    #result h1 { margin: 0 0 8px; font-size: 44px; }
    #result p { margin: 6px 0 10px; max-width: 520px; }
  `;
  document.head.appendChild(style);

  const root = document.createElement('div');
  root.id = 'night-watch-overlay';
  root.innerHTML = `
    <div id="nw-top">
      <div id="night-title">NIGHT WATCH // FNAF STYLE</div>
      <div id="night-label">Night 1</div>
      <div id="clock">12 AM</div>
      <div id="power-label">Power: 100%</div>
      <div id="cast">
        <span class="cast-chip">🐻 Freddy: stage leader, late-hour closer</span>
        <span class="cast-chip">🐰 Bonnie: left-route pressure</span>
        <span class="cast-chip">🐤 Chica: right-route / kitchen pressure</span>
        <span class="cast-chip">🦊 Foxy: Pirate Cove sprint attacker</span>
      </div>
    </div>
    <div id="nw-scene">
      <div id="noise"></div>
      <div id="warn">OFFICE THREAT</div>
      <div id="office-panel" class="panel active"><canvas id="office-canvas" width="1280" height="720"></canvas></div>
      <div id="cam-panel" class="panel"><canvas id="cam-canvas" width="1280" height="720"></canvas>
        <div id="cam-transition"></div>
        <div id="cam-overlay"></div>
        <div id="cam-hud"><div id="cam-name"></div><div id="cam-detected"></div></div>
        <div id="cam-map"></div>
      </div>
      <div id="office-controls">
        <div class="door-stack left">
          <button id="left-door-btn" class="ctrl-btn">LEFT DOOR</button>
          <button id="left-light-btn" class="ctrl-btn">LEFT LIGHT</button>
          <div id="left-door-text" style="font-size:11px;color:#c7d2e6;margin-top:6px;">OPEN</div>
          <div id="left-light-text" style="font-size:11px;color:#c7d2e6;">OFF</div>
        </div>
        <div id="center-hud">
          <div id="status">You are in the office.</div>
          <div id="presence">Listening...</div>
          <div id="tips">A/D or Arrow keys look • Space center • Q/E doors • Z/C lights</div>
        </div>
        <div class="door-stack right">
          <button id="right-door-btn" class="ctrl-btn">RIGHT DOOR</button>
          <button id="right-light-btn" class="ctrl-btn">RIGHT LIGHT</button>
          <div id="right-door-text" style="font-size:11px;color:#c7d2e6;margin-top:6px;">OPEN</div>
          <div id="right-light-text" style="font-size:11px;color:#c7d2e6;">OFF</div>
        </div>
      </div>
      <div id="powerout"></div>
      <div id="result"><div>
        <h1 id="result-title"></h1>
        <p id="result-text"></p>
        <button id="restart" class="ctrl-btn" style="width:130px;height:36px;">Restart Night</button>
      </div></div>
    </div>
    <div id="nw-bottom">
      <button id="cam-toggle">Open Cameras</button>
      <div id="power-wrap"><div id="power-fill"></div></div>
      <div id="usage">Usage: 1x</div>
      <button id="close-btn">Close</button>
    </div>
  `;
  document.body.appendChild(root);

  const rooms = [
    ['stage', 'Show Stage'],
    ['pirate', 'Pirate Cove'],
    ['dining', 'Dining Area'],
    ['backstage', 'Backstage'],
    ['westHall', 'West Hall'],
    ['westCorner', 'West Corner'],
    ['eastHall', 'East Hall'],
    ['eastCorner', 'East Corner'],
    ['kitchen', 'Kitchen'],
    ['office', 'Office']
  ];

  const aiByNight = {
    1: { bonnie: 0, chica: 0, freddy: 0, foxy: 0 },
    2: { bonnie: 3, chica: 1, freddy: 0, foxy: 1 },
    3: { bonnie: 4, chica: 3, freddy: 1, foxy: 2 },
    4: { bonnie: 6, chica: 5, freddy: 2, foxy: 4 },
    5: { bonnie: 8, chica: 7, freddy: 5, foxy: 7 },
    6: { bonnie: 10, chica: 10, freddy: 8, foxy: 10 }
  };

  const colors = {
    bonnie: '#8e77ff',
    chica: '#ffc153',
    freddy: '#b08a57',
    foxy: '#e06a5f',
    golden: '#d2b14a'
  };

  const roamGraph = {
    stage: ['pirate', 'dining', 'backstage'],
    dining: ['stage', 'backstage', 'kitchen', 'westHall', 'eastHall'],
    backstage: ['dining', 'westHall'],
    kitchen: ['dining', 'eastHall'],
    westHall: ['dining', 'westCorner', 'backstage'],
    westCorner: ['westHall'],
    eastHall: ['dining', 'eastCorner', 'kitchen'],
    eastCorner: ['eastHall'],
    pirate: ['stage', 'westHall']
  };

  const animProfile = {
    bonnie: { side: 'left', wakeDelayMs: 19000, wakeAnimMs: 9000, moveBaseMs: 3000, moveRandMs: 1800, preAttackMs: 1200, attackRate: 0.095 },
    chica: { side: 'right', wakeDelayMs: 26000, wakeAnimMs: 11000, moveBaseMs: 3300, moveRandMs: 2200, preAttackMs: 1300, attackRate: 0.09 },
    freddy: { side: 'right', wakeDelayMs: 52000, wakeAnimMs: 13000, moveBaseMs: 3800, moveRandMs: 2600, preAttackMs: 2200, attackRate: 0.08 },
    foxy: { side: 'left', wakeDelayMs: 31000, wakeAnimMs: 10000, moveBaseMs: 3400, moveRandMs: 1800, preAttackMs: 900, attackRate: 1 }
  };

  const nightPacing = {
    1: { wake: 1.35, move: 1.28, attack: 0.72 },
    2: { wake: 1.15, move: 1.12, attack: 0.86 },
    3: { wake: 1.0, move: 1.0, attack: 1.0 },
    4: { wake: 0.84, move: 0.88, attack: 1.16 },
    5: { wake: 0.7, move: 0.78, attack: 1.32 },
    6: { wake: 0.58, move: 0.68, attack: 1.5 }
  };

  const freddyReleaseHourByNight = {
    1: 4,
    2: 3,
    3: 3,
    4: 2,
    5: 2,
    6: 1
  };

  const state = {
    duration: 6 * 60 * 1000,
    t: 0,
    night: 1,
    power: 100,
    over: false,
    camOpen: false,
    camIdx: 0,
    camTransitionMs: 0,
    camGlitchMs: 0,
    look: 0,
    leftDoor: false,
    rightDoor: false,
    leftLight: false,
    rightLight: false,
    leftShake: 0,
    rightShake: 0,
    fanSpin: 0,
    jumpFlash: 0,
    blackoutMs: 0,
    blackoutTicks: 0,
    cameraStallMs: 0,
    camDowntimeMs: 0,
    foxySprintMs: 0,
    goldenFreddyMs: 0,
    entities: {
      bonnie: { room: 'stage', ai: 0, moveTimer: 3500, wakeDelayMs: 0, wakeAnimMs: 0, active: false, doorSeenMs: 0, lookPhase: 0 },
      chica: { room: 'stage', ai: 0, moveTimer: 3800, wakeDelayMs: 0, wakeAnimMs: 0, active: false, doorSeenMs: 0, lookPhase: 0 },
      freddy: { room: 'stage', ai: 0, moveTimer: 4500, wakeDelayMs: 0, wakeAnimMs: 0, active: false, doorSeenMs: 0, lookPhase: 0 },
      foxy: { room: 'pirate', ai: 0, moveTimer: 4200, wakeDelayMs: 0, wakeAnimMs: 0, active: false, doorSeenMs: 0, lookPhase: 0, coveStage: 0 }
    }
  };

  const $ = (s) => root.querySelector(s);
  const el = {
    clock: $('#clock'), powerLabel: $('#power-label'), powerFill: $('#power-fill'), usage: $('#usage'),
    nightLabel: $('#night-label'), status: $('#status'), presence: $('#presence'), warn: $('#warn'),
    camToggle: $('#cam-toggle'), officePanel: $('#office-panel'), camPanel: $('#cam-panel'), camTransition: $('#cam-transition'),
    camName: $('#cam-name'), camDetected: $('#cam-detected'), camMap: $('#cam-map'), powerout: $('#powerout'),
    leftDoorBtn: $('#left-door-btn'), rightDoorBtn: $('#right-door-btn'), leftLightBtn: $('#left-light-btn'), rightLightBtn: $('#right-light-btn'),
    leftDoorText: $('#left-door-text'), rightDoorText: $('#right-door-text'), leftLightText: $('#left-light-text'), rightLightText: $('#right-light-text'),
    officeCanvas: $('#office-canvas'), camCanvas: $('#cam-canvas'),
    result: $('#result'), resultTitle: $('#result-title'), resultText: $('#result-text')
  };

  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function inRoom(roomId) {
    return Object.entries(state.entities)
      .filter(([, e]) => e.room === roomId)
      .map(([name]) => name);
  }

  function pickNextRoom(name, currentRoom) {
    if (name === 'freddy') {
      if (currentRoom === 'stage') return Math.random() < 0.9 ? 'dining' : 'stage';
      if (currentRoom === 'dining') return Math.random() < 0.84 ? 'eastHall' : 'kitchen';
      if (currentRoom === 'kitchen') return Math.random() < 0.82 ? 'eastHall' : 'dining';
      if (currentRoom === 'eastHall') return Math.random() < 0.8 ? 'eastCorner' : 'dining';
      if (currentRoom === 'eastCorner') return Math.random() < 0.86 ? 'eastCorner' : 'eastHall';
    }

    const options = [...(roamGraph[currentRoom] || ['dining'])];
    if (!options.length) return currentRoom;
    const side = animProfile[name].side;
    const weighted = [];
    options.forEach((room) => {
      weighted.push(room);
      if (side === 'left' && (room === 'westHall' || room === 'westCorner')) weighted.push(room);
      if (side === 'right' && (room === 'eastHall' || room === 'eastCorner')) weighted.push(room);
      if (name === 'freddy' && room === 'eastCorner') weighted.push(room);
      if (name === 'bonnie' && room === 'westCorner') weighted.push(room);
      if (name === 'chica' && room === 'kitchen') weighted.push(room);
    });
    return weighted[Math.floor(Math.random() * weighted.length)] || currentRoom;
  }

  function usage() {
    let u = 1;
    if (state.leftDoor) u += 1;
    if (state.rightDoor) u += 1;
    if (state.leftLight) u += 1;
    if (state.rightLight) u += 1;
    if (state.camOpen) u += 1;
    if (state.camTransitionMs > 0) u += 1;
    if (state.cameraStallMs > 0) u += 0.4;
    return Math.round(u * 10) / 10;
  }

  function roomPalette(roomId) {
    const map = {
      stage: ['#4f5564', '#1a1f2a', '#2c3342'],
      dining: ['#5b3f42', '#241319', '#332128'],
      backstage: ['#37445c', '#141a2a', '#253349'],
      pirate: ['#54424e', '#221621', '#372432'],
      westHall: ['#30495d', '#101b26', '#203547'],
      westCorner: ['#345a70', '#0f1d29', '#284a60'],
      eastHall: ['#654636', '#23170f', '#3b2920'],
      eastCorner: ['#6e4c39', '#2b1a12', '#4b3024'],
      kitchen: ['#565b63', '#1f232a', '#3b4049'],
      office: ['#3f4755', '#131a25', '#273245']
    };
    return map[roomId] || map.office;
  }

  function drawRoomBase(ctx, w, h, roomId, look = 0) {
    const [top, mid, floor] = roomPalette(roomId);
    const pan = look * 80;
    const horizonY = h * 0.38;

    ctx.save();
    ctx.translate(pan, 0);

    const ceilGrad = ctx.createLinearGradient(0, 0, 0, horizonY);
    ceilGrad.addColorStop(0, top);
    ceilGrad.addColorStop(1, '#11161f');
    ctx.fillStyle = ceilGrad;
    ctx.fillRect(-120, 0, w + 240, horizonY);

    const wallGrad = ctx.createLinearGradient(0, horizonY, 0, h * 0.66);
    wallGrad.addColorStop(0, mid);
    wallGrad.addColorStop(1, '#121923');
    ctx.fillStyle = wallGrad;
    ctx.fillRect(-120, horizonY, w + 240, h * 0.28);

    const floorGrad = ctx.createLinearGradient(0, h * 0.62, 0, h);
    floorGrad.addColorStop(0, '#171f2d');
    floorGrad.addColorStop(1, floor);
    ctx.fillStyle = floorGrad;
    ctx.fillRect(-120, h * 0.62, w + 240, h * 0.4);

    const vanishingX = w * 0.5;
    ctx.strokeStyle = 'rgba(220,230,255,.07)';
    ctx.lineWidth = 1;
    for (let i = -7; i <= 7; i += 1) {
      const x = vanishingX + i * 120 + ((state.t * 0.01) % 120);
      ctx.beginPath();
      ctx.moveTo(x, h);
      ctx.lineTo(vanishingX + i * 10, horizonY + 6);
      ctx.stroke();
    }

    for (let i = 0; i < 9; i += 1) {
      const t = i / 8;
      const y = h * (0.64 + t * t * 0.34);
      const alpha = 0.14 - t * 0.1;
      ctx.strokeStyle = `rgba(200,215,245,${alpha.toFixed(3)})`;
      ctx.beginPath();
      ctx.moveTo(-100 + t * 180, y);
      ctx.lineTo(w + 100 - t * 180, y);
      ctx.stroke();
    }

    ctx.fillStyle = 'rgba(255,255,255,.03)';
    for (let i = 0; i < 6; i += 1) {
      const wx = i * 260 + ((state.t * 0.015) % 260) - 160;
      ctx.fillRect(wx, h * 0.42, 30, h * 0.23);
    }

    const leftShadow = ctx.createLinearGradient(0, 0, w * 0.2, 0);
    leftShadow.addColorStop(0, 'rgba(0,0,0,.34)');
    leftShadow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = leftShadow;
    ctx.fillRect(-120, 0, w * 0.26, h);

    const rightShadow = ctx.createLinearGradient(w, 0, w * 0.8, 0);
    rightShadow.addColorStop(0, 'rgba(0,0,0,.34)');
    rightShadow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = rightShadow;
    ctx.fillRect(w * 0.74, 0, w * 0.32, h);

    ctx.restore();
  }


  function drawPoster(ctx, x, y, w, h, title, tint) {
    ctx.fillStyle = '#11151d';
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = 'rgba(255,255,255,.2)';
    ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);
    ctx.fillStyle = tint;
    ctx.fillRect(x + 8, y + 8, w - 16, h * 0.45);
    ctx.fillStyle = 'rgba(255,255,255,.9)';
    ctx.font = 'bold 12px Verdana';
    ctx.fillText(title, x + 8, y + h - 14);
  }

  function drawDeskFan(ctx, cx, cy, spin) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.fillStyle = '#2f3746';
    ctx.fillRect(-20, 24, 40, 10);
    ctx.fillRect(-8, 8, 16, 16);
    ctx.strokeStyle = 'rgba(190,210,240,.55)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 30, 0, Math.PI * 2);
    ctx.stroke();

    ctx.rotate(spin);
    for (let i = 0; i < 4; i += 1) {
      ctx.rotate(Math.PI / 2);
      ctx.fillStyle = 'rgba(150,170,200,.75)';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(18, -4, 25, -2);
      ctx.quadraticCurveTo(18, 4, 0, 0);
      ctx.fill();
    }
    ctx.restore();
  }

  function drawEntity(ctx, x, y, scale, name, eyeGlow = true) {
    const c = colors[name] || '#ddd';
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    const headW = 84;
    const headH = 96;

    if (name === 'bonnie') {
      ctx.fillStyle = c;
      ctx.beginPath();
      ctx.roundRect(-34, -132, 22, 56, 12);
      ctx.roundRect(12, -132, 22, 56, 12);
      ctx.fill();
      ctx.fillStyle = '#7a67df';
      ctx.fillRect(-30, -126, 14, 16);
      ctx.fillRect(16, -126, 14, 16);
    }

    if (name === 'freddy') {
      ctx.fillStyle = c;
      ctx.beginPath();
      ctx.arc(-30, -62, 14, 0, Math.PI * 2);
      ctx.arc(30, -62, 14, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#171a21';
      ctx.fillRect(-22, -122, 44, 8);
      ctx.fillRect(-10, -132, 20, 12);
      ctx.fillStyle = 'rgba(255,255,255,.22)';
      ctx.fillRect(-6, -129, 7, 8);
    }

    if (name === 'foxy') {
      ctx.fillStyle = c;
      ctx.beginPath();
      ctx.moveTo(-36, -88); ctx.lineTo(-16, -124); ctx.lineTo(-8, -86);
      ctx.moveTo(36, -88); ctx.lineTo(16, -124); ctx.lineTo(8, -86);
      ctx.fill();
      ctx.strokeStyle = '#a9b4c8';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(34, 10);
      ctx.lineTo(50, 24);
      ctx.arc(50, 31, 7, -Math.PI / 2, Math.PI * 0.9);
      ctx.stroke();
    }

    if (name === 'chica') {
      ctx.fillStyle = '#d8b447';
      ctx.fillRect(-34, -70, 16, 8);
      ctx.fillRect(18, -70, 16, 8);
      ctx.fillStyle = '#f5f2e8';
      ctx.beginPath();
      ctx.roundRect(-30, -6, 60, 22, 8);
      ctx.fill();
      ctx.fillStyle = '#d04e4e';
      ctx.font = 'bold 10px Verdana';
      ctx.fillText("LET'S EAT!", -26, 9);
    }

    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.roundRect(-headW / 2, -76, headW, headH, 24);
    ctx.fill();

    ctx.fillStyle = '#0e1118';
    ctx.beginPath();
    ctx.arc(-16, -34, 10, 0, Math.PI * 2);
    ctx.arc(16, -34, 10, 0, Math.PI * 2);
    ctx.fill();

    if (eyeGlow) {
      ctx.fillStyle = name === 'foxy' ? '#ffd6a0' : '#ff9da0';
      ctx.beginPath();
      ctx.arc(-16, -34, 3, 0, Math.PI * 2);
      ctx.arc(16, -34, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    if (name === 'chica') {
      ctx.fillStyle = '#f2a63d';
      ctx.beginPath();
      ctx.moveTo(0, -22);
      ctx.lineTo(-12, -6);
      ctx.lineTo(12, -6);
      ctx.closePath();
      ctx.fill();
    } else if (name === 'foxy') {
      ctx.fillStyle = '#e9d7c0';
      ctx.beginPath();
      ctx.roundRect(-14, -14, 28, 18, 8);
      ctx.fill();
      ctx.fillStyle = '#1b1010';
      ctx.beginPath();
      ctx.arc(0, -6, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#292f3f';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(-20, -34, 6, 0, Math.PI * 2);
      ctx.stroke();
    } else if (name === 'freddy') {
      ctx.fillStyle = '#8e6d44';
      ctx.beginPath();
      ctx.roundRect(-14, -14, 28, 16, 8);
      ctx.fill();
      ctx.fillStyle = '#2a1f18';
      ctx.beginPath();
      ctx.arc(0, -6, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#11151d';
      ctx.beginPath();
      ctx.moveTo(-10, 8);
      ctx.lineTo(-2, 0);
      ctx.lineTo(0, 8);
      ctx.lineTo(-2, 16);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(10, 8);
      ctx.lineTo(2, 0);
      ctx.lineTo(0, 8);
      ctx.lineTo(2, 16);
      ctx.closePath();
      ctx.fill();
    } else if (name === 'bonnie') {
      ctx.fillStyle = '#a59af0';
      ctx.beginPath();
      ctx.roundRect(-13, -14, 26, 14, 8);
      ctx.fill();
      ctx.fillStyle = '#332c5c';
      ctx.beginPath();
      ctx.arc(0, -7, 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.save();
      ctx.rotate(-0.5);
      ctx.fillStyle = '#6f4a2f';
      ctx.beginPath();
      ctx.roundRect(-56, 10, 20, 58, 8);
      ctx.fill();
      ctx.fillStyle = '#4a2f1f';
      ctx.fillRect(-50, 12, 8, 54);
      ctx.fillStyle = '#b79a64';
      ctx.beginPath();
      ctx.ellipse(-46, 10, 9, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    ctx.fillStyle = 'rgba(0,0,0,.28)';
    ctx.fillRect(-44, 30, 88, 10);
    ctx.restore();
  }

  function drawOffice() {
    const ctx = el.officeCanvas.getContext('2d');
    const w = el.officeCanvas.width;
    const h = el.officeCanvas.height;
    drawRoomBase(ctx, w, h, 'office', state.look);

    const leftThreatCount = inRoom('westCorner').length;
    const rightThreatCount = inRoom('eastCorner').length;
    state.leftShake = Math.max(0, state.leftShake - 0.12);
    state.rightShake = Math.max(0, state.rightShake - 0.12);
    if (leftThreatCount) state.leftShake = Math.max(state.leftShake, 1.5 + Math.random() * 2.4);
    if (rightThreatCount) state.rightShake = Math.max(state.rightShake, 1.5 + Math.random() * 2.4);

    const powerFade = clamp(state.power / 100, 0.2, 1);

    const backGlow = ctx.createRadialGradient(w * 0.52, h * 0.24, 40, w * 0.52, h * 0.3, 390);
    backGlow.addColorStop(0, `rgba(255,248,220,${0.12 * powerFade})`);
    backGlow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = backGlow;
    ctx.fillRect(0, 0, w, h);

    drawPoster(ctx, w * 0.43, h * 0.12, 130, 160, 'CELEBRATE!', '#6f8fc1');
    drawPoster(ctx, w * 0.28, h * 0.18, 100, 136, 'RULES', '#836a8e');
    drawPoster(ctx, w * 0.62, h * 0.18, 100, 136, 'PARTY', '#7b6b4c');

    ctx.fillStyle = '#463424';
    ctx.fillRect(w * 0.26, h * 0.63, w * 0.48, h * 0.2);
    ctx.fillStyle = '#2f251b';
    ctx.fillRect(w * 0.24, h * 0.82, w * 0.52, h * 0.07);

    ctx.fillStyle = '#f5f3e3';
    for (let i = 0; i < 6; i += 1) {
      const px = w * 0.31 + i * 55 + Math.sin((state.t * 0.002) + i) * 2;
      const py = h * 0.66 + (i % 2) * 8;
      ctx.fillRect(px, py, 44, 56);
      ctx.strokeStyle = 'rgba(0,0,0,.18)';
      ctx.strokeRect(px, py, 44, 56);
    }

    drawDeskFan(ctx, w * 0.51, h * 0.665, state.fanSpin);

    ctx.fillStyle = '#1b1f29';
    ctx.fillRect(w * 0.585, h * 0.665, 120, 54);
    ctx.fillStyle = '#0e1219';
    ctx.fillRect(w * 0.594, h * 0.675, 102, 35);

    const cupX = w * 0.43;
    ctx.fillStyle = '#a9b7c8';
    ctx.fillRect(cupX, h * 0.69, 18, 38);
    ctx.fillStyle = '#4f5f71';
    ctx.fillRect(cupX + 3, h * 0.665, 12, 8);

    const doorWidth = 130;
    const leftDoorX = 60 + state.leftShake;
    const rightDoorX = w - 60 - doorWidth - state.rightShake;

    ctx.fillStyle = '#1a2232';
    ctx.fillRect(leftDoorX, 80, doorWidth, h - 150);
    ctx.fillRect(rightDoorX, 80, doorWidth, h - 150);

    if (state.leftDoor) {
      ctx.fillStyle = '#3b4d69';
      ctx.fillRect(leftDoorX + 8, 90, doorWidth - 16, h - 180);
    }
    if (state.rightDoor) {
      ctx.fillStyle = '#664a3b';
      ctx.fillRect(rightDoorX + 8, 90, doorWidth - 16, h - 180);
    }

    if (state.leftLight) {
      ctx.fillStyle = 'rgba(255,245,220,.2)';
      ctx.fillRect(0, 140, 230, h - 210);
    }
    if (state.rightLight) {
      ctx.fillStyle = 'rgba(255,245,220,.2)';
      ctx.fillRect(w - 230, 140, 230, h - 210);
    }

    if (leftThreatCount && state.leftLight) drawEntity(ctx, 240, h - 220, 1.2, inRoom('westCorner')[0], true);
    if (rightThreatCount && state.rightLight) drawEntity(ctx, w - 240, h - 220, 1.2, inRoom('eastCorner')[0], true);

    ctx.fillStyle = 'rgba(0,0,0,.25)';
    ctx.fillRect(0, h * 0.87, w, h * 0.13);

    const vignette = ctx.createRadialGradient(w * 0.5, h * 0.54, 220, w * 0.5, h * 0.54, 760);
    vignette.addColorStop(0, 'rgba(0,0,0,0)');
    vignette.addColorStop(1, 'rgba(0,0,0,.45)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, w, h);

    const depthFog = ctx.createLinearGradient(0, h * 0.25, 0, h);
    depthFog.addColorStop(0, 'rgba(0,0,0,0)');
    depthFog.addColorStop(1, 'rgba(0,0,0,.24)');
    ctx.fillStyle = depthFog;
    ctx.fillRect(0, 0, w, h);

    if (state.power < 18) {
      ctx.fillStyle = `rgba(255,255,210,${Math.random() * 0.11})`;
      ctx.fillRect(0, 0, w, h);
    }
    if (state.jumpFlash > 0) {
      ctx.fillStyle = `rgba(255,255,255,${Math.min(0.7, state.jumpFlash / 900)})`;
      ctx.fillRect(0, 0, w, h);
      state.jumpFlash = Math.max(0, state.jumpFlash - 20);
    }
  }

  function drawRoomAtmosphere(ctx, w, h, roomId) {
    const pulse = Math.sin(state.t * 0.004) * 0.5 + 0.5;
    const sway = Math.sin(state.t * 0.0025) * 10;
    const drift = Math.sin(state.t * 0.0018) * 6;

    if (roomId === 'stage') {
      const glow = ctx.createRadialGradient(w * 0.5, h * 0.3, 40, w * 0.5, h * 0.3, 560);
      glow.addColorStop(0, `rgba(255,220,170,${0.16 + pulse * 0.12})`);
      glow.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, w, h);

      ctx.fillStyle = '#5a2730';
      ctx.fillRect(0, h * 0.06, w * 0.14 + sway * 0.2, h * 0.56);
      ctx.fillRect(w * 0.86 - sway * 0.2, h * 0.06, w * 0.14, h * 0.56);

      ctx.fillStyle = '#3e2b36';
      ctx.fillRect(w * 0.22, h * 0.6, w * 0.56, h * 0.16);
      ctx.fillStyle = '#2a1b25';
      ctx.fillRect(w * 0.2, h * 0.74, w * 0.6, h * 0.03);

      ctx.fillStyle = `rgba(255,245,210,${0.3 + pulse * 0.25})`;
      ctx.beginPath();
      ctx.arc(w * 0.36 + drift, h * 0.18, 24, 0, Math.PI * 2);
      ctx.arc(w * 0.64 - drift, h * 0.18, 24, 0, Math.PI * 2);
      ctx.fill();
      return;
    }

    if (roomId === 'dining') {
      for (let i = 0; i < 3; i += 1) {
        const x = w * (0.18 + i * 0.26);
        const bob = Math.sin(state.t * 0.002 + i) * 2;
        ctx.fillStyle = '#3f2a30';
        ctx.fillRect(x, h * 0.62 + bob, 150, 72);
        ctx.fillStyle = `rgba(240,240,240,${0.8 + Math.sin(state.t * 0.005 + i) * 0.1})`;
        ctx.fillRect(x + 12, h * 0.6 + bob, 126, 12);
      }
      return;
    }

    if (roomId === 'backstage') {
      ctx.fillStyle = '#252f42';
      for (let i = 0; i < 4; i += 1) {
        const jitter = Math.sin(state.t * 0.003 + i) * 3;
        ctx.fillRect(110 + i * 220 + jitter, h * 0.28, 110, h * 0.42);
      }
      ctx.fillStyle = `rgba(154,169,191,${0.7 + pulse * 0.2})`;
      ctx.fillRect(w * 0.62, h * 0.56, 180, 44);
      return;
    }

    if (roomId === 'pirate') {
      ctx.fillStyle = '#4a1f2a';
      ctx.fillRect(w * 0.2, h * 0.16, w * 0.6, h * 0.52);
      ctx.fillStyle = '#2a1017';
      ctx.fillRect(w * 0.24 + sway * 0.2, h * 0.2, w * 0.52, h * 0.44);
      ctx.fillStyle = '#7a5b31';
      ctx.fillRect(w * 0.7, h * 0.44, 46, 180);
      ctx.fillStyle = `rgba(215,179,109,${0.65 + pulse * 0.25})`;
      ctx.fillRect(w * 0.72, h * 0.45, 30, 8);
      return;
    }

    if (roomId === 'westHall' || roomId === 'eastHall') {
      const left = roomId === 'westHall';
      ctx.fillStyle = `rgba(230,240,255,${0.05 + pulse * 0.07})`;
      ctx.fillRect(left ? 80 : w - 130, h * 0.18, 50, h * 0.48);
      ctx.fillStyle = '#1c2431';
      ctx.fillRect(w * 0.38, h * 0.28 + drift * 0.2, w * 0.24, h * 0.43);
      return;
    }

    if (roomId === 'westCorner' || roomId === 'eastCorner') {
      const left = roomId === 'westCorner';
      ctx.fillStyle = '#171f2a';
      ctx.fillRect(left ? 70 : w - 330, h * 0.34, 260, h * 0.35);
      ctx.fillStyle = `rgba(184,200,220,${0.45 + pulse * 0.25})`;
      ctx.fillRect(left ? 88 : w - 312, h * 0.38, 224, 8);
      return;
    }

    if (roomId === 'kitchen') {
      const hum = Math.sin(state.t * 0.006) * 0.08 + 0.9;
      ctx.fillStyle = `rgba(158,167,180,${hum})`;
      ctx.fillRect(w * 0.18, h * 0.58, w * 0.64, h * 0.09);
      ctx.fillStyle = '#596273';
      ctx.fillRect(w * 0.22, h * 0.34 + drift * 0.25, w * 0.1, h * 0.22);
      ctx.fillRect(w * 0.68, h * 0.34 - drift * 0.25, w * 0.1, h * 0.22);
      return;
    }
  }

  function drawCamera() {
    const ctx = el.camCanvas.getContext('2d');
    const w = el.camCanvas.width;
    const h = el.camCanvas.height;
    const roomId = rooms[state.camIdx][0];
    drawRoomBase(ctx, w, h, roomId, 0);
    drawRoomAtmosphere(ctx, w, h, roomId);

    const occupants = inRoom(roomId);
    occupants.forEach((name, i) => {
      const entity = state.entities[name];
      const x = w * (0.32 + i * 0.2);
      const waking = entity && !entity.active && entity.wakeDelayMs <= 0;
      const idleWobble = waking ? Math.sin(state.t * 0.008 + entity.lookPhase + i) * 12 : 0;
      const y = h * (0.63 + (i % 2) * 0.04) + idleWobble;
      drawEntity(ctx, x, y, 1.2 - i * 0.08, name, true);
    });

    if (state.goldenFreddyMs > 0 && (roomId === 'stage' || roomId === 'office')) {
      const fx = roomId === 'stage' ? w * 0.68 : w * 0.53;
      const fy = roomId === 'stage' ? h * 0.68 : h * 0.72;
      drawEntity(ctx, fx, fy, 1.24, 'golden', true);
    }

    if (roomId === 'pirate') {
      const stage = state.entities.foxy.coveStage;
      const foxyText = ['Curtain closed', 'Movement heard', 'Peeking out', 'Cove empty'][stage];
      ctx.fillStyle = 'rgba(255,220,180,.9)';
      ctx.font = 'bold 32px Verdana';
      ctx.fillText(foxyText, 36, h - 70);
    }

    if (roomId === 'kitchen') {
      ctx.fillStyle = '#e6f4ff';
      ctx.font = 'bold 20px Verdana';
      ctx.fillText('AUDIO ONLY - utensils rattling', 22, h - 32);
    }

    const scan = (state.t * 0.14) % h;
    ctx.fillStyle = 'rgba(180,255,190,.05)';
    ctx.fillRect(0, scan, w, 8);

    if (Math.random() < 0.22) {
      const y = Math.random() * h;
      ctx.fillStyle = 'rgba(255,255,255,.04)';
      ctx.fillRect(0, y, w, 1);
    }

    const camVignette = ctx.createRadialGradient(w * 0.5, h * 0.5, 150, w * 0.5, h * 0.5, 780);
    camVignette.addColorStop(0, 'rgba(0,0,0,0)');
    camVignette.addColorStop(1, 'rgba(0,0,0,.38)');
    ctx.fillStyle = camVignette;
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = 'rgba(180,210,255,.14)';
    ctx.lineWidth = 2;
    ctx.strokeRect(8, 8, w - 16, h - 16);

    const barrelShade = ctx.createRadialGradient(w * 0.5, h * 0.5, w * 0.35, w * 0.5, h * 0.5, w * 0.62);
    barrelShade.addColorStop(0, 'rgba(0,0,0,0)');
    barrelShade.addColorStop(1, 'rgba(0,0,0,.22)');
    ctx.fillStyle = barrelShade;
    ctx.fillRect(0, 0, w, h);

    if (Math.random() < 0.06 || state.camGlitchMs > 0) {
      ctx.fillStyle = 'rgba(255,255,255,.09)';
      ctx.fillRect(0, 0, w, h);
    }
  }

  function lose(message) {
    if (state.over) return;
    state.over = true;
    state.jumpFlash = 900;
    el.resultTitle.textContent = 'GAME OVER';
    el.resultText.textContent = message;
    el.result.classList.add('show');
  }

  function win() {
    if (state.over) return;
    state.over = true;
    const nextNight = Math.min(5, state.night + 1);
    el.resultTitle.textContent = '6 AM';
    el.resultText.textContent = `You survived Night ${state.night}. Click restart for Night ${nextNight}.`;
    el.result.classList.add('show');
  }

  function aiRoll(level, dt, divisor = 12) {
    const chance = ((level + 1) / divisor) * (dt / 1000);
    return Math.random() < chance;
  }

  function stepEntity(name, dt) {
    const e = state.entities[name];
    if (!e) return;

    if (!e.active) {
      if (e.wakeDelayMs > 0) {
        e.wakeDelayMs -= dt;
        return;
      }
      if (e.wakeAnimMs > 0) {
        e.wakeAnimMs -= dt;
        e.lookPhase += dt * 0.003;
        return;
      }
      e.active = true;
    }

    e.moveTimer -= dt;
    if (e.moveTimer > 0) return;

    const cfg = animProfile[name];
    const pace = nightPacing[state.night] || nightPacing[6];
    const speedBias = cfg.moveBaseMs * pace.move - e.ai * 85;
    e.moveTimer = clamp(speedBias + Math.random() * cfg.moveRandMs * pace.move, 420, 4600);

    if (name === 'foxy') {
      if (state.camOpen && rooms[state.camIdx][0] === 'pirate') {
        state.cameraStallMs = Math.max(state.cameraStallMs, 480);
        return;
      }
      if (aiRoll(e.ai, dt, 18)) {
        e.coveStage = clamp(e.coveStage + 1, 0, 3);
        e.room = e.coveStage < 3 ? 'pirate' : 'westHall';
      }
      return;
    }

    let divisor = name === 'freddy' ? 9 : 11;
    const progress = clamp(state.t / state.duration, 0, 1);
    const currentHour = Math.floor(progress * 6) + 1;

    if ((name === 'bonnie' || name === 'chica') && currentHour <= 3) {
      divisor = 9.6;
    }
    if (name === 'freddy' && currentHour <= 4) {
      divisor = 12.4;
    }

    if (name === 'freddy') {
      const unlockHour = freddyReleaseHourByNight[state.night] || 1;
      if (currentHour < unlockHour) return;
    }

    if (aiRoll(e.ai, dt, divisor)) {
      const fromDoor = e.room === 'westCorner' || e.room === 'eastCorner';
      e.room = pickNextRoom(name, e.room);
      if (fromDoor && e.room !== 'westCorner' && e.room !== 'eastCorner') e.doorSeenMs = 0;
    }
  }

  function resolveThreats(dt) {
    const handleDoorThreat = (name) => {
      const e = state.entities[name];
      const cfg = animProfile[name];
      const progress = clamp(state.t / state.duration, 0, 1);
      const currentHour = Math.floor(progress * 6) + 1;
      const atLeft = e.room === 'westCorner';
      const atRight = e.room === 'eastCorner';
      const atDoor = atLeft || atRight;
      if (!atDoor) {
        e.doorSeenMs = 0;
        return;
      }
      e.doorSeenMs += dt;
      const doorClosed = atLeft ? state.leftDoor : state.rightDoor;
      if (doorClosed) {
        const backoffMs = name === 'freddy' ? 3400 : 800;
        if (e.doorSeenMs > cfg.preAttackMs + backoffMs) {
          e.room = atLeft ? 'westHall' : 'eastHall';
          e.doorSeenMs = 0;
        }
        return;
      }

      if (e.doorSeenMs < cfg.preAttackMs) return;
      const pace = nightPacing[state.night] || nightPacing[6];
      let threat = (cfg.attackRate + e.ai * 0.003) * pace.attack;
      if (name === 'freddy') {
        const hourThreatScale = currentHour <= 3 ? 0.45 : currentHour === 4 ? 0.75 : currentHour === 5 ? 1.0 : 1.35;
        threat *= hourThreatScale;
      }
      if (Math.random() < threat * (dt / 1000)) {
        lose(`${name[0].toUpperCase()}${name.slice(1)} got in through the ${cfg.side} door.`);
      }
    };

    handleDoorThreat('bonnie');
    handleDoorThreat('chica');
    handleDoorThreat('freddy');

    if (state.entities.foxy.coveStage >= 3 && state.foxySprintMs <= 0) {
      state.entities.foxy.doorSeenMs += dt;
      if (state.entities.foxy.doorSeenMs >= animProfile.foxy.preAttackMs) {
        state.foxySprintMs = 1400;
      }
      state.status.textContent = 'Foxy is charging down the hall!';
    }
    if (state.foxySprintMs > 0) {
      state.foxySprintMs -= dt;
      if (state.foxySprintMs <= 0) {
        if (state.leftDoor) {
          state.power = Math.max(0, state.power - 6);
          state.entities.foxy.coveStage = 1;
          state.entities.foxy.room = 'pirate';
          state.entities.foxy.doorSeenMs = 0;
          state.camGlitchMs = 420;
          state.status.textContent = 'Foxy hit the left door and retreated.';
        } else {
          lose('Foxy sprinted into your office.');
        }
      }
    }
  }

  function updateNightAi() {
    const levels = aiByNight[state.night] || aiByNight[6];
    const pace = nightPacing[state.night] || nightPacing[6];
    state.entities.bonnie.ai = levels.bonnie;
    state.entities.chica.ai = levels.chica;
    state.entities.freddy.ai = levels.freddy;
    state.entities.foxy.ai = levels.foxy;

    if (state.night <= 3) {
      state.entities.bonnie.ai += 0.7;
      state.entities.chica.ai += 0.55;
      state.entities.freddy.ai = Math.max(0, state.entities.freddy.ai - 0.5);
    }

    Object.entries(state.entities).forEach(([name, entity]) => {
      const cfg = animProfile[name];
      entity.wakeDelayMs = cfg.wakeDelayMs * pace.wake + Math.random() * (3000 * pace.wake);
      entity.wakeAnimMs = cfg.wakeAnimMs * clamp(0.92 + pace.wake * 0.08, 0.75, 1.05);
      entity.active = false;
      entity.doorSeenMs = 0;
      entity.lookPhase = Math.random() * Math.PI * 2;
      entity.moveTimer = cfg.moveBaseMs * pace.move + Math.random() * cfg.moveRandMs * pace.move;
    });
  }

  function update(dt) {
    if (state.over) return;

    state.t += dt;
    state.camTransitionMs = Math.max(0, state.camTransitionMs - dt);
    state.camGlitchMs = Math.max(0, state.camGlitchMs - dt);
    state.cameraStallMs = Math.max(0, state.cameraStallMs - dt);
    state.fanSpin += dt * 0.012;
    if (!state.camOpen) {
      state.camDowntimeMs += dt;
    } else {
      state.camDowntimeMs = Math.max(0, state.camDowntimeMs - dt * 1.7);
    }

    const progress = clamp(state.t / state.duration, 0, 1);
    const hourIndex = Math.floor(progress * 6);
    const hourBoost = hourIndex >= 2 ? 1 : 0;

    state.entities.bonnie.ai = clamp(state.entities.bonnie.ai + hourBoost * 0.0018 * dt, 0, 20);
    state.entities.chica.ai = clamp(state.entities.chica.ai + hourBoost * 0.0018 * dt, 0, 20);
    state.entities.freddy.ai = clamp(state.entities.freddy.ai + hourBoost * 0.00155 * dt, 0, 20);
    state.entities.foxy.ai = clamp(state.entities.foxy.ai + hourBoost * 0.00135 * dt, 0, 20);

    const foxyCamPressure = clamp(state.camDowntimeMs / 22000, 0, 2.8);
    state.entities.foxy.ai = clamp(state.entities.foxy.ai + foxyCamPressure * (dt / 1000) * 0.07, 0, 20);

    if (state.goldenFreddyMs > 0) {
      state.goldenFreddyMs = Math.max(0, state.goldenFreddyMs - dt);
    } else {
      const goldenSpawnChance = 0.0000012 * (dt / 1000);
      if (Math.random() < goldenSpawnChance) {
        state.goldenFreddyMs = 3600;
        state.camGlitchMs = 700;
      }
    }

    const powerDrain = (0.053 * usage() * dt) / 1000;
    state.power = Math.max(0, state.power - powerDrain);

    if (state.power <= 0) {
      state.leftDoor = false;
      state.rightDoor = false;
      state.leftLight = false;
      state.rightLight = false;
      state.blackoutMs += dt;
      state.blackoutTicks += dt;
      if (state.blackoutTicks > 1100) {
        state.blackoutTicks = 0;
        if (Math.random() < 0.34) lose('Power out. Freddy moved in the darkness.');
      }
    }

    stepEntity('bonnie', dt);
    stepEntity('chica', dt);
    stepEntity('freddy', dt);
    stepEntity('foxy', dt);

    resolveThreats(dt);

    if (progress >= 1) win();
  }

  function draw() {
    const progress = clamp(state.t / state.duration, 0, 1);
    const hour = 12 + Math.floor(progress * 6);
    const hourText = `${hour > 12 ? hour - 12 : hour} AM`;

    el.clock.textContent = hourText;
    el.nightLabel.textContent = `Night ${state.night}`;
    el.powerLabel.textContent = `Power: ${Math.ceil(state.power)}%`;
    el.powerFill.style.width = `${state.power}%`;
    el.usage.textContent = `Usage: ${usage()}x`;

    el.officePanel.classList.toggle('active', !state.camOpen);
    el.camPanel.classList.toggle('active', state.camOpen);
    el.camPanel.classList.toggle('opening', state.camOpen && state.camTransitionMs > 0);
    el.camPanel.classList.toggle('closing', !state.camOpen && state.camTransitionMs > 0);
    el.camToggle.classList.toggle('active', state.camOpen);
    el.camToggle.textContent = state.camOpen ? 'Close Cameras' : 'Open Cameras';
    el.camTransition.style.opacity = (state.camTransitionMs / 220).toFixed(2);

    el.leftDoorBtn.classList.toggle('active', state.leftDoor);
    el.rightDoorBtn.classList.toggle('active', state.rightDoor);
    el.leftLightBtn.classList.toggle('active', state.leftLight);
    el.rightLightBtn.classList.toggle('active', state.rightLight);

    el.leftDoorText.textContent = state.leftDoor ? 'CLOSED' : 'OPEN';
    el.rightDoorText.textContent = state.rightDoor ? 'CLOSED' : 'OPEN';
    el.leftLightText.textContent = state.leftLight ? 'ON' : 'OFF';
    el.rightLightText.textContent = state.rightLight ? 'ON' : 'OFF';

    const leftThreat = inRoom('westCorner');
    const rightThreat = inRoom('eastCorner');
    const goldenActive = state.goldenFreddyMs > 0;
    const officeThreat = leftThreat.length || rightThreat.length || state.foxySprintMs > 0 || goldenActive;
    el.warn.style.display = officeThreat ? 'block' : 'none';
    el.warn.textContent = goldenActive ? 'GOLDEN FREDDYS ON THE LOSE' : 'OFFICE THREAT';

    const wakingNames = Object.entries(state.entities).filter(([, e]) => !e.active && e.wakeDelayMs <= 0).map(([name]) => name);

    if (leftThreat.length && state.leftLight) {
      el.presence.textContent = `LEFT CONTACT (${leftThreat.join(', ')})`;
    } else if (rightThreat.length && state.rightLight) {
      el.presence.textContent = `RIGHT CONTACT (${rightThreat.join(', ')})`;
    } else if (wakingNames.length) {
      el.presence.textContent = `Rustling on stage (${wakingNames.join(', ')})`;
    } else if (state.camOpen) {
      el.presence.textContent = 'Watching monitors...';
    } else {
      el.presence.textContent = 'Listening...';
    }

    if (!state.camOpen && state.camDowntimeMs > 18000 && state.power > 0) {
      el.status.textContent = 'Cameras have been idle too long. Pirate Cove is restless.';
    }

    if (state.power <= 0) {
      el.status.textContent = 'Power out. Doors and lights offline.';
    } else if (state.camOpen) {
      el.status.textContent = 'Viewing camera monitor...';
    } else {
      el.status.textContent = 'You are in the office.';
    }

    el.powerout.style.opacity = state.power <= 0 ? '.26' : '0';

    const [roomId, roomName] = rooms[state.camIdx];
    const entities = inRoom(roomId);
    el.camName.textContent = `Camera: ${roomName}`;
    el.camDetected.textContent = entities.length ? `Detected: ${entities.join(', ')}` : 'Detected: none';
    [...el.camMap.children].forEach((btn, i) => btn.classList.toggle('active', i === state.camIdx));

    drawOffice();
    drawCamera();
  }

  function reset(forNextNight = false) {
    if (forNextNight && state.over && el.resultTitle.textContent === '6 AM') {
      state.night = Math.min(5, state.night + 1);
    }

    state.t = 0;
    state.power = 100;
    state.over = false;
    state.camOpen = false;
    state.camIdx = 0;
    state.camTransitionMs = 0;
    state.camGlitchMs = 0;
    state.look = 0;
    state.leftDoor = false;
    state.rightDoor = false;
    state.leftLight = false;
    state.rightLight = false;
    state.leftShake = 0;
    state.rightShake = 0;
    state.fanSpin = 0;
    state.jumpFlash = 0;
    state.blackoutMs = 0;
    state.blackoutTicks = 0;
    state.cameraStallMs = 0;
    state.camDowntimeMs = 0;
    state.foxySprintMs = 0;
    state.goldenFreddyMs = 0;

    state.entities.bonnie.room = 'stage';
    state.entities.chica.room = 'stage';
    state.entities.freddy.room = 'stage';
    state.entities.foxy.room = 'pirate';
    state.entities.foxy.coveStage = 0;
    updateNightAi();

    el.result.classList.remove('show');
    draw();
  }

  function adjustLook(delta) {
    state.look = clamp(state.look + delta, -1, 1);
  }

  function toggleDoor(side) {
    if (state.over || state.power <= 0) return;
    if (side === 'left') state.leftDoor = !state.leftDoor;
    if (side === 'right') state.rightDoor = !state.rightDoor;
  }

  function toggleLight(side) {
    if (state.over || state.power <= 0) return;
    if (side === 'left') state.leftLight = !state.leftLight;
    if (side === 'right') state.rightLight = !state.rightLight;
  }

  rooms.forEach(([, label], idx) => {
    const button = document.createElement('button');
    button.className = 'cam-btn';
    button.textContent = label.replace(' ', '\n').slice(0, 12);
    button.onclick = () => {
      state.camIdx = idx;
      state.camGlitchMs = 140;
      if (rooms[idx][0] === 'pirate') state.cameraStallMs = 650;
    };
    el.camMap.appendChild(button);
  });

  window.addEventListener('keydown', (event) => {
    if (state.over) return;
    if (event.key === 'a' || event.key === 'ArrowLeft') adjustLook(-0.09);
    if (event.key === 'd' || event.key === 'ArrowRight') adjustLook(0.09);
    if (event.key === ' ') state.look *= 0.3;

    if (event.key.toLowerCase() === 'q') toggleDoor('left');
    if (event.key.toLowerCase() === 'e') toggleDoor('right');
    if (event.key.toLowerCase() === 'z') toggleLight('left');
    if (event.key.toLowerCase() === 'c') toggleLight('right');
    if (event.key.toLowerCase() === 'f' && state.power > 0) {
      state.camOpen = !state.camOpen;
      state.camTransitionMs = 220;
      state.camGlitchMs = 180;
    }
  });

  el.leftDoorBtn.onclick = () => toggleDoor('left');
  el.rightDoorBtn.onclick = () => toggleDoor('right');
  el.leftLightBtn.onclick = () => toggleLight('left');
  el.rightLightBtn.onclick = () => toggleLight('right');
  el.camToggle.onclick = () => {
    if (state.over || state.power <= 0) return;
    state.camOpen = !state.camOpen;
    state.camTransitionMs = 220;
    state.camGlitchMs = 180;
  };
  $('#restart').onclick = () => reset(true);
  $('#close-btn').onclick = () => { root.remove(); style.remove(); };

  let last = performance.now();
  function loop(now) {
    const dt = Math.min(120, now - last);
    last = now;
    update(dt);
    draw();
    if (document.body.contains(root)) requestAnimationFrame(loop);
  }

  reset(false);
  requestAnimationFrame(loop);
})();

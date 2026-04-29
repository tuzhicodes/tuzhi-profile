/* ════════════════════════════════════════
   TuZhi Deco — dark-soul
   Smoke wisps + skull particles + dark aura
   Canvas: 150×150  |  CX/CY: 75  |  R: 52
   ════════════════════════════════════════ */
(function () {
  const cv = document.getElementById('decoCanvas');
  if (!cv) return;
  const ctx = cv.getContext('2d');

  const W = 150, H = 150, CX = 75, CY = 75, R = 52;

  const SMOKE1 = '#2a1a3e';
  const SMOKE2 = '#3d1f5c';
  const PURPLE = '#7b2fff';
  const DARK   = '#1a0a2e';
  const WHITE  = '#d0b8ff';

  let t = 0;

  /* ── smoke particles ── */
  function makeSmoke() {
    const angle = Math.random() * Math.PI * 2;
    const orbit = R * 0.6 + Math.random() * R * 0.55;
    return {
      x     : CX + Math.cos(angle) * orbit,
      y     : CY + Math.sin(angle) * orbit,
      vx    : (Math.random() - 0.5) * 0.35,
      vy    : -(0.25 + Math.random() * 0.45),
      size  : 10 + Math.random() * 18,
      alpha : 0.18 + Math.random() * 0.22,
      life  : 0,
      maxLife: 90 + Math.floor(Math.random() * 70),
      rot   : Math.random() * Math.PI * 2,
      rotSpd: (Math.random() - 0.5) * 0.018,
    };
  }

  const smokes = Array.from({ length: 18 }, () => {
    const s = makeSmoke();
    s.life = Math.floor(Math.random() * s.maxLife);
    return s;
  });

  /* ── skull mini shape ── */
  function drawSkull(x, y, r, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = WHITE;
    ctx.shadowColor = PURPLE;
    ctx.shadowBlur = 10;

    /* cranium */
    ctx.beginPath();
    ctx.arc(x, y - r * 0.1, r, 0, Math.PI * 2);
    ctx.fill();

    /* jaw */
    ctx.beginPath();
    ctx.arc(x, y + r * 0.55, r * 0.65, 0, Math.PI);
    ctx.fill();

    /* eye sockets */
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x - r * 0.35, y - r * 0.1, r * 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + r * 0.35, y - r * 0.1, r * 0.3, 0, Math.PI * 2);
    ctx.fill();

    /* nose */
    ctx.beginPath();
    ctx.arc(x, y + r * 0.2, r * 0.18, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalCompositeOperation = 'source-over';
    ctx.restore();
  }

  /* ── orbiting skulls ── */
  const skulls = Array.from({ length: 5 }, (_, i) => ({
    angle : (i / 5) * Math.PI * 2,
    orbit : R - 4 + Math.random() * 10,
    speed : 0.007 + Math.random() * 0.005,
    size  : 4.5 + Math.random() * 3,
    phase : Math.random() * Math.PI * 2,
    alpha : 0.55 + Math.random() * 0.35,
    dir   : Math.random() < 0.5 ? 1 : -1,
  }));

  /* ── draw smoke wisp ── */
  function drawSmoke(s) {
    const progress = s.life / s.maxLife;
    const fadeIn   = progress < 0.2 ? progress / 0.2 : 1;
    const fadeOut  = progress > 0.7 ? 1 - (progress - 0.7) / 0.3 : 1;
    const a        = s.alpha * fadeIn * fadeOut;
    if (a <= 0) return;

    ctx.save();
    ctx.translate(s.x, s.y);
    ctx.rotate(s.rot);
    ctx.globalAlpha = a;

    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, s.size);
    g.addColorStop(0, SMOKE2);
    g.addColorStop(0.5, SMOKE1);
    g.addColorStop(1, 'rgba(26,10,46,0)');

    ctx.beginPath();
    ctx.ellipse(0, 0, s.size, s.size * 0.75, 0, 0, Math.PI * 2);
    ctx.fillStyle = g;
    ctx.fill();
    ctx.restore();
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    t++;

    /* 1. dark outer aura */
    const aura = ctx.createRadialGradient(CX, CY, R - 10, CX, CY, R + 14);
    aura.addColorStop(0, 'rgba(123,47,255,0)');
    aura.addColorStop(0.5, 'rgba(58,20,90,0.18)');
    aura.addColorStop(1, 'rgba(26,10,46,0)');
    ctx.beginPath();
    ctx.arc(CX, CY, R + 14, 0, Math.PI * 2);
    ctx.fillStyle = aura;
    ctx.fill();

    /* 2. inner vignette */
    const inner = ctx.createRadialGradient(CX, CY, R * 0.3, CX, CY, R);
    inner.addColorStop(0, 'rgba(40,10,60,0.08)');
    inner.addColorStop(1, 'rgba(40,10,60,0)');
    ctx.beginPath();
    ctx.arc(CX, CY, R, 0, Math.PI * 2);
    ctx.fillStyle = inner;
    ctx.fill();

    /* 3. smoke wisps */
    smokes.forEach(s => {
      s.life++;
      s.x  += s.vx;
      s.y  += s.vy;
      s.rot += s.rotSpd;
      s.size += 0.08;
      if (s.life >= s.maxLife) Object.assign(s, makeSmoke(), { life: 0 });
      drawSmoke(s);
    });

    /* 4. orbiting skulls */
    skulls.forEach(sk => {
      sk.angle += sk.speed * sk.dir;
      const bob = Math.sin(t * 0.04 + sk.phase) * 3;
      const x   = CX + Math.cos(sk.angle) * sk.orbit;
      const y   = CY + Math.sin(sk.angle) * sk.orbit + bob;
      const cx2 = Math.max(sk.size + 2, Math.min(W - sk.size - 2, x));
      const cy2 = Math.max(sk.size + 2, Math.min(H - sk.size - 2, y));
      const alphaPulse = sk.alpha * (0.7 + 0.3 * Math.sin(t * 0.05 + sk.phase));
      drawSkull(cx2, cy2, sk.size, alphaPulse);
    });

    /* 5. purple edge sparks */
    for (let i = 0; i < 6; i++) {
      const a  = (i / 6) * Math.PI * 2 + t * 0.012;
      const x  = CX + Math.cos(a) * (R + 1);
      const y  = CY + Math.sin(a) * (R + 1);
      const tw = 0.3 + 0.5 * Math.abs(Math.sin(t * 0.06 + i * 1.1));
      ctx.save();
      ctx.beginPath();
      ctx.arc(x, y, 1.8, 0, Math.PI * 2);
      ctx.fillStyle = PURPLE;
      ctx.shadowColor = PURPLE;
      ctx.shadowBlur = 12;
      ctx.globalAlpha = tw * 0.8;
      ctx.fill();
      ctx.restore();
    }

    /* 6. top smoke rise — wisps going above avatar */
    const riseAlpha = 0.12 + 0.06 * Math.sin(t * 0.025);
    const riseGrd = ctx.createLinearGradient(CX, CY - R, CX, CY - R - 28);
    riseGrd.addColorStop(0, `rgba(58,20,90,${riseAlpha})`);
    riseGrd.addColorStop(1, 'rgba(58,20,90,0)');
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(CX, CY - R - 10, 22, 20, 0, 0, Math.PI * 2);
    ctx.fillStyle = riseGrd;
    ctx.globalAlpha = 1;
    ctx.fill();
    ctx.restore();

    window._decoRaf = requestAnimationFrame(draw);
  }

  if (window._decoRaf) cancelAnimationFrame(window._decoRaf);
  draw();
})();


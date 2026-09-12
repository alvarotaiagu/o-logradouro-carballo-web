/* ---------- Hero: iconos "gelatinosos" orbitando (langostino, pulpo,
   tortilla, croqueta) ----------
   Técnica "gooey icon finish" del catálogo de motion del workspace — la
   preferida del cliente en las pruebas de Melao, hasta ahora sin usar en
   ningún sitio hermano. Cada icono se dibuja dos veces: una silueta más
   grande con blur (ctx.filter) por debajo y una copia más nítida y algo
   más pequeña encima, de modo que el conjunto lee como si estuviera
   "hecho del mismo gel" — el eco visual abstracto del degradado del hero.
   Iconos = platos de bandera reales de O Logradouro (langostinos y pulpo
   rebozados, tortilla, croquetas), no clip-art genérico. Canvas 2D, DPR
   limitado a 2, pausado fuera de viewport/pestaña oculta, con render
   estático bajo prefers-reduced-motion. El <canvas> es aria-hidden y se
   dibuja sobre un póster SVG estático que sigue siendo la escena completa
   si el canvas no se inicializa (sin JS, sin 2D context, sin soporte de
   ctx.filter, o reduced motion). */
(function () {
  function drawPrawn(ctx, s) {
    // Langostino: cuerpo curvado en coma + cola en abanico + antenas.
    ctx.beginPath();
    ctx.moveTo(-s * 0.5, s * 0.02);
    ctx.bezierCurveTo(-s * 0.46, -s * 0.42, s * 0.05, -s * 0.5, s * 0.32, -s * 0.22);
    ctx.bezierCurveTo(s * 0.5, -s * 0.02, s * 0.46, s * 0.28, s * 0.22, s * 0.4);
    ctx.bezierCurveTo(s * 0.02, s * 0.5, -s * 0.42, s * 0.36, -s * 0.5, s * 0.02);
    ctx.closePath();
    ctx.fill();
    // segmentos del cuerpo
    ctx.beginPath();
    ctx.moveTo(-s * 0.28, -s * 0.28);
    ctx.lineTo(-s * 0.12, s * 0.14);
    ctx.moveTo(-s * 0.02, -s * 0.36);
    ctx.lineTo(s * 0.12, s * 0.06);
    ctx.stroke();
    // cola en abanico
    ctx.beginPath();
    ctx.moveTo(s * 0.24, s * 0.36);
    ctx.lineTo(s * 0.46, s * 0.22);
    ctx.lineTo(s * 0.5, s * 0.42);
    ctx.lineTo(s * 0.3, s * 0.5);
    ctx.closePath();
    ctx.fill();
    // antenas
    ctx.beginPath();
    ctx.moveTo(-s * 0.46, -s * 0.1);
    ctx.quadraticCurveTo(-s * 0.7, -s * 0.3, -s * 0.86, -s * 0.16);
    ctx.moveTo(-s * 0.4, -s * 0.24);
    ctx.quadraticCurveTo(-s * 0.6, -s * 0.5, -s * 0.72, -s * 0.62);
    ctx.stroke();
  }

  function drawOctopus(ctx, s) {
    // Pulpo: cabeza redondeada + cuatro tentáculos curvos.
    ctx.beginPath();
    ctx.arc(0, -s * 0.18, s * 0.36, Math.PI, 0);
    ctx.bezierCurveTo(s * 0.36, s * 0.05, s * 0.2, s * 0.14, 0, s * 0.1);
    ctx.bezierCurveTo(-s * 0.2, s * 0.14, -s * 0.36, s * 0.05, -s * 0.36, -s * 0.18);
    ctx.closePath();
    ctx.fill();
    const legs = [
      [-s * 0.28, s * 0.06, -s * 0.5, s * 0.3, -s * 0.34, s * 0.56],
      [-s * 0.1, s * 0.14, -s * 0.16, s * 0.42, s * 0.02, s * 0.58],
      [s * 0.1, s * 0.14, s * 0.16, s * 0.42, -s * 0.02, s * 0.58],
      [s * 0.28, s * 0.06, s * 0.5, s * 0.3, s * 0.34, s * 0.56],
    ];
    ctx.lineWidth = Math.max(1, s * 0.09);
    ctx.lineCap = "round";
    legs.forEach(([x1, y1, x2, y2, x3, y3]) => {
      ctx.beginPath();
      ctx.moveTo(0, -s * 0.02);
      ctx.quadraticCurveTo(x1, y1, x2, y2);
      ctx.quadraticCurveTo(x2, y2, x3, y3);
      ctx.stroke();
    });
    // ojos
    const savedFill = ctx.fillStyle;
    ctx.fillStyle = "rgba(255,251,243,0.9)";
    ctx.beginPath();
    ctx.arc(-s * 0.12, -s * 0.2, s * 0.045, 0, Math.PI * 2);
    ctx.arc(s * 0.12, -s * 0.2, s * 0.045, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = savedFill;
  }

  function drawTortillaSlice(ctx, s) {
    // Cuña de tortilla: sector circular con borde redondeado + puntos de patata.
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, s * 0.56, -Math.PI * 0.62, -Math.PI * 0.02);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.56, -Math.PI * 0.62, -Math.PI * 0.02);
    ctx.stroke();
    const savedFill = ctx.fillStyle;
    ctx.fillStyle = "rgba(255,251,243,0.85)";
    [
      [s * 0.16, -s * 0.32],
      [s * 0.3, -s * 0.2],
      [s * 0.22, -s * 0.1],
      [s * 0.4, -s * 0.08],
    ].forEach(([x, y]) => {
      ctx.beginPath();
      ctx.arc(x, y, s * 0.045, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.fillStyle = savedFill;
  }

  function drawCroqueta(ctx, s) {
    // Croqueta: óvalo alargado + textura de rebozado (puntitos).
    ctx.beginPath();
    ctx.ellipse(0, 0, s * 0.5, s * 0.28, -0.12, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(0, 0, s * 0.5, s * 0.28, -0.12, 0, Math.PI * 2);
    ctx.stroke();
    const savedFill = ctx.fillStyle;
    ctx.fillStyle = "rgba(255,251,243,0.85)";
    const dots = [
      [-s * 0.24, -s * 0.06],
      [-s * 0.06, s * 0.1],
      [s * 0.12, -s * 0.1],
      [s * 0.28, s * 0.05],
      [s * 0.0, -s * 0.16],
    ];
    dots.forEach(([x, y]) => {
      ctx.beginPath();
      ctx.arc(x, y, s * 0.035, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.fillStyle = savedFill;
  }

  const DRAWERS = { prawn: drawPrawn, octopus: drawOctopus, tortilla: drawTortillaSlice, croqueta: drawCroqueta };

  function paintIcon(ctx, type, size, color) {
    ctx.fillStyle = color;
    ctx.strokeStyle = "rgba(255,251,243,0.85)";
    ctx.lineWidth = Math.max(1, size * 0.045);
    (DRAWERS[type] || drawPrawn)(ctx, size);
  }

  // ¿Soporta este navegador ctx.filter (blur)? Si no, se salta el paso de
  // la sombra gelatinosa y se dibuja solo la copia nítida — sigue siendo
  // una escena completa y correcta, solo sin el acabado "gooey".
  function supportsCanvasFilter() {
    try {
      const c = document.createElement("canvas").getContext("2d");
      return typeof c.filter === "string";
    } catch (e) {
      return false;
    }
  }

  function drawGooeyIcon(ctx, type, x, y, size, color, blurSupported) {
    ctx.save();
    ctx.translate(x, y);

    if (blurSupported) {
      ctx.save();
      ctx.filter = `blur(${Math.max(2, size * 0.16)}px)`;
      ctx.globalAlpha = 0.75;
      ctx.save();
      ctx.scale(1.22, 1.22);
      paintIcon(ctx, type, size, color);
      ctx.restore();
      ctx.restore();
    }

    ctx.shadowColor = "rgba(20,12,9,0.3)";
    ctx.shadowBlur = size * 0.22;
    ctx.shadowOffsetY = size * 0.08;
    paintIcon(ctx, type, size * 0.92, color);
    ctx.restore();
  }

  const ICONS = [
    { type: "prawn", color: "#C1592E", radiusX: 0.32, radiusY: 0.22, speedX: 0.5, speedY: 0.66, phase: 0, size: 0.17, pull: 0.5 },
    { type: "octopus", color: "#7A1F2E", radiusX: 0.34, radiusY: 0.3, speedX: 0.38, speedY: 0.48, phase: 2.3, size: 0.2, pull: 0.28 },
    { type: "tortilla", color: "#E8B18E", radiusX: 0.24, radiusY: 0.34, speedX: 0.58, speedY: 0.4, phase: 4.1, size: 0.16, pull: 0.42 },
    { type: "croqueta", color: "#6B7A45", radiusX: 0.2, radiusY: 0.2, speedX: 0.72, speedY: 0.58, phase: 1.5, size: 0.12, pull: 0.6 },
  ];

  window.createGooeyIconScene = function createGooeyIconScene(canvas) {
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    const blurSupported = supportsCanvasFilter();

    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = 0,
      height = 0,
      cx = 0,
      cy = 0,
      isNarrow = false;
    let pointer = { x: 0, y: 0 };
    let t = 0;
    let raf = null;
    let running = false;

    function resize() {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // El hero es a sangre completa (no una tarjeta casi cuadrada). En
      // escritorio, el titular ocupa la columna izquierda, así que el campo
      // de iconos se centra hacia la derecha. En móvil el titular ocupa
      // todo el ancho, así que el campo baja a una franja fina bajo el
      // texto en vez de invadirlo por el lado.
      isNarrow = width < 760;
      cx = isNarrow ? width * 0.5 : width * 0.78;
      cy = isNarrow ? height * 0.88 : height * 0.42;
    }

    function onPointerMove(e) {
      const rect = canvas.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      pointer.y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    }
    function onPointerLeave() {
      pointer.x = 0;
      pointer.y = 0;
    }

    function frame() {
      ctx.clearRect(0, 0, width, height);
      // Radios en función del ancho/alto reales (no de un cuadrado): en un
      // hero panorámico a sangre completa esto evita que los iconos queden
      // apretados en el centro con los lados vacíos.
      const spreadX = isNarrow ? width * 0.34 : width * 0.16;
      const spreadY = isNarrow ? height * 0.06 : height * 0.3;
      const iconScale = isNarrow ? width * 0.16 : Math.min(height, width * 0.4);
      ICONS.forEach((icon) => {
        const ox = Math.cos(t * icon.speedX + icon.phase) * icon.radiusX * (spreadX / 0.34);
        const oy = Math.sin(t * icon.speedY + icon.phase * 1.3) * icon.radiusY * (spreadY / 0.34);
        const leanX = pointer.x * icon.pull * 16;
        const leanY = pointer.y * icon.pull * 16;
        drawGooeyIcon(ctx, icon.type, cx + ox + leanX, cy + oy + leanY, icon.size * iconScale, icon.color, blurSupported);
      });
    }

    function loop() {
      if (!running) return;
      t += 0.008;
      frame();
      raf = requestAnimationFrame(loop);
    }

    function start() {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(loop);
    }
    function stop() {
      running = false;
      if (raf) cancelAnimationFrame(raf);
      raf = null;
    }

    resize();
    frame();

    const onResize = () => {
      resize();
      frame();
    };
    window.addEventListener("resize", onResize);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerleave", onPointerLeave);

    let io = null;
    if ("IntersectionObserver" in window) {
      io = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && !document.hidden) start();
          else stop();
        },
        { threshold: 0.05 }
      );
      io.observe(canvas);
    } else {
      start();
    }

    function onVisibility() {
      if (document.hidden) stop();
      else {
        const rect = canvas.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) start();
      }
    }
    document.addEventListener("visibilitychange", onVisibility);

    return {
      destroy() {
        stop();
        window.removeEventListener("resize", onResize);
        canvas.removeEventListener("pointermove", onPointerMove);
        canvas.removeEventListener("pointerleave", onPointerLeave);
        document.removeEventListener("visibilitychange", onVisibility);
        if (io) io.disconnect();
      },
    };
  };
})();

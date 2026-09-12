# O Logradouro — landing

Sitio estático (HTML/CSS/JS, sin build), mismo *toolkit* técnico que
[melao-carballo-web](https://github.com/alvarotaiagu/melao-carballo-web) y
[taberna-do-rio-carballo-web](https://github.com/alvarotaiagu/taberna-do-rio-carballo-web)
(GSAP + ScrollTrigger, Lenis) pero con su **propia estructura de página y su
propia técnica de hero** — ver "Cuarta familia estructural" más abajo. Abrir
`index.html` con un servidor estático cualquiera (por ejemplo
`python -m http.server`) — no funciona bien con `file://` porque las fuentes
y `js/main.js` necesitan HTTP.

## Corrección de dirección de arte (2026-09-12, tarde)

La primera entrega del hero, aunque usaba la técnica gooey-icon propia,
**heredaba sin cuestionar la composición exacta** de Melao/A Taberna do
Rio: fondo crema, texto a un lado y una tarjeta redondeada con foto al
otro, una insignia circular girando en la esquina superior y un sello de
Google flotando encima del borde inferior de la tarjeta. El cliente lo
señaló directamente ("se parece demasiado a la web de Melao") tras
comparar capturas. Se rehizo el hero:

- **A sangre completa, no en tarjeta**: el degradado vino/tinta y el
  canvas de iconos gelatinosos cubren todo el `.hero`, con el texto
  superpuesto directamente encima (con un scrim para legibilidad) en vez
  de vivir en una columna junto a una imagen enmarcada.
- **Sin insignia circular girando** ni sello de Google flotante — la
  valoración pasa a ser una línea de texto sencilla junto al horario,
  bajo los botones.
- **Único hero oscuro de la página**: es la única sección con fondo vino
  oscuro; el resto de la web sigue en tonos piedra claros. Antes, las tres
  webs hermanas abrían con el mismo tono crema.
- **Paleta base recalibrada**: `--piedra`/`--piedra-2`/`--papel` se
  desaturaron y enfriaron ligeramente (menos "papel/crema" cálido, más
  "piedra/cal" gris) — los tonos anteriores eran, en la práctica, el mismo
  hex que usan Melao y A Taberna do Rio.
- El campo de iconos del canvas ahora tiene una rama responsive: en
  escritorio se agrupa a la derecha (dejando libre la columna de texto a
  la izquierda); en móvil baja a una franja fina bajo el texto, más tenue,
  en vez de invadir el párrafo por el lado.

## Cuarta familia estructural del workspace

Este workspace usa cada web como plantilla reutilizable para vender a
futuros clientes, así que cada sitio debe leerse como una plantilla
distinta, no como un reskin. Antes de escribir una sola línea se revisó la
estructura de las tres webs hermanas (Melao, Marabú, A Taberna do Rio) para
no repetir ni el orden de secciones ni la técnica de hero de ninguna:

- **Hero con iconos "gelatinosos" orbitando** (`js/scene-gooey-icons.js`):
  langostino, pulpo, cuña de tortilla y croqueta — los platos de bandera
  reales del negocio — dibujados dos veces por frame (una silueta grande
  con `ctx.filter = blur(...)` debajo, una copia nítida encima) para que
  lean como "hechos del mismo gel". Es la técnica "gooey icon finish" del
  catálogo de motion del workspace, la favorita del cliente en las pruebas
  de Melao pero sin usar hasta ahora en ningún sitio hermano (Melao usa un
  shader WebGL de blobs abstractos; A Taberna do Rio usa iconos orbitando
  con acabado sólido+sombra, sin blur). Si `ctx.filter` no está soportado,
  se salta el paso del blur y se dibuja solo la copia nítida — sigue siendo
  una escena completa y correcta.
- **"Un solo horario, muchos momentos"** (`#momentos`): línea de tiempo
  horizontal de 4 pasos (desayuno → tapeo → terraza → cena/música) que
  traduce el horario real (10:00–1:00) en cuatro momentos de uso, en vez
  del grid de tarjetas iguales o de la dualidad día/noche de Marabú.
- **"La mesa"** (`#mesa`): un plato destacado a gran formato (numeral,
  nombre, descripción) + un índice del resto de platos al estilo carta de
  vinos, sin precios inventados. Deliberadamente distinto de la hoja con
  precios de A Taberna do Rio y del grid de fotos de Melao — y evita
  fabricar precios que no existen para este negocio.
- **"Tradición y modernidad"** (`#historia`): díptico antes/ahora que
  cuenta la reapertura real de 2025 bajo nueva gestión. Ninguna web
  hermana tiene esta sección de "línea de tiempo de marca".
- **"La Terraza"** (`#terraza`): 4 fichas de rasgos reales (nebulización,
  mascotas, música en directo, grupos) sobre fondo de textura, sin
  ilustraciones de escenas ni fotos — ver "Fotografía" abajo.
- **Reseñas y horario en directo**: mismo patrón visual de anillo de
  valoración + reloj de franjas que A Taberna do Rio (es un componente de
  datos, no de identidad — reutilizarlo no rompe la regla de "no clonar
  estructura"), pero aquí con una sola franja que cruza medianoche
  (10:00–1:00) en vez de las franjas separadas de barra/cocina.
- **Nav lateral de puntos** (`.rail-nav`), reutilizado del mismo patrón que
  A Taberna do Rio — es una pieza de navegación común al *toolkit*, no de
  identidad.

Validado con Playwright (Chromium local) en desktop/mobile, con
`reducedMotion: 'reduce'`, con `javaScriptEnabled: false` y con scroll real
completo (para confirmar que los `ScrollTrigger` de cada sección revelan su
contenido): sin errores de consola ni requests fallidas en ningún caso.

## Dirección de arte

- **Idea visual:** un bar-taberna de casco urbano en Carballo que combina
  la barra de un negocio de toda la vida con una cocina puesta al día tras
  su reapertura en 2025 — de ahí el titular "El bar de siempre, con la
  cocina de ahora."
- **Paleta:** el negocio **no tiene logo ni manual de marca disponible**
  (Facebook e Instagram bloquean el scraping automatizado y las fichas de
  turismo no traen imagen). En vez de inventar un color al azar, la paleta
  se apoya en materiales reales y honestos de una taberna gallega de
  centro urbano: piedra/cal cálida de fachada (`--piedra` `#F3ECE0`), barro
  y terracota de tejas y platos de barro (`--barro` `#C1592E` /
  `--barro-hondo` `#9C4520`), vino tinto tipo Ribeiro/Mencía (`--vino`
  `#7A1F2E` / `--vino-hondo` `#4E1219`) y un verde oliva que apunta a la
  cocina moderna/vegana del local reabierto (`--oliva` `#6B7A45`).
  Deliberadamente distinta de: coral/cielo/lima (Melao) y verde
  río/madera/dorado (A Taberna do Rio). Ver `css/style.css`, bloque
  `:root`.
- **Tipografía:** Fraunces (serif display con itálica expresiva, para el
  tono "carta de restaurante con carácter") + Work Sans (texto e
  interfaz) — pareja propia, distinta de Bitter+Inter usada en las dos
  webs hermanas.
- **Logo:** sin logo real facilitado. Se creó un emblema propio (iniciales
  "OL" sobre un círculo vino, con una onda de barro debajo —
  `scripts/gen_assets.py`) para favicon, iconos de "añadir a inicio" y
  marca del pie de página. **No es un logo real del negocio** — si el
  dueño aporta uno propio, sustituir estos archivos.
- **Fotografía / ilustración — IMPORTANTE:** el negocio no facilitó banco
  de fotos propio, y esta sesión no tuvo forma de obtener fotos reales de
  la fachada, la terraza o los platos (Instagram/Facebook bloquean el
  scraping de imágenes). Para no usar fotos de stock genéricas presentadas
  como si fueran el local real, ni tampoco escenas ilustradas de platos
  concretos, el sitio es **deliberadamente fotográfico-cero e
  ilustración-cero**: toda la identidad visual corre a cargo de la
  tipografía, los iconos de interfaz (Iconify Solar/MDI), los gráficos de
  datos (anillo de reseñas, reloj de horario) y la escena de canvas del
  hero (iconos abstractos con motion, no una fotografía). La sección
  "La Terraza" lleva un aviso visible ("Sin fotos de stock: en cuanto el
  local nos pase fotos reales...") para que quede claro que es una
  decisión de honestidad, no un descuido.
  **Antes de enseñar la web al dueño, lo ideal es conseguir fotos reales**
  de la terraza, el interior y 2–3 platos para añadir una sección de
  imágenes — la estructura del sitio no depende de ellas, así que se
  pueden incorporar sin rehacer nada.
- **Motion:** GSAP + ScrollTrigger para las revelaciones por sección,
  Lenis como motor de scroll suave. El hero usa un canvas 2D propio con
  acabado "gooey" (ver arriba) en vez del shader WebGL de Melao o los
  iconos planos de A Taberna do Rio. Todo el motion es opcional: si el CDN
  de GSAP/Lenis falla, el sitio se degrada con limpieza — nav, horario en
  vivo, mapa y WhatsApp siguen funcionando sin errores de consola (mismo
  guard `gsapReady` ya corregido en A Taberna do Rio).
- **Icons:** Iconify — Solar para símbolos de interfaz, MDI para
  paw/Instagram/Facebook (sin equivalente directo en Solar), `ri` para el
  glifo de WhatsApp y `logos:google-icon` para el sello de Google — mismo
  criterio que las webs hermanas.
- **Skill de diseño usada:** `build-awwwards-quality-sites`, con dirección
  de arte propia (paleta, tipografía, contenido y estructura) para este
  negocio.

## Contenido real vs. pendiente

**Confirmado y usado tal cual** (ficha de Google Maps del negocio,
12-09-2026, más `toppingsandsalads.es/taberna/o-logradouro/`):
- Nombre, dirección (R. Lugo, 2, 15100 Carballo), teléfono
  (637 08 50 37), valoración de Google (**4,6★, 240 reseñas**), horario
  (miércoles a domingo, 10:00–1:00; lunes y martes cerrado), categoría
  (taberna/bar), rango de precio (10–20 €).
- Reapertura en 2025 bajo nueva gestión manteniendo el carácter original —
  descrito en la ficha agregadora consultada.
- Platos y especialidades citados: langostinos y pulpo rebozados
  (destacado como "el plato que más se repite"), tortilla de feira y
  betanceira, croquetas de jamón asado, tabla de embutidos, hamburguesas
  veganas, huevos rotos con langostinos, tarta de Santiago/pistacho/queso
  caseras.
- Rasgos de ambiente citados: terraza cubierta con sistema de
  nebulización, se admiten mascotas, interior cálido para grupos e
  intimidad, música en directo ocasional.
- Redes sociales reales: Instagram `@ologradouro`, Facebook `OLogradouro`
  (URLs facilitadas directamente por el cliente).

**⚠️ Pendiente / decisiones tomadas por mi cuenta — revisar antes de
enseñar la web:**
- **Fotos reales** (ver "Fotografía" arriba) — es el ajuste pendiente más
  importante.
- **Precios**: no hay carta física ni fotografiada disponible, así que
  "La mesa" no muestra precios — solo el aviso "Precios a confirmar". No
  se ha inventado ningún precio.
- **WhatsApp**: se asume que 637 08 50 37 (móvil español) tiene WhatsApp
  activo, igual que se asumió en las webs hermanas — falta confirmarlo
  antes de enseñar la web al dueño.
- **Reseñas textuales**: sin acceso a citas textuales reales de clientes,
  la sección "Reseñas" usa solo la cifra real verificada (4,6★/240,
  enlazada a la ficha de Google) más tres temas recurrentes basados en la
  descripción agregada consultada — sin atribuir frases a personas
  concretas ni inventar testimonios.
- Los metadatos usan `https://alvarotaiagu.github.io/o-logradouro-carballo-web/`
  como dominio de referencia; si el negocio consigue un dominio propio,
  sustituir esa URL en `index.html` (canonical, `og:url`, `og:image`,
  `twitter:image`, JSON-LD) y en `404.html`.

## Validación hecha

- Servido en local (`python -m http.server`) y revisado con Playwright
  (Chromium) en 1440px y 390px, con `reducedMotion: 'reduce'` y con
  `javaScriptEnabled: false`: 0 errores de consola y 0 requests fallidas
  en los cuatro modos.
- Confirmado con un scroll real de principio a fin (rueda del ratón
  simulada, no solo una captura `fullPage`) que cada `data-reveal-group`
  lleva su contenido a `opacity: 1` al pasar por el viewport — una captura
  `fullPage` de Playwright no dispara los `ScrollTrigger` porque no hace
  scroll real, así que no es representativa por sí sola para este patrón
  de motion.
- Menú móvil probado por interacción real (clic): abre y cierra
  correctamente, con el foco devuelto al botón al cerrar con Escape.

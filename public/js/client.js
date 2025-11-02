// Orden correcto de la rueda europea (en sentido horario desde el 0 arriba)
const ORDER = [0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26];
const REDS = new Set([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]);

const COLOR_LABELS = {
  red: 'Rojo',
  black: 'Negro'
}

document.addEventListener("DOMContentLoaded", () => {
  const $ = (selector) => document.querySelector(selector);

  const betType = $('#betType');
  const selWrap = $('#selection-wrap');
  if (betType) {
    betType.addEventListener('change', () => {
      const t = betType.value;
      if (t === 'straight') selWrap.innerHTML = `<label>Número 0-36 <input class="input" name="selection" type="number" min="0" max="36" required /></label>`;
      if (t === 'color') selWrap.innerHTML = `<label>Color <select class="input" name="selection"><option value="red">Rojo</option><option value="black">Negro</option></select></label>`;
      if (t === 'parity') selWrap.innerHTML = `<label>Paridad <select class="input" name="selection"><option value="even">Par</option><option value="odd">Impar</option></select></label>`;
      if (t === 'dozen') selWrap.innerHTML = `<label>Docena <select class="input" name="selection"><option value="1">1-12</option><option value="2">13-24</option><option value="3">25-36</option></select></label>`;
    });
  }

  let isPlaying = false;
  const betForm = $('#bet-form');
  const winnerNumberValue = $('#winnerNumberValue');
  const winnerColorValue = $('#winnerColorValue');
  const balanceValue = $('#balanceValue');
  const resultStatus = $('#result-status');

  if (betForm) {
    betForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (isPlaying) return;
      isPlaying = true;
      const formData = new FormData(betForm);
      const data = Object.fromEntries(formData);

      console.log('Datos de la apuesta:', data);

      winnerNumberValue.textContent = 'N/A';
      winnerColorValue.textContent = 'N/A';
      resultStatus.innerHTML = '';

      const response = await fetch('/games/roulette', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      const result = await response.json();

      if (result.error) {
        alert('Error: ' + result.error);
        return;
      }

      spin(result.number);

      await new Promise(resolve => setTimeout(resolve, 6000));

      winnerNumberValue.textContent = result.number;
      winnerColorValue.textContent = COLOR_LABELS[result.color];
      balanceValue.textContent = '$' + result.balance.toLocaleString();

      if (result.payout > 0) {
        resultStatus.innerHTML = `<p class="won">¡Ganaste ${result.payout}!</p>`;
      } else {
        resultStatus.innerHTML = `<p class="lost">Perdiste.</p>`;
      }
      isPlaying = false;
    });
  }

  const wheel = $('#wheel');
  const labelsBox = $('#wheel-labels');
  // const spinBtn = $('#spinBtn');
  // const resultEl = $('#result');

  const SEG = 360 / ORDER.length; // ángulo por sector
  let rotation = 0;               // rotación acumulada (grados)
  let spinning = false;

  // Colores por número
  function colorOf(n) {
    if (n === 0) return getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
    return REDS.has(n) ? (getComputedStyle(document.documentElement).getPropertyValue('--error').trim())
      : (getComputedStyle(document.documentElement).getPropertyValue('--bg').trim());
  }

  // Construye el fondo con sectores coloreados usando conic-gradient
  function paintWheel() {
    const stops = ORDER.map((num, i) => {
      const start = (i * SEG).toFixed(6);
      const end = ((i + 1) * SEG).toFixed(6);
      return `${colorOf(num)} ${start}deg ${end}deg`;
    }).join(', ');
    wheel.style.background = `conic-gradient(from -90deg, ${stops})`;
  }

  // Crea y posiciona las etiquetas (números)
  function buildLabels() {
    labelsBox.innerHTML = '';
    const radius = wheel.clientWidth / 2 - 36; // distancia desde el centro a la etiqueta
    ORDER.forEach((num, i) => {
      const el = document.createElement('div');
      el.className = 'wheel-label ' + (num === 0 ? 'green' : REDS.has(num) ? 'red' : 'black');
      el.textContent = String(num);

      // Centro de cada sector (desde -90° para que el 0 esté arriba)
      const angle = -90 + (i + 0.5) * SEG;

      // Colocamos la etiqueta en la corona y la "enderezamos"
      el.style.transform =
        `translate(-50%, -50%) rotate(${angle}deg) translate(0, -${radius}px) rotate(${-angle}deg)`;

      el.dataset.index = i;
      labelsBox.appendChild(el);
    });
  }

  function clearActive() {
    labelsBox.querySelectorAll('.wheel-label.active').forEach(n => n.classList.remove('active'));
  }

  function highlightIndex(i) {
    const el = labelsBox.querySelector(`.wheel-label[data-index="${i}"]`);
    if (el) el.classList.add('active');
  }

  // Calcula la rotación final para que el centro del sector "targetIndex"
  // quede justo bajo el puntero superior.
  function rotationForIndex(targetIndex) {
    // Ángulo (mod 360) que al finalizar debe tener la rueda para alinear el centro del sector con el puntero
    // Condición: -rotation ≡ -90 + (i + 0.5)*SEG  (mod 360)
    // => rotation ≡ 90 - (i + 0.5)*SEG (mod 360)
    const aligned = 90 - (targetIndex + 0.5) * SEG;
    const alignedNorm = ((aligned % 360) + 360) % 360;

    const currentMod = ((rotation % 360) + 360) % 360;
    const deltaToAligned = ((alignedNorm - currentMod) + 360) % 360;

    const extraSpins = 4 + Math.floor(Math.random() * 3); // entre 4 y 6 vueltas extra
    return rotation + extraSpins * 360 + deltaToAligned;
  }

  // Lógica del giro
  function spin(number) {
    if (spinning) return;
    spinning = true;
    // spinBtn.disabled = true;
    clearActive();

    const targetIndex = ORDER.indexOf(number);
    // Elegimos un índice ganador al azar y rotamos para caer exactamente en él
    const finalRotation = rotationForIndex(targetIndex);

    // Aplicar rotación
    wheel.style.transform = `rotate(${finalRotation}deg)`;

    // Al terminar la transición, mostramos el resultado
    const onEnd = () => {
      wheel.removeEventListener('transitionend', onEnd, { once: true });
      rotation = finalRotation; // fijamos la rotación alcanzada
      const number = ORDER[targetIndex];
      const color = number === 0 ? 'verde' : (REDS.has(number) ? 'rojo' : 'negro');
      highlightIndex(targetIndex);
      // resultEl.textContent = `Resultado: ${number} (${color})`;
      // pequeña pausa antes de permitir otro giro (mejor UX)
      setTimeout(() => { spinning = false }, 350);
    };
    wheel.addEventListener('transitionend', onEnd, { once: true });
  }

  // Inicializar
  function init() {
    paintWheel();
    buildLabels();
  }

  // Reposicionar etiquetas si cambia el tamaño (por ser responsive)
  window.addEventListener('resize', buildLabels);

  init();
})
(() => {
  'use strict';

  const element = (id) => document.getElementById(id);
  const panel = element('tab-energy-meter');
  const viewer = element('energyViewer');
  const message = element('energyViewerMessage');
  const input = element('energyInput');
  const feedback = element('energyFeedback');
  const detail = element('energyDetail');
  const focusButton = element('energyFocus');
  const resetButton = element('energyReset');
  const typeButtons = panel.querySelectorAll('[data-energy-type]');
  const assetRoot = new URL('.', document.currentScript.src);
  const segments = ['abcdef', 'bc', 'abdeg', 'abcdg', 'bcfg', 'acdfg', 'acdefg', 'abc', 'abcdefg', 'abcdfg'];
  const segmentLines = {
    a: 'M7 0H29', b: 'M34 5V22', c: 'M34 32V49', d: 'M7 54H29',
    e: 'M2 32V49', f: 'M2 5V22', g: 'M7 27H29',
  };
  const types = {
    mechanical: {
      name: 'DD862 机械式',
      decimals: 1,
      explanation: '黑色字轮读整数，最右侧红色字轮读十分位。',
      center: [0, .025, -.015],
      register: [0, .486, .337],
      fullHeight: 2.09,
      detailHeight: .54,
      detailWidth: 1.08,
    },
    electronic: {
      name: 'DDS858 电子式',
      decimals: 2,
      explanation: '按液晶屏上的小数点读数，保留屏幕显示的两位小数。',
      center: [0, .005, .01],
      register: [.018, .339, .297],
      fullHeight: 1.91,
      detailHeight: .46,
      detailWidth: .9,
    },
  };

  let kind = 'mechanical';
  let ticks = null;
  let reading = '';
  let model;
  let loading;

  function setFeedback(text, result = '') {
    feedback.textContent = text;
    feedback.dataset.result = result;
  }

  function drawDetail() {
    if (kind === 'mechanical') {
      const wheels = reading.replace('.', '').split('').map((digit, index) => {
        const x = 16 + index * 52;
        const color = index === 4 ? '#ad322b' : '#202321';
        return `<rect x="${x}" y="13" width="45" height="64" rx="3" fill="${color}"/>
          <text x="${x + 22.5}" y="60" text-anchor="middle" fill="#fff4df" font-size="45">${digit}</text>`;
      });
      detail.innerHTML = `<rect width="340" height="90" rx="8" fill="#dad7be"/>
        <g font-family="monospace" font-weight="700">${wheels.join('')}</g>
        <text x="283" y="62" fill="#262922" font-size="18" font-family="sans-serif">kWh</text>`;
      detail.setAttribute('aria-label', `机械式表窗，黑色字轮 ${reading.slice(0, 4)}，红色字轮 ${reading.at(-1)}，单位千瓦时`);
      return;
    }

    let x = 20;
    const digits = [...reading].map((char) => {
      const left = x;
      if (char === '.') {
        x += 16;
        return `<rect x="${left + 2}" y="65" width="7" height="7" fill="#283d29"/>`;
      }
      x += 42;
      const paths = Object.entries(segmentLines).map(([id, path]) =>
        `<path d="${path}" stroke="${segments[Number(char)].includes(id) ? '#283d29' : '#9dad82'}"/>`);
      return `<g transform="translate(${left}, 17)">${paths.join('')}</g>`;
    });
    detail.innerHTML = `<rect width="340" height="90" rx="8" fill="#566159"/>
      <rect x="4" y="4" width="332" height="82" rx="5" fill="#b8c69a"/>
      <g stroke-width="6" stroke-linecap="round">${digits.join('')}</g>
      <text x="289" y="75" fill="#283d29" font-size="17" font-family="sans-serif">kWh</text>`;
    detail.setAttribute('aria-label', `电子式液晶屏显示 ${reading} 千瓦时`);
  }

  function newQuestion() {
    const decimals = types[kind].decimals;
    const limit = 10 ** (4 + decimals);
    ticks = ticks === null
      ? Math.floor(Math.random() * limit)
      : (ticks + 1 + Math.floor(Math.random() * (limit - 1))) % limit;
    const digits = String(ticks).padStart(4 + decimals, '0');
    reading = `${digits.slice(0, -decimals)}.${digits.slice(-decimals)}`;
    input.value = '';
    setFeedback('请读出电能表的累计用电量。');
    drawDetail();
    model?.setReading(kind, reading);
  }

  function selectType(next) {
    if (kind === next) return;
    kind = next;
    ticks = null;
    element('energyModelName').textContent = types[kind].name;
    typeButtons.forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset.energyType === kind));
    });
    newQuestion();
    model?.reset();
  }

  function answerText() {
    return Number(reading).toFixed(types[kind].decimals) + ' kWh';
  }

  element('energyForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const value = input.value.trim().replace(/．/g, '.');
    if (!/^(?:\d+(?:\.\d*)?|\.\d+)$/.test(value)) {
      setFeedback('请输入数字读数。', 'wrong');
      input.focus();
      return;
    }
    if (Number(value) === Number(reading)) {
      setFeedback('读数正确，累计用电量为 ' + answerText() + '。', 'right');
    } else {
      setFeedback('再看一次读数窗。' + types[kind].explanation, 'wrong');
    }
  });
  element('energyReveal').addEventListener('click', () => {
    setFeedback(answerText() + '。' + types[kind].explanation);
  });
  element('energyNext').addEventListener('click', newQuestion);
  typeButtons.forEach((button) => {
    button.addEventListener('click', () => selectType(button.dataset.energyType));
  });
  focusButton.addEventListener('click', () => model?.focus());
  resetButton.addEventListener('click', () => model?.reset());
  focusButton.disabled = resetButton.disabled = true;

  function loadScript(name) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = new URL(name, assetRoot).href;
      script.onload = resolve;
      script.onerror = reject;
      document.head.append(script);
    });
  }

  function createViewer() {
    const T = window.THREE;
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('webgl2', { antialias: true, alpha: true });
    if (!context) throw new Error('WebGL2 unavailable');
    const renderer = new T.WebGLRenderer({ canvas, context, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = T.SRGBColorSpace;
    renderer.toneMapping = T.ACESFilmicToneMapping;
    const scene = new T.Scene();
    const setModelReading = window.buildEnergyMeterModels(T, scene, segments);
    const camera = new T.OrthographicCamera(-1, 1, 1, -1, .01, 30);
    const target = new T.Vector3();
    const offset = new T.Spherical(5, 1.47, .32);
    let frame = 0;
    let lastWidth = 0;
    let lastHeight = 0;
    let focused = false;
    let zoom = 1;

    canvas.tabIndex = 0;
    canvas.setAttribute('aria-label', '电能表三维模型。方向键旋转，加号减号缩放，Home 复位。');
    viewer.append(canvas);

    function repaint() {
      frame = 0;
      const width = viewer.clientWidth;
      const height = viewer.clientHeight;
      if (!width || !height) return;
      if (width !== lastWidth || height !== lastHeight) {
        renderer.setSize(width, height, false);
        lastWidth = width;
        lastHeight = height;
      }
      const aspect = width / height;
      const config = types[kind];
      const minWidth = focused ? config.detailWidth : 1.62;
      const visibleHeight = Math.max(focused ? config.detailHeight : config.fullHeight, minWidth / aspect) / zoom;
      camera.top = visibleHeight / 2;
      camera.bottom = -camera.top;
      camera.right = camera.top * aspect;
      camera.left = -camera.right;
      camera.updateProjectionMatrix();
      camera.position.setFromSpherical(offset).add(target);
      camera.lookAt(target);
      renderer.render(scene, camera);
    }

    function requestPaint() {
      if (!frame) frame = requestAnimationFrame(repaint);
    }

    function preset(close) {
      focused = close;
      zoom = 1;
      offset.theta = close ? 0 : .32;
      offset.phi = close ? Math.PI / 2 : 1.47;
      target.fromArray(close ? types[kind].register : types[kind].center);
      requestPaint();
    }

    function orbit(dx, dy) {
      offset.theta -= dx * .008;
      offset.phi = T.MathUtils.clamp(offset.phi - dy * .008, .17, Math.PI - .17);
      requestPaint();
    }

    function scale(factor) {
      zoom = T.MathUtils.clamp(zoom * factor, .5, 3.4);
      requestPaint();
    }

    const pointers = new Map();
    const distance = () => {
      const [a, b] = pointers.values();
      return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
    };
    canvas.addEventListener('pointerdown', (event) => {
      if (event.button !== 0 || pointers.size === 2) return;
      canvas.setPointerCapture(event.pointerId);
      pointers.set(event.pointerId, event);
    });
    canvas.addEventListener('pointermove', (event) => {
      const previous = pointers.get(event.pointerId);
      if (!previous) return;
      if (pointers.size === 1) {
        pointers.set(event.pointerId, event);
        orbit(event.clientX - previous.clientX, event.clientY - previous.clientY);
      } else {
        const before = distance();
        pointers.set(event.pointerId, event);
        if (before > 0) scale(distance() / before);
      }
    });
    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach((type) => {
      canvas.addEventListener(type, (event) => pointers.delete(event.pointerId));
    });
    canvas.addEventListener('wheel', (event) => {
      event.preventDefault();
      const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? viewer.clientHeight : 1);
      scale(Math.exp(-delta * .0015));
    }, { passive: false });
    canvas.addEventListener('keydown', (event) => {
      switch (event.key) {
        case 'ArrowLeft': orbit(-18, 0); break;
        case 'ArrowRight': orbit(18, 0); break;
        case 'ArrowUp': orbit(0, -18); break;
        case 'ArrowDown': orbit(0, 18); break;
        case '+': case '=': scale(1.15); break;
        case '-': scale(1 / 1.15); break;
        case 'Home': preset(false); break;
        default: return;
      }
      event.preventDefault();
    });

    new ResizeObserver(requestPaint).observe(viewer);
    canvas.addEventListener('webglcontextrestored', requestPaint);
    return {
      setReading(type, value) {
        setModelReading(type, value);
        requestPaint();
      },
      focus: () => preset(true),
      reset: () => preset(false),
    };
  }

  const tabButton = document.querySelector('[data-tab="energy-meter"]');
  tabButton.addEventListener('click', () => {
    if (loading) return;
    loading = Promise.all([loadScript('three-r160.min.js'), loadScript('models.js')]).then(() => {
      model = createViewer();
      model.setReading(kind, reading);
      model.reset();
      message.hidden = true;
      focusButton.disabled = resetButton.disabled = false;
    }).catch((error) => {
      message.textContent = '三维模型暂不可用，可使用放大的读数窗继续练习。';
      element('energyControls').hidden = true;
      console.error('Energy meter viewer:', error);
    });
  });

  newQuestion();
  if (location.hash === '#energy-meter') tabButton.click();
})();

(() => {
  'use strict';

  const element = (id) => document.getElementById(id);
  const panel = element('tab-energy-meter');
  const face = element('energyMeterFace');
  const input = element('energyInput');
  const feedback = element('energyFeedback');
  const typeButtons = panel.querySelectorAll('[data-energy-type]');
  const segments = ['abcdef', 'bc', 'abdeg', 'abcdg', 'bcfg', 'acdfg', 'acdefg', 'abc', 'abcdefg', 'abcdfg'];
  const segmentLines = {
    a: 'M7 0H29', b: 'M34 5V22', c: 'M34 32V49', d: 'M7 54H29',
    e: 'M2 32V49', f: 'M2 5V22', g: 'M7 27H29',
  };
  const types = {
    mechanical: { decimals: 1, explanation: '黑色字轮读整数，最右侧红色字轮读十分位。' },
    electronic: { decimals: 2, explanation: '按液晶屏上的小数点读数，保留屏幕显示的两位小数。' },
  };

  let kind = 'mechanical';
  let ticks = null;
  let reading = '';

  function screw(x, y) {
    return `<g transform="translate(${x} ${y})">
      <circle r="10" fill="#30383a"/>
      <circle r="7" fill="#b5bfc4"/>
      <path d="M-3.3 -3.3L3.3 3.3M-3.3 3.3L3.3 -3.3" fill="none" stroke="#465156" stroke-width="1.8"/>
    </g>`;
  }

  // Front elevations are based on DD862 and DDS858 from 3Dmodel2/models/energy-meter.html.
  function mechanicalFace() {
    const wheels = [...reading.replace('.', '')].map((digit, index) => {
      const x = 102 + index * 65;
      const color = index === 4 ? 'url(#energyRedWheel)' : 'url(#energyBlackWheel)';
      return `<rect x="${x}" y="147" width="56" height="78" rx="4" fill="${color}"/>
        <text x="${x + 28}" y="206" text-anchor="middle" fill="#fffae9" font-size="57">${digit}</text>`;
    }).join('');
    return `<defs>
      <linearGradient id="energyDarkCase" x2="0" y2="1">
        <stop stop-color="#4a5050"/><stop offset="1" stop-color="#202729"/>
      </linearGradient>
      <linearGradient id="energyBlackWheel" x2="0" y2="1">
        <stop stop-color="#111615"/><stop offset=".50" stop-color="#292e2b"/><stop offset="1" stop-color="#121715"/>
      </linearGradient>
      <linearGradient id="energyRedWheel" x2="0" y2="1">
        <stop stop-color="#76221d"/><stop offset=".50" stop-color="#b8322b"/><stop offset="1" stop-color="#77231f"/>
      </linearGradient>
    </defs>
    <rect x="51" y="47" width="418" height="543" rx="31" fill="#273032" opacity=".10" transform="translate(5 8)"/>
    <rect x="51" y="47" width="418" height="543" rx="31" fill="url(#energyDarkCase)" stroke="#171f21" stroke-width="3"/>
    <rect x="73" y="76" width="374" height="397" rx="20" fill="#333b3b" stroke="#596263" stroke-width="2"/>
    <rect x="86" y="104" width="348" height="254" rx="11" fill="#e1dec4" stroke="#1d2524" stroke-width="5"/>
    <rect x="96" y="140" width="328" height="92" rx="7" fill="#262a26"/>
    <g font-family="monospace" font-weight="700">${wheels}</g>
    <g fill="#26312e" font-family="sans-serif">
      <text x="416" y="252" text-anchor="end" font-size="19" font-weight="700">kWh</text>
      <path d="M105 263H414" stroke="#636b58" stroke-width="1.5"/>
      <text x="106" y="291" font-size="26" font-weight="700">DD862</text>
      <text x="413" y="290" text-anchor="end" font-size="18">单相感应式电能表</text>
      <text x="106" y="332" font-size="17">220 V　50 Hz　5(20) A</text>
      <text x="413" y="332" text-anchor="end" font-size="17">720 r/kWh</text>
    </g>
    <rect x="95" y="376" width="330" height="41" rx="8" fill="#181e20" stroke="#667172" stroke-width="2"/>
    <ellipse cx="260" cy="394" rx="91" ry="8" fill="#778489"/>
    <path d="M169 394H351V400Q260 409 169 400Z" fill="#b4bdbe"/>
    <path d="M270 397H283" stroke="#b62f24" stroke-width="3"/>
    <rect x="63" y="483" width="394" height="96" rx="15" fill="#363e40" stroke="#1b2224" stroke-width="3"/>
    ${screw(106, 531)}${screw(414, 531)}`;
  }

  function electronicFace() {
    let x = 126;
    const digits = [...reading].map((char) => {
      const left = x;
      if (char === '.') {
        x += 16;
        return `<rect x="${left + 2}" y="210" width="8" height="8" fill="#283d29"/>`;
      }
      x += 43;
      const paths = Object.entries(segmentLines).map(([id, path]) =>
        `<path d="${path}" stroke="${segments[Number(char)].includes(id) ? '#283d29' : '#a3b087'}"/>`);
      return `<g transform="translate(${left} 161)">${paths.join('')}</g>`;
    }).join('');
    return `<defs>
      <linearGradient id="energyIvoryCase" x2="0" y2="1">
        <stop stop-color="#faf8f0"/><stop offset="1" stop-color="#d9d9cf"/>
      </linearGradient>
    </defs>
    <rect x="56" y="54" width="408" height="537" rx="24" fill="#273032" opacity=".10" transform="translate(5 8)"/>
    <rect x="56" y="54" width="408" height="537" rx="24" fill="#4d5759"/>
    <rect x="63" y="60" width="394" height="514" rx="18" fill="url(#energyIvoryCase)" stroke="#b1b5aa" stroke-width="2"/>
    <rect x="82" y="77" width="356" height="412" rx="15" fill="#efeee5" stroke="#c7c8bd" stroke-width="2"/>
    <g fill="#24464b" font-family="sans-serif">
      <text x="111" y="111" font-size="28" font-weight="700">DDS858</text>
      <text x="111" y="134" font-size="16">单相电子式电能表</text>
    </g>
    <rect x="106" y="144" width="310" height="117" rx="10" fill="#48564e"/>
    <rect x="112" y="150" width="298" height="105" rx="5" fill="#bdca9c" stroke="#899675" stroke-width="2"/>
    <g stroke-width="6" stroke-linecap="round">${digits}</g>
    <text x="400" y="243" text-anchor="end" fill="#263a29" font-family="sans-serif" font-size="19" font-weight="700">kWh</text>
    <circle cx="129" cy="292" r="9" fill="#596058"/>
    <circle cx="129" cy="292" r="5" fill="#872d23"/>
    <circle cx="398" cy="292" r="9" fill="#727c72"/>
    <g fill="#334844" font-family="sans-serif">
      <text x="144" y="297" font-size="16">脉冲</text>
      <path d="M111 324H409" stroke="#859287" stroke-width="1.5"/>
      <text x="113" y="358" font-size="21">220 V　50 Hz　0.25–0.5(60) A</text>
      <text x="113" y="394" font-size="23" font-weight="700">1600 imp/kWh</text>
      <text x="113" y="436" font-size="16">单相有功计量</text>
    </g>
    <rect x="65" y="492" width="390" height="77" rx="12" fill="#e5e3d9" stroke="#b1b5aa" stroke-width="2"/>
    ${screw(111, 531)}${screw(409, 531)}`;
  }

  function setFeedback(text, result = '') {
    feedback.textContent = text;
    feedback.dataset.result = result;
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

    if (kind === 'mechanical') {
      face.innerHTML = mechanicalFace();
      face.setAttribute('aria-label', `DD862 机械式电能表，黑色字轮 ${reading.slice(0, 4)}，红色字轮 ${reading.at(-1)}，单位千瓦时`);
    } else {
      face.innerHTML = electronicFace();
      face.setAttribute('aria-label', `DDS858 电子式电能表，液晶屏显示 ${reading} 千瓦时`);
    }
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
    button.addEventListener('click', () => {
      const next = button.dataset.energyType;
      if (kind === next) return;
      kind = next;
      ticks = null;
      typeButtons.forEach((option) => {
        option.setAttribute('aria-pressed', String(option === button));
      });
      newQuestion();
    });
  });

  newQuestion();
  if (location.hash === '#energy-meter') {
    document.querySelector('[data-tab="energy-meter"]').click();
  }
})();

(() => {
  'use strict';

  const element = (id) => document.getElementById(id);
  const panel = element('tab-energy-meter');
  const face = element('energyMeterFace');
  const input = element('energyInput');
  const feedback = element('energyFeedback');
  const typeButtons = panel.querySelectorAll('[data-energy-type]');
  const segments = ['abcdef', 'bc', 'abdeg', 'abcdg', 'bcfg', 'acdfg', 'acdefg', 'abc', 'abcdefg', 'abcdfg'];
  const segmentPaths = {
    a: 'M5.5 0h21l2.7 2.7-2.7 2.7h-21L2.8 2.7Z',
    b: 'M29.3 6.4 32 9.1v13.7l-2.7 2.7-2.7-2.7V9.1Z',
    c: 'M29.3 31.7 32 34.4v13.7l-2.7 2.7-2.7-2.7V34.4Z',
    d: 'M5.5 51.8h21l2.7 2.7-2.7 2.7h-21l-2.7-2.7Z',
    e: 'M2.7 31.7 5.4 34.4v13.7l-2.7 2.7L0 48.1V34.4Z',
    f: 'M2.7 6.4 5.4 9.1v13.7l-2.7 2.7L0 22.8V9.1Z',
    g: 'M5.5 25.9h21l2.7 2.7-2.7 2.7h-21l-2.7-2.7Z',
  };
  const types = {
    mechanical: { decimals: 1, explanation: '黑色字轮读整数，最右侧红色字轮读十分位。' },
    electronic: { decimals: 2, explanation: '按液晶屏上的小数点读数，保留屏幕显示的两位小数。' },
  };

  let kind = 'mechanical';
  let ticks = null;
  let reading = '';

  function screw(x, y, angle) {
    return `<g transform="translate(${x} ${y}) rotate(${angle})">
      <circle cy="1" r="9" fill="#151819" opacity=".52"/>
      <circle r="7.2" fill="url(#energyScrew)" stroke="#434745" stroke-width=".7"/>
      <path d="M-4.6 0H4.6M0-4.6V4.6" stroke="#222a2c" stroke-width="1.65"/>
      <path d="M-4.4 1.3H4.2M1.3-4.2V4.4" stroke="#fff" stroke-opacity=".35" stroke-width=".55"/>
    </g>`;
  }

  // Front elevations based on the 3Dmodel2 meters and manufacturer references.
  function mechanicalFace() {
    const places = ['1000', '100', '10', '1', '0.1'];
    const wheels = [...reading.replace('.', '')].map((digit, index) => {
      const x = 111 + index * 51;
      const red = index === 4;
      return `<g transform="translate(${x} 0)">
        <rect y="174" width="49" height="69" rx="1.8" fill="url(#${red ? 'energyRedWheel' : 'energyBlackWheel'})"/>
        <path d="M.7 175V242M48 175V242" stroke="#d9dde0" stroke-opacity=".17" stroke-width="1"/>
        <text x="24.5" y="223" text-anchor="middle" fill="#f1f2ed" font-size="48" font-weight="400">${digit}</text>
        <text x="24.5" y="238" text-anchor="middle" fill="#e7e9e6" font-size="10" font-weight="600">${places[index]}</text>
      </g>`;
    }).join('');
    return `<defs>
      <linearGradient id="energyBakelite" x2=".37" y2="1">
        <stop stop-color="#686c6d"/><stop offset=".22" stop-color="#494d4e"/>
        <stop offset=".68" stop-color="#3b3f40"/><stop offset="1" stop-color="#2b2e30"/>
      </linearGradient>
      <linearGradient id="energyBevel" x2="0" y2="1">
        <stop stop-color="#292c2d"/><stop offset=".19" stop-color="#393c3d"/><stop offset=".82" stop-color="#515556"/><stop offset="1" stop-color="#717677"/>
      </linearGradient>
      <linearGradient id="energyNameplate" x2=".36" y2="1">
        <stop stop-color="#e5e4db"/><stop offset=".33" stop-color="#f4f3eb"/><stop offset="1" stop-color="#c7c9c2"/>
      </linearGradient>
      <linearGradient id="energyBlackWheel" x2="0" y2="1">
        <stop stop-color="#101113"/><stop offset=".39" stop-color="#303236"/><stop offset=".62" stop-color="#1f2225"/><stop offset="1" stop-color="#101214"/>
      </linearGradient>
      <linearGradient id="energyRedWheel" x2="0" y2="1">
        <stop stop-color="#5b1619"/><stop offset=".40" stop-color="#b9242a"/><stop offset=".65" stop-color="#982029"/><stop offset="1" stop-color="#611719"/>
      </linearGradient>
      <linearGradient id="energyDiskEdge" x2="0" y2="1">
        <stop stop-color="#eef0ed"/><stop offset=".4" stop-color="#a3a8aa"/><stop offset="1" stop-color="#65696c"/>
      </linearGradient>
      <linearGradient id="energyScrew" x2=".55" y2="1">
        <stop stop-color="#f6f0db"/><stop offset=".45" stop-color="#acaba1"/><stop offset="1" stop-color="#6d706e"/>
      </linearGradient>
      <filter id="energyGrain"><feTurbulence type="fractalNoise" baseFrequency=".61" numOctaves="3" seed="14" stitchTiles="stitch"/></filter>
      <filter id="energyShadow" x="-15%" y="-12%" width="130%" height="130%"><feDropShadow dx="3" dy="7" stdDeviation="5" flood-color="#131b20" flood-opacity=".25"/></filter>
      <clipPath id="energyCaseClip"><rect x="62" y="81" width="396" height="442" rx="12"/></clipPath>
    </defs>
    <g filter="url(#energyShadow)">
      <path d="M224 76V55L247 33H272L296 56V76H278V61L266 51H253L242 61V76Z" fill="#3f4344" stroke="#252829" stroke-width="1.4"/>
      <path d="M45 526H113V566H56Q45 566 45 555ZM407 526H475V555Q475 566 464 566H407Z" fill="#44494a" stroke="#2c3031" stroke-width="1.4"/>
      <circle cx="64" cy="549" r="7" fill="#d9dfe2"/><circle cx="456" cy="549" r="7" fill="#d9dfe2"/>
      <rect x="49" y="68" width="422" height="471" rx="22" fill="#525758" stroke="#303436" stroke-width="1.5"/>
      <rect x="92" y="483" width="336" height="119" rx="9" fill="url(#energyBakelite)" stroke="#262b2c" stroke-width="1.5"/>
      <path d="M101 588H419" stroke="#909596" stroke-opacity=".22"/>
      <rect x="62" y="81" width="396" height="442" rx="12" fill="url(#energyBakelite)" stroke="#292d2e" stroke-width="1.6"/>
      <g clip-path="url(#energyCaseClip)"><rect x="62" y="81" width="396" height="442" opacity=".12" filter="url(#energyGrain)"/></g>
      <path d="M73 513V98Q73 91 82 91H446" fill="none" stroke="#b3b8b9" stroke-opacity=".26" stroke-width="1.6"/>
      <rect x="90" y="110" width="340" height="340" rx="3" fill="url(#energyBevel)" stroke="#292c2d" stroke-width="1.1"/>
      <rect x="104" y="124" width="312" height="312" rx="1.5" fill="url(#energyNameplate)" stroke="#7b807d" stroke-width="1"/>
      <path d="M107 132H413M109 134V431" fill="none" stroke="#fff" stroke-opacity=".49" stroke-width="1.2"/>
      <path d="M411 129V432H108" fill="none" stroke="#282b2c" stroke-opacity=".24" stroke-width="1.2"/>
    </g>
    <g font-family="Arial, 'Microsoft YaHei', sans-serif" fill="#252a29">
      <text x="260" y="155" text-anchor="middle" font-size="21" font-weight="600">DD862 型单相电能表</text>
      <rect x="109" y="172" width="255" height="73" rx="2" fill="#16191b"/>
      ${wheels}
      <text x="373" y="210" font-size="12" font-weight="600">kW · h</text>
      <path d="M258 285h8l-4 6Z" fill="#9f2e2b"/>
      <rect x="148" y="296" width="223" height="17" rx="5" fill="#1a1d1f" stroke="#686d6e" stroke-width="1.25"/>
      <rect x="165" y="301" width="188" height="7" rx="1.5" fill="url(#energyDiskEdge)"/>
      <path d="M251 304.5h18" stroke="#a83530" stroke-width="3"/>
      <path d="M377 304h19m-6-3 6 3-6 3" stroke="#292c2c" stroke-width="1.2" fill="none"/>
      <text x="260" y="352" text-anchor="middle" font-size="17" font-weight="600">220 V　5(20) A　50 Hz</text>
      <text x="120" y="381" font-size="15">720 r/(kW · h)</text>
      <text x="405" y="381" text-anchor="end" font-size="13">GB/T 17215.311-2008</text>
      <path d="M120 392H404" stroke="#565957" stroke-width=".8"/>
      <text x="122" y="416" font-size="13" fill="#555953">No. DD862-01</text>
    </g>
    ${screw(260, 560, -18)}`;
  }

  function electronicFace() {
    let x = 134;
    const digits = [...reading].map((char) => {
      const left = x;
      if (char === '.') {
        x += 13;
        return `<circle class="energy-decimal" cx="${left + 1}" cy="252.5" r="2.9"/>`;
      }
      x += 42;
      const paths = [...segments[Number(char)]].map((id) =>
        `<path data-segment="${id}" d="${segmentPaths[id]}"/>`);
      return `<g class="energy-lcd-digit" transform="translate(${left} 198) skewX(-3)">${paths.join('')}</g>`;
    }).join('');
    let barcodeX = 118;
    const bars = Array.from({ length: 45 }, (_, index) => {
      const width = [1.1, 2.5, 1.5, 3.1, 1.8][(index * 3 + Math.floor(index / 3)) % 5];
      const bar = `<rect x="${barcodeX}" y="411" width="${width}" height="26"/>`;
      barcodeX += width + (index % 3 === 0 ? 2.3 : 1.65);
      return bar;
    }).join('');
    return `<defs>
      <linearGradient id="energyPolymer" x2=".26" y2="1">
        <stop stop-color="#fbfaf4"/><stop offset=".4" stop-color="#eae9e1"/><stop offset="1" stop-color="#c7c8bc"/>
      </linearGradient>
      <linearGradient id="energyLabel" x2=".3" y2="1">
        <stop stop-color="#f9f8f2"/><stop offset=".72" stop-color="#ecece3"/><stop offset="1" stop-color="#dedfd6"/>
      </linearGradient>
      <linearGradient id="energyTerminal" x2=".34" y2="1">
        <stop stop-color="#e9e9e1"/><stop offset="1" stop-color="#bfc1b7"/>
      </linearGradient>
      <linearGradient id="energyLCD" x2=".25" y2="1">
        <stop stop-color="#aeb5a3"/><stop offset=".18" stop-color="#c9cfbb"/><stop offset=".65" stop-color="#c4cbb5"/><stop offset="1" stop-color="#b7bea9"/>
      </linearGradient>
      <linearGradient id="energyScrew" x2=".54" y2="1">
        <stop stop-color="#fff"/><stop offset=".49" stop-color="#b8bfbe"/><stop offset="1" stop-color="#737c7d"/>
      </linearGradient>
      <filter id="energyShadow" x="-15%" y="-12%" width="130%" height="130%"><feDropShadow dx="3" dy="7" stdDeviation="5" flood-color="#131b20" flood-opacity=".22"/></filter>
    </defs>
    <g filter="url(#energyShadow)">
      <path fill-rule="evenodd" d="M223 72V47Q223 36 234 36H286Q297 36 297 47V72ZM260 44a9 9 0 1 0 .01 18A9 9 0 0 0 260 44Z" fill="#a6a79d" stroke="#888b83" stroke-width="1"/>
      <rect x="64" y="63" width="392" height="530" rx="13" fill="#666d69" stroke="#4b514f" stroke-width="1.1"/>
      <rect x="70" y="66" width="380" height="519" rx="11" fill="url(#energyPolymer)" stroke="#9b9e93" stroke-width="1"/>
      <path d="M80 570V80Q80 75 86 75H438" fill="none" stroke="#fff" stroke-opacity=".72" stroke-width="1.5"/>
      <rect x="87" y="90" width="346" height="388" rx="5" fill="url(#energyLabel)" stroke="#babdb1" stroke-width="1.1"/>
      <path d="M91 471H428V97" fill="none" stroke="#969e92" opacity=".38"/>
      <path d="M70 483H450V572Q450 585 437 585H84Q70 585 70 572Z" fill="url(#energyTerminal)" stroke="#969a90" stroke-width="1"/>
      <path d="M75 485H445" stroke="#6f746d" stroke-width="1.5"/>
      <path d="M76 488H444" stroke="#fff" stroke-opacity=".57"/>
      <rect x="171" y="520" width="178" height="30" rx="3" fill="#d0d3ca" stroke="#a7ada0" stroke-width=".7"/>
      <path d="M174 547H346" stroke="#fff" stroke-opacity=".58"/>
    </g>
    <g font-family="Arial, 'Microsoft YaHei', sans-serif" fill="#28302e">
      <text x="110" y="123" font-size="22" font-weight="700">DDS858</text>
      <text x="407" y="122" text-anchor="end" font-size="15" font-weight="600">单相电子式电能表</text>
      <text x="111" y="144" font-size="12" fill="#59635c">单相有功 · LCD</text>
      <rect x="96" y="170" width="328" height="120" rx="4.5" fill="#535d56" stroke="#354139" stroke-width="1.2"/>
      <rect x="100" y="175" width="320" height="110" rx="3" fill="url(#energyLCD)" stroke="#707b69" stroke-width="1.2"/>
      <path d="M104 180H416M104 182V280" stroke="#edf2e7" stroke-opacity=".58" stroke-width="1.2" fill="none"/>
      <path d="M104 281H416V181" stroke="#555e50" stroke-opacity=".35" fill="none"/>
      <g fill="#222b23">${digits}</g>
      <text x="408" y="279" text-anchor="end" fill="#2e3b32" font-size="14" font-weight="700">kW · h</text>
      <circle cx="114" cy="317" r="7.6" fill="#78817a" stroke="#565e57" stroke-width="1"/>
      <circle cx="114" cy="317" r="4.1" fill="#7b2224"/>
      <circle cx="112.5" cy="315.5" r="1.25" fill="#e39a90" opacity=".75"/>
      <text x="128" y="321" font-size="13">脉冲</text>
      <circle cx="403" cy="317" r="8" fill="#6c786f" stroke="#566058" stroke-width="1"/>
      <path d="M398 314q4-4 8-1" stroke="#d1d8cf" stroke-opacity=".6" fill="none"/>
      <path d="M109 338H411" stroke="#9ca396" stroke-width=".85"/>
      <text x="111" y="362" font-size="17" font-weight="600">220 V　50 Hz　0.25–0.5(60) A</text>
      <text x="111" y="386" font-size="16" font-weight="600">1600 imp/(kW · h)</text>
      <text x="411" y="386" text-anchor="end" font-size="12">GB/T 17215.321-2021</text>
      <rect x="110" y="405" width="300" height="52" rx="1.5" fill="#f6f5ee" stroke="#c6c8bc" stroke-width=".6"/>
      <g fill="#373a37">${bars}</g>
      <text x="406" y="428" text-anchor="end" font-size="12">No. DDS858-01</text>
    </g>
    ${screw(108, 541, 24)}${screw(412, 541, -11)}`;
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
    return Number(reading).toFixed(types[kind].decimals) + ' kW · h';
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
    element('modalContent').innerHTML = `<div class="big" style="white-space:normal">标准读数：${answerText()}</div>
      <div class="detail">${types[kind].explanation}</div>`;
    element('answerOverlay').classList.add('show');
  });
  element('energyNext').addEventListener('click', newQuestion);
  const readingMode = element('energyReadingMode');
  const senseMode = element('energySenseMode');
  function showEnergySense(show) {
    element('energyReading').hidden = show;
    element('energySense').hidden = !show;
    readingMode.setAttribute('aria-pressed', String(!show));
    senseMode.setAttribute('aria-pressed', String(show));
  }

  readingMode.addEventListener('click', () => showEnergySense(false));
  const appliances = [
    { name: '台灯', model: '米家台灯 1S · MJTD01SYL', image: 'desk-lamp', watts: 9,
      rating: '额定功率', source: 'https://www.mi.com/mjsmartlamp-1s/specs' },
    { name: '电风扇', model: '米家落地扇 1X · BPL DS01DM', image: 'standing-fan', watts: 15,
      rating: '额定功率', source: 'https://www.mi.com/airfan1x/specs' },
    { name: '电视', model: 'Xiaomi TV A 55 · 55 英寸', image: 'television', watts: 120,
      rating: '整机功率', source: 'https://www.mi.com/global/support/faq/details/KA-79013/' },
    { name: '挂式空调', model: '美的 KFR-35GW/YC1', image: 'wall-air-conditioner', watts: 845,
      rating: '额定制冷耗电功率', source: 'https://dsdcp.smartmidea.net/mcsp/prod/20250120/a7f650d84b864f54b8996203b37186fd.pdf',
      note: '变频空调的实际功率会随运行状态变化。' },
    { name: '电热水壶', model: '米家电水壶 1.5 L · MJDSH01YM', image: 'electric-kettle', watts: 1800,
      rating: '额定功率', source: 'https://www.mi.com/electric-kettle/specs',
      note: '这里按持续加热 1 小时换算。日常烧水通常只加热几分钟。' },
  ];
  const senseGuess = element('energySenseGuess');
  const senseFeedback = element('energySenseFeedback');
  const seenReferences = new Set();
  const estimateFormatter = new Intl.NumberFormat('zh-CN', { maximumSignificantDigits: 5 });
  let senseQuestion;
  let remainingAppliances = [];

  function nextSenseQuestion() {
    if (remainingAppliances.length === 0) remainingAppliances = [...appliances];
    const choices = remainingAppliances.filter((appliance) => appliance !== senseQuestion);
    senseQuestion = choices[Math.floor(Math.random() * choices.length)];
    remainingAppliances = remainingAppliances.filter((appliance) => appliance !== senseQuestion);

    element('energySenseName').textContent = senseQuestion.name;
    const picture = element('energySenseImage');
    picture.alt = senseQuestion.name + '外观';
    picture.dataset.appliance = senseQuestion.image;
    picture.src = 'assets/energy-meter/' + senseQuestion.image + '.webp';
    element('energySenseValue').textContent = '先估计，再看参考值';
    element('energySenseDetails').hidden = true;
    senseFeedback.hidden = true;
    senseGuess.value = '';
  }

  function revealSenseReference() {
    const { watts, rating, model, source, note, image } = senseQuestion;
    const reference = (watts / 1000).toFixed(3);
    const power = String(watts).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    element('energySenseValue').textContent = '参考用电量：' + reference + ' kW · h';

    const sourceLink = element('energySenseSource');
    sourceLink.href = source;
    sourceLink.textContent = model + '（厂家参数）';
    element('energySenseCalculation').textContent =
      rating + ' ' + power + ' W，按此功率工作 1 小时，用电 ' + reference + ' kW · h。';
    const noteLine = element('energySenseNote');
    noteLine.textContent = note || '';
    noteLine.hidden = !note;
    seenReferences.add(image);
    element('energySenseComparison').hidden =
      !(['television', 'electric-kettle'].includes(image) &&
        seenReferences.has('television') && seenReferences.has('electric-kettle'));
    element('energySenseDetails').hidden = false;
  }

  element('energySenseNext').addEventListener('click', nextSenseQuestion);
  element('energySenseReveal').addEventListener('click', revealSenseReference);
  element('energySenseForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const value = senseGuess.value.trim().replace(/．/g, '.');
    if (!/^(?:\d+(?:\.\d*)?|\.\d+)$/.test(value)) {
      senseFeedback.textContent = '请先输入一个大于或等于 0 的估计值。';
      senseFeedback.hidden = false;
      senseGuess.focus();
      return;
    }
    revealSenseReference();
    const guess = Number(value);
    const reference = senseQuestion.watts / 1000;
    const guessText = estimateFormatter.format(guess);
    senseFeedback.textContent = guess === reference
      ? '你估计了 ' + guessText + ' kW · h，与参考值一致。'
      : '你估计了 ' + guessText + ' kW · h，比参考值' + (guess > reference ? '高 ' : '低 ') +
        estimateFormatter.format(Math.abs(guess - reference)) + ' kW · h。';
    senseFeedback.hidden = false;
  });

  senseMode.addEventListener('click', () => {
    if (!senseQuestion) nextSenseQuestion();
    showEnergySense(true);
  });

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

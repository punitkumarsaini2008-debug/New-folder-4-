// ==============================================================================
// Multi-OS Cybersecurity Platform - Calculator (Standard & Programmer/Scientific)
// ==============================================================================

class CalculatorApp {
  constructor() {
    this.displayVal = '0';
    this.operator = null;
    this.firstOperand = null;
    this.waitingForSecond = false;
  }

  open() {
    const iconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="2" width="16" height="20" rx="2"></rect><line x1="8" y1="6" x2="16" y2="6"></line><line x1="16" y1="14" x2="16" y2="18"></line><path d="M16 10h.01"></path><path d="M12 10h.01"></path><path d="M8 10h.01"></path><path d="M12 14h.01"></path><path d="M8 14h.01"></path><path d="M12 18h.01"></path><path d="M8 18h.01"></path></svg>`;

    const container = document.createElement('div');
    container.className = 'tool-container';
    container.style.cssText = 'width:100%; height:100%; background:#10151f; padding:12px; display:flex; flex-direction:column;';

    container.innerHTML = `
      <div style="background:#090d14; border:1px solid #30363d; border-radius:6px; padding:12px; text-align:right; margin-bottom:12px;">
        <div id="calc-expr" style="font-size:11px; color:#8b949e; min-height:16px;"></div>
        <div id="calc-display" style="font-size:26px; font-weight:700; color:#ffffff; font-family:var(--font-mono);">0</div>
        <!-- Hex/Bin Binary Programmer Info -->
        <div style="display:flex; justify-content:space-between; font-size:10px; color:#56e6ff; margin-top:4px; font-family:var(--font-mono); border-top:1px solid #1f2736; padding-top:4px;">
          <span>HEX: <span id="calc-hex">0x0</span></span>
          <span>BIN: <span id="calc-bin">0b0</span></span>
        </div>
      </div>

      <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:8px; flex:1;">
        <button class="tool-btn" data-action="clear" style="color:#ff7b72;">C</button>
        <button class="tool-btn" data-action="negate">±</button>
        <button class="tool-btn" data-action="percent">%</button>
        <button class="tool-btn primary" data-op="/">÷</button>

        <button class="tool-btn" data-num="7">7</button>
        <button class="tool-btn" data-num="8">8</button>
        <button class="tool-btn" data-num="9">9</button>
        <button class="tool-btn primary" data-op="*">×</button>

        <button class="tool-btn" data-num="4">4</button>
        <button class="tool-btn" data-num="5">5</button>
        <button class="tool-btn" data-num="6">6</button>
        <button class="tool-btn primary" data-op="-">-</button>

        <button class="tool-btn" data-num="1">1</button>
        <button class="tool-btn" data-num="2">2</button>
        <button class="tool-btn" data-num="3">3</button>
        <button class="tool-btn primary" data-op="+">+</button>

        <button class="tool-btn" data-num="0" style="grid-column: span 2;">0</button>
        <button class="tool-btn" data-num=".">.</button>
        <button class="tool-btn primary" data-action="calculate" style="background:#05d550; color:#000; font-weight:700;">=</button>
      </div>
    `;

    window.windowManager.createWindow({
      id: 'calculator',
      title: 'Calculator (Programmer / Standard)',
      icon: iconSvg,
      width: 320,
      height: 420,
      content: container
    });

    this.bindEvents(container);
  }

  bindEvents(container) {
    const display = container.querySelector('#calc-display');
    const expr = container.querySelector('#calc-expr');
    const hexEl = container.querySelector('#calc-hex');
    const binEl = container.querySelector('#calc-bin');

    const updateDisplay = () => {
      display.textContent = this.displayVal;
      const num = parseInt(this.displayVal, 10);
      if (!isNaN(num)) {
        hexEl.textContent = '0x' + num.toString(16).toUpperCase();
        binEl.textContent = '0b' + num.toString(2);
      } else {
        hexEl.textContent = '0x0';
        binEl.textContent = '0b0';
      }
    };

    container.querySelectorAll('[data-num]').forEach(btn => {
      btn.onclick = () => {
        const num = btn.dataset.num;
        if (this.waitingForSecond) {
          this.displayVal = num;
          this.waitingForSecond = false;
        } else {
          this.displayVal = this.displayVal === '0' ? num : this.displayVal + num;
        }
        updateDisplay();
      };
    });

    container.querySelectorAll('[data-op]').forEach(btn => {
      btn.onclick = () => {
        const op = btn.dataset.op;
        this.firstOperand = parseFloat(this.displayVal);
        this.operator = op;
        this.waitingForSecond = true;
        expr.textContent = `${this.firstOperand} ${op}`;
      };
    });

    container.querySelector('[data-action="clear"]').onclick = () => {
      this.displayVal = '0';
      this.firstOperand = null;
      this.operator = null;
      this.waitingForSecond = false;
      expr.textContent = '';
      updateDisplay();
    };

    container.querySelector('[data-action="negate"]').onclick = () => {
      this.displayVal = String(parseFloat(this.displayVal) * -1);
      updateDisplay();
    };

    container.querySelector('[data-action="percent"]').onclick = () => {
      this.displayVal = String(parseFloat(this.displayVal) / 100);
      updateDisplay();
    };

    container.querySelector('[data-action="calculate"]').onclick = () => {
      if (this.operator && this.firstOperand !== null) {
        const second = parseFloat(this.displayVal);
        let result = 0;
        if (this.operator === '+') result = this.firstOperand + second;
        if (this.operator === '-') result = this.firstOperand - second;
        if (this.operator === '*') result = this.firstOperand * second;
        if (this.operator === '/') result = second !== 0 ? this.firstOperand / second : 'Error';
        expr.textContent = `${this.firstOperand} ${this.operator} ${second} =`;
        this.displayVal = String(result);
        this.firstOperand = null;
        this.operator = null;
        this.waitingForSecond = false;
        updateDisplay();
      }
    };
  }
}

window.calculatorApp = new CalculatorApp();
window.openCalculatorApp = () => window.calculatorApp.open();

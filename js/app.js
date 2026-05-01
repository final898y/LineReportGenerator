import { Utils } from './utils.js';
import { ReportModes } from './report-modes.js';

/**
 * App 主程式 - 負責協調 UI 與各個模式
 */
const App = {
  activeTab: 'tab-general',

  init() {
    this.cacheDOM();
    this.bindEvents();
    this.initModes();
    this.updateMethodRequirementVisibility();
  },

  cacheDOM() {
    this.elements = {
      tabBtns: document.querySelectorAll(".tab-btn"),
      tabContents: document.querySelectorAll(".tab-content"),
      generateBtn: document.getElementById("generate-btn"),
      result: document.getElementById("result"),
      resultContainer: document.getElementById("result-container"),
      customNotesContainer: document.getElementById("custom-notes-container"),
      addNoteBtn: document.getElementById("add-note-btn"),
      methodRequirement: document.getElementById("method_requirement")
    };
  },

  bindEvents() {
    // 分頁切換
    this.elements.tabBtns.forEach(btn => {
      btn.addEventListener("click", () => this.switchTab(btn.dataset.tab));
    });

    // 增加備註
    this.elements.addNoteBtn.addEventListener("click", () => this.addNoteRow());

    // 繳交方式變更監聽
    document.querySelectorAll('input[name="method"]').forEach(el => {
      el.addEventListener("change", () => this.updateMethodRequirementVisibility());
    });

    // 產生按鈕
    this.elements.generateBtn.addEventListener("click", () => this.handleGenerate());
  },

  initModes() {
    // 執行各模式的初始化 (例如載入 LocalStorage)
    Object.values(ReportModes).forEach(mode => {
      if (typeof mode.init === 'function') {
        mode.init();
      }
    });
  },

  switchTab(tabId) {
    this.activeTab = tabId;
    this.elements.tabBtns.forEach(btn => {
      btn.classList.toggle("active", btn.dataset.tab === tabId);
    });
    this.elements.tabContents.forEach(content => {
      content.classList.toggle("active", content.id === tabId);
    });
    this.elements.resultContainer.style.display = "none";
  },

  updateMethodRequirementVisibility() {
    const checkedCount = document.querySelectorAll('input[name="method"]:checked').length;
    if (this.elements.methodRequirement) {
      this.elements.methodRequirement.style.display = checkedCount > 1 ? "inline-block" : "none";
    }
  },

  addNoteRow() {
    const div = document.createElement("div");
    div.className = "note-row";
    div.innerHTML = `
      <input type="text" class="custom-note-input" placeholder="請輸入備註項目...">
      <button type="button" class="remove-note-btn" title="刪除">✕</button>
    `;
    div.querySelector(".remove-note-btn").addEventListener("click", () => div.remove());
    this.elements.customNotesContainer.appendChild(div);
  },

  async handleGenerate() {
    // 1. 根據目前 Tab 取得對應的模式策略
    const mode = ReportModes[this.activeTab];
    if (!mode) return;

    // 2. 收集資料 (SRP: 模式自己知道怎麼收集自己的資料)
    const data = mode.collectData();
    if (!data) return; // 驗證失敗

    // 3. 產生樣板
    const template = mode.generateTemplate(data);

    // 4. UI 呈現
    this.displayResult(template);

    // 5. 複製到剪貼簿
    const success = await Utils.copyToClipboard(template);
    if (success) {
      this.showCopyFeedback();
    }
  },

  displayResult(text) {
    this.elements.result.innerText = text;
    this.elements.resultContainer.style.display = "block";
    this.elements.resultContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  },

  showCopyFeedback() {
    const btn = this.elements.generateBtn;
    const originalText = btn.innerText;
    btn.innerText = "✓ 複製成功！";
    btn.style.backgroundColor = "#05a647";
    setTimeout(() => {
      btn.innerText = originalText;
      btn.style.backgroundColor = "";
    }, 2000);
  }
};

document.addEventListener("DOMContentLoaded", () => App.init());

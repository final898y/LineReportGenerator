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
      addNoteBtns: document.querySelectorAll(".add-note-btn"),
      methodRequirement: document.getElementById("method_requirement"),
      templateSelect: document.getElementById("template_select"),
      deptMeetingFields: document.getElementById("dept_meeting_fields"),
      industryBriefFields: document.getElementById("industry_mayor_brief_fields"),
      cloudLinkLabel: document.getElementById("cloud_link_label"),
      cloudLinkGroup: document.getElementById("cloud_link_group")
    };
  },

  bindEvents() {
    // 分頁切換
    this.elements.tabBtns.forEach(btn => {
      btn.addEventListener("click", () => this.switchTab(btn.dataset.tab));
    });

    // 增加備註 (多個按鈕)
    this.elements.addNoteBtns.forEach(btn => {
      btn.addEventListener("click", () => this.addNoteRow(btn.dataset.container));
    });

    // 模板切換
    if (this.elements.templateSelect) {
      this.elements.templateSelect.addEventListener("change", (e) => this.handleTemplateChange(e.target.value));
    }

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
    // 初始化模板顯示狀態
    if (this.elements.templateSelect) {
      this.handleTemplateChange(this.elements.templateSelect.value);
    }
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

  handleTemplateChange(templateValue) {
    const isDeptMeeting = templateValue === 'dept_meeting';
    const isIndustryBrief = templateValue === 'industry_mayor_brief';

    if (this.elements.deptMeetingFields) {
      this.elements.deptMeetingFields.style.display = isDeptMeeting ? 'block' : 'none';
    }
    if (this.elements.industryBriefFields) {
      this.elements.industryBriefFields.style.display = isIndustryBrief ? 'block' : 'none';
    }
    if (this.elements.cloudLinkGroup) {
      this.elements.cloudLinkGroup.style.display = isIndustryBrief ? 'none' : 'block';
    }
    if (this.elements.cloudLinkLabel) {
      this.elements.cloudLinkLabel.innerText = isDeptMeeting ? '雲端連結 (說明第2點)' : '雲端連結';
    }
    
    // 更新案由預設值
    const subjectInput = document.getElementById("weekly_subject");
    if (subjectInput) {
      if (isDeptMeeting) subjectInput.value = "處務會議資料填報";
      else if (isIndustryBrief) subjectInput.value = "本周產業發展處市長面報簡報資料";
      else subjectInput.value = "本週市長週報";
    }
  },

  updateMethodRequirementVisibility() {
    const checkedCount = document.querySelectorAll('input[name="method"]:checked').length;
    if (this.elements.methodRequirement) {
      this.elements.methodRequirement.style.display = checkedCount > 1 ? "inline-block" : "none";
    }
  },

  addNoteRow(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const div = document.createElement("div");
    div.className = "note-row";
    div.innerHTML = `
      <input type="text" class="custom-note-input" placeholder="請輸入備註項目...">
      <button type="button" class="remove-note-btn" title="刪除">✕</button>
    `;
    div.querySelector(".remove-note-btn").addEventListener("click", () => div.remove());
    container.appendChild(div);
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

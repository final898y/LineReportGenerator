/**
 * LINE 通報格式產生器 v6 - Refactored
 * 遵循 SOLID 原則，提升擴充性與可維護性
 */

/**
 * 格式化模組 (Formatter Module)
 * 專門負責資料的轉換與字串樣板組合 (Single Responsibility)
 */
const ReportFormatter = {
  /**
   * 格式化日期時間
   */
  formatDate(rawDate, dateLabel, timeLabel) {
    if (!rawDate) return "未設定期限";
    const [date, time] = rawDate.split("T");
    const formattedDate = date.replace(/-/g, "/");
    let result = formattedDate;
    if (dateLabel) result += ` ${dateLabel}`;
    result += ` ${time}`;
    if (timeLabel) result += ` ${timeLabel}`;
    return result;
  },

  /**
   * 取得核取方塊的值並轉為清單格式
   */
  getChecklistItems(selector) {
    const checked = Array.from(document.querySelectorAll(selector));
    return checked.length > 0 
      ? checked.map(el => "- " + el.value).join("\n")
      : "- 未指定";
  },

  /**
   * 整合備註內容並轉換為條列式編號
   * @param {string[]} noteItems - 所有備註文字陣列
   * @returns {string} 條列式字串
   */
  formatNotes(noteItems) {
    const validNotes = noteItems.filter(item => item.trim() !== "");
    if (validNotes.length === 0) return "無";
    
    return validNotes
      .map((note, index) => `${index + 1}. ${note}`)
      .join("\n");
  },

  /**
   * 產生最終的樣板字串
   */
  generate(data) {
    const importantHeader = data.isImportant ? "`【重要】` \n" : "";
    const unitRow = data.unit ? `通報單位： ${data.unit}\n` : "";
    const formattedDeadline = this.formatDate(data.deadline, data.deadlineDateLabel, data.deadlineTimeLabel);
    const notesContent = this.formatNotes(data.notes);

    return `${importantHeader}\`【 案 件 通 報 】\`
~~~~~~~~~~~~~~~~~~~~~~~
${unitRow}案由： \`${data.subject}\`
期限： \`${formattedDeadline}\`
~~~~~~~~~~~~~~~~~~~~~~~
繳交方式${data.methodRequirement}：
${data.methods}
~~~~~~~~~~~~~~~~~~~~~~~
詳細說明：
${data.description || "無"}

備註：
${notesContent}
~~~~~~~~~~~~~~~~~~~~~~~`;
  }
};

/**
 * 應用程式控制模組 (App Controller)
 */
const App = {
  init() {
    this.cacheDOM();
    this.bindEvents();
    // 初始化選單狀態
    this.updateMethodRequirementVisibility();
    // 預設增加一列自定義備註
    this.addNoteRow();
  },

  cacheDOM() {
    this.elements = {
      isImportant: document.getElementById("is_important"),
      unit: document.getElementById("unit"),
      subject: document.getElementById("subject"),
      deadline: document.getElementById("deadline"),
      deadlineDateLabel: document.getElementById("deadline_date_label"),
      deadlineTimeLabel: document.getElementById("deadline_time_label"),
      methodRequirement: document.getElementById("method_requirement"),
      description: document.getElementById("description"),
      customNotesContainer: document.getElementById("custom-notes-container"),
      addNoteBtn: document.getElementById("add-note-btn"),
      result: document.getElementById("result"),
      resultContainer: document.getElementById("result-container"),
      generateBtn: document.getElementById("generate-btn")
    };
  },

  bindEvents() {
    this.elements.generateBtn.addEventListener("click", () => this.handleGenerate());
    this.elements.addNoteBtn.addEventListener("click", () => this.addNoteRow());
    
    // 監聽繳交方式核取方塊的變動
    document.querySelectorAll('input[name="method"]').forEach(el => {
      el.addEventListener("change", () => this.updateMethodRequirementVisibility());
    });
  },

  /**
   * 根據勾選數量決定是否顯示「繳交方式」的需求選單
   */
  updateMethodRequirementVisibility() {
    const checkedCount = document.querySelectorAll('input[name="method"]:checked').length;
    // 只有在勾選 2 個以上時才顯示 (都要)/(任選一種)
    if (checkedCount > 1) {
      this.elements.methodRequirement.style.display = "inline-block";
    } else {
      this.elements.methodRequirement.style.display = "none";
    }
  },

  /**
   * 動態增加備註輸入列
   */
  addNoteRow() {
    const div = document.createElement("div");
    div.className = "note-row";
    div.innerHTML = `
      <input type="text" class="custom-note-input" placeholder="請輸入備註項目...">
      <button type="button" class="remove-note-btn" title="刪除">✕</button>
    `;
    
    // 綁定刪除事件
    div.querySelector(".remove-note-btn").addEventListener("click", () => {
      div.remove();
    });

    this.elements.customNotesContainer.appendChild(div);
  },

  /**
   * 處理產生按鈕的邏輯
   */
  async handleGenerate() {
    const subject = this.elements.subject.value.trim();
    if (!subject) {
      alert("「案由」是必填欄位喔！");
      this.elements.subject.focus();
      return;
    }

    // 收集所有備註 (Checkbox + 自定義輸入)
    const notes = [
      ...Array.from(document.querySelectorAll('input[name="note_opt"]:checked')).map(el => el.value),
      ...Array.from(document.querySelectorAll('.custom-note-input')).map(el => el.value.trim())
    ];

    const checkedMethods = Array.from(document.querySelectorAll('input[name="method"]:checked'));

    const formData = {
      isImportant: this.elements.isImportant.checked,
      unit: this.elements.unit.value.trim(),
      subject: subject,
      deadline: this.elements.deadline.value,
      deadlineDateLabel: this.elements.deadlineDateLabel.value,
      deadlineTimeLabel: this.elements.deadlineTimeLabel.value,
      // 只有勾選超過 1 個才顯示 (都要) 或 (任選一種)
      methodRequirement: checkedMethods.length > 1 ? this.elements.methodRequirement.value : "",
      description: this.elements.description.value.trim(),
      methods: checkedMethods.length > 0 
        ? checkedMethods.map(el => "- " + el.value).join("\n")
        : "- 未指定",
      notes: notes
    };

    const template = ReportFormatter.generate(formData);
    this.displayResult(template);
    await this.copyToClipboard(template);
  },

  displayResult(text) {
    this.elements.result.innerText = text;
    this.elements.resultContainer.style.display = "block";
    this.elements.resultContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  },

  async copyToClipboard(text) {
    if (!navigator.clipboard) {
      this.fallbackCopyTextToClipboard(text);
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      this.showCopyFeedback();
    } catch (err) {
      this.fallbackCopyTextToClipboard(text);
    }
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
  },

  fallbackCopyTextToClipboard(text) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    this.showCopyFeedback();
  }
};

document.addEventListener("DOMContentLoaded", () => App.init());

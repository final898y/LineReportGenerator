/**
 * LINE 通報格式產生器 v7 - Multi-Mode Refactored
 */

const ReportFormatter = {
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

  formatNotes(noteItems) {
    const validNotes = noteItems.filter(item => item && item.trim() !== "");
    if (validNotes.length === 0) return "無";
    return validNotes.map((note, index) => `${index + 1}. ${note}`).join("\n");
  },

  /**
   * 一般模式樣板
   */
  generateGeneral(data) {
    const importantHeader = data.isImportant ? "`【重要】` \n" : "";
    const unitRow = data.unit ? `通報單位： ${data.unit}\n` : "";
    const formattedDeadline = this.formatDate(data.deadline, data.deadlineDateLabel, data.deadlineTimeLabel);
    
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
${this.formatNotes(data.notes)}
~~~~~~~~~~~~~~~~~~~~~~~`;
  },

  /**
   * 週報模式樣板
   */
  generateWeekly(data) {
    const importantHeader = data.isImportant ? "`【重要】` \n" : "";
    const formattedDeadline = this.formatDate(data.deadline, data.deadlineDateLabel, "");

    return `${importantHeader}\`【 案 件 通 報 】\`
~~~~~~~~~~~~~~~~~~~~~~~
案由： \`${data.subject}\`
期限： \`${formattedDeadline}\`
~~~~~~~~~~~~~~~~~~~~~~~
詳細說明：
1. 本週處務會議 \`訂於${data.meetingTime || "未定"}\`  
2. 請各位填妥本週處務會議資料，雲端連結:
${data.cloudLink || "尚未提供"}
~~~~~~~~~~~~~~~~~~~~~~~`;
  },

  /**
   * 公告模式樣板
   */
  generateAnnouncement(data) {
    const importantHeader = data.isImportant ? "`【重要】` \n" : "";
    return `${importantHeader}\`【 公 告 通 知 】\`

標題： \`${data.subject}\`

內容：
${data.description || "無"}`;
  }
};

const App = {
  activeTab: 'tab-general',

  init() {
    this.cacheDOM();
    this.bindEvents();
    this.loadWeeklyLink();
    this.updateMethodRequirementVisibility();
  },

  cacheDOM() {
    this.elements = {
      // Tabs
      tabBtns: document.querySelectorAll(".tab-btn"),
      tabContents: document.querySelectorAll(".tab-content"),
      
      // General Mode
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
      
      // Weekly Mode
      weeklyIsImportant: document.getElementById("weekly_is_important"),
      weeklySubject: document.getElementById("weekly_subject"),
      weeklyDeadline: document.getElementById("weekly_deadline"),
      weeklyDeadlineDateLabel: document.getElementById("weekly_deadline_date_label"),
      weeklyMeetingTime: document.getElementById("weekly_meeting_time"),
      weeklyCloudLink: document.getElementById("weekly_cloud_link"),

      // Announcement Mode
      annIsImportant: document.getElementById("ann_is_important"),
      annSubject: document.getElementById("ann_subject"),
      annDescription: document.getElementById("ann_description"),

      // Shared
      generateBtn: document.getElementById("generate-btn"),
      result: document.getElementById("result"),
      resultContainer: document.getElementById("result-container")
    };
  },

  bindEvents() {
    // Tab switching
    this.elements.tabBtns.forEach(btn => {
      btn.addEventListener("click", () => this.switchTab(btn.dataset.tab));
    });

    // General Mode actions
    this.elements.addNoteBtn.addEventListener("click", () => this.addNoteRow());
    document.querySelectorAll('input[name="method"]').forEach(el => {
      el.addEventListener("change", () => this.updateMethodRequirementVisibility());
    });

    // Generate action
    this.elements.generateBtn.addEventListener("click", () => this.handleGenerate());
  },

  switchTab(tabId) {
    this.activeTab = tabId;
    this.elements.tabBtns.forEach(btn => {
      btn.classList.toggle("active", btn.dataset.tab === tabId);
    });
    this.elements.tabContents.forEach(content => {
      content.classList.toggle("active", content.id === tabId);
    });
    // 切換時隱藏上一次的結果，避免混淆
    this.elements.resultContainer.style.display = "none";
  },

  updateMethodRequirementVisibility() {
    const checkedCount = document.querySelectorAll('input[name="method"]:checked').length;
    this.elements.methodRequirement.style.display = checkedCount > 1 ? "inline-block" : "none";
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

  loadWeeklyLink() {
    const DEFAULT_LINK = "https://docs.google.com/spreadsheets/d/1oaWz0Q3MNVgLg8vlyP4eTFUhvGQB2FImqHsTscltRpM/edit?gid=1569821820#gid=1569821820";
    const savedLink = localStorage.getItem("weekly_cloud_link");
    this.elements.weeklyCloudLink.value = savedLink || DEFAULT_LINK;
  },

  saveWeeklyLink(link) {
    localStorage.setItem("weekly_cloud_link", link);
  },

  async handleGenerate() {
    let template = "";
    
    if (this.activeTab === 'tab-general') {
      const subject = this.elements.subject.value.trim();
      if (!subject) return this.alertMissing("案由");
      
      const notes = [
        ...Array.from(document.querySelectorAll('input[name="note_opt"]:checked')).map(el => el.value),
        ...Array.from(document.querySelectorAll('.custom-note-input')).map(el => el.value.trim())
      ];
      const checkedMethods = Array.from(document.querySelectorAll('input[name="method"]:checked'));

      template = ReportFormatter.generateGeneral({
        isImportant: this.elements.isImportant.checked,
        unit: this.elements.unit.value.trim(),
        subject,
        deadline: this.elements.deadline.value,
        deadlineDateLabel: this.elements.deadlineDateLabel.value,
        deadlineTimeLabel: this.elements.deadlineTimeLabel.value,
        methodRequirement: checkedMethods.length > 1 ? this.elements.methodRequirement.value : "",
        methods: checkedMethods.length > 0 ? checkedMethods.map(el => "- " + el.value).join("\n") : "- 未指定",
        description: this.elements.description.value.trim(),
        notes
      });

    } else if (this.activeTab === 'tab-weekly') {
      const subject = this.elements.weeklySubject.value.trim();
      if (!subject) return this.alertMissing("案由");
      
      this.saveWeeklyLink(this.elements.weeklyCloudLink.value.trim());

      template = ReportFormatter.generateWeekly({
        isImportant: this.elements.weeklyIsImportant.checked,
        subject,
        deadline: this.elements.weeklyDeadline.value,
        deadlineDateLabel: this.elements.weeklyDeadlineDateLabel.value,
        meetingTime: this.elements.weeklyMeetingTime.value.trim(),
        cloudLink: this.elements.weeklyCloudLink.value.trim()
      });

    } else if (this.activeTab === 'tab-announcement') {
      const subject = this.elements.annSubject.value.trim();
      if (!subject) return this.alertMissing("公告標題");

      template = ReportFormatter.generateAnnouncement({
        isImportant: this.elements.annIsImportant.checked,
        subject,
        description: this.elements.annDescription.value.trim()
      });
    }

    this.displayResult(template);
    await this.copyToClipboard(template);
  },

  alertMissing(field) {
    alert(`「${field}」是必填欄位喔！`);
  },

  displayResult(text) {
    this.elements.result.innerText = text;
    this.elements.resultContainer.style.display = "block";
    this.elements.resultContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  },

  async copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      this.showCopyFeedback();
    } catch (err) {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      this.showCopyFeedback();
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
  }
};

document.addEventListener("DOMContentLoaded", () => App.init());

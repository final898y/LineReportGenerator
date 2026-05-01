import { Utils } from './utils.js';

/**
 * 報告模式策略定義
 */

class GeneralMode {
  collectData() {
    const subject = document.getElementById("subject").value.trim();
    if (!subject) {
      Utils.alertMissing("案由");
      return null;
    }

    const notes = [
      ...Array.from(document.querySelectorAll('input[name="note_opt"]:checked')).map(el => el.value),
      ...Array.from(document.querySelectorAll('.custom-note-input')).map(el => el.value.trim())
    ];
    
    const checkedMethods = Array.from(document.querySelectorAll('input[name="method"]:checked'));

    return {
      isImportant: document.getElementById("is_important").checked,
      unit: document.getElementById("unit").value.trim(),
      subject,
      deadline: document.getElementById("deadline").value,
      deadlineDateLabel: document.getElementById("deadline_date_label").value,
      deadlineTimeLabel: document.getElementById("deadline_time_label").value,
      methodRequirement: checkedMethods.length > 1 ? document.getElementById("method_requirement").value : "",
      methods: checkedMethods.length > 0 ? checkedMethods.map(el => "- " + el.value).join("\n") : "- 未指定",
      description: document.getElementById("description").value.trim(),
      notes
    };
  }

  generateTemplate(data) {
    const importantHeader = data.isImportant ? "`【重要】` \n" : "";
    const unitRow = data.unit ? `通報單位： ${data.unit}\n` : "";
    const formattedDeadline = Utils.formatDate(data.deadline, data.deadlineDateLabel, data.deadlineTimeLabel);
    
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
${Utils.formatNotes(data.notes)}
~~~~~~~~~~~~~~~~~~~~~~~`;
  }
}

class WeeklyMode {
  constructor() {
    this.DEFAULT_LINK = "https://docs.google.com/spreadsheets/d/1oaWz0Q3MNVgLg8vlyP4eTFUhvGQB2FImqHsTscltRpM/edit?gid=1569821820#gid=1569821820";
  }

  collectData() {
    const subject = document.getElementById("weekly_subject").value.trim();
    if (!subject) {
      Utils.alertMissing("案由");
      return null;
    }

    const cloudLink = document.getElementById("weekly_cloud_link").value.trim();
    localStorage.setItem("weekly_cloud_link", cloudLink);

    return {
      isImportant: document.getElementById("weekly_is_important").checked,
      subject,
      deadline: document.getElementById("weekly_deadline").value,
      deadlineDateLabel: document.getElementById("weekly_deadline_date_label").value,
      meetingTime: document.getElementById("weekly_meeting_time").value.trim(),
      cloudLink
    };
  }

  generateTemplate(data) {
    const importantHeader = data.isImportant ? "`【重要】` \n" : "";
    const formattedDeadline = Utils.formatDate(data.deadline, data.deadlineDateLabel, "");

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
  }

  init() {
    const savedLink = localStorage.getItem("weekly_cloud_link");
    const linkInput = document.getElementById("weekly_cloud_link");
    if (linkInput) {
      linkInput.value = savedLink || this.DEFAULT_LINK;
    }
  }
}

class AnnouncementMode {
  collectData() {
    const subject = document.getElementById("ann_subject").value.trim();
    if (!subject) {
      Utils.alertMissing("公告標題");
      return null;
    }

    return {
      isImportant: document.getElementById("ann_is_important").checked,
      subject,
      description: document.getElementById("ann_description").value.trim()
    };
  }

  generateTemplate(data) {
    const importantHeader = data.isImportant ? "`【重要】` \n" : "";
    return `${importantHeader}\`【 公 告 通 知 】\`

標題： \`${data.subject}\`

內容：
${data.description || "無"}`;
  }
}

/**
 * 模式工廠
 */
export const ReportModes = {
  'tab-general': new GeneralMode(),
  'tab-weekly': new WeeklyMode(),
  'tab-announcement': new AnnouncementMode()
};

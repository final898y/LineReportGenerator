import { Utils } from "./utils.js";

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
      ...Array.from(
        document.querySelectorAll('input[name="note_opt"]:checked'),
      ).map((el) => el.value),
      ...Array.from(
        document.querySelectorAll(
          "#custom-notes-container-general .custom-note-input",
        ),
      ).map((el) => el.value.trim()),
    ];

    const checkedMethods = Array.from(
      document.querySelectorAll('input[name="method"]:checked'),
    );

    return {
      isImportant: document.getElementById("is_important").checked,
      unit: document.getElementById("unit").value.trim(),
      subject,
      deadline: document.getElementById("deadline").value,
      deadlineDateLabel: document.getElementById("deadline_date_label").value,
      deadlineTimeLabel: document.getElementById("deadline_time_label").value,
      methodRequirement:
        checkedMethods.length > 1
          ? document.getElementById("method_requirement").value
          : "",
      methods:
        checkedMethods.length > 0
          ? checkedMethods.map((el) => "- " + el.value).join("\n")
          : "- 未指定",
      description: document.getElementById("description").value.trim(),
      notes,
    };
  }

  generateTemplate(data) {
    const importantHeader = data.isImportant ? "`【重要】` \n" : "";
    const unitRow = data.unit ? `通報單位： ${data.unit}\n` : "";
    const formattedDeadline = Utils.formatDate(
      data.deadline,
      data.deadlineDateLabel,
      data.deadlineTimeLabel,
    );
    const separator = "~~~~~~~~~~~~~~~~~~~~~~~";

    return `${importantHeader}\`【 案 件 通 報 】\`
${separator}
${unitRow}案由： \`${data.subject}\`
期限： \`${formattedDeadline}\`
${separator}
繳交方式${data.methodRequirement}：
${data.methods}
${separator}
詳細說明：
${data.description || "無"}

備註：
${Utils.formatNotes(data.notes)}
${separator}`;
  }
}

class TemplateMode {
  constructor() {
    this.DEFAULT_LINKS = {
      dept_meeting:
        "https://docs.google.com/spreadsheets/d/1oaWz0Q3MNVgLg8vlyP4eTFUhvGQB2FImqHsTscltRpM/edit?gid=1569821820#gid=1569821820",
      mayor_weekly:
        "https://docs.google.com/spreadsheets/d/1oaWz0Q3MNVgLg8vlyP4eTFUhvGQB2FImqHsTscltRpM/edit?gid=1569821820#gid=1569821820",
    };
  }

  collectData() {
    const template = document.getElementById("template_select").value;
    const subject = document.getElementById("weekly_subject").value.trim();
    if (!subject) {
      Utils.alertMissing("案由");
      return null;
    }

    const cloudLink = document.getElementById("weekly_cloud_link").value.trim();
    localStorage.setItem(`cloud_link_${template}`, cloudLink);

    const notes = [
      ...Array.from(
        document.querySelectorAll('input[name="weekly_note_opt"]:checked'),
      ).map((el) => el.value),
      ...Array.from(
        document.querySelectorAll(
          "#custom-notes-container-weekly .custom-note-input",
        ),
      ).map((el) => el.value.trim()),
    ];

    return {
      template,
      isImportant: document.getElementById("weekly_is_important").checked,
      subject,
      deadline: document.getElementById("weekly_deadline").value,
      deadlineDateLabel: document.getElementById("weekly_deadline_date_label")
        .value,
      deadlineTimeLabel: document.getElementById("weekly_deadline_time_label")
        .value,
      meetingTime: document.getElementById("weekly_meeting_time").value.trim(),
      cloudLink,
      reportItems: document
        .getElementById("industry_report_items")
        .value.trim(),
      notes,
    };
  }

  generateTemplate(data) {
    const importantHeader = data.isImportant ? "`【重要】` \n" : "";
    const formattedDeadline = Utils.formatDate(
      data.deadline,
      data.deadlineDateLabel,
      data.deadlineTimeLabel,
    );
    const separator = "~~~~~~~~~~~~~~~~~~~~~~~~~~";

    if (data.template === "mayor_weekly") {
      return `${importantHeader}\`【 案 件 通 報 】\`
${separator}
案由： \`${data.subject}\`
期限： \`${formattedDeadline}\`
${separator}
繳交方式：
- 線上表單
${separator}
詳細說明：
1. 請至「${data.cloudLink || "尚未提供"}」 填妥本週週報內容。
備註：
${Utils.formatNotes(data.notes)}
${separator}`;
    } else if (data.template === "industry_mayor_brief") {
      return `${importantHeader}\`【 案 件 通 報 】\`
${separator}
通報單位： 產發處處長
案由： \`${data.subject}\`
期限： \`${formattedDeadline}\`
${separator}
繳交方式：
- 檔案回傳
${separator}
本週產發處例會報告事項：
${data.reportItems || "無"}
備註：
${Utils.formatNotes(data.notes)}
${separator}`;
    } else {
      // 預設為處務會議
      return `${importantHeader}\`【 案 件 通 報 】\`
${separator}
案由： \`${data.subject}\`
期限： \`${formattedDeadline}\`
${separator}
詳細說明：
1. 本週處務會議 \`訂於${data.meetingTime || "未定"}\`  
2. 請各位填妥本週處務會議資料，雲端連結:
${data.cloudLink || "尚未提供"}
備註：
${Utils.formatNotes(data.notes)}
${separator}`;
    }
  }

  init() {
    const templateSelect = document.getElementById("template_select");
    if (!templateSelect) return;

    const updateLink = () => {
      const template = templateSelect.value;
      const savedLink = localStorage.getItem(`cloud_link_${template}`);
      const linkInput = document.getElementById("weekly_cloud_link");
      if (linkInput) {
        linkInput.value = savedLink || this.DEFAULT_LINKS[template] || "";
      }
    };

    templateSelect.addEventListener("change", updateLink);
    updateLink();
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
      description: document.getElementById("ann_description").value.trim(),
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
  "tab-general": new GeneralMode(),
  "tab-weekly": new TemplateMode(),
  "tab-announcement": new AnnouncementMode(),
};

/**
 * 常用工具函式
 */

export const Utils = {
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
   * 格式化備註清單
   */
  formatNotes(noteItems) {
    const validNotes = noteItems.filter(item => item && item.trim() !== "");
    if (validNotes.length === 0) return "無";
    return validNotes.map((note, index) => `${index + 1}. ${note}`).join("\n");
  },

  /**
   * 複製文字到剪貼簿
   */
  async copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return successful;
    }
  },

  /**
   * 必填欄位提示
   */
  alertMissing(field) {
    alert(`「${field}」是必填欄位喔！`);
  }
};

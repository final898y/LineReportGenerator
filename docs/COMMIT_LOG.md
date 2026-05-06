## [2026-05-06] refactor(ui): 將週報模式升級為模板模式並支援多重模板

- Hash: `TBD`
- 改動方向: 將原有的「週報模式」重構為更具擴充性的「模板模式」，支援下拉選單切換不同預設模板。
- 具體內容:
  - 於 `index.html` 將「週報模式」更名為「模板模式」，並新增模板選擇下拉選單。
  - 在 `js/report-modes.js` 中將 `WeeklyMode` 重新實作為 `TemplateMode`，並新增對「本週市長週報」模板的支援。
  - 為所有模板模式（處務會議、市長週報、產發處市長面報）新增「相關備註」區塊，支援預設勾選與自定義輸入。
  - 於 `js/app.js` 實作動態欄位切換邏輯，根據選取的模板顯示或隱藏特定輸入項。
  - 優化 LocalStorage 儲存邏輯，支援按模板分別儲存雲端連結。

## [2026-05-01] refactor(core): 重構核心邏輯為模組化架構並採用策略模式

- Hash: `TBD`
- 改動方向: 將單一腳本 `script.js` 拆解為模組化架構，並引入策略模式處理不同報告模式。
- 具體內容:
  - 移除 `script.js`，將其功能遷移至 `js/` 目錄下的 `app.js`, `report-modes.js`, `utils.js`。
  - 在 `report-modes.js` 中實作策略模式 (Strategy Pattern)，將一般案件、週報會議、公告通知的格式化邏輯解耦。
  - 更新 `index.html` 以支援 ES Modules 並修正標籤屬性。
  - 大幅更新 `README.MD` 以反映新的系統架構與技術細節。
  - 新增 `AGENTS.md` 以規範 AI Agent 的行為與 Commit 流程。

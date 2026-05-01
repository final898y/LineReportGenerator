## [2026-05-01] refactor(core): 重構核心邏輯為模組化架構並採用策略模式

- Hash: `TBD`
- 改動方向: 將單一腳本 `script.js` 拆解為模組化架構，並引入策略模式處理不同報告模式。
- 具體內容:
  - 移除 `script.js`，將其功能遷移至 `js/` 目錄下的 `app.js`, `report-modes.js`, `utils.js`。
  - 在 `report-modes.js` 中實作策略模式 (Strategy Pattern)，將一般案件、週報會議、公告通知的格式化邏輯解耦。
  - 更新 `index.html` 以支援 ES Modules 並修正標籤屬性。
  - 大幅更新 `README.MD` 以反映新的系統架構與技術細節。
  - 新增 `AGENTS.md` 以規範 AI Agent 的行為與 Commit 流程。

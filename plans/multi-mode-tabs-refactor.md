# 功能開發計畫：多模式分頁切換系統 (Multi-Mode Tabs)

## 1. 目標 (Objective)
將「LINE 通報格式產生器」重構為多模式分頁介面，支援「一般通報」、「週報模式」及「公告模式」，提升特定場景下的輸入效率，並確保程式碼架構單純、易於擴充。

## 2. 關鍵變更 (Key Changes)

### 2.1 介面結構 (index.html)
- **分頁導覽 (Tab Navigation)**:
  - 新增 `.tabs` 容器，包含三個按鈕：`一般模式`、`週報模式`、`公告模式`。
- **分頁內容 (Tab Panels)**:
  - `#tab-general`: 搬移現有的所有欄位至此。
  - `#tab-weekly`: 專屬週報欄位。
    - 案由預設為「處務會議資料填報」。
    - 期限選擇器。
    - 會議日期/時間輸入框 (用於填入說明第 1 點)。
    - 雲端連結輸入框 (用於填入說明第 2 點)。
  - `#tab-announcement`: 專屬公告欄位。
    - 僅保留「重要性」、「案由」、「詳細說明」。

### 2.2 視覺樣式 (style.css)
- **Tab 樣式**:
  - 選中狀態: `var(--line-green)` 背景，白色文字。
  - 非選中狀態: 淺灰色背景。
- **顯示控制**:
  - 使用 `.tab-content` 與 `.active` 類別控制分頁顯示。
  - 預設隱藏非作用中的分頁容器。

### 2.3 程式邏輯 (script.js)
- **TabManager 類別**: 負責切換 Tab 狀態，並觸發不同模式的初始化。
- **StorageManager 類別**: 負責在 `localStorage` 儲存「週報模式」的雲端連結，避免重複輸入。
- **ReportFormatterFactory**: 
  - `general`: 輸出包含期限、繳交方式、備註的完整樣板。
  - `weekly`: 輸出包含固定文字（說明 1 & 2）與期限的週報樣板。
  - `announcement`: 輸出僅含案由與說明的極簡樣板。
- **App 整合**:
  - `handleGenerate()` 根據目前 `activeTab` 抓取對應資料。

## 3. 實施步驟 (Implementation Steps)

### 第一階段：HTML/CSS 基礎結構重組
1. 在 `index.html` 中包裹現有欄位至 `#tab-general`。
2. 建立標籤導覽列與其他兩個模式的空白容器。
3. 在 `style.css` 加入 Tab 的切換邏輯樣式。

### 第二階段：邏輯重構與 Tab 切換
1. 在 `script.js` 實作 `TabManager`。
2. 修正 `App.cacheDOM()` 以對應新的容器結構。
3. 測試分頁切換的 UI 呈現是否正確。

### 第三階段：開發「週報模式」與「公告模式」
1. 完成 `weekly` 與 `announcement` 的 HTML 欄位配置。
2. 在 `ReportFormatter` 中實作對應的字串產生函數。
3. 實作週報模式的 `localStorage` 記憶功能。

## 4. 驗證與測試 (Verification)
- **分頁切換**: 確認切換分頁時，舊分頁的資料不會遺失，且畫面正確顯示。
- **週報產生**: 填入會議時間與連結，確認輸出的文字符合範例格式。
- **公告模式**: 確認輸出的文字不含任何分隔線、期限或備註。
- **資料記憶**: 重新整理頁面後，週報模式的雲端連結應自動填回。

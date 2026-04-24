function generate() {
    // 1. 資料抓取與清洗
    const type = document.getElementById('type').value;
    const unit = document.getElementById('unit').value.trim();
    const subject = document.getElementById('subject').value.trim();
    const description = document.getElementById('description').value.trim();
    const rawDeadline = document.getElementById('deadline').value;
    const noteCustom = document.getElementById('note_custom').value.trim();
    
    // 2. 表單驗證
    if (!subject) {
        alert("「案由」是必填欄位喔！");
        document.getElementById('subject').focus();
        return;
    }

    // 3. 欄位渲染邏輯
    const typeRow = (type !== "無(預設)") ? `\`類別：\` ${type}\n` : "";
    const unitRow = unit ? `通報單位： ${unit}\n` : "";

    // 4. 日期格式化處理
    const deadline = rawDeadline ? rawDeadline.replace('T', ' ').replace(/-/g, '/') : "未設定期限";

    // 5. 繳交方式多選處理
    const methods = Array.from(document.querySelectorAll('input[name="method"]:checked'))
                         .map(el => "- " + el.value)
                         .join('\n');

    // 6. 備註整合
    const noteOpts = Array.from(document.querySelectorAll('input[name="note_opt"]:checked'))
                          .map(el => `【${el.value}】`);
    if (noteCustom) noteOpts.push(`【${noteCustom}】`);
    const noteFinal = noteOpts.length > 0 ? noteOpts.join('、') : "無";

    // 7. 最終模板合成 (已補回通報單位)
    const template = `\`【 案 件 通 報 】\`
~~~~~~~~~~~~~~~~~~~~~~~~~~
${typeRow}${unitRow}案由： \`${subject}\`
期限： \`${deadline}\`
~~~~~~~~~~~~~~~~~~~~~~~~~~
繳交方式(都要)：
${methods || "- 未指定"}
~~~~~~~~~~~~~~~~~~~~~~~~~~
詳細說明：
${description || "無"}

備註： ${noteFinal}
~~~~~~~~~~~~~~~~~~~~~~~~~~`;

    // 8. 顯示與複製
    const resultDiv = document.getElementById('result');
    resultDiv.innerText = template;
    document.getElementById('result-container').style.display = 'block';

    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(template).then(() => {
            alert("✅ 格式已更新並複製成功！");
        });
    }
}

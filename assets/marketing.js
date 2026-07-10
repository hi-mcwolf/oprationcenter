/* 页面一：营销页 · 触达配置抽屉交互 */

const TEMPLATES = {
  quiz: "Only the best teams remain! Warm up for the Quarterfinals with today's FREE World Cup Quiz. Visit bingoplus.com.",
  recharge: '尊敬的用户，本周充值满 500 即享 8% 加赠，活动今晚 24:00 截止，立即打开 App 参与吧！',
  recall: '您好，我们注意到您已有一段时间未登录。现为您专属保留了回归礼包，登录即可领取，期待您的回来！',
};

document.addEventListener('DOMContentLoaded', () => {
  renderSidebar('marketing', 'marketing-campaign');
  renderTopbar();
  bindDrawerClose();

  // 打开抽屉
  document.querySelectorAll('[data-open-reach]').forEach(btn => {
    btn.addEventListener('click', () => openDrawer('reachDrawer'));
  });

  // 通道多选 chip
  document.querySelectorAll('#channelChips .chip').forEach(chip => {
    chip.addEventListener('click', () => chip.classList.toggle('selected'));
  });

  // 采纳建议：勾选推荐通道 + 填入示例文案
  document.getElementById('adoptBtn').addEventListener('click', () => {
    document.querySelectorAll('#channelChips .chip').forEach(chip => {
      const adopt = chip.dataset.channel === 'sms' || chip.dataset.channel === 'tele';
      chip.classList.toggle('selected', adopt);
    });
    document.getElementById('contentText').value = document.getElementById('suggestCopy').textContent.trim();
    showToast('已采纳建议：短信、电销通道及示例文案已填入');
  });

  // 模板选择
  document.getElementById('tplSelect').addEventListener('change', e => {
    const tpl = TEMPLATES[e.target.value];
    if (tpl) document.getElementById('contentText').value = tpl;
  });

  // 保存为模板
  document.getElementById('saveTplBtn').addEventListener('click', () => {
    const content = document.getElementById('contentText').value.trim();
    if (!content) { showToast('请先输入内容再保存为模板'); return; }
    showToast('已保存为模板');
  });

  // 发送时间：指定日期 / 循环 切换
  document.querySelectorAll('input[name="sendMode"]').forEach(radio => {
    radio.addEventListener('change', () => {
      const isDate = radio.value === 'date';
      document.getElementById('dateConfig').hidden = !isDate;
      document.getElementById('cycleConfig').hidden = isDate;
    });
  });

  // 循环频率：每周时显示星期选择
  document.getElementById('cycleFreq').addEventListener('change', e => {
    document.getElementById('cycleWeekday').hidden = e.target.value !== 'weekly';
  });

  // 确认
  document.getElementById('confirmReach').addEventListener('click', () => {
    const selected = document.querySelectorAll('#channelChips .chip.selected');
    if (!selected.length) { showToast('请至少选择一个触达通道'); return; }
    if (!document.getElementById('contentText').value.trim()) { showToast('请配置发送内容'); return; }
    closeDrawer('reachDrawer');
    showToast('触达配置已保存');
  });

  refreshIcons();
});

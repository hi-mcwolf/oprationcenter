/* 页面一：营销页 · 触达配置抽屉交互 */

const TEMPLATES = {
  quiz: "Only the best teams remain! Warm up for the Quarterfinals with today's FREE World Cup Quiz. Visit bingoplus.com.",
  recharge: '尊敬的用户，本周充值满 500 即享 8% 加赠，活动今晚 24:00 截止，立即打开 App 参与吧！',
  recall: '您好，我们注意到您已有一段时间未登录。现为您专属保留了回归礼包，登录即可领取，期待您的回来！',
};

const CHANNEL_LABELS = {
  sms: 'SMS', email: '邮件', push: 'Push',
  viber: 'Viber', telegram: 'Telegram', tele: '电销',
};

/* 每个通道单独维护内容 */
const channelContents = {};
let activeContentChannel = null;

function selectedChannels() {
  return [...document.querySelectorAll('#channelChips .chip.selected')].map(c => c.dataset.channel);
}

function saveActiveContent() {
  if (activeContentChannel) {
    channelContents[activeContentChannel] = document.getElementById('contentText').value;
  }
}

function renderContentTabs() {
  const channels = selectedChannels();
  const tabsHost = document.getElementById('contentTabs');
  const empty = document.getElementById('contentTabsEmpty');
  const ta = document.getElementById('contentText');

  if (!channels.length) {
    activeContentChannel = null;
    tabsHost.innerHTML = '';
    empty.hidden = false;
    ta.hidden = true;
    return;
  }

  if (!channels.includes(activeContentChannel)) activeContentChannel = channels[0];
  empty.hidden = true;
  ta.hidden = false;
  ta.value = channelContents[activeContentChannel] || '';
  ta.placeholder = `请输入「${CHANNEL_LABELS[activeContentChannel]}」通道的触达文案内容…`;

  tabsHost.innerHTML = channels.map(c =>
    `<button class="tab${c === activeContentChannel ? ' active' : ''}" data-content-tab="${c}">${CHANNEL_LABELS[c]}</button>`
  ).join('');

  tabsHost.querySelectorAll('[data-content-tab]').forEach(tab => {
    tab.addEventListener('click', () => {
      saveActiveContent();
      activeContentChannel = tab.dataset.contentTab;
      renderContentTabs();
    });
  });
}

/* 触达策略配置区（数据来自 strategy-data.js） */
function renderStrategyPicker() {
  const host = document.getElementById('strategyPickList');
  const categories = ['frequency', 'dnd', 'dedup', 'retry', 'channel-route'];
  host.innerHTML = categories.map(catId => {
    const cat = strategyCategoryById(catId);
    const items = strategiesByCategory(catId).filter(s => s.status === 'active');
    if (!items.length) return '';
    return `
      <div class="strategy-pick-group">
        <div class="strategy-pick-cat"><i data-lucide="${cat.icon}"></i>${cat.name}</div>
        ${items.map(s => `
          <label class="check-item strategy-pick-item">
            <input type="checkbox" value="${s.id}">
            <span class="sp-name">${s.name}</span>
            <span class="sp-summary">${s.summary}</span>
          </label>`).join('')}
      </div>`;
  }).join('');
  refreshIcons();
}

document.addEventListener('DOMContentLoaded', () => {
  renderSidebar('marketing', 'marketing-campaign');
  renderTopbar();
  bindDrawerClose();

  // 打开抽屉
  document.querySelectorAll('[data-open-reach]').forEach(btn => {
    btn.addEventListener('click', () => openDrawer('reachDrawer'));
  });

  // 通道多选 chip：切换后刷新内容 Tab
  document.querySelectorAll('#channelChips .chip').forEach(chip => {
    chip.addEventListener('click', () => {
      saveActiveContent();
      chip.classList.toggle('selected');
      renderContentTabs();
    });
  });

  // 采纳建议：勾选推荐通道 + 填入示例文案（填入各推荐通道）
  document.getElementById('adoptBtn').addEventListener('click', () => {
    saveActiveContent();
    document.querySelectorAll('#channelChips .chip').forEach(chip => {
      const adopt = chip.dataset.channel === 'sms' || chip.dataset.channel === 'tele';
      chip.classList.toggle('selected', adopt);
    });
    const copy = document.getElementById('suggestCopy').textContent.trim();
    channelContents.sms = copy;
    channelContents.tele = copy;
    activeContentChannel = 'sms';
    renderContentTabs();
    showToast('已采纳建议：短信、电销通道及示例文案已填入');
  });

  // 模板选择（作用于当前通道）
  document.getElementById('tplSelect').addEventListener('change', e => {
    const tpl = TEMPLATES[e.target.value];
    if (!tpl) return;
    if (!activeContentChannel) { showToast('请先选择触达通道'); e.target.value = ''; return; }
    document.getElementById('contentText').value = tpl;
    channelContents[activeContentChannel] = tpl;
  });

  // 保存为模板：显示模板名称输入框
  const tplNameRow = document.getElementById('tplNameRow');
  document.getElementById('saveTplBtn').addEventListener('click', () => {
    const content = document.getElementById('contentText').value.trim();
    if (!activeContentChannel || !content) { showToast('请先输入内容再保存为模板'); return; }
    tplNameRow.hidden = false;
    document.getElementById('tplNameInput').focus();
  });
  document.getElementById('tplNameOk').addEventListener('click', () => {
    const name = document.getElementById('tplNameInput').value.trim();
    if (!name) { showToast('请输入模板名称'); return; }
    tplNameRow.hidden = true;
    document.getElementById('tplNameInput').value = '';
    showToast(`模板「${name}」已保存`);
  });
  document.getElementById('tplNameCancel').addEventListener('click', () => {
    tplNameRow.hidden = true;
    document.getElementById('tplNameInput').value = '';
  });

  // 文案输入实时保存到当前通道
  document.getElementById('contentText').addEventListener('input', saveActiveContent);

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

  // 触达策略配置
  renderStrategyPicker();

  // 确认
  document.getElementById('confirmReach').addEventListener('click', () => {
    saveActiveContent();
    const channels = selectedChannels();
    if (!channels.length) { showToast('请至少选择一个触达通道'); return; }
    const missing = channels.find(c => !(channelContents[c] || '').trim());
    if (missing) { showToast(`请配置「${CHANNEL_LABELS[missing]}」通道的发送内容`); return; }
    closeDrawer('reachDrawer');
    showToast('触达配置已保存');
  });

  refreshIcons();
});

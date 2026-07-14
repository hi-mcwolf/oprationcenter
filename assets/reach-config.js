/* SDK 触达配置抽屉（全局挂载，由 topbar SDK 按钮打开） */

const RC_CHANNEL_LABELS = {
  sms: 'SMS', email: '邮件', push: 'Push',
  viber: 'Viber', telegram: 'Telegram', messenger: 'Messenger',
};

const rcChannelContents = {};
let rcActiveChannel = null;
let rcEditor = null;

function selectedRcChannels() {
  return [...document.querySelectorAll('#channelChips .chip.selected')].map(c => c.dataset.channel);
}

function saveRcActiveContent() {
  if (rcActiveChannel && rcEditor) {
    rcChannelContents[rcActiveChannel] = rcEditor.getValue();
  }
}

function renderRcContentTabs() {
  const channels = selectedRcChannels();
  const tabsHost = document.getElementById('contentTabs');
  const empty = document.getElementById('contentTabsEmpty');
  const editorHost = document.getElementById('contentEditorHost');

  rcEditor?.destroy();
  rcEditor = null;

  if (!channels.length) {
    rcActiveChannel = null;
    tabsHost.innerHTML = '';
    empty.hidden = false;
    editorHost.innerHTML = '';
    return;
  }

  if (!channels.includes(rcActiveChannel)) rcActiveChannel = channels[0];
  empty.hidden = true;

  tabsHost.innerHTML = channels.map(c =>
    `<button type="button" class="tab${c === rcActiveChannel ? ' active' : ''}" data-content-tab="${c}">${RC_CHANNEL_LABELS[c]}</button>`
  ).join('');

  tabsHost.querySelectorAll('[data-content-tab]').forEach(tab => {
    tab.addEventListener('click', () => {
      saveRcActiveContent();
      rcActiveChannel = tab.dataset.contentTab;
      renderRcContentTabs();
    });
  });

  rcEditor = createContentEditor({
    container: editorHost,
    channel: rcActiveChannel,
    value: rcChannelContents[rcActiveChannel],
    showTemplateTools: true,
    onChange: val => { rcChannelContents[rcActiveChannel] = val; },
  });
}

function reachConfigDrawerHtml() {
  return `
  <div class="drawer-root" id="reachDrawer">
    <div class="drawer-mask" data-close></div>
    <aside class="drawer drawer-md">
      <header class="drawer-header">
        <h3>触达配置</h3>
        <button class="icon-btn" data-close aria-label="关闭"><i data-lucide="x"></i></button>
      </header>
      <div class="drawer-body drawer-body--gray">
        <section class="card card-suggest">
          <div class="suggest-head">
            <span class="tag tag-ai"><i data-lucide="sparkles"></i>AI 触达建议</span>
          </div>
          <div class="suggest-meta">
            <div class="meta-item">
              <span class="meta-label">推荐通道</span>
              <span class="tag tag-primary">短信</span>
              <span class="tag tag-primary">Push</span>
            </div>
            <!-- <div class="meta-item">
              <span class="meta-label">发送时机</span>
              <span class="tag">活动开始前</span>
            </div> -->
          </div>
          <div class="suggest-block">
            <div class="suggest-line"><span class="suggest-key">示例文案</span></div>
            <span class="suggest-copy" id="suggestCopy">Only the best teams remain! Warm up for the Quarterfinals with today's FREE World Cup Quiz. Visit bingoplus.com.</span>
          </div>
          <p class="suggest-basis">
            基于 <em>"World Cup Group Stage Quiz"</em> 等任务的 <em>触达率 38.6%</em>
            推荐采用 <em>短信</em> 通道，<!-- 在 <em>活动开始前 2 小时</em>--> 发送 <em>竞猜提醒类内容</em>
          </p>
          <div class="suggest-actions">
            <button type="button" class="btn btn-primary" id="adoptBtn">采纳建议</button>
          </div>
        </section>
        <section class="card">
          <h4 class="card-title">触达通道及内容配置</h4>
          <div class="field">
            <span class="field-label">触达通道</span>
            <div class="chip-group" id="channelChips">
              <button type="button" class="chip" data-channel="sms">SMS</button>
              <button type="button" class="chip" data-channel="email">邮件</button>
              <button type="button" class="chip" data-channel="push">Push</button>
              <button type="button" class="chip" data-channel="viber">Viber</button>
              <button type="button" class="chip" data-channel="telegram">Telegram</button>
              <button type="button" class="chip" data-channel="messenger">Messenger</button>
            </div>
          </div>
          <div class="field">
            <div class="field-label-row">
              <span class="field-label">内容配置</span>
            </div>
            <div class="tabs content-tabs" id="contentTabs"></div>
            <p class="content-tabs-empty" id="contentTabsEmpty">请先在上方选择触达通道，再为每个通道单独配置内容</p>
            <div id="contentEditorHost"></div>
          </div>
          <div class="field">
            <span class="field-label">发送时间</span>
            <div class="radio-group">
              <label><input type="radio" name="sendMode" value="immediate" checked>立即</label>
              <label><input type="radio" name="sendMode" value="scheduled">定时</label>
              <label><input type="radio" name="sendMode" value="cycle">循环</label>
            </div>
            <div class="send-config" id="scheduledConfig" hidden>
              <input type="datetime-local" class="input" id="sendDate" value="2026-07-10T10:00">
            </div>
            <div class="send-config" id="cycleConfig" hidden>
              <select class="select" id="cycleFreq">
                <option value="daily">每天</option>
                <option value="weekly">每周</option>
              </select>
              <select class="select" id="cycleWeekday" hidden>
                <option>周一</option><option>周二</option><option>周三</option>
                <option>周四</option><option>周五</option><option>周六</option><option>周日</option>
              </select>
              <input type="time" class="input" id="cycleTime" value="10:00">
            </div>
          </div>
        </section>
      </div>
      <footer class="drawer-footer">
        <button class="btn btn-outline" data-close>取消</button>
        <button class="btn btn-primary" id="confirmReach">确认</button>
      </footer>
    </aside>
  </div>`;
}

function bindReachConfigEvents() {
  document.querySelectorAll('#channelChips .chip').forEach(chip => {
    chip.addEventListener('click', () => {
      saveRcActiveContent();
      chip.classList.toggle('selected');
      renderRcContentTabs();
    });
  });

  document.getElementById('adoptBtn').addEventListener('click', () => {
    saveRcActiveContent();
    document.querySelectorAll('#channelChips .chip').forEach(chip => {
      chip.classList.toggle('selected', chip.dataset.channel === 'sms');
    });
    const copy = document.getElementById('suggestCopy').textContent.trim();
    rcChannelContents.sms = { text: copy };
    rcActiveChannel = 'sms';
    renderRcContentTabs();
    showToast('已采纳建议：短信通道及示例文案已填入');
  });

  document.querySelectorAll('input[name="sendMode"]').forEach(radio => {
    radio.addEventListener('change', () => {
      const mode = document.querySelector('input[name="sendMode"]:checked').value;
      document.getElementById('scheduledConfig').hidden = mode !== 'scheduled';
      document.getElementById('cycleConfig').hidden = mode !== 'cycle';
    });
  });

  document.getElementById('cycleFreq').addEventListener('change', e => {
    document.getElementById('cycleWeekday').hidden = e.target.value !== 'weekly';
  });

  document.getElementById('confirmReach').addEventListener('click', () => {
    saveRcActiveContent();
    const channels = selectedRcChannels();
    if (!channels.length) { showToast('请至少选择一个触达通道'); return; }
    const missing = channels.find(c => {
      const v = rcChannelContents[c];
      if (!v) return true;
      const summary = contentSummary(v);
      return !summary.trim();
    });
    if (missing) { showToast(`请配置「${RC_CHANNEL_LABELS[missing]}」通道的发送内容`); return; }
    closeDrawer('reachDrawer');
    showToast('触达配置已保存');
  });
}

let rcInitialized = false;

function initReachConfigDrawer() {
  if (rcInitialized) return;
  rcInitialized = true;
  document.body.insertAdjacentHTML('beforeend', reachConfigDrawerHtml());
  bindDrawerClose();
  bindReachConfigEvents();
  refreshIcons();
  initCharCounters(document.getElementById('reachDrawer'));
}

document.addEventListener('DOMContentLoaded', () => {
  initReachConfigDrawer();
});

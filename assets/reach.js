/* 页面二：触达主页 + 新建任务抽屉 */

/* ---------------- 基础数据 ---------------- */
const CHANNELS = {
  sms:      { label: 'SMS',      tip: '短信',     icon: 'message-square' },
  email:    { label: '邮件',     tip: '邮件',     icon: 'mail' },
  push:     { label: 'Push',     tip: 'Push',     icon: 'bell' },
  viber:    { label: 'Viber',    tip: 'Viber',    icon: 'phone-call' },
  telegram: { label: 'Telegram', tip: 'Telegram', icon: 'send' },
  tele:     { label: '电销',     tip: '电销',     icon: 'headphones' },
};

/* 星灵标签（DEMO 数据） */
const AUDIENCES = [
  { id: 'active',  name: '活跃用户',   count: 12800 },
  { id: 'vip',     name: 'VIP用户',    count: 2300 },
  { id: 'newreg',  name: '新注册用户', count: 5600 },
  { id: 'churn',   name: '流失预警用户', count: 1800 },
  { id: 'high',    name: '高充值用户', count: 960 },
  { id: 'silent',  name: '沉默用户',   count: 8400 },
];

const CONTENT_TEMPLATES = [
  { id: 'quiz',     name: '世界杯竞猜提醒', text: "Only the best teams remain! Warm up for the Quarterfinals with today's FREE World Cup Quiz. Visit bingoplus.com." },
  { id: 'recharge', name: '充值优惠通知',   text: '尊敬的用户，本周充值满 500 即享 8% 加赠，活动今晚 24:00 截止，立即打开 App 参与吧！' },
  { id: 'recall',   name: '流失召回话术',   text: '您好，我们注意到您已有一段时间未登录。现为您专属保留了回归礼包，登录即可领取，期待您的回来！' },
];

const WEEKDAYS = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

/* 触达策略选择面板使用的分类（数据来自 strategy-data.js） */
const STRATEGY_PICK_CATEGORIES = ['audience', 'send', 'frequency', 'dnd', 'dedup', 'retry'];

let tasks = [
  { name: '世界杯竞猜预热短信', channel: 'sms',  total: 12800, sent: 9632 },
  { name: '新用户充值召回邮件', channel: 'email', total: 5600,  sent: 2128 },
  { name: 'VIP 流失预警电销',   channel: 'tele',  total: 960,   sent: 384 },
];

/* ---------------- 任务草稿状态 ---------------- */
let draft = null;

function newChannelConfig() {
  return { timing: null, content: '' };
}

function initDraft(channel) {
  draft = {
    name: '',
    productLine: '',
    audienceTags: [],
    audienceFiles: [],
    strategies: [],
    channels: [channel],
    active: channel,
    perChannel: { [channel]: newChannelConfig() },
  };
  document.getElementById('ntName').value = '';
  document.getElementById('ntProductLine').value = '';
  closePanel();
  renderTabs();
  renderRows();
  renderPreview();
}

/* ---------------- 右侧列表区 ---------------- */
function updateGreeting() {
  const h = new Date().getHours();
  const part = h < 11 ? '早上' : h < 14 ? '中午' : '晚上';
  document.getElementById('greeting').textContent = `${part}好，尊敬的 marvin@ 指挥官`;
  document.getElementById('greetSub').innerHTML =
    `您当前共有 <b>${tasks.length}</b> 个任务在执行，您可以点击左侧展示区新建触达任务`;
}

function renderTasks() {
  const host = document.getElementById('taskList');
  host.innerHTML = tasks.map(t => {
    const pct = t.total ? Math.round(t.sent / t.total * 100) : 0;
    return `
      <div class="task-card">
        <div class="task-name">${t.name}<span class="tag">${CHANNELS[t.channel]?.label || ''}</span></div>
        <div class="task-total"><i data-lucide="users"></i>总数 ${t.total.toLocaleString()}</div>
        <div class="task-sent">
          已发送 ${t.sent.toLocaleString()}
          <span class="progress"><span class="progress-inner" style="width:${pct}%"></span></span>
          <span class="pct">${pct}%</span>
        </div>
      </div>`;
  }).join('');
  refreshIcons();
}

/* ---------------- 手机屏幕：时钟与悬浮提示 ---------------- */
function updatePhoneClock() {
  const now = new Date();
  const pad = n => String(n).padStart(2, '0');
  document.getElementById('phoneTime').textContent = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
  document.getElementById('phoneDate').textContent =
    `${now.getMonth() + 1}月${now.getDate()}日 星期${'日一二三四五六'[now.getDay()]}`;
}

function bindPhoneScreen() {
  const screen = document.getElementById('phoneScreen');
  const tip = document.getElementById('cursorTip');

  screen.addEventListener('mousemove', e => {
    const item = e.target.closest('.app-item');
    tip.textContent = item
      ? `点击创建${CHANNELS[item.dataset.channel].tip}`
      : '点击APP图标创建任务';
    tip.style.display = 'block';
    tip.style.left = e.clientX + 'px';
    tip.style.top = e.clientY + 'px';
  });
  screen.addEventListener('mouseleave', () => { tip.style.display = 'none'; });

  screen.querySelectorAll('.app-item').forEach(item => {
    item.addEventListener('click', () => {
      tip.style.display = 'none';
      initDraft(item.dataset.channel);
      openDrawer('taskDrawer');
    });
  });
}

/* ---------------- 通道 Tab ---------------- */
function renderTabs() {
  const host = document.getElementById('ntTabs');
  const remaining = Object.keys(CHANNELS).filter(c => !draft.channels.includes(c));
  host.innerHTML = `
    ${draft.channels.map(c => `
      <button class="tab${c === draft.active ? ' active' : ''}" data-tab="${c}">${CHANNELS[c].tip}</button>
    `).join('')}
    ${remaining.length ? '<button class="tab-add" id="tabAdd" title="添加通道"><i data-lucide="plus"></i></button>' : ''}
  `;

  host.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      draft.active = tab.dataset.tab;
      closePanel();
      renderTabs();
      renderRows();
      renderPreview();
    });
  });

  const addBtn = host.querySelector('#tabAdd');
  if (addBtn) {
    addBtn.addEventListener('click', e => {
      e.stopPropagation();
      const existing = host.querySelector('.popover');
      if (existing) { existing.remove(); return; }
      const pop = document.createElement('div');
      pop.className = 'popover';
      pop.innerHTML = remaining.map(c =>
        `<button class="popover-item" data-add="${c}">${CHANNELS[c].tip}</button>`
      ).join('');
      host.appendChild(pop);
      pop.querySelectorAll('[data-add]').forEach(btn => {
        btn.addEventListener('click', () => {
          const c = btn.dataset.add;
          draft.channels.push(c);
          draft.perChannel[c] = newChannelConfig();
          draft.active = c;
          closePanel();
          renderTabs();
          renderRows();
          renderPreview();
        });
      });
      const closePop = ev => {
        if (!pop.contains(ev.target)) { pop.remove(); document.removeEventListener('click', closePop); }
      };
      setTimeout(() => document.addEventListener('click', closePop));
    });
  }
  refreshIcons();
}

/* ---------------- 配置行展示 ---------------- */
function timingLabel(t) {
  if (!t) return null;
  if (t.type === 'now') return '即时';
  if (t.type === 'scheduled') return `定时 · ${(t.datetime || '').replace('T', ' ')}`;
  if (t.type === 'recurring') {
    return t.freq === 'weekly'
      ? `循环 · 每周${(t.weekday || '周一').replace('周', '')} ${t.time}`
      : `循环 · 每天 ${t.time}`;
  }
  return null;
}

function renderRows() {
  // 人群（星灵标签 + 上传，跨通道共享）
  const av = document.getElementById('audienceValue');
  const parts = [];
  if (draft.audienceTags.length) {
    parts.push(draft.audienceTags.map(id => AUDIENCES.find(a => a.id === id).name).join(' · '));
  }
  if (draft.audienceFiles.length) {
    parts.push(`已上传 ${draft.audienceFiles.length} 个文件`);
  }
  av.innerHTML = parts.length
    ? `<span class="cfg-summary">${parts.join(' ｜ ')}</span>`
    : '<span class="placeholder">请选择人群</span>';

  const cfg = draft.perChannel[draft.active];

  const tv = document.getElementById('timingValue');
  const tl = timingLabel(cfg.timing);
  tv.innerHTML = tl
    ? `<span class="tag tag-primary">${tl}</span>`
    : '<span class="placeholder">请选择发送时机</span>';

  const cv = document.getElementById('contentValue');
  if (cfg.content) {
    const summary = cfg.content.length > 24 ? cfg.content.slice(0, 24) + '…' : cfg.content;
    cv.innerHTML = `<span class="cfg-summary">${summary}</span>`;
  } else {
    cv.innerHTML = '<span class="placeholder">请配置发送内容</span>';
  }

  // 触达策略（跨通道共享）
  const sv = document.getElementById('strategyValue');
  if (draft.strategies.length) {
    const names = draft.strategies.map(id => strategyById(id)?.name).filter(Boolean);
    const summary = names.length > 2 ? `${names.slice(0, 2).join(' · ')} 等 ${names.length} 项` : names.join(' · ');
    sv.innerHTML = `<span class="cfg-summary">${summary}</span>`;
  } else {
    sv.innerHTML = '<span class="placeholder">请选择触达策略</span>';
  }
}

/* ---------------- 左侧预览 ---------------- */
function renderPreview() {
  const host = document.getElementById('ntPreview');
  const ch = draft.active;
  const content = draft.perChannel[ch].content;
  const text = content || '您配置的内容将实时显示在这里…';
  const emptyCls = content ? '' : ' empty';
  const now = new Date();
  const pad = n => String(n).padStart(2, '0');
  const timeStr = `${pad(now.getHours())}:${pad(now.getMinutes())}`;

  let inner = '';
  if (ch === 'sms') {
    inner = `
      <div class="pv-header">
        <div class="pv-avatar"><i data-lucide="message-square"></i></div>
        <div class="pv-sender">106 9013 3***</div>
      </div>
      <div class="pv-bubble${emptyCls}">${text}</div>
      <div class="pv-time-hint">刚刚</div>`;
  } else if (ch === 'email') {
    inner = `
      <div class="pv-mail">
        <div class="pv-mail-row"><span>发件人</span>marketing@bingoplus.com</div>
        <div class="pv-mail-row"><span>主题</span>${draft.name || document.getElementById('ntName').value || '触达通知'}</div>
        <div class="pv-mail-body${emptyCls}">${text}</div>
      </div>`;
  } else if (ch === 'push') {
    inner = `
      <div class="pv-lock-time">
        <div class="t">${timeStr}</div>
        <div class="d">${now.getMonth() + 1}月${now.getDate()}日 星期${'日一二三四五六'[now.getDay()]}</div>
      </div>
      <div class="pv-notify">
        <div class="pv-app-icon"><i data-lucide="bell"></i></div>
        <div>
          <div class="pv-n-title">BingoPlus</div>
          <div class="pv-n-body${emptyCls}">${text}</div>
        </div>
      </div>`;
  } else if (ch === 'viber' || ch === 'telegram') {
    inner = `
      <div class="pv-header">
        <div class="pv-avatar"><i data-lucide="${CHANNELS[ch].icon}"></i></div>
        <div class="pv-sender">BingoPlus 官方 · ${CHANNELS[ch].label}</div>
      </div>
      <div class="pv-bubble${emptyCls}">${text}</div>
      <div class="pv-time-hint">${timeStr}</div>`;
  } else if (ch === 'tele') {
    inner = `
      <div class="pv-call">
        <div class="pv-call-avatar"><i data-lucide="headphones"></i></div>
        <div class="pv-call-num">400 880 1***</div>
        <div class="pv-call-hint">BingoPlus 客户服务 来电中…</div>
        <div class="pv-call-script">
          <span class="sc-label">外呼话术</span>${text}
        </div>
        <div class="pv-call-actions">
          <span class="call-btn decline"><i data-lucide="phone-off"></i></span>
          <span class="call-btn accept"><i data-lucide="phone"></i></span>
        </div>
      </div>`;
  }

  host.innerHTML = `<div class="pv-screen">${inner}</div>`;
  refreshIcons();
}

/* ---------------- 右栏配置面板 ---------------- */
let activePanel = null;
let panelStrategyMselGroup = null;
const CFG_ROWS = ['rowAudience', 'rowTiming', 'rowContent', 'rowStrategy'];

function closePanel() {
  panelStrategyMselGroup?.destroy();
  panelStrategyMselGroup = null;
  activePanel = null;
  document.getElementById('ntPanel').innerHTML =
    '<div class="panel-empty">点击左侧配置项查看详情</div>';
  CFG_ROWS.forEach(id => document.getElementById(id).classList.remove('active'));
}

function openPanel(type) {
  panelStrategyMselGroup?.destroy();
  panelStrategyMselGroup = null;
  activePanel = type;
  CFG_ROWS.forEach(id => document.getElementById(id).classList.remove('active'));

  const panel = document.getElementById('ntPanel');
  if (type === 'audience') {
    document.getElementById('rowAudience').classList.add('active');
    panel.innerHTML = `
      <div class="panel-title">选择人群</div>
      <p class="panel-hint">星灵标签与上传至少选择 1 项</p>

      <div class="field">
        <span class="field-label">星灵标签（可多选）</span>
        <div class="check-list" id="audTagList">
          ${AUDIENCES.map(a => `
            <label class="check-item">
              <input type="checkbox" value="${a.id}" ${draft.audienceTags.includes(a.id) ? 'checked' : ''}>
              ${a.name}<span class="count">${a.count.toLocaleString()} 人</span>
            </label>`).join('')}
        </div>
      </div>

      <div class="field">
        <span class="field-label">上传</span>
        <div class="upload-area">
          <div class="upload-btns">
            <button class="btn btn-outline btn-sm" id="uploadFileBtn"><i data-lucide="file-up"></i>上传文件</button>
            <button class="btn btn-outline btn-sm" id="uploadFolderBtn"><i data-lucide="folder-up"></i>上传文件夹</button>
            <a class="link-btn" id="downloadTplBtn"><i data-lucide="download"></i>模板下载</a>
          </div>
          <input type="file" id="uploadFileInput" accept=".csv,.xlsx,.txt" hidden>
          <input type="file" id="uploadFolderInput" webkitdirectory hidden>
          <ul class="upload-list" id="uploadList"></ul>
        </div>
      </div>

      <div class="panel-actions">
        <button class="btn btn-outline" id="panelCancel">取消</button>
        <button class="btn btn-primary" id="panelOk">确认</button>
      </div>`;

    const pendingFiles = [...draft.audienceFiles];
    const renderUploadList = () => {
      panel.querySelector('#uploadList').innerHTML = pendingFiles.map((f, i) => `
        <li><i data-lucide="file-check-2"></i>${f}<button class="icon-btn" data-rm="${i}"><i data-lucide="x"></i></button></li>
      `).join('');
      panel.querySelectorAll('[data-rm]').forEach(btn => {
        btn.addEventListener('click', () => {
          pendingFiles.splice(Number(btn.dataset.rm), 1);
          renderUploadList();
        });
      });
      refreshIcons();
    };
    renderUploadList();

    const fileInput = panel.querySelector('#uploadFileInput');
    const folderInput = panel.querySelector('#uploadFolderInput');
    panel.querySelector('#uploadFileBtn').addEventListener('click', () => fileInput.click());
    panel.querySelector('#uploadFolderBtn').addEventListener('click', () => folderInput.click());
    fileInput.addEventListener('change', () => {
      [...fileInput.files].forEach(f => pendingFiles.push(f.name));
      fileInput.value = '';
      renderUploadList();
    });
    folderInput.addEventListener('change', () => {
      if (folderInput.files.length) {
        const dir = folderInput.files[0].webkitRelativePath.split('/')[0];
        pendingFiles.push(`${dir}/（${folderInput.files.length} 个文件）`);
      }
      folderInput.value = '';
      renderUploadList();
    });
    panel.querySelector('#downloadTplBtn').addEventListener('click', () => {
      showToast('人群上传模板已开始下载');
    });

    panel.querySelector('#panelOk').addEventListener('click', () => {
      const tags = [...panel.querySelectorAll('#audTagList input:checked')].map(i => i.value);
      if (!tags.length && !pendingFiles.length) {
        showToast('星灵标签与上传至少选择 1 项');
        return;
      }
      draft.audienceTags = tags;
      draft.audienceFiles = pendingFiles;
      closePanel();
      renderRows();
    });
  } else if (type === 'timing') {
    document.getElementById('rowTiming').classList.add('active');
    const t = draft.perChannel[draft.active].timing || {};
    const type0 = t.type || 'now';
    panel.innerHTML = `
      <div class="panel-title">发送时机 · ${CHANNELS[draft.active].tip}</div>
      <div class="field">
        <div class="radio-group">
          <label><input type="radio" name="ntTiming" value="now" ${type0 === 'now' ? 'checked' : ''}>即时</label>
          <label><input type="radio" name="ntTiming" value="scheduled" ${type0 === 'scheduled' ? 'checked' : ''}>定时</label>
          <label><input type="radio" name="ntTiming" value="recurring" ${type0 === 'recurring' ? 'checked' : ''}>循环</label>
        </div>
      </div>
      <div class="send-config" id="ntScheduled" ${type0 !== 'scheduled' ? 'hidden' : ''}>
        <input type="datetime-local" class="input" id="ntDatetime" value="${t.datetime || '2026-07-15T10:00'}">
      </div>
      <div class="send-config" id="ntRecurring" ${type0 !== 'recurring' ? 'hidden' : ''}>
        <select class="select" id="ntFreq">
          <option value="daily" ${t.freq !== 'weekly' ? 'selected' : ''}>每天</option>
          <option value="weekly" ${t.freq === 'weekly' ? 'selected' : ''}>每周</option>
        </select>
        <select class="select" id="ntWeekday" ${t.freq !== 'weekly' ? 'hidden' : ''}>
          ${WEEKDAYS.map(w => `<option ${t.weekday === w ? 'selected' : ''}>${w}</option>`).join('')}
        </select>
        <input type="time" class="input" id="ntTime" value="${t.time || '10:00'}">
      </div>
      <div class="panel-actions">
        <button class="btn btn-outline" id="panelCancel">取消</button>
        <button class="btn btn-primary" id="panelOk">确认</button>
      </div>`;

    panel.querySelectorAll('input[name="ntTiming"]').forEach(r => {
      r.addEventListener('change', () => {
        panel.querySelector('#ntScheduled').hidden = r.value !== 'scheduled';
        panel.querySelector('#ntRecurring').hidden = r.value !== 'recurring';
      });
    });
    panel.querySelector('#ntFreq').addEventListener('change', e => {
      panel.querySelector('#ntWeekday').hidden = e.target.value !== 'weekly';
    });
    panel.querySelector('#panelOk').addEventListener('click', () => {
      const sel = panel.querySelector('input[name="ntTiming"]:checked').value;
      draft.perChannel[draft.active].timing = {
        type: sel,
        datetime: panel.querySelector('#ntDatetime').value,
        freq: panel.querySelector('#ntFreq').value,
        weekday: panel.querySelector('#ntWeekday').value,
        time: panel.querySelector('#ntTime').value,
      };
      closePanel();
      renderRows();
    });
  } else if (type === 'content') {
    document.getElementById('rowContent').classList.add('active');
    const current = draft.perChannel[draft.active].content;
    panel.innerHTML = `
      <div class="panel-title">发送内容 · ${CHANNELS[draft.active].tip}</div>
      <div class="field">
        <div class="field-label-row">
          <span class="field-label">内容编辑</span>
          <div class="field-tools">
            <select class="select select-sm" id="ntTplSelect">
              <option value="">选择模板</option>
              ${CONTENT_TEMPLATES.map(t => `<option value="${t.id}">${t.name}</option>`).join('')}
            </select>
            <button class="btn btn-outline btn-sm" id="ntSaveTplBtn">保存为模板</button>
          </div>
        </div>
        <div class="tpl-name-row" id="ntTplNameRow" hidden>
          <input class="input" id="ntTplNameInput" placeholder="请输入模板名称">
          <button class="btn btn-primary btn-sm" id="ntTplNameOk">保存</button>
          <button class="btn btn-outline btn-sm" id="ntTplNameCancel">取消</button>
        </div>
        <textarea class="textarea" id="ntContent" rows="8" placeholder="请输入发送内容…">${current}</textarea>
      </div>
      <div class="panel-actions">
        <button class="btn btn-outline" id="panelCancel">取消</button>
        <button class="btn btn-primary" id="panelOk">确认</button>
      </div>`;

    const ta = panel.querySelector('#ntContent');
    panel.querySelector('#ntTplSelect').addEventListener('change', e => {
      const tpl = CONTENT_TEMPLATES.find(t => t.id === e.target.value);
      if (tpl) { ta.value = tpl.text; syncLivePreview(ta.value); }
    });
    // 实时同步预览
    ta.addEventListener('input', () => syncLivePreview(ta.value));

    // 保存为模板：显示模板名称文本框
    const tplNameRow = panel.querySelector('#ntTplNameRow');
    panel.querySelector('#ntSaveTplBtn').addEventListener('click', () => {
      if (!ta.value.trim()) { showToast('请先输入内容再保存为模板'); return; }
      tplNameRow.hidden = false;
      panel.querySelector('#ntTplNameInput').focus();
    });
    panel.querySelector('#ntTplNameOk').addEventListener('click', () => {
      const name = panel.querySelector('#ntTplNameInput').value.trim();
      if (!name) { showToast('请输入模板名称'); return; }
      tplNameRow.hidden = true;
      panel.querySelector('#ntTplNameInput').value = '';
      showToast(`模板「${name}」已保存`);
    });
    panel.querySelector('#ntTplNameCancel').addEventListener('click', () => {
      tplNameRow.hidden = true;
      panel.querySelector('#ntTplNameInput').value = '';
    });

    panel.querySelector('#panelOk').addEventListener('click', () => {
      draft.perChannel[draft.active].content = ta.value.trim();
      closePanel();
      renderRows();
      renderPreview();
    });
  } else if (type === 'strategy') {
    document.getElementById('rowStrategy').classList.add('active');
    panel.innerHTML = `
      <div class="panel-title">触达策略</div>
      <p class="panel-hint">选择在「触达策略」页面配置的策略规则，每个类型可多选</p>
      <div id="panelStrategyMsel"></div>
      <div class="panel-actions">
        <button class="btn btn-outline" id="panelCancel">取消</button>
        <button class="btn btn-primary" id="panelOk">确认</button>
      </div>`;

    panelStrategyMselGroup = createStrategyMultiSelectGroup({
      container: panel.querySelector('#panelStrategyMsel'),
      categoryIds: STRATEGY_PICK_CATEGORIES,
      selected: draft.strategies,
    });

    panel.querySelector('#panelOk').addEventListener('click', () => {
      draft.strategies = panelStrategyMselGroup.getValue();
      closePanel();
      renderRows();
    });
  }

  panel.querySelector('#panelCancel').addEventListener('click', () => {
    closePanel();
    renderPreview();
  });
  enhanceSelects(panel);
  refreshIcons();
}

function syncLivePreview(text) {
  const saved = draft.perChannel[draft.active].content;
  draft.perChannel[draft.active].content = text;
  renderPreview();
  draft.perChannel[draft.active].content = saved;
}

/* ---------------- 创建任务 ---------------- */
function createTask() {
  const name = document.getElementById('ntName').value.trim();
  if (!name) { showToast('请输入任务名称'); return; }
  if (!document.getElementById('ntProductLine').value) { showToast('请选择产品线'); return; }
  if (!draft.audienceTags.length && !draft.audienceFiles.length) { showToast('请选择人群（星灵标签或上传至少 1 项）'); return; }
  const missing = draft.channels.find(c => !draft.perChannel[c].timing || !draft.perChannel[c].content);
  if (missing) {
    showToast(`请完成「${CHANNELS[missing].tip}」通道的时机与内容配置`);
    return;
  }

  const total = draft.audienceTags.reduce((sum, id) => sum + AUDIENCES.find(a => a.id === id).count, 0)
    + draft.audienceFiles.length * 1000;
  draft.channels.forEach(c => {
    tasks.unshift({ name: `${name}`, channel: c, total, sent: 0 });
  });

  renderTasks();
  updateGreeting();
  closeDrawer('taskDrawer');
  showToast('任务创建成功');
}

/* ---------------- 初始化 ---------------- */
document.addEventListener('DOMContentLoaded', () => {
  renderSidebar('reach', 'reach-task');
  renderTopbar();
  bindDrawerClose();
  updateGreeting();
  renderTasks();
  updatePhoneClock();
  setInterval(updatePhoneClock, 30 * 1000);
  bindPhoneScreen();

  document.getElementById('rowAudience').addEventListener('click', () => openPanel('audience'));
  document.getElementById('rowTiming').addEventListener('click', () => openPanel('timing'));
  document.getElementById('rowContent').addEventListener('click', () => openPanel('content'));
  document.getElementById('rowStrategy').addEventListener('click', () => openPanel('strategy'));
  document.getElementById('ntName').addEventListener('input', () => {
    if (draft && draft.active === 'email') renderPreview();
  });
  document.getElementById('createTaskBtn').addEventListener('click', createTask);

  refreshIcons();
});

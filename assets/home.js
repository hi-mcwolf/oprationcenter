/* 运营中心首页 */

const REACH_TASKS_MOCK = [
  '世界杯竞猜预热短信（SMS，发送中，进度 75%）',
  '新用户充值召回邮件（邮件，发送中，进度 38%）',
  'VIP 沉默用户 Push 召回（Push，发送中，进度 52%）',
];

function updateHomeGreeting() {
  const el = document.getElementById('homeGreeting');
  if (!el) return;
  const h = new Date().getHours();
  const part = h < 11 ? '早上' : h < 14 ? '中午' : '晚上';
  el.textContent = `${part}好，尊敬的 marvin@ 指挥官！`;
}

function openHomeNewTask() {
  if (typeof initDraft !== 'function') return;
  initDraft('sms');
  openDrawer('taskDrawer');
  initCharCounters(document.getElementById('taskDrawer'));
  refreshIcons();
}

function formatHomeTime() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function appendReachTasksReply() {
  const feed = document.querySelector('.home-feed-scroll');
  if (!feed || document.getElementById('reachTasksReply')) return;

  const article = document.createElement('article');
  article.className = 'oc-msg';
  article.id = 'reachTasksReply';
  article.innerHTML = `
    <div class="oc-msg-avatar"><i data-lucide="rocket"></i></div>
    <div class="oc-msg-body">
      <div class="oc-msg-head">
        <span class="oc-msg-name">Mothership</span>
        <time>${formatHomeTime()}</time>
      </div>
      <div class="oc-msg-bubble">
        <p><strong>当前共有 3 个触达在执行：</strong></p>
        <ul class="oc-strategy-list">
          ${REACH_TASKS_MOCK.map(item => `<li>&gt; ${item}</li>`).join('')}
        </ul>
      </div>
    </div>
  `;
  feed.appendChild(article);
  article.scrollIntoView({ behavior: 'smooth', block: 'end' });
  if (typeof refreshIcons === 'function') refreshIcons();
}

function bindHomeActions() {
  document.querySelectorAll('[data-oc-action]').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const action = link.dataset.ocAction;
      if (action === '新建' || action === '配置触达') {
        openHomeNewTask();
        return;
      }
      if (action === '查看触达执行') {
        appendReachTasksReply();
        return;
      }
      showToast(`${action}（原型占位）`);
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  renderSidebar('ops', 'home');
  renderTopbar('ops');
  bindDrawerClose();
  updateHomeGreeting();
  bindHomeActions();
  if (typeof refreshIcons === 'function') refreshIcons();
});

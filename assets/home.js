/* 运营中心首页 */

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

function bindHomeActions() {
  document.getElementById('homeNewBtn')?.addEventListener('click', openHomeNewTask);

  document.querySelectorAll('[data-oc-action]').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      if (link.dataset.ocAction === '新建') {
        openHomeNewTask();
        return;
      }
      showToast(`${link.dataset.ocAction}（原型占位）`);
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  renderSidebar('home');
  renderTopbar();
  bindDrawerClose();
  updateHomeGreeting();
  bindHomeActions();
  if (typeof refreshIcons === 'function') refreshIcons();
});

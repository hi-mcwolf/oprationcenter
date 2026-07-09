/* 公共逻辑：顶部导航渲染、抽屉开关、Toast */

const NAV_ITEMS = [
  { key: 'home', label: '首页', href: 'index.html' },
  { key: 'lifecycle', label: '生命周期经营', href: 'javascript:;' },
  { key: 'content', label: '内容管理', href: 'javascript:;' },
  { key: 'marketing', label: '营销', href: 'marketing.html' },
  { key: 'reach', label: '触达', href: 'reach.html' },
  { key: 'decorate', label: '页面装修', href: 'javascript:;' },
  { key: 'compliance', label: '合规配置', href: 'javascript:;' },
];

function renderTopNav(activeKey) {
  const host = document.getElementById('topNav');
  if (!host) return;
  host.className = 'top-nav';
  host.innerHTML = `
    <div class="brand"><i data-lucide="layout-grid"></i>运营中心</div>
    <nav class="nav-items">
      ${NAV_ITEMS.map(item => `
        <a class="nav-item${item.key === activeKey ? ' active' : ''}" href="${item.href}">${item.label}</a>
      `).join('')}
    </nav>
    <div class="nav-user"><span class="avatar">M</span>marvin@</div>
  `;
}

/* ---- 抽屉 ---- */
function openDrawer(id) {
  const root = document.getElementById(id);
  if (!root) return;
  root.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeDrawer(id) {
  const root = document.getElementById(id);
  if (!root) return;
  root.classList.remove('open');
  if (!document.querySelector('.drawer-root.open')) {
    document.body.style.overflow = '';
  }
}

function bindDrawerClose() {
  document.querySelectorAll('.drawer-root').forEach(root => {
    root.querySelectorAll('[data-close]').forEach(el => {
      el.addEventListener('click', () => closeDrawer(root.id));
    });
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.drawer-root.open').forEach(root => closeDrawer(root.id));
    }
  });
}

/* ---- Toast ---- */
let toastTimer = null;
function showToast(msg) {
  let el = document.querySelector('.toast');
  if (!el) {
    el = document.createElement('div');
    el.className = 'toast';
    document.body.appendChild(el);
  }
  el.textContent = msg;
  requestAnimationFrame(() => el.classList.add('show'));
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2000);
}

/* ---- Lucide 图标刷新 ---- */
function refreshIcons() {
  if (window.lucide) lucide.createIcons();
}

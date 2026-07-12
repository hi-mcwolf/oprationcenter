/* 公共逻辑：左侧伸缩菜单渲染、抽屉开关、Toast */

const NAV_ITEMS = [
  { key: 'home', label: '首页', icon: 'house', href: 'index.html' },
  {
    key: 'lifecycle', label: '生命周期经营', icon: 'repeat',
    children: [
      { key: 'lifecycle-tier', label: '用户分层', href: 'javascript:;' },
      { key: 'lifecycle-journey', label: '生命周期旅程', href: 'javascript:;' },
    ],
  },
  {
    key: 'content', label: '内容管理', icon: 'folder-open',
    children: [
      { key: 'content-assets', label: '素材库', href: 'javascript:;' },
      { key: 'content-review', label: '内容审核', href: 'javascript:;' },
    ],
  },
  {
    key: 'marketing', label: '营销', icon: 'megaphone',
    children: [
      { key: 'marketing-campaign', label: '营销活动', href: 'marketing.html' },
      { key: 'marketing-calendar', label: '营销日历', href: 'javascript:;' },
    ],
  },
  {
    key: 'reach', label: '触达', icon: 'send',
    children: [
      { key: 'reach-task', label: '触达任务', href: 'reach.html' },
      { key: 'reach-task-records', label: '任务记录', href: 'task-records.html' },
      { key: 'reach-send-records', label: '发送记录', href: 'send-records.html' },
      { key: 'reach-template', label: '模板管理', href: 'templates.html' },
      { key: 'reach-strategy', label: '触达策略', href: 'strategy.html' },
      { key: 'reach-stats', label: '数据统计', href: 'stats.html' },
    ],
  },
  {
    key: 'decorate', label: '页面装修', icon: 'layout-template',
    children: [
      { key: 'decorate-page', label: '页面模板', href: 'javascript:;' },
      { key: 'decorate-widget', label: '组件市场', href: 'javascript:;' },
    ],
  },
  {
    key: 'compliance', label: '合规配置', icon: 'shield-check',
    children: [
      { key: 'compliance-rule', label: '合规规则', href: 'javascript:;' },
      { key: 'compliance-audit', label: '审计日志', href: 'javascript:;' },
    ],
  },
];

function renderSidebar(activeKey, activeSubKey) {
  const host = document.getElementById('sidebar');
  if (!host) return;
  host.className = 'sidebar';
  host.innerHTML = `
    <div class="sb-brand"><i data-lucide="layout-grid"></i>Digiplus</div>
    <nav class="sb-menu">
      ${NAV_ITEMS.map(item => {
        if (!item.children) {
          return `<a class="sb-item${item.key === activeKey ? ' active' : ''}" href="${item.href}">
            <i data-lucide="${item.icon}"></i>${item.label}
          </a>`;
        }
        const isActive = item.key === activeKey;
        return `
          <div class="menu-group${isActive ? ' open' : ''}" data-group="${item.key}">
            <button class="sb-item sb-toggle${isActive ? ' active' : ''}">
              <i data-lucide="${item.icon}"></i>${item.label}
              <i data-lucide="chevron-down" class="chev"></i>
            </button>
            <div class="submenu">
              ${item.children.map(sub => `
                <a class="sub-item${sub.key === activeSubKey ? ' active' : ''}" href="${sub.href}">${sub.label}</a>
              `).join('')}
            </div>
          </div>`;
      }).join('')}
    </nav>
  `;

  // 点击一级菜单伸缩子菜单（手风琴：展开一项时收起其他项）
  host.querySelectorAll('.sb-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const group = btn.closest('.menu-group');
      const willOpen = !group.classList.contains('open');
      host.querySelectorAll('.menu-group.open').forEach(g => g.classList.remove('open'));
      group.classList.toggle('open', willOpen);
    });
  });
}

function renderTopbar() {
  const host = document.getElementById('topbar');
  if (!host) return;
  host.className = 'topbar';
  host.innerHTML = `
    <nav class="topbar-menu">
      <a class="topbar-item active" href="javascript:;">运营中心</a>
    </nav>
    <div class="topbar-user"><span class="avatar">M</span>marvin@</div>
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

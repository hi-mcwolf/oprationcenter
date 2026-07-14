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

const PRODUCT_LINES = [
  { value: 'BP-VIP', label: 'BP-VIP' },
  { value: 'BP-CONTENT OPERATION CENTER', label: 'BP-CONTENT OPERATION CENTER' },
  { value: 'BingoPlus', label: 'BingoPlus' },
];

const USER_ACCOUNT_SAMPLES = [
  'bingoplusjuan01', 'bingoplusmaria02', 'bingopluskevin03',
  'bingoplusana04', 'bingopluspaolo05', 'bingoplusgrace06',
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
    <div class="topbar-actions">
      <button class="btn btn-outline btn-sm" id="sdkBtn" type="button">SDK</button>
      <div class="topbar-user"><span class="avatar">M</span>marvin@</div>
    </div>
  `;
  const sdkBtn = host.querySelector('#sdkBtn');
  if (sdkBtn && !sdkBtn.dataset.bound) {
    sdkBtn.dataset.bound = '1';
    sdkBtn.addEventListener('click', () => {
      if (typeof initReachConfigDrawer === 'function') initReachConfigDrawer();
      openDrawer('reachDrawer');
    });
  }
}

function tipIcon(tipText) {
  return `<span class="tip-icon" data-tip="${tipText.replace(/"/g, '&quot;')}"><i data-lucide="help-circle"></i></span>`;
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

/* ---- 字符数计数 ---- */
function shouldAttachCharCounter(el) {
  if (el.dataset.charCount === 'off') return false;
  if (el.closest('.filter-card')) return false;
  if (el.matches('.ssel-search, .msel-search')) return false;
  if (el.tagName === 'INPUT') {
    const type = (el.getAttribute('type') || 'text').toLowerCase();
    if (type !== 'text' && type !== 'search') return false;
  }
  if (el.hidden) return false;
  if (el.closest('[hidden]')) return false;
  return true;
}

function getCharMax(el) {
  if (el.dataset.charMax) return Number(el.dataset.charMax);
  const ml = el.getAttribute('maxlength');
  if (ml && ml !== '-1') return Number(ml);
  return null;
}

function formatCharCount(len, max) {
  if (max != null && !Number.isNaN(max)) return `字数：${len} / ${max}`;
  return `字数：${len}`;
}

function updateCharCounterEl(el, counter) {
  const len = el.value?.length ?? 0;
  const max = getCharMax(el);
  counter.textContent = formatCharCount(len, max);
  counter.classList.toggle('over', max != null && len > max);
  const wrap = el.closest('.input-char-wrap');
  if (wrap) wrap.classList.toggle('input-char-wrap--has-max', max != null && !Number.isNaN(max));
}

function ensureCharCounterWrap(el) {
  let wrap = el.parentElement;
  if (wrap?.classList.contains('input-char-wrap')) return wrap;

  const orphanCounter = el.nextElementSibling?.classList.contains('char-counter')
    || el.nextElementSibling?.classList.contains('char-count')
    ? el.nextElementSibling : null;

  wrap = document.createElement('div');
  wrap.className = 'input-char-wrap';
  if (el.classList.contains('input-sm')) wrap.classList.add('input-char-wrap--sm');
  el.parentNode.insertBefore(wrap, el);
  wrap.appendChild(el);
  if (orphanCounter) {
    orphanCounter.classList.remove('char-count');
    orphanCounter.classList.add('char-counter');
    wrap.appendChild(orphanCounter);
  }
  return wrap;
}

function getOrCreateCounter(wrap) {
  let counter = wrap.querySelector(':scope > .char-counter');
  if (!counter) {
    counter = document.createElement('span');
    counter.className = 'char-counter';
    wrap.appendChild(counter);
  }
  return counter;
}

function initCharCounters(root = document) {
  root.querySelectorAll('input[type="text"], input:not([type]), textarea').forEach(el => {
    if (!shouldAttachCharCounter(el)) return;

    const wrap = ensureCharCounterWrap(el);
    const counter = getOrCreateCounter(wrap);
    updateCharCounterEl(el, counter);

    if (!el.dataset.charCountBound) {
      el.dataset.charCountBound = '1';
      el.addEventListener('input', () => updateCharCounterEl(el, counter));
    }
  });
}

document.addEventListener('DOMContentLoaded', () => initCharCounters());

/* ---- 更多操作菜单（挂到 body，避免被表格 overflow / sticky 裁切） ---- */
let floatingMoreMenu = null;

function ensureFloatingMoreMenu() {
  if (floatingMoreMenu?.isConnected) return floatingMoreMenu;
  floatingMoreMenu = document.createElement('div');
  floatingMoreMenu.className = 'more-menu more-menu--fixed';
  floatingMoreMenu.hidden = true;
  floatingMoreMenu.addEventListener('click', e => e.stopPropagation());
  document.body.appendChild(floatingMoreMenu);
  return floatingMoreMenu;
}

function closeAllMoreMenus() {
  if (floatingMoreMenu) {
    floatingMoreMenu.hidden = true;
    floatingMoreMenu.innerHTML = '';
    floatingMoreMenu.dataset.for = '';
    floatingMoreMenu.style.cssText = '';
  }
  document.querySelectorAll('.more-wrap .more-menu').forEach(m => { m.hidden = true; });
}

function positionMoreMenu(btn, menu) {
  const rect = btn.getBoundingClientRect();
  menu.classList.add('more-menu--fixed');
  menu.style.position = 'fixed';
  menu.style.visibility = 'hidden';
  menu.style.left = '0px';
  menu.style.top = '0px';
  menu.style.right = 'auto';
  menu.style.zIndex = '1000';

  const mw = menu.offsetWidth || 140;
  const mh = menu.offsetHeight || 0;
  let left = rect.right - mw;
  left = Math.min(Math.max(8, left), window.innerWidth - mw - 8);
  let top = rect.bottom + 4;
  if (top + mh > window.innerHeight - 8) {
    top = Math.max(8, rect.top - mh - 4);
  }

  menu.style.left = `${left}px`;
  menu.style.top = `${top}px`;
  menu.style.visibility = 'visible';
}

function toggleMoreMenu(btn) {
  const source = btn.closest('.more-wrap')?.querySelector('.more-menu');
  if (!source) return;
  const menu = ensureFloatingMoreMenu();
  const opening = menu.hidden || menu.dataset.for !== btn.dataset.more;
  closeAllMoreMenus();
  if (!opening) return;

  menu.innerHTML = source.innerHTML;
  menu.dataset.for = btn.dataset.more;
  menu.hidden = false;
  positionMoreMenu(btn, menu);

  menu.querySelectorAll('.more-item').forEach(item => {
    item.addEventListener('click', () => {
      const act = item.dataset.act;
      const id = item.dataset.id;
      const orig = source.querySelector(`.more-item[data-act="${act}"][data-id="${id}"]`)
        || source.querySelector(`.more-item[data-act="${act}"]`);
      closeAllMoreMenus();
      orig?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
  });
}

function bindMoreMenus(root = document) {
  root.querySelectorAll('[data-more]').forEach(btn => {
    if (btn.dataset.moreBound) return;
    btn.dataset.moreBound = '1';
    btn.addEventListener('click', e => {
      e.stopPropagation();
      toggleMoreMenu(btn);
    });
  });
}

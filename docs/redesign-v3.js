(() => {
  'use strict';
  const root = document.documentElement;
  const themeToggle = document.querySelector('.theme-toggle');
  const motionToggle = document.querySelector('.motion-toggle');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const readPreference = (name) => { try { return localStorage.getItem(name); } catch { return null; } };
  const savePreference = (name, value) => { try { localStorage.setItem(name, value); } catch {} };

  const setTheme = (theme) => {
    root.dataset.theme = theme;
    const isDark = theme === 'dark';
    themeToggle.setAttribute('aria-pressed', String(isDark));
    themeToggle.setAttribute('aria-label', isDark ? '切换浅色模式' : '切换深色模式');
    themeToggle.title = isDark ? '切换浅色模式' : '切换深色模式';
  };
  setTheme(readPreference('yhong386-prototype-theme') === 'dark' ? 'dark' : 'light');
  themeToggle.addEventListener('click', () => {
    const theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    setTheme(theme);
    savePreference('yhong386-prototype-theme', theme);
  });

  const hero = document.querySelector('.hero');
  let heroPointerFrame = 0;
  let heroPointer = null;
  const resetHeroPointer = () => {
    cancelAnimationFrame(heroPointerFrame);
    heroPointerFrame = 0;
    heroPointer = null;
    hero.style.setProperty('--px', '0px');
    hero.style.setProperty('--py', '0px');
    hero.style.setProperty('--hero-hover', '0');
    hero.style.setProperty('--hero-pointer-x', '50%');
    hero.style.setProperty('--hero-pointer-y', '35%');
  };
  const setMotion = (enabled) => {
    enabled = enabled && !reducedMotion.matches;
    root.dataset.motion = enabled ? 'on' : 'off';
    motionToggle.setAttribute('aria-pressed', String(enabled));
    motionToggle.setAttribute('aria-label', enabled ? '关闭动态效果' : '开启动效');
    if (!enabled) resetHeroPointer();
  };
  const savedMotion = readPreference('yhong386-prototype-motion');
  setMotion(!reducedMotion.matches && savedMotion !== 'off');
  motionToggle.addEventListener('click', () => {
    const enabled = root.dataset.motion !== 'on';
    setMotion(enabled);
    savePreference('yhong386-prototype-motion', enabled ? 'on' : 'off');
  });
  reducedMotion.addEventListener('change', () => setMotion(!reducedMotion.matches && readPreference('yhong386-prototype-motion') !== 'off'));
  hero.addEventListener('pointermove', (event) => {
    if (root.dataset.motion !== 'on' || event.pointerType === 'touch' || reducedMotion.matches) return;
    heroPointer = { x: event.clientX, y: event.clientY };
    if (heroPointerFrame) return;
    heroPointerFrame = requestAnimationFrame(() => {
      heroPointerFrame = 0;
      if (!heroPointer || root.dataset.motion !== 'on' || reducedMotion.matches) return;
      const rect = hero.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const x = Math.max(0, Math.min(1, (heroPointer.x - rect.left) / rect.width));
      const y = Math.max(0, Math.min(1, (heroPointer.y - rect.top) / rect.height));
      hero.style.setProperty('--px', `${((x - .5) * 28).toFixed(2)}px`);
      hero.style.setProperty('--py', `${((y - .5) * 18).toFixed(2)}px`);
      hero.style.setProperty('--hero-pointer-x', `${(x * 100).toFixed(2)}%`);
      hero.style.setProperty('--hero-pointer-y', `${(y * 100).toFixed(2)}%`);
      hero.style.setProperty('--hero-hover', '1');
    });
  });
  hero.addEventListener('pointerleave', resetHeroPointer);

  document.querySelectorAll('.flow-card').forEach(card => {
    card.addEventListener('pointermove', (event) => {
      if (root.dataset.motion !== 'on' || event.pointerType === 'touch') return;
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--pointer-x', `${event.clientX - rect.left}px`);
      card.style.setProperty('--pointer-y', `${event.clientY - rect.top}px`);
      card.style.setProperty('--spotlight', '1');
    });
    card.addEventListener('pointerleave', () => card.style.setProperty('--spotlight', '0'));
  });

  const techItems = Array.from(document.querySelectorAll('.tech-item'));
  const filters = Array.from(document.querySelectorAll('.stack-filters button'));
  const techDetail = document.querySelector('.tech-detail');
  let activeFilter = 'all';
  const defaultDetail = () => {
    techDetail.textContent = activeFilter === 'all' ? '轻触图标，看看我的工具箱。' : `已聚焦 ${filters.find(button => button.dataset.filter === activeFilter).textContent} 技术。`;
    const hint = document.createElement('span');
    hint.textContent = '12 TOOLS / ALWAYS EXPLORING';
    techDetail.append(hint);
  };
  filters.forEach(button => button.addEventListener('click', () => {
    activeFilter = button.dataset.filter;
    filters.forEach(filter => {
      const active = filter === button;
      filter.classList.toggle('active', active);
      filter.setAttribute('aria-pressed', String(active));
    });
    techItems.forEach(item => {
      const relevant = activeFilter === 'all' || item.dataset.categories.split(' ').includes(activeFilter);
      item.classList.toggle('dimmed', !relevant);
      item.disabled = !relevant;
      item.setAttribute('aria-pressed', 'false');
    });
    document.querySelectorAll('.stack-line').forEach(line => line.classList.toggle('dimmed', activeFilter !== 'all' && line.dataset.group !== activeFilter));
    defaultDetail();
  }));
  techItems.forEach((item, index) => {
    item.addEventListener('click', () => {
      techItems.forEach(other => other.setAttribute('aria-pressed', String(other === item)));
      techDetail.textContent = item.dataset.description;
    });
    item.addEventListener('pointerenter', () => {
      if (root.dataset.motion !== 'on' || item.disabled) return;
      [techItems[index - 1], techItems[index + 1]].filter(Boolean).forEach(neighbor => neighbor.classList.add('neighbor'));
    });
    item.addEventListener('pointerleave', () => techItems.forEach(other => other.classList.remove('neighbor')));
  });

  const identityModes = {
    code: { role: '"Full-stack Dev"', loves: '"Build & Create"', description: '全栈开发，关注工程质量与产品体验。' },
    anime: { role: '"Anime Enthusiast"', loves: '"Stories & Worlds"', description: '喜欢二次元，也认真体验每一个幻想世界。' },
    game: { role: '"Hardcore Gamer"', loves: '"One More Level"', description: '深度游戏玩家，在游玩与探索中收集灵感。' }
  };
  document.querySelectorAll('.identity-modes button').forEach(button => button.addEventListener('click', () => {
    document.querySelectorAll('.identity-modes button').forEach(item => {
      const active = item === button;
      item.classList.toggle('active', active);
      item.setAttribute('aria-pressed', String(active));
    });
    const content = identityModes[button.dataset.mode];
    document.querySelector('.mode-value').textContent = content.role;
    document.querySelector('.mode-love').textContent = content.loves;
    document.querySelector('.mode-description').textContent = content.description;
  }));

  const artDialog = document.querySelector('.art-dialog');
  const worldDialog = document.querySelector('.world-dialog');
  document.querySelector('.image-expand').addEventListener('click', () => artDialog.showModal());
  const worldContent = {
    code: { title: 'Full-stack', copy: '目前从事全栈开发工作，关注工程质量与产品体验。使用 Java / Spring 构建服务，也使用 Vue / React 完成前端体验。', href: 'https://yhong386.com', link: '看看我的开发笔记' },
    ai: { title: 'AI & Automation', copy: '探索 AI Agent、Prompt Engineering 与自动化工作流。技术栈包含 Agent、Dify，让有趣的想法变成实用的自动化实践。', href: 'https://yhong386.com', link: '看看我的 AI 探索' },
    games: { title: 'Anime & Games', copy: '重度二次元，深度游戏玩家。认真体验每一个动画与游戏世界，也在个人博客记录二次元与游戏生活。', href: 'https://steamcommunity.com/id/yhong386/', link: '在 Steam 上找到我' }
  };
  document.querySelectorAll('[data-world]').forEach(button => button.addEventListener('click', () => {
    const content = worldContent[button.dataset.world];
    worldDialog.querySelector('h2').textContent = content.title;
    worldDialog.querySelector('.world-dialog-copy').textContent = content.copy;
    const link = worldDialog.querySelector('.world-dialog-link');
    link.href = content.href;
    link.firstChild.textContent = `${content.link} `;
    worldDialog.showModal();
  }));
  document.querySelectorAll('dialog').forEach(dialog => {
    dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => {
      if (event.target !== dialog) return;
      const rect = dialog.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
    });
  });

  const copyEmail = document.querySelector('.copy-email');
  const copyFeedback = document.querySelector('.copy-feedback');
  const fallbackCopy = (text) => {
    const field = document.createElement('textarea');
    field.value = text;
    field.style.cssText = 'position:fixed;left:-9999px;top:0';
    document.body.append(field);
    field.select();
    const copied = document.execCommand('copy');
    field.remove();
    copyEmail.focus({ preventScroll: true });
    return copied;
  };
  copyEmail.addEventListener('click', async () => {
    let copied = false;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText('zhazhiji4@163.com');
        copied = true;
      } else copied = fallbackCopy('zhazhiji4@163.com');
    } catch { try { copied = fallbackCopy('zhazhiji4@163.com'); } catch {} }
    copyFeedback.textContent = copied ? '已复制 zhazhiji4@163.com' : '邮箱：zhazhiji4@163.com';
  });

  const navLinks = Array.from(document.querySelectorAll('.section-nav a'));
  navLinks.forEach(link => link.addEventListener('click', () => navLinks.forEach(other => other.classList.toggle('selected', other === link))));
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      const current = entries.filter(entry => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
      if (!current) return;
      navLinks.forEach(link => link.classList.toggle('selected', link.hash === `#${current.target.id}`));
    }, { rootMargin: '-8% 0px -65% 0px', threshold: 0 });
    navLinks.forEach(link => { const heading = document.querySelector(link.hash); if (heading) observer.observe(heading); });
  }
  const progress = document.querySelector('.reading-progress > span');
  const backToTop = document.querySelector('.back-to-top');
  let scrollScheduled = false;
  const updateScrollDetails = () => {
    const maximum = document.documentElement.scrollHeight - innerHeight;
    progress.style.width = `${maximum > 0 ? Math.min(100, scrollY / maximum * 100) : 0}%`;
    backToTop.hidden = scrollY < 500;
    scrollScheduled = false;
  };
  window.addEventListener('scroll', () => {
    if (scrollScheduled) return;
    scrollScheduled = true;
    requestAnimationFrame(updateScrollDetails);
  }, { passive: true });
  window.addEventListener('resize', updateScrollDetails, { passive: true });
  updateScrollDetails();
  backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reducedMotion.matches ? 'instant' : 'smooth' }));
})();

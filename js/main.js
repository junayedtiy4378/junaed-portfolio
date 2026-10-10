(async function () {
  'use strict';
  // Prefer the managed JSON content; the bundled data.js is a local/offline fallback.
  let data = window.PORTFOLIO_DATA;
  try {
    const response = await fetch('content/portfolio.json', {cache:'no-store'});
    if (response.ok) data = await response.json();
  } catch (_) { /* file:// and offline viewing use bundled content */ }
  if (!data) return;
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => Array.from(root.querySelectorAll(s));
  const safe = value => String(value == null ? '' : value).replace(/[&<>"']/g, chr => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[chr]));
  const externalLink = url => /^https:\/\//i.test(url);
  const s = value => safe(value);
  $('#year').textContent = new Date().getFullYear();
  $('#availability-label').textContent = data.profile.availability;

  // Managed content: every text block below can be changed in /admin.
  const p = data.profile || {};
  const text = (selector,value) => {const el=$(selector); if(el && value!==undefined && value!==null)el.textContent=String(value);};
  const html = (selector,value) => {const el=$(selector);if(el)el.innerHTML=value;};
  const trustedHref = url => (/^https:\/\/[^\s"'<>]+$/i.test(url||'') || /^mailto:[^\s"'<>]+$/i.test(url||'')) ? url : '#';
  text('.brand-name',p.name);
  const brand=$('.brand-name'); if(brand)brand.innerHTML=s(p.name)+ '<small>Research · Engineering</small>';
  text('#hero-greeting',p.name);
  text('#hero-lead',p.heroLead);
  text('#hero-highlight',p.heroHighlight);
  text('.hero-subtitle',p.heroSubtitle);
  text('.hero-description',p.heroDescription);
  text('#hero-location',p.location);
  text('#hero-semester',`${p.semester||''} semester · BSc in CSE`);
  text('#hero-professional-role',p.role);
  text('#metric-semester',p.semester);
  text('#metric-credits',p.credits);
  text('#about-current',p.aboutCurrently);
  text('#about-lead',p.aboutLead);
  text('#about-p1',p.aboutParagraph1);
  text('#about-p2',p.aboutParagraph2);
  html('.about-tags',(p.aboutTags||[]).map(tag=>`<span>${s(tag)}</span>`).join(''));
  const avatar=$('.avatar-emblem');
  if(avatar && /^(https:\/\/|\/?assets\/uploads\/)/i.test(p.avatarImage||'')) {
    avatar.classList.add('has-photo'); avatar.innerHTML=`<img src="${s(p.avatarImage)}" alt="Portrait of ${s(p.name)}" loading="lazy">`;
  }
  text('#education-semester',p.semester);
  text('#education-credits',p.credits);
  text('#education-graduation',p.graduation);
  text('#contact-description',p.contactDescription);
  text('#footer-tagline',p.footerTagline);
  text('#footer-name',p.name);
  text('#contact-email-text',p.email);
  const emailLink=$('#contact-email-link'); if(emailLink)emailLink.href=/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(p.email||'')?'mailto:'+p.email:'#contact';
  const profileLinkedin=$('#profile-linkedin');if(profileLinkedin)profileLinkedin.href=trustedHref(p.linkedin);
  const contactLinkedin=$('#contact-linkedin');if(contactLinkedin)contactLinkedin.href=trustedHref(p.linkedin);
  const contactGithub=$('#contact-github');if(contactGithub)contactGithub.href=trustedHref(p.github);
  const bannerGithub=$('#banner-github');if(bannerGithub)bannerGithub.href=trustedHref(p.github)+'?tab=repositories';
  const footerGithub=$('#footer-github');if(footerGithub)footerGithub.href=trustedHref(p.github);
  const footerLinkedin=$('#footer-linkedin');if(footerLinkedin)footerLinkedin.href=trustedHref(p.linkedin);
  document.title=`${p.name||'Portfolio'} — LLM Research & Software Engineering`;
  const r=data.research||{};
  text('#research-status',r.status);
  text('#research-title',r.title);
  text('#research-description',r.description);
  text('#research-note',r.note);
  html('.research-topics',(r.tags||[]).map(t=>`<span>${s(t)}</span>`).join(''));
  html('#research-workflow',(r.workflow||[]).map((step,i)=>`<div class="flow-step"><b>${String(i+1).padStart(2,'0')}</b><div><strong>${s(step.title)}</strong><small>${s(step.description)}</small></div><span class="flow-icon">↗</span></div>`).join(''));
  html('#interests-grid',(data.interests||[]).map((item,i)=>`<div class="interest-card"><span class="interest-symbol">${String(i+1).padStart(2,'0')}<span>↗</span></span><h3>${s(item.title)}</h3><p>${s(item.description)}</p></div>`).join(''));
  // A more specific image layout is used for uploaded project thumbnails.


  // Elegant, local decorative miniatures. Every project has its own layout.
  function visual(type) {
    if (type === 'nlp') return `<div class="thumb-overlay thumb-nlp"><div class="thumb-browser"><div class="thumb-browser-top"><i></i><i></i><i></i><span>MODEL BENCHMARKS / NLP</span></div><div class="chart-content"><div class="chart-top"><div><small>TEST ACCURACY</small><strong>69.39<span>%</span></strong></div><div class="chart-circ">↗</div></div><div class="chart-bars"><span>BiGRU <i style="--bar:84%"></i></span><span>BiLSTM <i style="--bar:76%"></i></span><span>DNN <i style="--bar:63%"></i></span><span>LogReg <i style="--bar:49%"></i></span></div></div></div></div>`;
    if (type === 'kode') return `<div class="thumb-overlay thumb-kode"><div class="shop-surface"><div class="shop-nav"><span>KODE<span class="green-text">.</span></span><small>SHOP / NEW / STUDIO</small><span>↗</span></div><div class="shop-hero"><div class="shop-type"><small>NEW SEASON / 26</small><b>LESS,<br>BETTER.</b><i>EXPLORE COLLECTION →</i></div><div class="shop-product"><div class="shirt"><span></span></div></div></div></div></div>`;
    if (type === 'jirao') return `<div class="thumb-overlay thumb-jirao"><div class="jirao-map"><span class="map-road r1"></span><span class="map-road r2"></span><span class="map-road r3"></span><span class="map-pin p1">⌖</span><span class="map-pin p2">⌖</span><span class="map-pin p3">⌖</span><div class="map-listing"><div class="map-listing-head"><b>JIRAO</b><span>◉ LIVE</span></div><div class="map-listing-row"><i></i><span><strong>Spaces for every plan</strong><small>Find · Explore · Reserve</small></span></div><div class="map-listing-bottom">Browse spaces <span>↗</span></div></div></div></div>`;
    return `<div class="thumb-overlay thumb-cricket"><div class="scoreboard"><div class="scoreboard-head"><span>LIVE MATCH</span><span class="score-ping">● OVER 04.2</span></div><div class="scoreboard-main"><small>TEAM A</small><div>126<span>/</span>04</div><strong>OVERS 12.4</strong></div><div class="scoreboard-keys"><span>1</span><span>4</span><span>2</span><span>6</span><span>W</span><span>0</span><span>↗</span></div><div class="scoreboard-bottom">8086 ASSEMBLY // SCOREBOARD</div></div></div>`;
  }

  function projectTemplate(project) {
    const href = project.url && externalLink(project.url) ? project.url : null;
    const link = href ? `<a class="project-link" href="${s(href)}" target="_blank" rel="noopener noreferrer" aria-label="${s(project.linkLabel + ': ' + project.title)}">${s(project.linkLabel)} <span aria-hidden="true">↗</span></a>` : '<span class="project-unpublished">Code available on request</span>';
    const image = /^(https:\/\/|\/?assets\/uploads\/)/i.test(project.image||'') ? `<img class="project-upload-image" src="${s(project.image)}" alt="${s(project.title)} project visual" loading="lazy">` : visual(project.visual);
    return `<article class="project-card"><div class="project-image ${s(project.visual)} ${project.image?'has-image':''}">${image}<span class="project-corner">${s(project.number)} / ${String(data.projects.filter(p => p.featured !== false).length).padStart(2, '0')}</span></div><div class="project-body"><div class="project-label-row"><span class="project-type">${s(project.category)}</span><span class="project-num">WORK / ${s(project.number)}</span></div><h3>${s(project.title)}</h3><p>${s(project.description)}</p><span class="project-role">${s(project.role)}</span><div class="project-tags">${project.stack.map(tag => `<span>${s(tag)}</span>`).join('')}</div><div class="project-footer">${link}<span aria-hidden="true" class="project-decor">✳</span></div></div></article>`;
  }
  const categories=[...new Set(data.projects.map(item=>item.category).filter(Boolean))];
  html('#project-filters',`<button type="button" class="filter active" data-filter="all" aria-pressed="true">All work</button>`+categories.map(c=>`<button type="button" class="filter" data-filter="${s(c)}" aria-pressed="false">${s(c)}</button>`).join(''));
  let activeProjectFilter = 'all';
  function renderProjects() {
    const rows = data.projects.filter(p => p.featured !== false && (activeProjectFilter === 'all' || p.category === activeProjectFilter));
    $('#project-grid').innerHTML = rows.length ? rows.map(projectTemplate).join('') : '<p class="empty-state">No projects in this category yet.</p>';
    $('#project-count').textContent = `${String(rows.length).padStart(2,'0')} project${rows.length === 1 ? '' : 's'}`;
    $$('#project-filters .filter').forEach(button => {const active = button.dataset.filter === activeProjectFilter; button.classList.toggle('active', active); button.setAttribute('aria-pressed', String(active));});
  }
  $('#project-filters').addEventListener('click', event => {const button = event.target.closest('[data-filter]'); if (!button) return; activeProjectFilter = button.dataset.filter; renderProjects();});
  renderProjects();
  $('#featured-projects-total').textContent = String(data.projects.filter(p => p.featured !== false).length).padStart(2, '0');

  $('#skills-grid').innerHTML = data.skillGroups.map(group => `<article class="skill-card"><div class="skill-top"><span class="skill-icon">${s(group.icon)}</span><span class="skill-num">/${s(group.num)}</span></div><h3>${s(group.title)}</h3><p>${s(group.subtitle)}</p><div class="skill-chips">${group.skills.map(skill => `<span>${s(skill)}</span>`).join('')}</div></article>`).join('');

  // Course catalogue: search, topic filters, expandable list.
  let showAll = false;
  const courseSearch = $('#course-search');
  const courseFilter = $('#course-filter');
  function renderCourses() {
    const query = courseSearch.value.trim().toLowerCase();
    const group = courseFilter.value;
    const courses = data.courses.filter(c => (group === 'all' || group === c.group) && (!query || `${c.code} ${c.name} ${c.group}`.toLowerCase().includes(query)));
    const isFiltering = !!query || group !== 'all';
    const visible = showAll || isFiltering ? courses : courses.slice(0, 7);
    $('#course-list').innerHTML = visible.length ? visible.map(c => `<div class="course-row"><strong>${s(c.code)}</strong><span>${s(c.name)}</span><small>${s(c.group)}</small></div>`).join('') : '<div class="empty-state">No matching courses. Try a different search.</div>';
    $('#coursework-counter').textContent = `${courses.length} courses`;
    const more = $('#course-more');
    more.hidden = courses.length <= 7 || isFiltering;
    more.innerHTML = showAll ? 'Show fewer courses <span aria-hidden="true">↑</span>' : `Show all ${data.courses.length} completed courses <span aria-hidden="true">↓</span>`;
    more.setAttribute('aria-expanded', String(showAll));
  }
  const groups=[...new Set(data.courses.map(c=>c.group))];
  courseFilter.innerHTML='<option value="all">All subject areas</option>'+groups.map(g=>`<option value="${s(g)}">${s(g)}</option>`).join('');
  courseSearch.addEventListener('input', renderCourses);
  courseFilter.addEventListener('change', renderCourses);
  $('#course-more').addEventListener('click', () => {showAll = !showAll; renderCourses();});
  renderCourses();

  // Optional publications appear automatically as soon as you add entries.
  const pubs = (data.publications || []).filter(item => item.title && item.visible !== false);
  if (pubs.length) {
    const mount = $('#publications-mount'); mount.hidden = false;
    mount.innerHTML = `<div class="publications-head"><div class="section-kicker"><span>RESEARCH OUTPUTS</span><i></i></div><h3>Publications & talks</h3></div><div class="publication-list">${pubs.map(p => `<article><span>${s(p.venue || 'Research')}</span><h4>${s(p.title)}</h4><p>${s(p.authors || '')}</p>${externalLink(p.url || '') ? `<a href="${s(p.url)}" target="_blank" rel="noopener noreferrer">Read more ↗</a>` : ''}</article>`).join('')}</div>`;
  }

  html('#custom-sections-mount',(data.customSections||[]).filter(sec=>sec.visible!==false && sec.title).map(sec=>`<section class="section extra-section" id="extra-${s(sec.id||'section')}" aria-label="${s(sec.title)}"><div class="section-header"><div><div class="section-kicker"><span>${s(sec.kicker||'MORE ABOUT ME')}</span><i></i></div><h2>${s(sec.title)}</h2></div><p class="section-lead">${s(sec.description||'')}</p></div><div class="extra-grid">${(sec.items||[]).map(item=>`<article class="extra-card"><h3>${s(item.title)}</h3><p>${s(item.description||'')}</p>${externalLink(item.url||'')?`<a href="${s(item.url)}" target="_blank" rel="noopener noreferrer">Explore ↗</a>`:''}</article>`).join('')}</div></section>`).join(''));

  // Public GitHub repositories update automatically after new public pushes.
  // The curated project cards above remain independent and are not overwritten.
  async function githubFeed() {
    const feed = $('#github-repos'); const state = $('#github-feed-state');
    try {
      const url = `https://api.github.com/users/${encodeURIComponent(data.profile.githubUsername)}/repos?sort=updated&per_page=20&type=owner`;
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 8000);
      let response;
      try { response = await fetch(url, {headers:{'Accept':'application/vnd.github+json'}, signal:controller.signal}); }
      finally { clearTimeout(timer); }
      if (!response.ok) throw new Error('GitHub rate limit or network issue');
      const repos = (await response.json()).filter(r => r && !r.private && r.name !== data.profile.githubUsername).slice(0, 3);
      if (!repos.length) {state.textContent = 'Browse GitHub for updates'; return;}
      feed.innerHTML = repos.map(repo => `<a class="github-repo" href="${s(repo.html_url)}" target="_blank" rel="noopener noreferrer"><div><span class="repo-title">${s(repo.name.replaceAll('-', ' '))} <span aria-hidden="true">↗</span></span><small>${s(repo.description || (repo.fork ? 'Forked repository' : 'Public repository'))}</small></div><span class="repo-language">${s(repo.language || 'Code')}</span></a>`).join('');
      state.textContent = 'Live public repositories';
    } catch (error) {
      state.textContent = 'GitHub feed unavailable · View profile instead';
      // Fallback link is deliberately left in place. The site works offline.
    }
  }
  githubFeed();

  const menu = $('.menu-toggle'); const nav = $('.nav');
  function closeMenu() { menu.classList.remove('open'); nav.classList.remove('open'); menu.setAttribute('aria-expanded','false'); menu.setAttribute('aria-label','Open navigation'); }
  menu.addEventListener('click', () => { const open = menu.getAttribute('aria-expanded') !== 'true'; menu.classList.toggle('open',open); nav.classList.toggle('open',open); menu.setAttribute('aria-expanded', String(open)); menu.setAttribute('aria-label',open ? 'Close navigation' : 'Open navigation');});
  $$('.nav-link').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => {if(event.key === 'Escape') closeMenu();});
  document.addEventListener('click', event => {if (!event.target.closest('.site-header')) closeMenu();});

  if ('IntersectionObserver' in window) {
    const links = $$('.nav-link');
    const observer = new IntersectionObserver(entries => {entries.forEach(entry => {if(!entry.isIntersecting) return; links.forEach(a => a.classList.toggle('active', a.hash === '#' + entry.target.id));});}, {rootMargin:'-18% 0px -70% 0px'});
    $$('.section-anchor').forEach(section => observer.observe(section));
  }
  const back = $('#back-to-top');
  window.addEventListener('scroll', () => back.classList.toggle('visible', window.scrollY > 680), {passive:true});
  back.addEventListener('click', () => window.scrollTo({top:0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'}));

  $('#contact-form').addEventListener('submit', event => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    const name = $('#contact-name').value.trim();
    const email = $('#contact-email').value.trim();
    const message = $('#contact-message').value.trim();
    if (!name || !email || !message) return;
    const subject = `Portfolio inquiry from ${name}`;
    const body = `Hello Junaed,\n\n${message}\n\n—\nFrom: ${name}\nReply to: ${email}`;
    const mailto = `mailto:${data.profile.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    $('#form-helper').textContent = 'Opening your email app… if nothing happens, please email me directly using the link beside this form.';
    window.location.href = mailto;
  });
})();

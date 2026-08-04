const navbar = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');

window.addEventListener('scroll', () => {
  if (window.scrollY > 60) navbar.classList.add('scrolled');
  else navbar.classList.remove('scrolled');
  checkBtt();
});

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  mobileMenu.classList.toggle('open');
});

document.querySelectorAll('.mobile-link').forEach(el => {
  el.addEventListener('click', () => {
    hamburger.classList.remove('open');
    mobileMenu.classList.remove('open');
  });
});

document.querySelectorAll('a[href^="#"]').forEach(el => {
  el.addEventListener('click', (e) => {
    const href = el.getAttribute('href');
    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const delay = entry.target.style.animationDelay || '0s';
      setTimeout(() => entry.target.classList.add('visible'), parseFloat(delay) * 1000);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

const btt = document.getElementById('backToTop');
function checkBtt() {
  if (window.scrollY > 500) btt.classList.add('visible');
  else btt.classList.remove('visible');
}
btt.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

const themeBtn = document.getElementById('themeBtn');
const themePanel = document.getElementById('themePanel');
themeBtn.addEventListener('click', (e) => { e.stopPropagation(); themePanel.classList.toggle('open'); });
document.addEventListener('click', () => themePanel.classList.remove('open'));
themePanel.addEventListener('click', (e) => e.stopPropagation());

document.querySelectorAll('.swatch').forEach(el => {
  el.addEventListener('click', () => {
    const theme = el.dataset.theme;
    document.documentElement.setAttribute('data-theme', theme);
    document.querySelectorAll('.swatch').forEach(s => s.classList.remove('active'));
    el.classList.add('active');
    localStorage.setItem('yd-theme', theme);
  });
});

const savedTheme = localStorage.getItem('yd-theme');
if (savedTheme) {
  document.documentElement.setAttribute('data-theme', savedTheme);
  document.querySelectorAll('.swatch').forEach(el => {
    el.classList.toggle('active', el.dataset.theme === savedTheme);
  });
}

document.querySelectorAll('.dtab').forEach(el => {
  el.addEventListener('click', () => {
    const dest = el.dataset.dest;
    document.querySelectorAll('.dtab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.gallery-panel').forEach(p => p.classList.remove('active'));
    el.classList.add('active');
    const panel = document.getElementById('gal-' + dest);
    if (panel) panel.classList.add('active');
  });
});

const lightbox = document.getElementById('lightbox');
const lbImg = document.getElementById('lbImg');
const lbCaption = document.getElementById('lbCaption');
const lbCounter = document.getElementById('lbCounter');
const lbPrev = document.querySelector('.lb-prev');
const lbNext = document.querySelector('.lb-next');

let lbItems = [];
let lbIndex = 0;

function getLbItems(src) {
  const activePanel = document.querySelector('.gallery-panel.active');
  const instaGrid = document.querySelector('.insta-grid');
  let container = null;
  for (const c of [activePanel, instaGrid]) {
    if (!c) continue;
    const nodes = c.querySelectorAll('[onclick]');
    for (const n of nodes) {
      if ((n.getAttribute('onclick') || '').includes(src)) { container = c; break; }
    }
    if (container) break;
  }
  if (!container) return [{ src, cap: '' }];
  const nodes = container.querySelectorAll('[onclick^="openLb"]');
  return Array.from(nodes).map(n => {
    const m = (n.getAttribute('onclick') || '').match(/openLb\('([^']+)',\s*'([^']*)'/);
    return m ? { src: m[1], cap: m[2] } : null;
  }).filter(Boolean);
}

function showLb(index) {
  if (!lbItems.length) return;
  index = ((index % lbItems.length) + lbItems.length) % lbItems.length;
  lbIndex = index;
  const item = lbItems[index];
  lbImg.style.opacity = '0';
  setTimeout(() => {
    lbImg.src = item.src;
    lbImg.onload = () => { lbImg.style.opacity = '1'; };
    lbCaption.textContent = item.cap || '';
    lbCounter.textContent = lbItems.length > 1 ? (index + 1) + ' / ' + lbItems.length : '';
    lbPrev.classList.toggle('hidden', lbItems.length <= 1);
    lbNext.classList.toggle('hidden', lbItems.length <= 1);
  }, 100);
}

window.openLb = function (src, cap) {
  lbItems = getLbItems(src);
  const idx = lbItems.findIndex(i => i.src === src);
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
  showLb(idx >= 0 ? idx : 0);
};

window.closeLb = function () {
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
  setTimeout(() => { lbImg.src = ''; lbItems = []; }, 300);
};

window.prevLb = function (e) {
  if (e) e.stopPropagation();
  showLb(lbIndex - 1);
};

window.nextLb = function (e) {
  if (e) e.stopPropagation();
  showLb(lbIndex + 1);
};

document.addEventListener('keydown', (e) => {
  if (!lightbox.classList.contains('open')) return;
  if (e.key === 'Escape') window.closeLb();
  if (e.key === 'ArrowLeft') window.prevLb();
  if (e.key === 'ArrowRight') window.nextLb();
});

let wizStep = 1;
const TOTAL_STEPS = 5;
const wizData = {
  destination: '', month: '', duration: '', groupType: '',
  numTravellers: '', budget: '₹50,000',
  name: '', phone: '', email: '', notes: ''
};
const BUDGETS = ['₹15,000','₹25,000','₹35,000','₹50,000','₹75,000','₹1,00,000','₹1,50,000','₹2,00,000','₹2,50,000','₹3,50,000','₹5,00,000+'];

const budgetSlider = document.getElementById('budgetSlider');
const budgetDisplay = document.getElementById('budgetDisplay');
budgetSlider.addEventListener('input', () => {
  const val = BUDGETS[parseInt(budgetSlider.value)];
  budgetDisplay.textContent = val;
  wizData.budget = val;
});

document.querySelectorAll('#destChips .chip').forEach(el => {
  el.addEventListener('click', () => {
    document.querySelectorAll('#destChips .chip').forEach(c => c.classList.remove('selected'));
    el.classList.add('selected');
    wizData.destination = el.dataset.value;
    document.getElementById('customDest').value = '';
  });
});

document.getElementById('customDest').addEventListener('input', (e) => {
  const val = e.target.value;
  if (val) {
    document.querySelectorAll('#destChips .chip').forEach(c => c.classList.remove('selected'));
    wizData.destination = val;
  }
});

document.querySelectorAll('.group-card').forEach(el => {
  el.addEventListener('click', () => {
    document.querySelectorAll('.group-card').forEach(c => c.classList.remove('selected'));
    el.classList.add('selected');
    wizData.groupType = el.dataset.value;
  });
});

function updateWizUI() {
  for (let i = 1; i <= TOTAL_STEPS; i++) {
    const step = document.getElementById('wStep' + i);
    if (step) step.classList.toggle('active', i === wizStep);
  }
  document.getElementById('wizardBar').style.width = ((wizStep / TOTAL_STEPS) * 100) + '%';
  document.querySelectorAll('.w-dot').forEach(el => {
    const s = parseInt(el.dataset.step);
    el.classList.toggle('active', s === wizStep);
    el.classList.toggle('done', s < wizStep);
  });
  document.getElementById('wCounter').textContent = 'Step ' + wizStep + ' of ' + TOTAL_STEPS;
  document.getElementById('wBack').style.visibility = wizStep === 1 ? 'hidden' : 'visible';
  const next = document.getElementById('wNext');
  const submit = document.getElementById('wSubmit');
  if (wizStep === TOTAL_STEPS) { next.style.display = 'none'; submit.style.display = 'flex'; }
  else { next.style.display = 'flex'; submit.style.display = 'none'; }
}

function collectStep() {
  if (wizStep === 1) {
    const v = document.getElementById('customDest').value.trim();
    if (v) wizData.destination = v;
  } else if (wizStep === 2) {
    wizData.month = document.getElementById('travelMonth').value;
    wizData.duration = document.getElementById('tripDuration').value;
  } else if (wizStep === 3) {
    wizData.numTravellers = document.getElementById('numTravellers').value;
  } else if (wizStep === 4) {
    wizData.budget = BUDGETS[parseInt(budgetSlider.value)];
  } else if (wizStep === 5) {
    wizData.name = document.getElementById('cName').value.trim();
    wizData.phone = document.getElementById('cPhone').value.trim();
    wizData.email = document.getElementById('cEmail').value.trim();
    wizData.notes = document.getElementById('cNotes').value.trim();
  }
}

document.getElementById('wNext').addEventListener('click', () => {
  if (wizStep < TOTAL_STEPS) { collectStep(); wizStep++; updateWizUI(); }
});

document.getElementById('wBack').addEventListener('click', () => {
  if (wizStep > 1) { wizStep--; updateWizUI(); }
});

function buildWizMessage() {
  const d = wizData;
  return '🌍 *New Trip Enquiry — Yatra Darpan*\n\n📍 *Destination:* ' + (d.destination || 'Not specified') + '\n📅 *Travel Month:* ' + (d.month || 'Flexible') + '\n⏱ *Duration:* ' + (d.duration || 'Flexible') + '\n👥 *Group Type:* ' + (d.groupType || 'Not specified') + ' (' + (d.numTravellers ? d.numTravellers + ' travellers' : 'Not specified') + ')\n💰 *Budget per person:* ' + d.budget + '\n' + (d.notes ? '📝 *Notes:* ' + d.notes + '\n' : '') + '\n👤 *Name:* ' + d.name + '\n📞 *Phone:* ' + d.phone + '\n' + (d.email ? '📧 *Email:* ' + d.email : '') + '\n\n_Sent from YatraDarpan.com_';
}

document.getElementById('wSubmit').addEventListener('click', () => {
  collectStep();
  const name = document.getElementById('cName').value.trim();
  const phone = document.getElementById('cPhone').value.trim();
  if (!name || !phone) { alert('Please enter your name and WhatsApp number to continue.'); return; }
  window.open('https://wa.me/919082393198?text=' + encodeURIComponent(buildWizMessage()), '_blank');
  document.getElementById('wizardCard').style.display = 'none';
  const thanks = document.getElementById('wizardThanks');
  thanks.style.display = 'block';
  thanks.scrollIntoView({ behavior: 'smooth', block: 'center' });
});

updateWizUI();

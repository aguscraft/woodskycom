// Simple client-side script to fetch repo info & languages from GitHub API
// Replaces content in the page. No auth used (rate-limited).
const owner = 'aguscraft';
const repo = 'woodssky';
const apiBase = 'https://api.github.com/repos/' + owner + '/' + repo;

async function fetchJson(url){
  const res = await fetch(url);
  if(!res.ok) throw new Error('HTTP ' + res.status + ' for ' + url);
  return res.json();
}

function colorForLanguage(name){
  // simple deterministic color mapping
  const colors = [
    '#f97316','#7c3aed','#ef4444','#06b6d4','#84cc16','#f59e0b','#a78bfa','#10b981','#ef6c00','#3b82f6'
  ];
  let h = 0;
  for(let i=0;i<name.length;i++) h += name.charCodeAt(i);
  return colors[h % colors.length];
}

function renderLanguages(langs){
  const container = document.getElementById('lang-list');
  container.innerHTML = '';
  const entries = Object.entries(langs);
  if(entries.length === 0){
    container.innerHTML = '<p class="muted">Tidak ada bahasa terdeteksi atau repo kosong.</p>';
    return;
  }
  const total = entries.reduce((s,[_k,v]) => s + v, 0);
  entries.sort((a,b) => b[1]-a[1]);
  for(const [name, bytes] of entries){
    const pct = Math.round((bytes/total)*1000)/10;
    const color = colorForLanguage(name);
    const item = document.createElement('div');
    item.className = 'lang-item';
    item.innerHTML = `
      <div class="lang-color" style="background:${color}"></div>
      <div class="lang-name"><strong>${name}</strong> <span class="muted">(${pct}%)</span></div>
      <div class="lang-bar" aria-hidden="true"><div class="lang-fill" style="width:${pct}%; background:${color}"></div></div>
    `;
    container.appendChild(item);
  }
}

async function init(){
  try{
    // fetch repo info
    const info = await fetchJson(apiBase);
    document.getElementById('repo-name').textContent = info.name || repo;
    document.getElementById('repo-desc').textContent = info.description || 'woob';
    document.getElementById('about-text').innerHTML = `Deskripsi: <strong>${info.description || 'woob'}</strong>`;
    document.getElementById('github-link').href = info.html_url;

    // fetch languages
    const langs = await fetchJson(apiBase + '/languages');
    renderLanguages(langs);
  }catch(err){
    console.error(err);
    const container = document.getElementById('lang-list');
    container.innerHTML = `<p class="muted">Gagal memuat data dari GitHub: ${err.message}</p>`;
  }
}

document.addEventListener('DOMContentLoaded', init);
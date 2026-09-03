// ══════════════════════════════════════════════════════════════
//  TukarTani — script.js (Revisi: fix semua bug + fitur baru)
// ══════════════════════════════════════════════════════════════

// ── DATA KOMODITAS & NPK CONVERTER (dengan faktor penalti M) ─
// mult    = multiplier nilai tukar komoditas kering (grade A)
// poin    = poin per kg (grade A)
// mPenalty= faktor penalti kadar air: {kering:1.0, sedang:0.8, basah:0.6}
//           Formula NTC: NilaiTukar = Volume × mult × M
const dataKatalog = {
  peternak: [
    { id:'sapi',     name:'Kotoran Sapi',   icon:'fa-cow',       mult:2.0, poin:1,   mPenalty:{kering:1.0,sedang:0.8,basah:0.6}, npkInfo:'N:0.5% P:0.25% K:0.5%'  },
    { id:'kambing',  name:'Kotoran Kambing',icon:'fa-paw',       mult:1.8, poin:1.2, mPenalty:{kering:1.0,sedang:0.8,basah:0.6}, npkInfo:'N:0.7% P:0.45% K:0.3%'  },
    { id:'ayam',     name:'Kotoran Ayam',   icon:'fa-crow',      mult:1.2, poin:1.5, mPenalty:{kering:1.0,sedang:0.8,basah:0.6}, npkInfo:'N:1.7% P:1.9% K:1.0%'   },
    { id:'kelinci',  name:'Urin Kelinci',   icon:'fa-droplet',   mult:0.8, poin:2.0, mPenalty:{kering:1.0,sedang:0.9,basah:0.9}, npkInfo:'N:2.72% P:1.0% K:0.5%'  },
    { id:'cangkang', name:'Cangkang Telur', icon:'fa-egg',       mult:0.6, poin:1.8, mPenalty:{kering:1.0,sedang:0.95,basah:0.85}, npkInfo:'Kalsium Tinggi ~38%'   },
    { id:'sisakan',  name:'Sisa Pakan',     icon:'fa-wheat-awn', mult:1.0, poin:0.8, mPenalty:{kering:1.0,sedang:0.75,basah:0.55}, npkInfo:'Serat Kasar ~25%'      },
  ],
  petani: [
    { id:'jerami',  name:'Jerami Padi',   icon:'fa-wheat-awn', mult:1.5, poin:1.0, mPenalty:{kering:1.0,sedang:0.75,basah:0.5}, npkInfo:'N:0.4% P:0.1% K:1.5%'  },
    { id:'jagung',  name:'Kulit Jagung',  icon:'fa-leaf',      mult:1.2, poin:0.9, mPenalty:{kering:1.0,sedang:0.78,basah:0.55},npkInfo:'N:0.5% P:0.12% K:1.2%' },
    { id:'sekam',   name:'Sekam Padi',    icon:'fa-seedling',  mult:1.0, poin:0.8, mPenalty:{kering:1.0,sedang:0.85,basah:0.7}, npkInfo:'SiO2 tinggi, C:35%'     },
    { id:'batang',  name:'Batang Pisang', icon:'fa-tree',      mult:0.9, poin:0.7, mPenalty:{kering:1.0,sedang:0.7,basah:0.5},  npkInfo:'K tinggi, Selulosa~50%' },
    { id:'sabut',   name:'Sabut Kelapa',  icon:'fa-circle',    mult:0.8, poin:0.7, mPenalty:{kering:1.0,sedang:0.85,basah:0.7}, npkInfo:'Lignin~45% K:0.25%'    },
    { id:'ampas',   name:'Ampas Tebu',    icon:'fa-fire',      mult:0.7, poin:0.6, mPenalty:{kering:1.0,sedang:0.75,basah:0.55},npkInfo:'Serat Tinggi, Energi'  },
  ],
};

// Grade kadar air yang ditetapkan oleh AI scanner
let currentMoistureGrade = 'kering'; // default sebelum scan

// ── DATA REWARDS UMKM ────────────────────────────────────────
const rewardsList = [
  { id:1, name:'Keripik Pisang',      desc:'UMKM Tani',              cost:80,  icon:'fa-cookie-bite',    colorClass:'bg-amber-100 dark:bg-amber-900/30 text-amber-600',    isUmkm:true  },
  { id:2, name:'Kopi Bubuk Nagari',   desc:'UMKM Desa',              cost:120, icon:'fa-mug-hot',        colorClass:'bg-stone-100 dark:bg-stone-900/30 text-stone-600',    isUmkm:true  },
  { id:3, name:'Bibit Padi Unggul',   desc:'1 Kg',                   cost:100, icon:'fa-seedling',       colorClass:'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600', isUmkm:false },
  { id:4, name:'Pakan Konsentrat',    desc:'5 Kg',                   cost:200, icon:'fa-sack-xmark',     colorClass:'bg-orange-100 dark:bg-orange-900/30 text-orange-600',  isUmkm:false },
  { id:5, name:'Kuota Internet 10GB', desc:'CSR Telkomsel',          cost:150, icon:'fa-wifi',           colorClass:'bg-sky-100 dark:bg-sky-900/30 text-sky-600',           isUmkm:false },
  { id:6, name:'Pupuk Organik',       desc:'3 Kg — Dinas Pertanian', cost:180, icon:'fa-leaf',           colorClass:'bg-teal-100 dark:bg-teal-900/30 text-teal-600',        isUmkm:false },
  { id:7, name:'Gula Aren Cair',      desc:'UMKM Desa',              cost:90,  icon:'fa-bottle-droplet', colorClass:'bg-amber-100 dark:bg-amber-900/30 text-amber-700',     isUmkm:true  },
  { id:8, name:'Tempe Kedelai',       desc:'UMKM Tani',              cost:60,  icon:'fa-burger',         colorClass:'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700',  isUmkm:true  },
];

// ── DATA WILAYAH INDONESIA ────────────────────────────────────
const indonesiaWilayah = [
  { lat:-0.9145, lng:100.4607, nama:'Kota Padang', tipe:'kota', provinsi:'Sumatera Barat' },
  { lat:-0.8834, lng:100.3603, nama:'Kab. Padang Pariaman', tipe:'kab', provinsi:'Sumatera Barat' },
  { lat:-0.4490, lng:100.7887, nama:'Kota Bukittinggi', tipe:'kota', provinsi:'Sumatera Barat' },
  { lat:-0.9600, lng:100.3642, nama:'Kota Solok', tipe:'kota', provinsi:'Sumatera Barat' },
  { lat:3.5952,  lng:98.6722,  nama:'Kota Medan', tipe:'kota', provinsi:'Sumatera Utara' },
  { lat:3.7475,  lng:98.6921,  nama:'Kab. Deli Serdang', tipe:'kab', provinsi:'Sumatera Utara' },
  { lat:3.3384,  lng:99.1413,  nama:'Kota Pematangsiantar', tipe:'kota', provinsi:'Sumatera Utara' },
  { lat:5.5501,  lng:95.3182,  nama:'Kota Banda Aceh', tipe:'kota', provinsi:'Aceh' },
  { lat:5.1667,  lng:97.1333,  nama:'Kab. Aceh Utara', tipe:'kab', provinsi:'Aceh' },
  { lat:0.5333,  lng:101.4500, nama:'Kota Pekanbaru', tipe:'kota', provinsi:'Riau' },
  { lat:0.3654,  lng:101.1220, nama:'Kab. Kampar', tipe:'kab', provinsi:'Riau' },
  { lat:-1.4855, lng:102.4380, nama:'Kota Jambi', tipe:'kota', provinsi:'Jambi' },
  { lat:-2.5820, lng:104.7705, nama:'Kota Palembang', tipe:'kota', provinsi:'Sumatera Selatan' },
  { lat:-2.9710, lng:104.9283, nama:'Kab. Banyuasin', tipe:'kab', provinsi:'Sumatera Selatan' },
  { lat:-5.4297, lng:105.2611, nama:'Kota Bandar Lampung', tipe:'kota', provinsi:'Lampung' },
  { lat:-3.8000, lng:102.2667, nama:'Kota Bengkulu', tipe:'kota', provinsi:'Bengkulu' },
  { lat:-3.3194, lng:114.5908, nama:'Kota Banjarmasin', tipe:'kota', provinsi:'Kalimantan Selatan' },
  { lat:-0.0236, lng:109.3425, nama:'Kota Pontianak', tipe:'kota', provinsi:'Kalimantan Barat' },
  { lat:1.8370,  lng:116.1190, nama:'Kota Samarinda', tipe:'kota', provinsi:'Kalimantan Timur' },
  { lat:1.2654,  lng:116.8312, nama:'Kab. Kutai Kartanegara', tipe:'kab', provinsi:'Kalimantan Timur' },
  { lat:-1.6813, lng:113.3823, nama:'Kota Palangka Raya', tipe:'kota', provinsi:'Kalimantan Tengah' },
  { lat:3.3167,  lng:117.6000, nama:'Kota Tarakan', tipe:'kota', provinsi:'Kalimantan Utara' },
  { lat:-6.1751, lng:106.8272, nama:'Kota Jakarta Pusat', tipe:'kota', provinsi:'DKI Jakarta' },
  { lat:-6.2000, lng:106.7500, nama:'Kota Tangerang', tipe:'kota', provinsi:'Banten' },
  { lat:-6.3167, lng:106.8500, nama:'Kota Depok', tipe:'kota', provinsi:'Jawa Barat' },
  { lat:-6.5599, lng:106.7226, nama:'Kab. Bogor', tipe:'kab', provinsi:'Jawa Barat' },
  { lat:-6.9175, lng:107.6191, nama:'Kota Bandung', tipe:'kota', provinsi:'Jawa Barat' },
  { lat:-6.9934, lng:107.5682, nama:'Kab. Bandung', tipe:'kab', provinsi:'Jawa Barat' },
  { lat:-7.2667, lng:108.2667, nama:'Kota Tasikmalaya', tipe:'kota', provinsi:'Jawa Barat' },
  { lat:-6.7320, lng:108.5523, nama:'Kab. Cirebon', tipe:'kab', provinsi:'Jawa Barat' },
  { lat:-7.0051, lng:110.4381, nama:'Kota Semarang', tipe:'kota', provinsi:'Jawa Tengah' },
  { lat:-7.8000, lng:110.3600, nama:'Kota Yogyakarta', tipe:'kota', provinsi:'DI Yogyakarta' },
  { lat:-7.9833, lng:110.2667, nama:'Kab. Bantul', tipe:'kab', provinsi:'DI Yogyakarta' },
  { lat:-7.2289, lng:112.6300, nama:'Kota Surabaya', tipe:'kota', provinsi:'Jawa Timur' },
  { lat:-7.9839, lng:112.6214, nama:'Kota Malang', tipe:'kota', provinsi:'Jawa Timur' },
  { lat:-8.1167, lng:113.7167, nama:'Kab. Jember', tipe:'kab', provinsi:'Jawa Timur' },
  { lat:-7.4167, lng:112.4167, nama:'Kab. Gresik', tipe:'kab', provinsi:'Jawa Timur' },
  { lat:-8.6500, lng:115.2167, nama:'Kota Denpasar', tipe:'kota', provinsi:'Bali' },
  { lat:-8.6400, lng:115.2167, nama:'Kab. Badung', tipe:'kab', provinsi:'Bali' },
  { lat:-8.5861, lng:116.1171, nama:'Kota Mataram', tipe:'kota', provinsi:'Nusa Tenggara Barat' },
  { lat:-10.1718,lng:123.6070, nama:'Kota Kupang', tipe:'kota', provinsi:'Nusa Tenggara Timur' },
  { lat:-5.1477, lng:119.4327, nama:'Kota Makassar', tipe:'kota', provinsi:'Sulawesi Selatan' },
  { lat:-4.0091, lng:119.6234, nama:'Kab. Wajo', tipe:'kab', provinsi:'Sulawesi Selatan' },
  { lat:-3.9724, lng:122.5130, nama:'Kota Kendari', tipe:'kota', provinsi:'Sulawesi Tenggara' },
  { lat:-0.8917, lng:119.8707, nama:'Kota Palu', tipe:'kota', provinsi:'Sulawesi Tengah' },
  { lat:0.5412,  lng:123.0595, nama:'Kota Gorontalo', tipe:'kota', provinsi:'Gorontalo' },
  { lat:1.4800,  lng:124.8469, nama:'Kota Manado', tipe:'kota', provinsi:'Sulawesi Utara' },
  { lat:-3.6951, lng:128.1814, nama:'Kota Ambon', tipe:'kota', provinsi:'Maluku' },
  { lat:0.8833,  lng:127.3667, nama:'Kota Ternate', tipe:'kota', provinsi:'Maluku Utara' },
  { lat:-2.5333, lng:140.7167, nama:'Kota Jayapura', tipe:'kota', provinsi:'Papua' },
  { lat:-4.2667, lng:133.6167, nama:'Kab. Nabire', tipe:'kab', provinsi:'Papua Tengah' },
  { lat:-7.7500, lng:140.6833, nama:'Kab. Merauke', tipe:'kab', provinsi:'Papua Selatan' },
  { lat:-1.3667, lng:133.5167, nama:'Kota Sorong', tipe:'kota', provinsi:'Papua Barat Daya' },
  { lat:-0.8667, lng:131.2500, nama:'Kab. Manokwari', tipe:'kab', provinsi:'Papua Barat' },
];

// ── DATABASE LOKAL ────────────────────────────────────────────
let currentUser = null;

function saveUsers(users) { localStorage.setItem('tukarTaniUsers', JSON.stringify(users)); }
function getUsers() { const s = localStorage.getItem('tukarTaniUsers'); return s ? JSON.parse(s) : {}; }

function saveCurrentUser() {
  if (!currentUser) return;
  const users = getUsers();
  users[currentUser.phone] = currentUser;
  saveUsers(users);
  localStorage.setItem('tukarTaniCurrentUser', currentUser.phone);
  localStorage.setItem('tt_theme', document.documentElement.classList.contains('dark') ? 'dark' : 'light');
  updateUIWithUserData();
}

function loadCurrentUser() {
  const phone = localStorage.getItem('tukarTaniCurrentUser');
  if (phone) { const users = getUsers(); if (users[phone]) { currentUser = users[phone]; return true; } }
  return false;
}

// ── UPDATE UI ─────────────────────────────────────────────────
function updateUIWithUserData() {
  if (!currentUser) return;

  // Nama
  ['display-name-beranda','display-name-profil'].forEach(id => {
    const el = document.getElementById(id); if (el) el.innerText = currentUser.name;
  });

  // Role badge
  const roleMap = { petani:'Petani Padi', peternak:'Peternak Sapi', kader:'Kader Karang Taruna' };
  const iconMap = { petani:'fa-seedling', peternak:'fa-cow', kader:'fa-users' };
  const badge = document.getElementById('beranda-role-badge');
  if (badge) badge.innerHTML = `<i class="fa-solid ${iconMap[currentUser.role]||'fa-user'} text-brand-500"></i> Akun Tervalidasi — ${roleMap[currentUser.role]||currentUser.role}`;

  // Kader notice
  const kn = document.getElementById('kader-notice');
  if (kn) kn.style.display = currentUser.role === 'kader' ? 'flex' : 'none';

  // Poin & rupiah
  ['beranda-points','katalog-points'].forEach(id => { const el = document.getElementById(id); if(el) el.innerText = currentUser.points; });
  const rupiahEl = document.getElementById('beranda-rupiah');
  if (rupiahEl) rupiahEl.innerText = `≈ Rp${(currentUser.points*100).toLocaleString('id-ID')}`;

  // Stats
  const hc = document.getElementById('profil-history-count'); if (hc) hc.innerText = `${currentUser.tradeHistoryCount} Transaksi`;
  const ca = document.getElementById('profil-carbon-amount'); if (ca) ca.innerHTML = `<i class="fa-solid fa-arrow-trend-down"></i> ${parseFloat(currentUser.carbonReduction||0).toFixed(2)} Ton`;
  const bc = document.getElementById('beranda-contracts'); if (bc) bc.innerText = `${currentUser.tradeHistoryCount} Kesepakatan`;
  const bcarb = document.getElementById('beranda-carbon');
  if (bcarb) bcarb.innerHTML = `${parseFloat(currentUser.carbonReduction||0).toFixed(1)}<span class="text-lg font-bold text-teal-100 ml-1">Ton CO₂</span>`;

  // Avatar — FIX: update semua elemen .avatar-img langsung
  const defaultUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=10b981&color=fff&size=200`;
  const src = currentUser.avatarDataUrl || defaultUrl;
  document.querySelectorAll('.avatar-img').forEach(el => { el.src = src; el.style.display = 'block'; });

  // Profil avatar preview spesifik
  const profAvatar = document.getElementById('profile-avatar-img');
  if (profAvatar) { profAvatar.src = src; profAvatar.style.display = 'block'; }
  const profInitials = document.getElementById('profile-avatar-initials');
  if (profInitials) profInitials.style.display = currentUser.avatarDataUrl ? 'none' : 'flex';

  const deleteBtn = document.getElementById('delete-avatar-btn');
  if (deleteBtn) {
    deleteBtn.classList.toggle('hidden', !currentUser.avatarDataUrl);
    deleteBtn.classList.toggle('flex', !!currentUser.avatarDataUrl);
  }

  renderActivityFeed();
  renderNotifBadge();
  renderKatalog();
}

// ── ACTIVITY FEED ─────────────────────────────────────────────
function renderActivityFeed() {
  const feedEl = document.getElementById('activity-feed');
  if (!feedEl || !currentUser) return;
  if (!currentUser.feeds || !currentUser.feeds.length) {
    feedEl.innerHTML = `<div class="bg-white dark:bg-slate-900 p-6 rounded-2xl border-2 border-slate-100 dark:border-slate-800 text-center shadow-sm">
      <i class="fa-solid fa-seedling text-brand-300 text-3xl mb-2 block"></i>
      <p class="text-sm font-bold text-slate-400">Belum ada sirkulasi. Mulai barter pertama Anda!</p></div>`;
    return;
  }
  feedEl.innerHTML = currentUser.feeds.slice(0,5).map(f => `
    <div class="bg-white dark:bg-slate-900 p-4 md:p-5 rounded-2xl border-2 border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4 hover:-translate-y-1 hover:shadow-md hover:border-brand-300 dark:hover:border-brand-700 transition-all duration-300 cursor-pointer">
      <div class="w-12 h-12 rounded-full bg-brand-50 dark:bg-brand-900/20 text-brand-500 flex items-center justify-center shrink-0">
        <i class="fa-solid fa-handshake"></i></div>
      <div class="flex-1 min-w-0">
        <p class="text-sm md:text-base font-bold text-slate-900 dark:text-white truncate">${f.title}</p>
        <p class="text-xs md:text-sm text-slate-500 dark:text-slate-400 truncate mt-0.5">${f.desc}</p>
      </div>
      <span class="text-[10px] md:text-xs text-slate-400 font-bold whitespace-nowrap bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">${f.time||'Baru saja'}</span>
    </div>`).join('');
}

// ── NOTIFIKASI ────────────────────────────────────────────────
function renderNotifBadge() {
  if (!currentUser) return;
  const unread = (currentUser.notifs||[]).filter(n=>!n.read).length;
  document.querySelectorAll('.notif-badge-count').forEach(el => { el.innerText = unread; el.classList.toggle('hidden', unread===0); });
  document.querySelectorAll('.notif-dot').forEach(el => el.classList.toggle('hidden', unread===0));
}

function pushNotification(title, desc, icon) {
  if (!currentUser) return;
  if (!currentUser.notifs) currentUser.notifs = [];
  currentUser.notifs.unshift({ title, desc, icon, read:false, time: new Date().toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'}) });
  saveCurrentUser();
  renderNotifBadge();
}

// openNotifications — hanya dipanggil dari tombol nav notif
// Cukup panggil switchTab, render sudah ada di dalam switchTab
function openNotifications() {
  switchTab('notifikasi');
}

function markNotifRead(i) {
  if (currentUser?.notifs?.[i]) { currentUser.notifs[i].read=true; saveCurrentUser(); }
}

// ── KATALOG UMKM ─────────────────────────────────────────────
function renderKatalog() {
  const container = document.getElementById('katalog-grid');
  if (!container) return;
  const userPoin = currentUser ? currentUser.points : 0;
  container.innerHTML = rewardsList.map(r => {
    const canAfford = userPoin >= r.cost;
    const bg = r.colorClass.split(' ').filter(c=>!c.startsWith('text-')).join(' ');
    const txt = r.colorClass.split(' ').filter(c=>c.startsWith('text-')).join(' ');
    return `
    <div class="bg-white dark:bg-slate-900 rounded-[2rem] border-2 border-slate-100 dark:border-slate-800 p-6 flex flex-col hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 group relative">
      ${r.isUmkm?'<span class="absolute top-3 right-3 bg-purple-500 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-lg shadow-sm">UMKM</span>':''}
      <div class="w-full aspect-video ${bg} rounded-2xl flex items-center justify-center mb-4 group-hover:opacity-80 transition-opacity">
        <i class="fa-solid ${r.icon} text-5xl ${txt} drop-shadow-md group-hover:scale-110 transition-transform"></i></div>
      <div class="flex-1">
        <span class="text-[10px] font-bold tracking-widest text-slate-400 uppercase">${r.desc}</span>
        <h3 class="text-lg font-extrabold text-slate-900 dark:text-white mt-1 leading-tight">${r.name}</h3>
      </div>
      <div class="mt-4 flex items-center justify-between">
        <span class="font-extrabold text-yellow-500 text-lg flex items-center gap-1.5">
          <i class="fa-solid fa-coins text-sm"></i> ${r.cost} Poin</span>
        <button onclick="tukarItem('${r.name}',${r.cost})"
          class="${canAfford?'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:scale-105':'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed'} px-4 py-2 rounded-xl text-sm font-bold shadow-md transition-all"
          ${canAfford?'':'disabled'}>${canAfford?'Tukar':'Poin Kurang'}</button>
      </div>
    </div>`;
  }).join('');
}

// ── PIN INPUT — FIX: semua digit bisa lihat ───────────────────
function getPin(containerId) {
  let pin='';
  document.querySelectorAll(`#${containerId} .pin-input`).forEach(i=>pin+=i.value);
  return pin;
}

function togglePinVisibility(containerId) {
  const inputs = document.querySelectorAll(`#${containerId} .pin-input`);
  // Cari tombol — bisa di dalam atau di luar container (id = toggle-pin-{containerId})
  const btn = document.getElementById('toggle-pin-' + containerId);
  const isHidden = inputs[0]?.type === 'password';
  inputs.forEach(inp => inp.type = isHidden ? 'text' : 'password');
  if (btn) {
    const icon = btn.querySelector('i');
    if (icon) {
      icon.className = isHidden
        ? 'fa-solid fa-eye-slash text-lg'
        : 'fa-solid fa-eye text-lg';
    }
    // Ubah warna tombol saat aktif
    btn.classList.toggle('text-brand-500', isHidden);
    btn.classList.toggle('border-brand-400', isHidden);
    btn.classList.toggle('text-slate-400', !isHidden);
  }
}

function setupPinInputs() {
  document.querySelectorAll('.pin-container').forEach(container => {
    const inputs = container.querySelectorAll('.pin-input');
    inputs.forEach((input,index) => {
      input.addEventListener('focus', () => input.select());
      input.addEventListener('keydown', e => {
        if (e.key==='Backspace' && !input.value && index>0) inputs[index-1].focus();
      });
      input.addEventListener('input', e => {
        input.value = input.value.replace(/[^0-9]/g,'');
        if (input.value && index < inputs.length-1) inputs[index+1].focus();
      });
      input.addEventListener('paste', e => {
        e.preventDefault();
        const data = e.clipboardData.getData('text').replace(/[^0-9]/g,'').slice(0, inputs.length-index);
        for (let i=0;i<data.length;i++) {
          inputs[index+i].value=data[i];
          if (index+i < inputs.length-1) inputs[index+i+1].focus();
          else inputs[index+i].blur();
        }
      });
    });
  });
}

// ── LUPA PIN — FIX: fungsional ───────────────────────────────
function lupaPin() {
  const phone = document.getElementById('login-phone').value.trim();
  if (!phone) {
    openInfoModal('Masukkan Nomor Telepon',
      'Silakan isi nomor telepon Anda terlebih dahulu, lalu klik "Lupa PIN?" untuk melanjutkan.',
      'fa-solid fa-phone','bg-blue-100 dark:bg-blue-900/30 text-blue-500');
    return;
  }
  const users = getUsers();
  if (!users[phone]) {
    openInfoModal('Akun Tidak Ditemukan',
      `Nomor telepon <b>${phone}</b> tidak terdaftar di TukarTani. Silakan daftar terlebih dahulu.`,
      'fa-solid fa-user-slash','bg-red-100 dark:bg-red-900/30 text-red-500');
    return;
  }
  // Tampilkan modal reset PIN
  openInfoModal('Reset PIN',
    `Untuk keamanan, PIN hanya dapat direset dengan menghubungi <b>Kader Karang Taruna</b> atau <b>Admin Balai Desa</b> setempat dengan membawa identitas diri (KTP/KK).<br><br>Atau, Anda dapat mereset data akun melalui <b>menu Profil → Reset Data Akun</b> jika sudah masuk sebelumnya.`,
    'fa-solid fa-key','bg-amber-100 dark:bg-amber-900/30 text-amber-600');
}

// ── AUTH ──────────────────────────────────────────────────────
function toggleAuthMode(mode) {
  const loginForm    = document.getElementById('form-login-container');
  const registerForm = document.getElementById('form-register-container');
  const authTitle    = document.getElementById('auth-title');
  const authDesc     = document.getElementById('auth-desc');
  document.getElementById('login-error-msg')?.classList.add('hidden');
  document.getElementById('register-error-msg')?.classList.add('hidden');
  if (mode==='register') {
    loginForm.classList.add('hidden'); registerForm.classList.remove('hidden');
    authTitle.innerText='Daftar Akun'; authDesc.innerText='Bergabung dengan komunitas TukarTani';
  } else {
    registerForm.classList.add('hidden'); loginForm.classList.remove('hidden');
    authTitle.innerText='TukarTani'; authDesc.innerText='Masuk untuk mulai barter agropastoral';
  }
}

function handleAuth(event, type) {
  event.preventDefault();
  const btn = event.submitter;
  const orig = btn.innerHTML;
  btn.innerHTML='<i class="fa-solid fa-circle-notch fa-spin"></i> Memproses...'; btn.disabled=true;

  if (type==='register') {
    const phone = document.getElementById('register-phone').value.trim();
    const name  = document.getElementById('register-name').value.trim();
    const pin   = getPin('register-pin-container');
    const role  = document.querySelector('input[name="role"]:checked').value;
    const errEl = document.getElementById('register-error-msg');
    errEl?.classList.add('hidden');
    if (pin.length<4) {
      errEl?.querySelector('span') && (errEl.querySelector('span').innerText='Silakan masukkan 4 digit PIN lengkap.');
      errEl?.classList.remove('hidden'); btn.innerHTML=orig; btn.disabled=false; return;
    }
    const users = getUsers();
    if (users[phone]) {
      errEl?.querySelector('span') && (errEl.querySelector('span').innerText='Nomor telepon sudah terdaftar.');
      errEl?.classList.remove('hidden'); btn.innerHTML=orig; btn.disabled=false; return;
    }
    const initPoin = role==='petani'?150:role==='peternak'?450:200;
    users[phone] = { phone,name,pin,role,points:initPoin,tradeHistoryCount:0,carbonReduction:0,avatarDataUrl:null,feeds:[],
      notifs:[{title:'Selamat Datang di TukarTani! 🌾',desc:'Akun Anda berhasil dibuat. Mulai barter pertama Anda.',icon:'fa-rocket',read:false,time:new Date().toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'})}] };
    saveUsers(users); currentUser=users[phone];
  } else {
    const phone = document.getElementById('login-phone').value.trim();
    const pin   = getPin('login-pin-container');
    const errEl = document.getElementById('login-error-msg');
    errEl?.classList.add('hidden');
    if (pin.length<4) {
      errEl?.querySelector('span') && (errEl.querySelector('span').innerText='Silakan masukkan 4 digit PIN.');
      errEl?.classList.remove('hidden'); btn.innerHTML=orig; btn.disabled=false; return;
    }
    const users = getUsers(); const user = users[phone];
    if (!user || user.pin!==pin) {
      errEl?.querySelector('span') && (errEl.querySelector('span').innerText='Nomor telepon atau PIN salah.');
      errEl?.classList.remove('hidden'); btn.innerHTML=orig; btn.disabled=false; return;
    }
    currentUser=user;
  }

  setTimeout(() => {
    btn.innerHTML=orig; btn.disabled=false;
    saveCurrentUser();
    localStorage.setItem('isLoggedIn','true');
    document.getElementById('auth-view').classList.remove('flex');
    document.getElementById('auth-view').classList.add('hidden');
    document.getElementById('app-view').classList.remove('hidden');
    document.getElementById('app-view').classList.add('flex');
    switchTab('beranda');
  }, 1200);
}

// ── DARK MODE ─────────────────────────────────────────────────
function toggleTheme() {
  const isDark = document.documentElement.classList.toggle('dark');
  localStorage.setItem('tt_theme', isDark?'dark':'light');
  document.querySelectorAll('.theme-icon-class').forEach(el => {
    el.classList.toggle('fa-moon',!isDark); el.classList.toggle('fa-sun',isDark);
  });
}

// ── NAVIGASI ──────────────────────────────────────────────────
function switchTab(tabId) {
  document.querySelectorAll('.page-view').forEach(el=>el.classList.add('hidden'));
  document.querySelectorAll('.nav-btn-mobile').forEach(btn => {
    btn.classList.remove('text-brand-600','dark:text-brand-400'); btn.classList.add('text-slate-400');
  });
  document.querySelectorAll('.nav-btn-desktop').forEach(btn => {
    btn.classList.remove('bg-brand-50','dark:bg-brand-900/20','text-brand-600','dark:text-brand-400','font-bold');
    btn.classList.add('text-slate-500','dark:text-slate-400','hover:bg-slate-100','dark:hover:bg-slate-800/50','font-medium');
  });

  const viewEl = document.getElementById('view-'+tabId);
  if (viewEl) viewEl.classList.remove('hidden');

  const activeMob = document.getElementById('nav-mobile-'+tabId);
  if (activeMob) { activeMob.classList.remove('text-slate-400'); activeMob.classList.add('text-brand-600','dark:text-brand-400'); }

  const activeDesk = document.getElementById('nav-desktop-'+tabId);
  if (activeDesk) {
    activeDesk.classList.remove('text-slate-500','dark:text-slate-400','hover:bg-slate-100','dark:hover:bg-slate-800/50','font-medium');
    activeDesk.classList.add('bg-brand-50','dark:bg-brand-900/20','text-brand-600','dark:text-brand-400','font-bold');
  }

  if (tabId==='eksplorasi') setTimeout(()=>{ initMap(); mapInstance?.invalidateSize(); },150);
  if (tabId==='chat') setTimeout(()=>{ const c=document.getElementById('chat-messages'); if(c) c.scrollTop=c.scrollHeight; },50);
  if (tabId==='input-komoditas') { resetValidationState(); buildKomoditasSelector(); }
  if (tabId==='match-result') setTimeout(()=>initMatchMap(),150);

  // Fix: render notifikasi langsung saat tab dibuka
  if (tabId==='notifikasi') {
    const container = document.getElementById('notif-list-container');
    if (container && currentUser) {
      if (!currentUser.notifs || !currentUser.notifs.length) {
        container.innerHTML = `<div class="text-center py-12">
          <i class="fa-regular fa-bell-slash text-slate-300 text-5xl mb-3 block"></i>
          <p class="text-sm font-bold text-slate-400">Belum ada notifikasi.</p>
        </div>`;
      } else {
        container.innerHTML = currentUser.notifs.map((n,i) => `
          <div class="flex items-start gap-4 p-4 rounded-2xl border-2 ${n.read
            ? 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900'
            : 'border-brand-200 dark:border-brand-800/50 bg-brand-50 dark:bg-brand-900/10'} mb-3 cursor-pointer"
            onclick="markNotifRead(${i})">
            <div class="w-10 h-10 rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0">
              <i class="fa-solid ${n.icon||'fa-bell'} text-sm"></i>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-extrabold text-slate-900 dark:text-white">${n.title}</p>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">${n.desc}</p>
              <p class="text-[10px] text-slate-400 mt-1.5 font-bold">${n.time||''}</p>
            </div>
            ${!n.read ? '<div class="w-2.5 h-2.5 rounded-full bg-brand-500 shrink-0 mt-1.5"></div>' : ''}
          </div>`).join('');
        // Mark semua sebagai read
        currentUser.notifs.forEach(n=>n.read=true);
        saveCurrentUser();
      }
    }
  }
  // FIX: render notifikasi langsung saat tab dibuka, tidak perlu klik tombol lagi
  if (tabId==='notifikasi') {
    const container = document.getElementById('notif-list-container');
    if (container && currentUser) {
      if (!currentUser.notifs || !currentUser.notifs.length) {
        container.innerHTML = `<div class="text-center py-12"><i class="fa-regular fa-bell-slash text-slate-300 text-5xl mb-3 block"></i><p class="text-sm font-bold text-slate-400">Belum ada notifikasi.</p></div>`;
      } else {
        container.innerHTML = currentUser.notifs.map((n,i) => `
          <div class="flex items-start gap-4 p-4 rounded-2xl border-2 ${n.read?'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900':'border-brand-200 dark:border-brand-800/50 bg-brand-50 dark:bg-brand-900/10'} mb-3 cursor-pointer" onclick="markNotifRead(${i}); this.className=this.className.replace('border-brand-200 dark:border-brand-800/50 bg-brand-50 dark:bg-brand-900/10','border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900'); this.querySelector('.notif-unread-dot')?.remove();">
            <div class="w-10 h-10 rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0">
              <i class="fa-solid ${n.icon||'fa-bell'} text-sm"></i></div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-extrabold text-slate-900 dark:text-white">${n.title}</p>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">${n.desc}</p>
              <p class="text-[10px] text-slate-400 mt-1.5 font-bold">${n.time||''}</p>
            </div>
            ${!n.read?'<div class="notif-unread-dot w-2.5 h-2.5 rounded-full bg-brand-500 shrink-0 mt-1.5"></div>':''}
          </div>`).join('');
        // Mark all read
        currentUser.notifs.forEach(n=>n.read=true);
        saveCurrentUser();
      }
    }
  }
}

// ── SIDEBAR DESKTOP ───────────────────────────────────────────
function toggleSidebar() {
  const sidebar=document.getElementById('desktop-sidebar');
  const texts=document.querySelectorAll('.sidebar-text');
  const header=document.getElementById('sidebar-header');
  const icon=document.getElementById('sidebar-toggle-icon');
  if (sidebar.classList.contains('w-72')) {
    sidebar.classList.replace('w-72','w-24'); texts.forEach(el=>el.classList.add('hidden'));
    header.classList.replace('px-6','px-0'); header.classList.replace('justify-start','justify-center');
    icon?.classList.add('rotate-180');
  } else {
    sidebar.classList.replace('w-24','w-72'); texts.forEach(el=>el.classList.remove('hidden'));
    header.classList.replace('px-0','px-6'); header.classList.replace('justify-center','justify-start');
    icon?.classList.remove('rotate-180');
  }
}

// ── FOTO PROFIL — FIX: langsung update semua avatar ──────────
function previewImage(event) {
  const file = event.target.files[0];
  if (!file) return;
  if (file.size > 10*1024*1024) {
    openInfoModal('File Terlalu Besar',`Ukuran foto maksimal 10MB.`,'fa-solid fa-camera-slash','bg-red-100 dark:bg-red-900/30 text-red-500');
    event.target.value=''; return;
  }
  const reader = new FileReader();
  reader.onload = e => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let w=img.width, h=img.height;
      if (w>500) { h=Math.round(h*500/w); w=500; }
      canvas.width=w; canvas.height=h;
      canvas.getContext('2d').drawImage(img,0,0,w,h);
      const compressed = canvas.toDataURL('image/jpeg',0.85);
      if (currentUser) {
        currentUser.avatarDataUrl = compressed;
        saveCurrentUser();
        showToast('✅ Foto profil berhasil diperbarui!');
      }
      event.target.value='';
    };
    img.onerror = () => { openInfoModal('File Rusak','Foto tidak dapat dibaca.','fa-solid fa-xmark-circle','bg-red-100 dark:bg-red-900/30 text-red-500'); event.target.value=''; };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function deleteAvatar() {
  if (currentUser) { currentUser.avatarDataUrl=null; saveCurrentUser(); }
  document.getElementById('file-upload').value='';
  showToast('Foto profil dihapus.');
}

// ── FORM KOMODITAS — MULTI-SELECT + KALKULASI ─────────────────
// selectedItems: array of {id, vol} — bisa lebih dari satu
let selectedItems = [];   // [{id:'sapi', vol:100}, ...]
let currentKomoditasRole = 'peternak';

function buildKomoditasSelector() {
  if (!currentUser) return;
  const isKader = currentUser.role==='kader';
  const kaderSel = document.getElementById('lansia-select');
  currentKomoditasRole = isKader ? (kaderSel?kaderSel.value:'peternak') : currentUser.role;
  const kaderBlock = document.getElementById('kader-selector-block');
  if (kaderBlock) kaderBlock.style.display = isKader?'block':'none';

  const items = dataKatalog[currentKomoditasRole]||dataKatalog['peternak'];
  const container = document.getElementById('item-selector');
  if (!container) return;

  // Reset selection: pilih item pertama
  selectedItems = [{ id:items[0].id, vol:100 }];

  container.innerHTML = items.map((item,i) => `
    <div onclick="toggleKomoditas('${item.id}')" id="btn-${item.id}"
      class="p-4 bg-white dark:bg-slate-950 border-2 ${i===0?'border-transparent bg-gradient-to-br from-brand-500 to-brand-600 text-white':'border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400'}
      rounded-2xl text-center text-sm font-bold transition-all shadow-sm hover:shadow-md flex flex-col items-center gap-2 relative overflow-hidden cursor-pointer select-none item-btn ${i===0?'selected':''}">
      <i class="fa-solid ${item.icon} text-3xl mb-1 transition-transform group-hover:scale-110"></i>
      <span class="relative z-10 leading-tight text-xs">${item.name}</span>
      <span class="absolute top-2 right-2 check-icon ${i===0?'':'hidden'} w-5 h-5 bg-white/30 rounded-full flex items-center justify-center text-white text-[10px] font-bold">
        <i class="fa-solid fa-check"></i></span>
      <div class="absolute -right-4 -bottom-4 w-12 h-12 bg-brand-500/10 rounded-full blur-xl transition-all"></div>
    </div>`).join('');

  calculateNPK();
}

function toggleKomoditas(id) {
  const items = dataKatalog[currentKomoditasRole]||dataKatalog['peternak'];
  const idx = selectedItems.findIndex(s=>s.id===id);
  if (idx>-1) {
    // Deselect hanya jika lebih dari 1 item terpilih
    if (selectedItems.length===1) { showToast('Minimal 1 komoditas harus dipilih.','fa-triangle-exclamation','text-amber-400'); return; }
    selectedItems.splice(idx,1);
  } else {
    selectedItems.push({ id, vol: parseInt(document.getElementById('weight-slider')?.value||100) });
  }
  // Update visual
  items.forEach(item => {
    const btn = document.getElementById('btn-'+item.id);
    if (!btn) return;
    const isSelected = selectedItems.some(s=>s.id===item.id);
    const checkIcon = btn.querySelector('.check-icon');
    if (isSelected) {
      btn.className = btn.className.replace(/border-slate-\d+ dark:border-slate-\d+/g,'border-transparent');
      btn.classList.add('selected');
      btn.style.background='';
      if (checkIcon) checkIcon.classList.remove('hidden');
    } else {
      btn.className = btn.className.replace('border-transparent','border-slate-200 dark:border-slate-800');
      btn.classList.remove('selected');
      if (checkIcon) checkIcon.classList.add('hidden');
    }
  });
  calculateNPK();
}

function updateKaderRole() { buildKomoditasSelector(); }

function updateScale() {
  const slider = document.getElementById('weight-slider');
  const display = document.getElementById('weight-display');
  const vol = parseInt(slider?.value||100);
  if (display) display.innerText = vol;
  // Update semua vol di selectedItems
  selectedItems.forEach(s=>s.vol=vol);
  calculateNPK();
}

// State pengiriman yang dipilih user (untuk kalkulasi potongan BUMDes)
let selectedPengiriman = 'ambil-sendiri';
const BUMDES_RATE_PER_KM = 5; // poin per km
const BUMDES_JARAK_KM    = 2.4; // jarak estimasi default (nanti bisa dari GPS)

// FIX Gap 5 — kalkulasi NTC dengan faktor penalti kadar air M
// FIX Gap 1 — tampilkan potongan BUMDes secara transparan di UI
function calculateNPK() {
  const slider = document.getElementById('weight-slider');
  const vol = parseInt(slider?.value||100);
  const items = dataKatalog[currentKomoditasRole]||dataKatalog['peternak'];
  const M = currentMoistureGrade; // 'kering' | 'sedang' | 'basah'

  let totalReceive=0, totalPoinBruto=0;
  let npkLines=[], labelLines=[];

  selectedItems.forEach(s => {
    const obj = items.find(i=>i.id===s.id)||items[0];
    const mFactor = obj.mPenalty[M] || 1.0;
    totalReceive   += vol * obj.mult * mFactor;
    totalPoinBruto += vol * (obj.poin||1) * mFactor;
    npkLines.push(`${obj.name}: ${obj.npkInfo}`);
    labelLines.push(obj.name);
  });

  totalReceive   = Math.round(totalReceive);
  totalPoinBruto = Math.round(totalPoinBruto);

  // Hitung potongan BUMDes jika dipilih
  const potonganBumdes = selectedPengiriman === 'armada-bumdes'
    ? Math.round(BUMDES_RATE_PER_KM * BUMDES_JARAK_KM)
    : 0;
  const totalPoinNetto = Math.max(0, totalPoinBruto - potonganBumdes);

  // Update nilai tukar
  const exVal = document.getElementById('exchange-value');
  const exPoin = document.getElementById('exchange-poin');
  const npkInfoEl = document.getElementById('npk-info');
  const npkLabelEl = document.getElementById('npk-label');
  const ntcBreakdownEl = document.getElementById('ntc-breakdown');
  const moistureBadgeEl = document.getElementById('moisture-badge');

  if (exVal)   exVal.innerText = `~${totalReceive} Kg`;
  if (npkInfoEl)   npkInfoEl.innerText   = npkLines.join(' | ') || '-';
  if (npkLabelEl)  npkLabelEl.innerText  = labelLines.join(', ') || 'Komoditas';

  // Badge kadar air dengan warna
  const mLabel = {kering:'Kering Optimal ✓', sedang:'Sedang — Penalti ×0.8', basah:'Basah — Penalti ×0.6'};
  const mColor = {kering:'text-green-600 bg-green-100 dark:bg-green-900/30', sedang:'text-amber-600 bg-amber-100 dark:bg-amber-900/30', basah:'text-red-600 bg-red-100 dark:bg-red-900/30'};
  if (moistureBadgeEl) {
    moistureBadgeEl.innerText = mLabel[M] || M;
    moistureBadgeEl.className = `text-[10px] font-extrabold px-2.5 py-1 rounded-lg ${mColor[M]||''}`;
  }

  // Breakdown NTC transparan (Gap 1 + Gap 5)
  if (exPoin) {
    if (potonganBumdes > 0) {
      exPoin.innerHTML = `
        <span class="line-through text-slate-400 text-base">+${totalPoinBruto} Poin</span>
        <span class="block text-red-500 text-xs font-bold">- ${potonganBumdes} Poin (BUMDes ${BUMDES_JARAK_KM}km × ${BUMDES_RATE_PER_KM})</span>
        <span class="block text-brand-600 dark:text-brand-400 font-extrabold text-xl">= +${totalPoinNetto} Poin Bersih</span>`;
    } else {
      exPoin.innerHTML = `<span class="text-xl font-extrabold">+${totalPoinBruto} Poin</span>`;
    }
  }

  // Breakdown detail NTC
  if (ntcBreakdownEl) {
    const mFactor0 = (items.find(i=>i.id===selectedItems[0]?.id)||items[0])?.mPenalty[M] || 1.0;
    ntcBreakdownEl.innerHTML = `
      <div class="text-[10px] font-bold text-slate-500 dark:text-slate-400 space-y-0.5">
        <p>📐 Formula NTC: Vol(${vol}kg) × Nilai Tukar × <b>M(${mFactor0})</b>${potonganBumdes?` - BUMDes(${potonganBumdes})`:''}</p>
        <p>🌡️ Grade Kadar Air: <b class="${mColor[M]?.split(' ')[0]||''}">${mLabel[M]}</b></p>
        ${potonganBumdes?`<p>🚛 Potongan BUMDes: <b class="text-red-500">${BUMDES_JARAK_KM}km × ${BUMDES_RATE_PER_KM} = ${potonganBumdes} Poin</b></p>`:''}
      </div>`;
  }

  return { totalPoinBruto, totalPoinNetto, potonganBumdes, totalReceive, M };
}

// ── VALIDASI AI ───────────────────────────────────────────────
let isAiValidated = false;

function resetValidationState() {
  isAiValidated = false;
  const st=document.getElementById('validation-status-text');
  const bm=document.getElementById('btn-matchmaking');
  const bs=document.getElementById('btn-start-validation');
  if (st) { st.innerHTML='Tahap wajib sebelum melakukan barter.'; st.className='text-xs font-medium text-slate-500 dark:text-slate-400'; }
  if (bs) { bs.innerHTML='<i class="fa-solid fa-camera text-brand-400"></i> Pindai Komoditas'; bs.className='w-full md:w-auto bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold py-3 px-6 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 text-sm'; }
  if (bm) {
    bm.disabled=true; bm.className='w-full bg-slate-300 dark:bg-slate-700 text-slate-500 dark:text-slate-400 font-bold py-4 rounded-2xl shadow-sm transition-all text-lg flex justify-center items-center gap-3 cursor-not-allowed';
    document.getElementById('btn-matchmaking-icon')?.setAttribute('class','fa-solid fa-lock');
    const txt=document.getElementById('btn-matchmaking-text'); if(txt) txt.innerText='Selesaikan Validasi AI';
  }
}

function completeValidation() {
  closeValidationModal(); isAiValidated=true;
  // Recalculate dengan grade M yang baru ditetapkan scanner
  calculateNPK();

  const st=document.getElementById('validation-status-text');
  const bm=document.getElementById('btn-matchmaking');
  const bs=document.getElementById('btn-start-validation');
  const mLabel = {kering:'Grade A — Kering Optimal',sedang:'Grade B — Kadar Air Sedang (Penalti ×0.8)',basah:'Grade C — Basah (Penalti ×0.6)'};
  const mColor = {kering:'text-green-600 dark:text-green-400',sedang:'text-amber-600 dark:text-amber-400',basah:'text-red-500 dark:text-red-400'};
  if (st) {
    const icon = currentMoistureGrade==='kering' ? 'fa-circle-check text-green-500' : currentMoistureGrade==='sedang' ? 'fa-triangle-exclamation text-amber-500' : 'fa-circle-xmark text-red-500';
    st.innerHTML=`<i class="fa-solid ${icon}"></i> <span class="${mColor[currentMoistureGrade]}">${mLabel[currentMoistureGrade]}</span>`;
    st.className='text-xs font-bold mt-1';
  }
  if (bs) { bs.innerHTML='<i class="fa-solid fa-check"></i> Selesai'; bs.className='w-full md:w-auto bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 pointer-events-none font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 text-sm'; }
  if (bm) {
    bm.disabled=false; bm.className='w-full bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white font-extrabold py-4 rounded-2xl shadow-lg shadow-brand-500/30 transition-all text-lg flex justify-center items-center gap-3';
    document.getElementById('btn-matchmaking-icon')?.setAttribute('class','fa-solid fa-satellite-dish');
    const txt=document.getElementById('btn-matchmaking-text'); if(txt) txt.innerText='Cari Mitra Barter';
  }
}

// ── GAP 1: update potongan BUMDes saat opsi pengiriman diganti ─
function setPengiriman(val) {
  selectedPengiriman = val;
  calculateNPK();
}

// ── GAP 4: BANK SILASE ────────────────────────────────────────
function openBankSilase() {
  const existing = document.getElementById('modal-bank-silase');
  if (existing) {
    existing.classList.remove('hidden'); existing.classList.add('flex');
    setTimeout(()=>{ existing.classList.remove('opacity-0'); document.getElementById('bank-silase-content')?.classList.remove('scale-90'); },10);
    return;
  }

  const modalHtml = `
  <div id="modal-bank-silase" class="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[4500] hidden flex-col items-center justify-center p-6 opacity-0 transition-opacity duration-300">
    <div id="bank-silase-content" class="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl max-w-lg w-full transform scale-90 transition-transform duration-300 max-h-[92vh] overflow-y-auto no-scrollbar">

      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-900/30 text-amber-600 flex items-center justify-center text-2xl">🌾</div>
          <div>
            <h2 class="text-xl font-extrabold text-slate-900 dark:text-white">Bank Silase</h2>
            <p class="text-xs text-slate-500 dark:text-slate-400 font-medium">Stok Pakan Fermentasi Sepanjang Tahun</p>
          </div>
        </div>
        <button onclick="closeBankSilase()" class="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
          <i class="fa-solid fa-xmark"></i></button>
      </div>

      <!-- Masalah yang diselesaikan -->
      <div class="bg-amber-50 dark:bg-amber-900/10 border-2 border-amber-100 dark:border-amber-800/50 p-4 rounded-2xl mb-6">
        <p class="text-xs font-extrabold text-amber-700 dark:text-amber-400 uppercase tracking-widest mb-2">🔴 Masalah</p>
        <p class="text-sm font-medium text-amber-900 dark:text-amber-200 leading-relaxed">
          Jerami padi hanya tersedia <b>2–3× setahun</b> saat panen. Di luar musim panen, peternak kekurangan pakan hijauan → harga melonjak → sapi kurus → produksi turun.
        </p>
      </div>

      <!-- Alur Bank Silase -->
      <p class="text-sm font-extrabold text-slate-900 dark:text-white mb-4">Alur Fermentasi Bank Silase:</p>
      <div class="space-y-3 mb-6">
        ${[
          {step:'1',icon:'fa-wheat-awn',color:'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600',title:'Stok Jerami Masuk',desc:'Petani menyerahkan jerami segar pasca panen ke Drop Point Balai Desa. Kader Karang Taruna mencatat berat dan kualitas.'},
          {step:'2',icon:'fa-flask',color:'bg-blue-100 dark:bg-blue-900/30 text-blue-600',title:'Proses Fermentasi',desc:'Jerami dicampur molase + EM4 (Effective Microorganism), dikemas rapat dalam plastik/silo selama 21 hari. Anaerob → pH turun → jerami awet.'},
          {step:'3',icon:'fa-boxes-stacked',color:'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600',title:'Penyimpanan Silase',desc:'Silase matang disimpan di Gudang Silase Desa. Bisa bertahan 6–12 bulan tanpa refrigerasi jika tertutup rapat.'},
          {step:'4',icon:'fa-handshake',color:'bg-brand-100 dark:bg-brand-900/30 text-brand-600',title:'Distribusi via TukarTani',desc:'Peternak dapat menukar TukarPoin dengan silase kapan saja, sepanjang tahun — tidak perlu menunggu musim panen.'},
        ].map(s=>`
        <div class="flex gap-4 items-start">
          <div class="w-10 h-10 rounded-2xl ${s.color} flex items-center justify-center shrink-0 font-extrabold text-lg">
            <i class="fa-solid ${s.icon} text-sm"></i>
          </div>
          <div class="flex-1 pb-3 border-b border-slate-100 dark:border-slate-800 last:border-0">
            <p class="text-sm font-extrabold text-slate-900 dark:text-white">Tahap ${s.step}: ${s.title}</p>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">${s.desc}</p>
          </div>
        </div>`).join('')}
      </div>

      <!-- Stok tersedia (simulasi) -->
      <div class="bg-slate-50 dark:bg-slate-950 rounded-2xl p-4 mb-6 border border-slate-100 dark:border-slate-800">
        <p class="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">Stok Silase Desa — Update Hari Ini</p>
        <div class="space-y-2">
          ${[
            {nama:'Silase Jerami Padi',stok:'1.250 Kg',harga:'80 Poin/Kg',warna:'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700'},
            {nama:'Silase Batang Jagung',stok:'640 Kg',harga:'70 Poin/Kg',warna:'bg-orange-100 dark:bg-orange-900/30 text-orange-700'},
            {nama:'Silase Batang Pisang',stok:'420 Kg',harga:'60 Poin/Kg',warna:'bg-green-100 dark:bg-green-900/30 text-green-700'},
          ].map(s=>`
          <div class="flex items-center justify-between gap-2">
            <div class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full ${s.warna.split(' ')[0].replace('bg-','bg-').replace('100','500')} shrink-0"></span>
              <span class="text-sm font-bold text-slate-800 dark:text-slate-200">${s.nama}</span>
            </div>
            <div class="text-right">
              <span class="text-xs font-bold text-slate-500 dark:text-slate-400 block">${s.stok} tersedia</span>
              <span class="text-xs font-extrabold text-brand-600 dark:text-brand-400">${s.harga}</span>
            </div>
          </div>`).join('')}
        </div>
      </div>

      <!-- Aksi -->
      <div class="grid grid-cols-2 gap-3">
        <button onclick="closeBankSilase()" class="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-extrabold py-3.5 rounded-2xl transition-all hover:bg-slate-200 dark:hover:bg-slate-700 text-sm">
          Tutup
        </button>
        <button onclick="closeBankSilase(); switchTab('katalog');" class="flex-1 bg-gradient-to-r from-brand-500 to-brand-600 text-white font-extrabold py-3.5 rounded-2xl shadow-lg shadow-brand-500/30 transition-all text-sm flex items-center justify-center gap-2">
          <i class="fa-solid fa-coins"></i> Tukar Poin
        </button>
      </div>
    </div>
  </div>`;

  document.body.insertAdjacentHTML('beforeend', modalHtml);
  const modal = document.getElementById('modal-bank-silase');
  modal.classList.remove('hidden'); modal.classList.add('flex');
  setTimeout(()=>{ modal.classList.remove('opacity-0'); document.getElementById('bank-silase-content')?.classList.remove('scale-90'); },10);
}

function closeBankSilase() {
  const modal = document.getElementById('modal-bank-silase');
  modal?.classList.add('opacity-0');
  document.getElementById('bank-silase-content')?.classList.add('scale-90');
  setTimeout(()=>{ modal?.classList.add('hidden'); modal?.classList.remove('flex'); },300);
}

// ── SCANNER AI ────────────────────────────────────────────────
let scanTimer=null, cameraStream=null;

async function openScanner() {
  const modal=document.getElementById('ai-modal');
  const msg=document.getElementById('scanner-msg');
  const video=document.getElementById('scanner-video');
  const bgImg=document.getElementById('scanner-bg');
  const icon=document.getElementById('scanner-icon');
  modal.classList.remove('hidden'); modal.classList.add('flex');
  if (icon) icon.className='fa-solid fa-circle-notch fa-spin text-brand-400 text-lg';
  if (msg) msg.innerText='Membuka Kamera...';
  try {
    cameraStream = await navigator.mediaDevices.getUserMedia({video:{facingMode:'environment'}});
    video.srcObject=cameraStream; video.classList.remove('hidden'); bgImg?.classList.add('hidden');
  } catch(err) {
    closeScanner();
    setTimeout(()=>openInfoModal('Akses Kamera Ditolak','Mohon izinkan akses kamera di browser/perangkat Anda.','fa-solid fa-camera-slash','bg-red-100 dark:bg-red-900/30 text-red-500'),350);
    return;
  }
  if (msg) msg.innerText='Mendeteksi Biomassa...';
  scanTimer = setTimeout(()=>{ if(icon) icon.className='fa-solid fa-check-circle text-green-400 text-lg'; if(msg) msg.innerText='Selesai! Validasi Berhasil.'; setTimeout(()=>{closeScanner();showValidationModal();},1500); },4000);
}

function closeScanner() {
  clearTimeout(scanTimer);
  if (cameraStream) { cameraStream.getTracks().forEach(t=>t.stop()); cameraStream=null; }
  const modal=document.getElementById('ai-modal');
  modal?.classList.add('hidden'); modal?.classList.remove('flex');
  document.getElementById('scanner-video')?.classList.add('hidden');
  document.getElementById('scanner-bg')?.classList.remove('hidden');
}

function showValidationModal() {
  // Gap 5: AI scanner random-assign moisture grade setelah scan
  const grades = ['kering','kering','kering','sedang','basah']; // mayoritas kering
  currentMoistureGrade = grades[Math.floor(Math.random()*grades.length)];

  const modal=document.getElementById('modal-validation');
  // Update teks hasil scan sesuai grade
  const gradeEl = document.getElementById('validation-grade-result');
  const penaltyEl = document.getElementById('validation-penalty-info');
  const mLabel = {kering:'Grade A — Kering Optimal',sedang:'Grade B — Kadar Air Sedang',basah:'Grade C — Kadar Air Tinggi'};
  const mColor = {kering:'text-green-600',sedang:'text-amber-600',basah:'text-red-500'};
  const mPenalty = {kering:'M = 1.0 (tidak ada penalti)',sedang:'M = 0.8 (penalti 20%)',basah:'M = 0.6 (penalti 40%)'};
  if (gradeEl) { gradeEl.innerText = mLabel[currentMoistureGrade]; gradeEl.className = `text-lg font-extrabold ${mColor[currentMoistureGrade]}`; }
  if (penaltyEl) { penaltyEl.innerText = mPenalty[currentMoistureGrade]; }

  modal.classList.remove('hidden'); modal.classList.add('flex');
  setTimeout(()=>{ modal.classList.remove('opacity-0'); document.getElementById('validation-content')?.classList.remove('scale-90'); },10);
}

function closeValidationModal() {
  const modal=document.getElementById('modal-validation');
  modal.classList.add('opacity-0'); document.getElementById('validation-content')?.classList.add('scale-90');
  setTimeout(()=>{ modal.classList.add('hidden'); modal.classList.remove('flex'); },300);
}

// ── MATCHMAKING ───────────────────────────────────────────────
function startMatchmaking() {
  if (!isAiValidated) { openInfoModal('Validasi AI Diperlukan','Selesaikan tahap <b>Validasi AI Vision</b> terlebih dahulu.','fa-solid fa-microchip','bg-orange-100 dark:bg-orange-900/30 text-orange-500'); return; }
  const btnMatch=document.getElementById('btn-matchmaking');
  const origHTML=btnMatch.innerHTML;
  btnMatch.innerHTML='<i class="fa-solid fa-circle-notch fa-spin"></i> Sedang Mencari...'; btnMatch.disabled=true;
  const loading=document.getElementById('match-loading');
  loading.classList.remove('hidden'); loading.classList.add('flex');
  setTimeout(()=>loading.classList.remove('opacity-0'),10);
  setTimeout(()=>{
    loading.classList.add('opacity-0');
    setTimeout(()=>{
      loading.classList.add('hidden'); loading.classList.remove('flex');
      const items=dataKatalog[currentKomoditasRole]||dataKatalog['peternak'];
      const vol=parseInt(document.getElementById('weight-slider')?.value||100);
      const mainObj=items.find(i=>i.id===selectedItems[0]?.id)||items[0];
      const totalReceive=selectedItems.reduce((sum,s)=>{ const obj=items.find(i=>i.id===s.id)||items[0]; return sum+vol*obj.mult; },0);
      const partnerName=currentKomoditasRole==='petani'?'Peternakan Pak Budi':'Kelompok Tani Mekar';
      const receiveType=currentKomoditasRole==='petani'?'Pakan Ternak':'Jerami Padi';
      const komodList=selectedItems.map(s=>(items.find(i=>i.id===s.id)||items[0]).name).join(' + ');
      document.getElementById('match-give') && (document.getElementById('match-give').innerText=vol);
      document.getElementById('match-give-type') && (document.getElementById('match-give-type').innerText=komodList);
      document.getElementById('match-receive') && (document.getElementById('match-receive').innerText=Math.round(totalReceive));
      document.getElementById('match-receive-type') && (document.getElementById('match-receive-type').innerText=receiveType);
      document.getElementById('match-partner-name') && (document.getElementById('match-partner-name').innerText=partnerName);
      btnMatch.innerHTML=origHTML; btnMatch.disabled=false;
      switchTab('match-result');
    },300);
  },2500);
}

// State mitra aktif yang dipilih dari matchmaking/peta
let activeMitra = {
  name: 'Mitra Barter',
  sub:  'Komoditas tersedia',
  jarak:'2.4 km',
  icon: 'cow',
  avatarColor: 'eab308',
};

function acceptMatch() {
  // Update header chat sesuai mitra dari matchmaking
  const partnerName = currentKomoditasRole==='petani' ? 'Peternakan Pak Budi' : 'Kelompok Tani Mekar';
  const partnerJarak = '2.4 km';
  activeMitra = {
    name: partnerName,
    jarak: partnerJarak,
    avatarColor: currentKomoditasRole==='petani' ? 'eab308' : '22c55e',
  };
  _resetAndOpenChat(activeMitra);
}

function rejectMatch() { showToast('Tawaran ditolak. Kembali ke form komoditas.'); switchTab('input-komoditas'); }

// Helper: reset chat messages + update header + buka tab chat
function _resetAndOpenChat(mitra) {
  // Update header chat
  const nameEl   = document.getElementById('chat-partner-name');
  const statusEl = document.getElementById('chat-partner-status');
  const avatarEl = document.getElementById('chat-partner-avatar');
  if (nameEl)   nameEl.innerText = mitra.name;
  if (statusEl) statusEl.innerHTML = `<i class="fa-solid fa-circle text-[8px] animate-pulse text-green-500 mr-1"></i> Sedang Online • ${mitra.jarak||'2.4 km'}`;
  if (avatarEl) avatarEl.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(mitra.name)}&background=${mitra.avatarColor||'eab308'}&color=fff`;

  // Reset area pesan ke kondisi awal (hanya pesan pertama dari mitra)
  const chatBox = document.getElementById('chat-messages');
  if (chatBox) {
    const vol = parseInt(document.getElementById('weight-slider')?.value||100);
    const items = dataKatalog[currentKomoditasRole]||dataKatalog['peternak'];
    const komodList = selectedItems.map(s=>(items.find(i=>i.id===s.id)||items[0]).name).join(' + ');
    const time = new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});
    chatBox.innerHTML = `
      <div class="flex justify-center mb-6">
        <span class="bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">Sistem Matchmaking AI — ${new Date().toLocaleDateString('id-ID',{day:'2-digit',month:'short'})}</span>
      </div>
      <div class="flex items-end gap-2 md:gap-3 w-full md:w-4/5">
        <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(mitra.name)}&background=${mitra.avatarColor||'eab308'}&color=fff" class="w-8 h-8 rounded-full shadow-sm mb-1 shrink-0"/>
        <div class="p-4 bg-white dark:bg-slate-900 rounded-3xl rounded-bl-none shadow-sm border border-slate-100 dark:border-slate-800">
          <p class="text-sm text-slate-700 dark:text-slate-300 font-medium leading-relaxed">Halo! Saya tertarik barter dengan <b>${vol}kg ${komodList}</b> Anda. Bisa kita negosiasi lebih lanjut?</p>
          <span class="text-[10px] text-slate-400 mt-2 block text-right font-semibold">${time}</span>
        </div>
      </div>`;
    chatBox.scrollTop = chatBox.scrollHeight;
  }
  switchTab('chat');
}

function searchMapPartner() {
  const loading=document.getElementById('match-loading');
  loading.classList.remove('hidden'); loading.classList.add('flex');
  setTimeout(()=>loading.classList.remove('opacity-0'),10);
  setTimeout(()=>{ loading.classList.add('opacity-0'); setTimeout(()=>{ loading.classList.add('hidden'); loading.classList.remove('flex'); switchTab('eksplorasi'); },300); },1500);
}

// Dipanggil dari popup marker peta — reset chat dan buka dengan mitra yang diklik
function startChatWithMitra(namaLabel, iconType, jarak) {
  const colorMap = {'cow':'eab308','wheat-awn':'22c55e','crow':'f97316','seedling':'10b981'};
  activeMitra = { name: namaLabel, jarak: jarak||'2.4 km', avatarColor: colorMap[iconType]||'10b981' };
  _resetAndOpenChat(activeMitra);
}

// ── FITUR SAYA BUTUH ─ FIX: lengkap dengan armada BUMDes ─────
function openSayaButuh() {
  const modal = document.getElementById('modal-saya-butuh');
  if (!modal) { buildSayaButuhModal(); return; }
  modal.classList.remove('hidden'); modal.classList.add('flex');
  setTimeout(()=>{ modal.classList.remove('opacity-0'); document.getElementById('saya-butuh-content')?.classList.remove('scale-90'); },10);
}

function buildSayaButuhModal() {
  // Buat modal dinamis
  const modalHtml = `
  <div id="modal-saya-butuh" class="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[4500] hidden flex-col items-center justify-center p-6 opacity-0 transition-opacity duration-300">
    <div id="saya-butuh-content" class="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl max-w-md w-full transform scale-90 transition-transform duration-300 max-h-[90vh] overflow-y-auto no-scrollbar">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-2xl font-extrabold text-slate-900 dark:text-white">Saya Butuh</h2>
        <button onclick="closeSayaButuh()" class="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
          <i class="fa-solid fa-xmark"></i></button>
      </div>

      <!-- Pilih komoditas yang dibutuhkan + volume per item -->
      <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">Komoditas yang Dibutuhkan</label>
      <p class="text-xs text-slate-400 mb-3">Pilih satu atau lebih, lalu isi volume masing-masing.</p>
      <div class="space-y-2 mb-5" id="butuh-komoditas-grid">
        ${[...dataKatalog.peternak,...dataKatalog.petani].map(item=>`
        <div class="flex items-center gap-3 p-3 border-2 border-slate-200 dark:border-slate-800 rounded-xl transition-all" id="butuh-row-${item.id}">
          <label class="flex items-center gap-2 flex-1 cursor-pointer min-w-0">
            <input type="checkbox" name="butuh-item" value="${item.id}" class="w-4 h-4 accent-brand-500 shrink-0" onchange="toggleButuhRow('${item.id}')">
            <i class="fa-solid ${item.icon} text-slate-400 shrink-0 w-4 text-center"></i>
            <span class="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">${item.name}</span>
          </label>
          <div class="flex items-center gap-1 shrink-0 opacity-40" id="vol-wrap-${item.id}">
            <input type="number" id="butuh-vol-${item.id}" value="100" min="10" max="5000" step="10" disabled
              class="w-20 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg py-1.5 px-2 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-brand-500 transition-all text-center"/>
            <span class="text-xs font-bold text-slate-400">Kg</span>
          </div>
        </div>`).join('')}
      </div>

      <!-- Opsi Pengiriman / Armada -->
      <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">Opsi Pengiriman</label>
      <div class="space-y-2.5 mb-6">
        <label class="cursor-pointer">
          <input type="radio" name="pengiriman" value="ambil-sendiri" class="peer sr-only" checked>
          <div class="p-4 border-2 border-slate-200 dark:border-slate-800 rounded-2xl flex items-center gap-3 peer-checked:border-brand-500 peer-checked:bg-brand-50 dark:peer-checked:bg-brand-900/20 transition-all">
            <div class="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 peer-checked:bg-brand-100 shrink-0">
              <i class="fa-solid fa-person-walking text-base"></i></div>
            <div><p class="text-sm font-extrabold text-slate-900 dark:text-white">Ambil Sendiri</p>
              <p class="text-xs text-slate-500 dark:text-slate-400">Saya datang langsung ke Drop Point Balai Desa</p></div>
          </div>
        </label>
        <label class="cursor-pointer">
          <input type="radio" name="pengiriman" value="armada-bumdes" class="peer sr-only">
          <div class="p-4 border-2 border-slate-200 dark:border-slate-800 rounded-2xl flex items-center gap-3 peer-checked:border-blue-500 peer-checked:bg-blue-50 dark:peer-checked:bg-blue-900/20 transition-all">
            <div class="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 shrink-0">
              <i class="fa-solid fa-truck text-base"></i></div>
            <div><p class="text-sm font-extrabold text-slate-900 dark:text-white">🚛 Armada BUMDes</p>
              <p class="text-xs text-slate-500 dark:text-slate-400">Layanan antar-jemput desa, biaya 5 Poin/km (maks 20km)</p></div>
          </div>
        </label>
        <label class="cursor-pointer">
          <input type="radio" name="pengiriman" value="kader-titip" class="peer sr-only">
          <div class="p-4 border-2 border-slate-200 dark:border-slate-800 rounded-2xl flex items-center gap-3 peer-checked:border-purple-500 peer-checked:bg-purple-50 dark:peer-checked:bg-purple-900/20 transition-all">
            <div class="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 shrink-0">
              <i class="fa-solid fa-users text-base"></i></div>
            <div><p class="text-sm font-extrabold text-slate-900 dark:text-white">Titip via Kader</p>
              <p class="text-xs text-slate-500 dark:text-slate-400">Kader Karang Taruna menghubungkan & menitipkan komoditas</p></div>
          </div>
        </label>
      </div>

      <!-- Catatan -->
      <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Catatan Tambahan (opsional)</label>
      <textarea id="butuh-catatan" rows="2" placeholder="Contoh: Perlu kering, tidak bau menyengat..."
        class="w-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 text-sm text-slate-900 dark:text-white outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all resize-none mb-6"></textarea>

      <button onclick="submitSayaButuh()"
        class="w-full bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white font-extrabold py-4 rounded-2xl shadow-lg shadow-brand-500/30 transition-all text-base flex items-center justify-center gap-3">
        <i class="fa-solid fa-bullhorn"></i> Pasang Permintaan
      </button>
    </div>
  </div>`;
  document.body.insertAdjacentHTML('beforeend', modalHtml);
  const modal = document.getElementById('modal-saya-butuh');
  modal.classList.remove('hidden'); modal.classList.add('flex');
  setTimeout(()=>{ modal.classList.remove('opacity-0'); document.getElementById('saya-butuh-content')?.classList.remove('scale-90'); },10);
}

function closeSayaButuh() {
  const modal = document.getElementById('modal-saya-butuh');
  modal?.classList.add('opacity-0');
  document.getElementById('saya-butuh-content')?.classList.add('scale-90');
  setTimeout(()=>{ modal?.classList.add('hidden'); modal?.classList.remove('flex'); },300);
}

// Toggle aktif/nonaktif input volume saat checkbox diklik
function toggleButuhRow(id) {
  const chk  = document.querySelector(`input[name="butuh-item"][value="${id}"]`);
  const wrap = document.getElementById(`vol-wrap-${id}`);
  const inp  = document.getElementById(`butuh-vol-${id}`);
  const row  = document.getElementById(`butuh-row-${id}`);
  if (!chk || !wrap || !inp) return;
  if (chk.checked) {
    wrap.classList.remove('opacity-40'); inp.disabled=false;
    row.classList.replace('border-slate-200','border-brand-500');
    row.classList.replace('dark:border-slate-800','dark:border-brand-500');
    row.classList.add('bg-brand-50','dark:bg-brand-900/10');
  } else {
    wrap.classList.add('opacity-40'); inp.disabled=true;
    row.classList.replace('border-brand-500','border-slate-200');
    row.classList.replace('dark:border-brand-500','dark:border-slate-800');
    row.classList.remove('bg-brand-50','dark:bg-brand-900/10');
  }
}

function submitSayaButuh() {
  const checked = [...document.querySelectorAll('input[name="butuh-item"]:checked')].map(c=>c.value);
  const kirim   = document.querySelector('input[name="pengiriman"]:checked')?.value||'ambil-sendiri';
  const catatan = document.getElementById('butuh-catatan')?.value||'';

  if (!checked.length) { showToast('Pilih minimal 1 komoditas yang dibutuhkan.','fa-triangle-exclamation','text-amber-400'); return; }

  const allItems = [...dataKatalog.peternak,...dataKatalog.petani];
  const kirimLabel = kirim==='armada-bumdes'?'Armada BUMDes 🚛':kirim==='kader-titip'?'Titip via Kader':'Ambil Sendiri';

  // Baca volume per komoditas dari input masing-masing
  const rincianArr = checked.map(id => {
    const vol = parseInt(document.getElementById(`butuh-vol-${id}`)?.value||100);
    const nama = (allItems.find(i=>i.id===id)||{name:id}).name;
    return { id, nama, vol };
  });
  const komodNames = rincianArr.map(r=>r.nama).join(', ');
  const rincian    = rincianArr.map(r=>`${r.nama}: ${r.vol}kg`).join(' | ');
  const totalVol   = rincianArr.reduce((s,r)=>s+r.vol,0);

  pushNotification(
    `Permintaan Dipasang: ${komodNames}`,
    `${rincian} — Pengiriman: ${kirimLabel}${catatan?' | Catatan: '+catatan:''}. Menunggu mitra terdekat.`,
    'fa-bullhorn'
  );

  closeSayaButuh();

  // Simulasi notifikasi mitra merespons setelah 3 detik
  setTimeout(() => {
    const mitraResponder = ['Peternakan Pak Budi','Kelompok Tani Mekar','Gapoktan Maju','Peternakan Ayam Pak RT'];
    const mitraName = mitraResponder[Math.floor(Math.random()*mitraResponder.length)];
    pushNotification(
      `🔔 Mitra Terdekat Merespons!`,
      `${mitraName} (2.4 km dari Anda) menyatakan tertarik memenuhi permintaan ${vol}kg ${komodNames} Anda. Buka Chat untuk negosiasi.`,
      'fa-location-dot'
    );
    showToast(`${mitraName} tertarik! Cek Notifikasi.`,'fa-bell','text-brand-400');
  }, 3000);

  setTimeout(()=>openInfoModal(
    'Permintaan Berhasil Dipasang! 📢',
    `<b>${rincian}</b> dengan opsi <b>${kirimLabel}</b> telah dipasang. Mitra terdekat akan menghubungi Anda melalui notifikasi &amp; Chat dalam beberapa saat.`,
    'fa-solid fa-check-circle','bg-green-100 dark:bg-green-900/30 text-green-500'
  ),350);
}

// ── CHAT ──────────────────────────────────────────────────────
function sepakatBarter() {
  openConfirmModal('Konfirmasi Sepakat','Apakah Anda yakin ingin menyepakati barter ini?','fa-solid fa-handshake','bg-amber-100 dark:bg-amber-900/30 text-amber-600','Ya, Sepakat','bg-amber-500 hover:bg-amber-600',()=>openDisclaimerModal());
}

function openDisclaimerModal() {
  const modal=document.getElementById('modal-disclaimer');
  if (!modal) { executeDeal(); return; }
  const chk=document.getElementById('check-disclaimer'); const btn=document.getElementById('btn-final-deal');
  if(chk) chk.checked=false;
  if(btn) { btn.disabled=true; btn.className=btn.className.replace('bg-brand-500 hover:bg-brand-600','bg-slate-300 dark:bg-slate-700 cursor-not-allowed'); }
  modal.classList.remove('hidden'); modal.classList.add('flex');
  setTimeout(()=>{ modal.classList.remove('opacity-0'); document.getElementById('disclaimer-content')?.classList.remove('scale-90'); },10);
}

function toggleDealBtn() {
  const chk=document.getElementById('check-disclaimer'); const btn=document.getElementById('btn-final-deal');
  if(!chk||!btn) return;
  if(chk.checked) { btn.disabled=false; btn.className=btn.className.replace('bg-slate-300 dark:bg-slate-700 cursor-not-allowed','bg-brand-500 hover:bg-brand-600'); }
  else { btn.disabled=true; btn.className=btn.className.replace('bg-brand-500 hover:bg-brand-600','bg-slate-300 dark:bg-slate-700 cursor-not-allowed'); }
}

function closeDisclaimerModal() {
  const modal=document.getElementById('modal-disclaimer');
  modal?.classList.add('opacity-0'); document.getElementById('disclaimer-content')?.classList.add('scale-90');
  setTimeout(()=>{ modal?.classList.add('hidden'); modal?.classList.remove('flex'); },300);
}

function executeDeal() { closeDisclaimerModal(); openRatingModal(); }

let currentRating=5;
function openRatingModal() {
  const modal=document.getElementById('modal-rating');
  if(!modal) { finalizeDeal(5); return; }
  currentRating=5; renderStars(5);
  modal.classList.remove('hidden'); modal.classList.add('flex');
  setTimeout(()=>{ modal.classList.remove('opacity-0'); document.getElementById('rating-content')?.classList.remove('scale-90'); },10);
}

function setRating(val) { currentRating=val; renderStars(val); }
function renderStars(val) {
  const c=document.getElementById('star-container'); if(!c) return;
  c.innerHTML=[1,2,3,4,5].map(i=>`<button onclick="setRating(${i})" class="star-btn text-4xl ${i<=val?'text-amber-400 active':'text-slate-200 dark:text-slate-700'}"><i class="fa-solid fa-star"></i></button>`).join('');
}

function submitRating() {
  const modal=document.getElementById('modal-rating');
  modal?.classList.add('opacity-0'); document.getElementById('rating-content')?.classList.add('scale-90');
  setTimeout(()=>{ modal?.classList.add('hidden'); modal?.classList.remove('flex'); finalizeDeal(currentRating); },300);
}

function finalizeDeal(rating) {
  if (!currentUser) return;
  const items=dataKatalog[currentKomoditasRole]||dataKatalog['peternak'];
  const vol=parseInt(document.getElementById('weight-slider')?.value||100);
  const { totalPoinNetto, potonganBumdes, totalReceive } = calculateNPK();
  const totalCarbon = vol * 0.35 * selectedItems.length;

  currentUser.points += totalPoinNetto;
  currentUser.tradeHistoryCount += 1;
  currentUser.carbonReduction = parseFloat(currentUser.carbonReduction||0) + totalCarbon;

  if (!currentUser.feeds) currentUser.feeds=[];
  const komodList = selectedItems.map(s=>(items.find(i=>i.id===s.id)||items[0]).name).join(' + ');
  const bumdesNote = potonganBumdes > 0 ? ` (dipotong ${potonganBumdes} poin BUMDes)` : '';
  currentUser.feeds.unshift({
    title:`Barter ${komodList} Berhasil 🤝`,
    desc:`${vol}kg → +${totalPoinNetto} Poin bersih${bumdesNote} (Rating: ${'⭐'.repeat(rating)})`,
    time:new Date().toLocaleDateString('id-ID',{day:'2-digit',month:'short'})
  });
  if (currentUser.feeds.length>20) currentUser.feeds.pop();

  pushNotification(
    `Barter Selesai! +${totalPoinNetto} Poin Bersih`,
    `${vol}kg ${komodList}.${bumdesNote?'\n'+bumdesNote:''} Karbon dicegah: ${totalCarbon.toFixed(2)} Ton CO₂.`,
    'fa-leaf'
  );
  saveCurrentUser();

  // Update success modal dengan breakdown
  const re=document.getElementById('success-resi');
  const pe=document.getElementById('success-poin');
  const sb=document.getElementById('success-bumdes-note');
  if (re) re.innerText=`TKRT-${Math.floor(Math.random()*9000)+1000}`;
  if (pe) pe.innerHTML=`+${totalPoinNetto} Poin Bersih`;
  if (sb) {
    sb.innerHTML = potonganBumdes > 0
      ? `<span class="text-xs text-red-500 font-bold block">Dipotong ${potonganBumdes} Poin untuk Armada BUMDes</span>`
      : '';
  }

  setTimeout(()=>{
    const modal=document.getElementById('modal-success');
    modal.classList.remove('hidden'); modal.classList.add('flex');
    setTimeout(()=>{ modal.classList.remove('opacity-0'); document.getElementById('success-content')?.classList.remove('scale-90'); },10);
  },350);
}

function closeSuccessModal() {
  const modal=document.getElementById('modal-success');
  modal.classList.add('opacity-0'); document.getElementById('success-content')?.classList.add('scale-90');
  setTimeout(()=>{ modal.classList.add('hidden'); modal.classList.remove('flex'); switchTab('beranda'); },300);
}

// ── CHAT ──────────────────────────────────────────────────────
function sendMessage() {
  const input=document.getElementById('chat-input'); const msg=input?.value.trim(); if(!msg) return;
  const chat=document.getElementById('chat-messages');
  const time=new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});
  chat.insertAdjacentHTML('beforeend',`<div class="flex items-end justify-end gap-2 md:gap-3 w-full animate-fade-in">
    <div class="p-4 bg-gradient-to-br from-brand-500 to-brand-600 text-white rounded-3xl rounded-br-none shadow-md">
      <p class="text-sm font-medium leading-relaxed">${msg}</p>
      <span class="text-[10px] text-brand-100 mt-2 flex justify-end items-center gap-1 font-semibold">${time} <i class="fa-solid fa-check text-xs"></i></span>
    </div></div>`);
  input.value=''; chat.scrollTop=chat.scrollHeight;
  setTimeout(()=>{
    const t=msg.toLowerCase(); const vol=parseInt(document.getElementById('weight-slider')?.value||100);
    let reply;
    if(/malam|pagi|siang|sore/.test(t)) { const s=t.includes('malam')?'Malam':t.includes('pagi')?'Pagi':t.includes('siang')?'Siang':'Sore'; reply=`${s} juga! Wah pas banget.`; }
    else if(/halo|hai|hey|apa kabar/.test(t)) reply=`Halo! Kabar baik. Siap barter ${vol}kg bersama saya?`;
    else if(/kapan|besok|lusa|minggu|hari ini/.test(t)) reply=`Drop Point Balai Desa buka setiap hari 07.00–17.00 WIB.`;
    else if(/lokasi|dimana|tempat|drop|antar|armada|bumdes/.test(t)) reply=`Titik serah di Drop Point Balai Desa. Bisa juga pakai Armada BUMDes desa kita, biaya 5 Poin/km.`;
    else if(/kualitas|bagus|jamur|busuk|aman/.test(t)) reply=`Aman Pak, AI TukarTani sudah validasi Grade A.`;
    else if(/poin|harga|nilai/.test(t)) reply=`Volume ${vol}kg = ${vol} TukarPoin ≈ Rp${(vol*100).toLocaleString('id-ID')}.`;
    else if(/setuju|deal|oke|siap|sepakat/.test(t)) reply=`Mantap! Klik tombol <b>"Sepakat Barter"</b> di atas ya Pak/Bu.`;
    else if(/terima kasih|makasih/.test(t)) reply=`Sama-sama! Jangan lupa kasih rating bintang 🌟`;
    else reply=`Baik, sudah dicatat. Ada yang ingin dikonfirmasi lagi sebelum kita sepakati barter ${vol}kg ini?`;
    const time2=new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});
    chat.insertAdjacentHTML('beforeend',`<div class="flex items-end gap-2 md:gap-3 w-full md:w-4/5 animate-fade-in">
      <img src="https://ui-avatars.com/api/?name=Pak+Budi&background=eab308&color=fff" class="w-8 h-8 rounded-full shadow-sm mb-1 shrink-0"/>
      <div class="p-4 bg-white dark:bg-slate-900 rounded-3xl rounded-bl-none shadow-sm border border-slate-100 dark:border-slate-800">
        <p class="text-sm text-slate-700 dark:text-slate-300 font-medium leading-relaxed">${reply}</p>
        <span class="text-[10px] text-slate-400 mt-2 block text-right font-semibold">${time2}</span>
      </div></div>`);
    chat.scrollTop=chat.scrollHeight;
  },900);
}

function handleChatKeyPress(e) { if(e.key==='Enter') sendMessage(); }
function toggleChatAttachment() { const m=document.getElementById('chat-attachment-menu'); m?.classList.toggle('hidden'); m?.classList.toggle('flex'); }

function sendImage(event) {
  const file=event.target.files[0]; if(!file) return;
  const reader=new FileReader();
  reader.onload=e=>{
    const chat=document.getElementById('chat-messages');
    const time=new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});
    chat.insertAdjacentHTML('beforeend',`<div class="flex items-end justify-end gap-2 w-full animate-fade-in">
      <div class="p-2 bg-gradient-to-br from-brand-500 to-brand-600 text-white rounded-3xl rounded-br-none shadow-md max-w-[70%]">
        <img src="${e.target.result}" class="w-full rounded-2xl mb-1 object-cover"/>
        <span class="text-[10px] text-brand-100 mt-1 flex justify-end items-center gap-1 font-semibold px-2 pb-1">${time} <i class="fa-solid fa-check text-xs"></i></span>
      </div></div>`);
    chat.scrollTop=chat.scrollHeight; document.getElementById('chat-image-upload').value='';
  };
  reader.readAsDataURL(file);
}

function sendLocation() {
  const chat=document.getElementById('chat-messages'); const time=new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});
  chat.insertAdjacentHTML('beforeend',`<div class="flex items-end justify-end gap-2 w-full animate-fade-in">
    <div class="p-3 bg-gradient-to-br from-brand-500 to-brand-600 text-white rounded-3xl rounded-br-none shadow-md max-w-[75%] flex flex-col">
      <div class="w-full aspect-video bg-white/20 rounded-xl flex items-center justify-center mb-2 overflow-hidden relative">
        <i class="fa-solid fa-location-dot text-4xl text-white drop-shadow-md z-10"></i></div>
      <p class="text-sm font-bold px-1">Lokasi Terkini Saya</p>
      <p class="text-xs font-medium text-brand-100 px-1 mb-1">GPS Aktif</p>
      <span class="text-[10px] text-brand-100 mt-1 flex justify-end items-center gap-1 font-semibold px-1">${time} <i class="fa-solid fa-check text-xs"></i></span>
    </div></div>`);
  chat.scrollTop=chat.scrollHeight; toggleChatAttachment();
}

// ── PETA DENGAN LIVE LOCATION ────────────────────────────────
let mapInstance=null, matchMapInstance=null, userLiveMarker=null, liveWatchId=null;

function setupMapSearch() {
  const input=document.getElementById('map-search'); if(!input) return;
  let sugEl=document.getElementById('map-suggestions');
  if (!sugEl) {
    sugEl=document.createElement('div'); sugEl.id='map-suggestions'; sugEl.className='hidden';
    input.parentElement.style.position='relative'; input.parentElement.appendChild(sugEl);
  }
  input.addEventListener('input',()=>{
    const q=input.value.trim().toLowerCase();
    if(q.length<2){ sugEl.classList.add('hidden'); return; }
    const results=indonesiaWilayah.filter(w=>w.nama.toLowerCase().includes(q)||w.provinsi.toLowerCase().includes(q)).slice(0,8);
    if(!results.length){ sugEl.classList.add('hidden'); return; }
    sugEl.innerHTML=results.map(w=>`<div class="map-suggestion-item" onclick="flyToWilayah(${w.lat},${w.lng},'${w.nama}','${w.provinsi}')">
      <i class="fa-solid ${w.tipe==='kota'?'fa-city':'fa-map'} text-brand-500 text-sm shrink-0"></i>
      <div><p class="font-bold text-slate-800 dark:text-slate-200">${w.nama}</p>
      <p class="text-[11px] text-slate-400 dark:text-slate-500">${w.provinsi}</p></div></div>`).join('');
    sugEl.classList.remove('hidden');
  });
  document.addEventListener('click',e=>{ if(!input.contains(e.target)&&!sugEl.contains(e.target)) sugEl.classList.add('hidden'); });
}

function flyToWilayah(lat,lng,nama,provinsi) {
  if(!mapInstance) return;
  mapInstance.flyTo([lat,lng],13,{duration:1.2});
  addWilayahMarkers(lat,lng,nama);
  const sug=document.getElementById('map-suggestions'); if(sug) sug.classList.add('hidden');
  const input=document.getElementById('map-search'); if(input) input.value=nama;
}

// FIX: partner marker sekarang bisa diklik dan membuka popup
let wilayahMarkers=[];
function addWilayahMarkers(centerLat,centerLng,namaWilayah) {
  wilayahMarkers.forEach(m=>{ try{mapInstance.removeLayer(m);}catch(e){} });
  wilayahMarkers=[];

  const circle=L.circle([centerLat,centerLng],{color:'#10b981',fillColor:'#10b981',fillOpacity:0.08,weight:2,dashArray:'5,5',radius:15000}).addTo(mapInstance);
  wilayahMarkers.push(circle);

  const userIconHtml=`<div style="position:relative;width:32px;height:32px;display:flex;align-items:center;justify-content:center;">
    <div style="position:absolute;inset:0;background:#3b82f6;border-radius:50%;animation:ping 1.2s cubic-bezier(0,0,0.2,1) infinite;opacity:0.6;"></div>
    <div style="position:relative;width:16px;height:16px;background:#3b82f6;border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(59,130,246,0.5);z-index:10;"></div>
  </div>`;
  const userMarker=L.marker([centerLat,centerLng],{icon:L.divIcon({html:userIconHtml,className:'',iconSize:[32,32],iconAnchor:[16,16]})})
    .addTo(mapInstance).bindPopup(`<div style='text-align:center;'><b style='color:#0f172a;'>📍 Lokasi Anda</b><br><span style='font-size:11px;color:#64748b;'>${namaWilayah}</span></div>`,{className:'modern-popup'});
  wilayahMarkers.push(userMarker);

  const partners=[
    {lat:centerLat+0.025,lng:centerLng+0.018,type:'cow',      label:'Peternakan Pak Budi',   sub:'Tersedia: 200kg Kotoran Sapi',  jarak:'2.4 km'},
    {lat:centerLat-0.020,lng:centerLng+0.030,type:'wheat-awn',label:'Gapoktan Maju',           sub:'Tersedia: 300kg Jerami Padi',   jarak:'3.1 km'},
    {lat:centerLat+0.010,lng:centerLng-0.025,type:'crow',     label:'Peternakan Ayam Pak RT',  sub:'Tersedia: 150kg Kotoran Ayam',  jarak:'2.0 km'},
    {lat:centerLat-0.035,lng:centerLng-0.010,type:'seedling', label:'Kelompok Tani Wanita',    sub:'Tersedia: 400kg Sekam Padi',    jarak:'4.2 km'},
  ];

  // Drop Point Balai Desa — clickable
  const dpHtml=`<div style="width:44px;height:44px;background:#1d4ed8;border:3px solid white;border-radius:10px;display:flex;align-items:center;justify-content:center;color:white;font-size:15px;box-shadow:0 3px 10px rgba(29,78,216,0.4);cursor:pointer;">
    <i class="fa-solid fa-landmark"></i></div>`;
  const dpMarker=L.marker([centerLat+0.008,centerLng-0.012],{icon:L.divIcon({html:dpHtml,className:'',iconAnchor:[22,22]})})
    .addTo(mapInstance)
    .bindPopup(`<div style="text-align:center;min-width:150px;padding:4px;">
      <b style="display:block;font-size:13px;color:#1d4ed8;">📍 Drop Point Balai Desa</b>
      <span style="font-size:11px;color:#475569;font-weight:700;">Titik Serah Terima Resmi</span><br>
      <span style="font-size:10px;color:#94a3b8;">Buka: 07.00–17.00 WIB</span>
    </div>`,{className:'modern-popup'});
  wilayahMarkers.push(dpMarker);

  partners.forEach(p=>{
    const iconHtml=`<div style="display:flex;flex-direction:column;align-items:center;cursor:pointer;">
      <div style="width:44px;height:44px;background:#10b981;border:3px solid white;border-radius:50%;display:flex;align-items:center;justify-content:center;color:white;font-size:18px;box-shadow:0 3px 12px rgba(16,185,129,0.5);">
        <i class="fa-solid fa-${p.type}"></i></div>
      <div style="width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-top:9px solid #10b981;margin-top:-1px;"></div>
    </div>`;
    const marker=L.marker([p.lat,p.lng],{icon:L.divIcon({html:iconHtml,className:'',iconSize:[44,55],iconAnchor:[22,55],popupAnchor:[0,-55]})})
      .addTo(mapInstance)
      .bindPopup(`<div style="text-align:center;min-width:170px;padding:6px 4px;">
        <b style="display:block;font-size:13px;color:#0f172a;margin-bottom:3px;">${p.label}</b>
        <span style="font-size:11px;color:#10b981;font-weight:700;">${p.sub}</span><br>
        <span style="font-size:10px;color:#64748b;">📍 ${p.jarak} dari Anda</span><br>
        <button onclick="startChatWithMitra('"+p.label+"','"+p.type+"','"+p.jarak+"')" style="margin-top:8px;background:#10b981;color:white;border:none;padding:7px 18px;border-radius:10px;font-size:11px;font-weight:700;cursor:pointer;width:100%;">
          <i class='fa-solid fa-comment'></i> Chat Sekarang
        </button>
      </div>`,{className:'modern-popup'});
    wilayahMarkers.push(marker);
  });
}

// FIX: initMap — GPS diminta PERTAMA, fallback ke Bogor (bukan Padang)
function initMap() {
  if (mapInstance!==null) { mapInstance.invalidateSize(); return; }

  // Tampilkan map dulu dengan center Indonesia (sementara GPS belum ready)
  // Zoom 5 supaya tidak bias ke mana-mana
  mapInstance=L.map('map',{zoomControl:false}).setView([-6.5599,106.7226],11);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© <a href="https://openstreetmap.org">OpenStreetMap</a>'}).addTo(mapInstance);
  L.control.zoom({position:'bottomright'}).addTo(mapInstance);
  setupMapSearch();

  // Tambah style animasi ping jika belum ada
  if (!document.getElementById('ping-style')) {
    const s=document.createElement('style');
    s.id='ping-style';
    s.textContent=`@keyframes ping{75%,100%{transform:scale(2);opacity:0}}`;
    document.head.appendChild(s);
  }

  // Tampilkan tombol live location
  const liveBtn=document.getElementById('btn-live-location');
  if (liveBtn) liveBtn.classList.remove('hidden');

  if (!navigator.geolocation) {
    // Tidak ada GPS — fallback Cibanteng Bogor
    _renderMapAtLocation(-6.5599,106.7226,'Cibanteng, Bogor (Fallback)');
    return;
  }

  // Loading indicator di peta
  const loadHtml=`<div id="map-gps-loading" style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);z-index:2000;background:rgba(255,255,255,0.95);backdrop-filter:blur(8px);padding:16px 24px;border-radius:20px;box-shadow:0 8px 30px rgba(0,0,0,0.12);display:flex;align-items:center;gap:12px;font-family:Poppins,sans-serif;">
    <div style="width:20px;height:20px;border:3px solid #10b981;border-top-color:transparent;border-radius:50%;animation:spin 0.8s linear infinite;"></div>
    <span style="font-size:13px;font-weight:700;color:#0f172a;">Mencari lokasi GPS...</span>
  </div>
  <style>#map-gps-loading{pointer-events:none;}@keyframes spin{to{transform:rotate(360deg)}}</style>`;
  document.getElementById('map').insertAdjacentHTML('beforeend',loadHtml);

  navigator.geolocation.getCurrentPosition(
    pos=>{
      // Hapus loading
      document.getElementById('map-gps-loading')?.remove();
      const {latitude:lat,longitude:lng}=pos.coords;
      _renderMapAtLocation(lat,lng,'Lokasi Anda (GPS)');
    },
    err=>{
      document.getElementById('map-gps-loading')?.remove();
      console.log('GPS gagal:',err.message);
      // Fallback Cibanteng Bogor (sesuai lokasi user)
      _renderMapAtLocation(-6.5599,106.7226,'Cibanteng, Kab. Bogor');
      showToast('GPS tidak aktif — tampilkan area Bogor','fa-location-dot','text-amber-400');
    },
    {enableHighAccuracy:true,timeout:8000,maximumAge:0}
  );
}

// Helper: render semua marker di koordinat tertentu
function _renderMapAtLocation(lat,lng,label) {
  // Fly ke lokasi
  mapInstance.flyTo([lat,lng],14,{duration:1.2});

  // Bersihkan marker lama
  wilayahMarkers.forEach(m=>{try{mapInstance.removeLayer(m);}catch(e){}});
  wilayahMarkers=[];

  // Marker user (live pulse)
  const liveHtml=`<div style="position:relative;width:36px;height:36px;display:flex;align-items:center;justify-content:center;">
    <div style="position:absolute;width:36px;height:36px;background:#3b82f6;border-radius:50%;opacity:0.4;animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite;"></div>
    <div style="position:relative;width:16px;height:16px;background:#3b82f6;border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(59,130,246,0.6);z-index:10;"></div>
  </div>`;
  if (userLiveMarker) { try{mapInstance.removeLayer(userLiveMarker);}catch(e){} }
  userLiveMarker=L.marker([lat,lng],{
    icon:L.divIcon({html:liveHtml,className:'',iconSize:[36,36],iconAnchor:[18,18]})
  }).addTo(mapInstance)
    .bindPopup(`<div style="text-align:center;"><b style="color:#0f172a;">📍 ${label}</b><br><span style="font-size:11px;color:#64748b;">Radius pencarian 15km</span></div>`,{className:'modern-popup'})
    .openPopup();
  wilayahMarkers.push(userLiveMarker);

  // Radius circle 15km
  const circle=L.circle([lat,lng],{color:'#10b981',fillColor:'#10b981',fillOpacity:0.06,weight:2,dashArray:'6,4',radius:15000}).addTo(mapInstance);
  wilayahMarkers.push(circle);

  // Marker mitra di sekitar user
  const partners=[
    {dlat:+0.025,dlng:+0.018,type:'cow',      label:'Peternakan Pak Budi',   sub:'200kg Kotoran Sapi', jarak:'2.4 km'},
    {dlat:-0.020,dlng:+0.030,type:'wheat-awn',label:'Gapoktan Maju',          sub:'300kg Jerami Padi',  jarak:'3.1 km'},
    {dlat:+0.010,dlng:-0.025,type:'crow',     label:'Peternakan Ayam Pak RT', sub:'150kg Kotoran Ayam', jarak:'2.0 km'},
    {dlat:-0.035,dlng:-0.010,type:'seedling', label:'Kelompok Tani Wanita',   sub:'400kg Sekam Padi',   jarak:'4.2 km'},
  ];
  partners.forEach(p=>{
    const iHtml=`<div style="display:flex;flex-direction:column;align-items:center;cursor:pointer;">
      <div style="width:44px;height:44px;background:#10b981;border:3px solid white;border-radius:50%;display:flex;align-items:center;justify-content:center;color:white;font-size:18px;box-shadow:0 3px 12px rgba(16,185,129,0.5);">
        <i class="fa-solid fa-${p.type}"></i></div>
      <div style="width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-top:9px solid #10b981;margin-top:-1px;"></div>
    </div>`;
    const m=L.marker([lat+p.dlat,lng+p.dlng],{icon:L.divIcon({html:iHtml,className:'',iconSize:[44,55],iconAnchor:[22,55],popupAnchor:[0,-55]})})
      .addTo(mapInstance)
      .bindPopup(`<div style="text-align:center;min-width:170px;padding:6px 4px;">
        <b style="display:block;font-size:13px;color:#0f172a;margin-bottom:3px;">${p.label}</b>
        <span style="font-size:11px;color:#10b981;font-weight:700;">${p.sub}</span><br>
        <span style="font-size:10px;color:#64748b;">📍 ${p.jarak} dari Anda</span><br>
        <button onclick="startChatWithMitra('"+p.label+"','"+p.type+"','"+p.jarak+"')" style="margin-top:8px;background:#10b981;color:white;border:none;padding:7px 18px;border-radius:10px;font-size:11px;font-weight:700;cursor:pointer;width:100%;">
          <i class='fa-solid fa-comment'></i> Chat Sekarang</button>
      </div>`,{className:'modern-popup'});
    wilayahMarkers.push(m);
  });

  // Drop Point Balai Desa
  const dpHtml=`<div style="width:44px;height:44px;background:#1d4ed8;border:3px solid white;border-radius:10px;display:flex;align-items:center;justify-content:center;color:white;font-size:15px;box-shadow:0 3px 10px rgba(29,78,216,0.4);cursor:pointer;">
    <i class="fa-solid fa-landmark"></i></div>`;
  const dpM=L.marker([lat+0.008,lng-0.012],{icon:L.divIcon({html:dpHtml,className:'',iconAnchor:[22,22]})})
    .addTo(mapInstance)
    .bindPopup(`<div style="text-align:center;min-width:150px;padding:4px;">
      <b style="display:block;font-size:13px;color:#1d4ed8;">📍 Drop Point Balai Desa</b>
      <span style="font-size:11px;color:#475569;font-weight:700;">Titik Serah Terima Resmi</span><br>
      <span style="font-size:10px;color:#94a3b8;">Buka: 07.00–17.00 WIB</span>
    </div>`,{className:'modern-popup'});
  wilayahMarkers.push(dpM);

  // Update search placeholder
  const srch=document.getElementById('map-search');
  if (srch) srch.placeholder=`GPS: ${label.split('(')[0].trim()} — ketik untuk cari wilayah lain`;
}

function centerToLiveLocation() {
  if (!mapInstance) return;
  navigator.geolocation.getCurrentPosition(pos=>{
    const {latitude:lat, longitude:lng}=pos.coords;
    mapInstance.flyTo([lat,lng],15,{duration:1});
    if (userLiveMarker) userLiveMarker.openPopup();
  }, ()=>showToast('GPS tidak tersedia di browser ini.','fa-location-dot','text-red-400'));
}

function initMatchMap() {
  if (matchMapInstance!==null) { matchMapInstance.invalidateSize(); return; }
  const uLat=-0.9145,uLng=100.4607,mLat=-0.8950,mLng=100.4780;
  matchMapInstance=L.map('match-map',{zoomControl:false,dragging:false}).setView([uLat,uLng],13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:''}).addTo(matchMapInstance);
  const uIcon=L.divIcon({className:'bg-transparent',html:`<div style="position:relative;width:40px;height:40px;display:flex;align-items:center;justify-content:center;"><div style="position:absolute;inset:0;background:#3b82f6;border-radius:50%;animation:ping 1.2s infinite;opacity:0.5;"></div><div style="position:relative;width:20px;height:20px;background:#3b82f6;border:3px solid white;border-radius:50%;z-index:10;"></div></div>`,iconSize:[40,40],iconAnchor:[20,20]});
  const mIcon=L.divIcon({className:'bg-transparent',html:`<div style="display:flex;flex-direction:column;align-items:center;"><div style="width:48px;height:48px;background:white;border-radius:50%;border:2px solid #10b981;box-shadow:0 4px 15px rgba(0,0,0,0.15);overflow:hidden;"><img src="https://ui-avatars.com/api/?name=Pak+Budi&background=eab308&color=fff" style="width:100%;height:100%;object-fit:cover;"/></div><div style="width:12px;height:12px;background:#10b981;transform:rotate(45deg);margin-top:-4px;"></div></div>`,iconSize:[48,60],iconAnchor:[24,60]});
  L.marker([uLat,uLng],{icon:uIcon}).addTo(matchMapInstance);
  L.marker([mLat,mLng],{icon:mIcon}).addTo(matchMapInstance);
  const ll=[[uLat,uLng],[mLat,mLng]];
  L.polyline(ll,{color:'#10b981',weight:4,dashArray:'8,8'}).addTo(matchMapInstance);
  matchMapInstance.fitBounds(L.polyline(ll).getBounds(),{padding:[40,40]});
}

// ── TOAST ─────────────────────────────────────────────────────
function showToast(message, icon='fa-circle-check', color='text-brand-400') {
  const toast=document.getElementById('toast-notification');
  const msgEl=document.getElementById('toast-msg'); const iconEl=document.getElementById('toast-icon');
  if(msgEl) msgEl.innerText=message;
  if(iconEl) iconEl.className=`fa-solid ${icon} ${color} text-lg`;
  toast.classList.remove('opacity-0','-translate-y-10','pointer-events-none');
  toast.classList.add('opacity-100','translate-y-0');
  setTimeout(()=>{ toast.classList.remove('opacity-100','translate-y-0'); toast.classList.add('opacity-0','-translate-y-10','pointer-events-none'); },2800);
}

// ── MODAL HELPERS ─────────────────────────────────────────────
let confirmCallback=null;
function openConfirmModal(title,desc,iconClass,colorClass,btnText,btnColorClass,callback) {
  document.getElementById('confirm-title').innerText=title;
  document.getElementById('confirm-desc').innerText=desc;
  document.getElementById('confirm-icon-container').className=`w-20 h-20 rounded-full flex items-center justify-center text-4xl mx-auto mb-6 ${colorClass}`;
  document.getElementById('confirm-icon').className=iconClass;
  const btn=document.getElementById('btn-confirm-action');
  btn.innerText=btnText; btn.className=`flex-1 text-white font-extrabold py-3.5 rounded-2xl shadow-lg transition-all ${btnColorClass}`;
  confirmCallback=callback;
  btn.onclick=()=>{ if(confirmCallback) confirmCallback(); closeConfirmModal(); };
  const modal=document.getElementById('modal-confirm');
  modal.classList.remove('hidden'); modal.classList.add('flex');
  setTimeout(()=>{ modal.classList.remove('opacity-0'); document.getElementById('confirm-content')?.classList.remove('scale-90'); },10);
}
function closeConfirmModal() {
  const modal=document.getElementById('modal-confirm');
  modal.classList.add('opacity-0'); document.getElementById('confirm-content')?.classList.add('scale-90');
  setTimeout(()=>{ modal.classList.add('hidden'); modal.classList.remove('flex'); },300);
}
function openInfoModal(title,desc,iconClass,containerClasses) {
  document.getElementById('info-title').innerText=title;
  document.getElementById('info-desc').innerHTML=desc;
  document.getElementById('info-icon-container').className=`w-20 h-20 rounded-full flex items-center justify-center text-4xl mx-auto mb-6 ${containerClasses}`;
  document.getElementById('info-icon').className=iconClass;
  const modal=document.getElementById('modal-info');
  modal.classList.remove('hidden'); modal.classList.add('flex');
  setTimeout(()=>{ modal.classList.remove('opacity-0'); document.getElementById('info-content')?.classList.remove('scale-90'); },10);
}
function closeInfoModal() {
  const modal=document.getElementById('modal-info');
  modal.classList.add('opacity-0'); document.getElementById('info-content')?.classList.add('scale-90');
  setTimeout(()=>{ modal.classList.add('hidden'); modal.classList.remove('flex'); },300);
}

// ── PENUKARAN POIN ────────────────────────────────────────────
function tukarItem(namaItem,poin) {
  if (!currentUser) return;
  if (currentUser.points<poin) { openInfoModal('Poin Tidak Cukup',`Maaf, poin Anda saat ini <b>${currentUser.points}</b>, kurang <b>${poin-currentUser.points} Poin</b> untuk <b>${namaItem}</b>.`,'fa-solid fa-circle-xmark','bg-red-100 dark:bg-red-900/30 text-red-500'); return; }
  openConfirmModal('Konfirmasi Penukaran',`Tukarkan ${poin} Poin untuk "${namaItem}"?`,'fa-solid fa-gift','bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600','Ya, Tukar','bg-yellow-500 hover:bg-yellow-600',()=>{
    currentUser.points-=poin;
    pushNotification(`Penukaran: ${namaItem}`,`${poin} Poin berhasil ditukar. Sisa: ${currentUser.points} Poin.`,'fa-gift');
    saveCurrentUser();
    setTimeout(()=>openInfoModal('Penukaran Berhasil! 🎁',`<b>${poin} Poin</b> ditukarkan untuk <b>${namaItem}</b>. Cek notifikasi untuk instruksi pengambilan. Sisa poin: ${currentUser.points}.`,'fa-solid fa-check-circle','bg-green-100 dark:bg-green-900/30 text-green-500'),350);
  });
}

// ── PROFIL ────────────────────────────────────────────────────
function showRiwayatBarter() { if(!currentUser) return; openInfoModal('Total Riwayat Barter',`Anda telah menyelesaikan <b>${currentUser.tradeHistoryCount} transaksi barter</b> komoditas melalui TukarTani.`,'fa-solid fa-clock-rotate-left','bg-blue-100 dark:bg-blue-900/30 text-blue-500'); }
function showReduksiEmisi() { if(!currentUser) return; openInfoModal('Reduksi Emisi CO₂',`Melalui barter, Anda berkontribusi mereduksi <b>${parseFloat(currentUser.carbonReduction||0).toFixed(2)} Ton CO₂</b>. Aksi nyata untuk lingkungan! 🌿`,'fa-solid fa-leaf','bg-emerald-100 dark:bg-emerald-900/30 text-emerald-500'); }
function showPusatBantuan() { openInfoModal('Pusat Bantuan & Regulasi (PPL)','Hubungi <b>Penyuluh Pertanian Lapangan (PPL)</b> terdekat di Balai Desa atau Dinas Pertanian untuk konsultasi standar kualitas komoditas dan regulasi pertanian setempat.','fa-solid fa-headset','bg-purple-100 dark:bg-purple-900/30 text-purple-500'); }
function resetDataAkun() {
  openConfirmModal('Reset Data Akun','PERINGATAN: Seluruh data akun Anda akan dihapus permanen.','fa-solid fa-rotate-right','bg-orange-100 dark:bg-orange-900/30 text-orange-600','Ya, Reset','bg-orange-500 hover:bg-orange-600',()=>{
    if(currentUser) { const u=getUsers(); delete u[currentUser.phone]; saveUsers(u); }
    localStorage.removeItem('isLoggedIn'); localStorage.removeItem('tukarTaniCurrentUser');
    showToast('Data akun berhasil dihapus.'); setTimeout(()=>location.reload(),1500);
  });
}
function handleLogout() {
  openConfirmModal('Keluar Akun','Apakah Anda yakin ingin keluar dari akun TukarTani?','fa-solid fa-arrow-right-from-bracket','bg-red-100 dark:bg-red-900/30 text-red-600','Keluar','bg-red-500 hover:bg-red-600',()=>{
    localStorage.removeItem('isLoggedIn'); localStorage.removeItem('tukarTaniCurrentUser'); currentUser=null;
    if(mapInstance){mapInstance.remove();mapInstance=null;}
    if(matchMapInstance){matchMapInstance.remove();matchMapInstance=null;}
    document.getElementById('app-view').classList.remove('flex'); document.getElementById('app-view').classList.add('hidden');
    document.getElementById('auth-view').classList.remove('hidden'); document.getElementById('auth-view').classList.add('flex');
    toggleAuthMode('login');
  });
}

// ── INISIALISASI ──────────────────────────────────────────────
document.addEventListener('DOMContentLoaded',()=>{
  const savedTheme=localStorage.getItem('tt_theme');
  if (savedTheme==='dark') {
    document.documentElement.classList.add('dark');
    document.querySelectorAll('.theme-icon-class').forEach(el=>el.classList.replace('fa-moon','fa-sun'));
  }
  document.querySelectorAll('.theme-toggle-btn').forEach(btn=>btn.addEventListener('click',toggleTheme));
  setupPinInputs();

  if (localStorage.getItem('isLoggedIn')==='true' && loadCurrentUser()) {
    // Returning user — percepat splash lalu langsung ke app
    const splash=document.getElementById('splash-screen');
    if (splash) {
      setTimeout(()=>{ splash.classList.add('sp-exit'); setTimeout(()=>splash.style.display='none',650); },2000);
    }
    document.getElementById('auth-view')?.classList.add('hidden');
    document.getElementById('app-view').classList.remove('hidden');
    document.getElementById('app-view').classList.add('flex');
    updateUIWithUserData(); switchTab('beranda');
  } else {
    localStorage.removeItem('isLoggedIn'); localStorage.removeItem('tukarTaniCurrentUser');
    // Splash screen (di index.html) akan menampilkan auth-view setelah progress selesai
  }
});

'use client';

import React, { useState, useEffect } from 'react';

interface ServiceItem {
  id: number;
  n: string;
  p: number;
  d: number;
}

interface StaffItem {
  id: number;
  n: string;
}

interface CustomerItem {
  id: number;
  name: string;
  phone: string;
  pw: string;
}

interface AppointmentItem {
  id: number;
  cid: number;
  name: string;
  svc: number;
  stf: number;
  date: string;
  time: string;
  st: 'onayli' | 'geldi' | 'koltukta' | 'tamam' | 'iptal' | 'noshow';
  chips: string[];
}

interface LogItem {
  id: number;
  t: string;
  txt: string;
  a: number;
  prev: string;
  u: boolean;
}

interface ShopItem {
  n: string;
  u: string;
  a: string;
  t: string;
}

const SV: ServiceItem[] = [
  { id: 1, n: 'İmza Saç Kesimi', p: 450, d: 45 },
  { id: 2, n: 'Sakal Tıraşı', p: 250, d: 30 },
  { id: 3, n: 'Saç + Sakal', p: 650, d: 75 },
];

const ST: StaffItem[] = [
  { id: 1, n: 'Murat Can' },
  { id: 2, n: 'Emre Yıldız' },
  { id: 3, n: 'Tolga Demir' },
];

const OPEN = 480; // 08:00
const CLOSE = 1260; // 21:00
const BS = 780; // 13:00
const BE = 840; // 14:00
const CLOSED_DAY = 0; // Pazar

const MON = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
const DN = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];

const iso = (d: Date) =>
  d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2);

const addDays = (s: string, n: number) => {
  const d = new Date(s + 'T12:00:00');
  d.setDate(d.getDate() + n);
  return iso(d);
};

const fd = (s: string) => {
  const d = new Date(s + 'T12:00:00');
  return d.getDate() + ' ' + MON[d.getMonth()] + ' ' + DN[d.getDay()];
};

const mm = (t: string) => {
  const [a, b] = t.split(':');
  return +a * 60 + +b;
};

const tt = (m: number) =>
  ('0' + Math.floor(m / 60)).slice(-2) + ':' + ('0' + (m % 60)).slice(-2);

const CHIPS = ['Ense: Natürel', 'Sessiz Tıraş', 'İkram: Sade Kahve', 'Makine Boyu: 2', 'İkram: Çay'];

const LB: Record<string, string> = {
  onayli: 'Onaylı',
  geldi: 'Geldi',
  koltukta: 'Koltukta',
  tamam: 'Tamamlandı',
  iptal: 'İptal',
  noshow: 'Gelmedi',
};

const nd = (s: string) => {
  let d = (s || '').replace(/\D/g, '');
  if (d.length === 12 && d.startsWith('90')) d = d.slice(2);
  return d.replace(/^0/, '');
};

export default function Home() {
  const today = iso(new Date());

  const [view, setView] = useState<'c' | 'b' | 'a'>('c');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Veri Durumu
  const [CUS, setCUS] = useState<CustomerItem[]>([
    { id: 1, name: 'Can Kaya', phone: '05551112233', pw: '1234' },
    { id: 2, name: 'Mert B.', phone: '05552223344', pw: '1234' },
    { id: 3, name: 'Selim Bey', phone: '05553334455', pw: '1234' },
    { id: 4, name: 'Ali V.', phone: '05554445566', pw: '1234' },
    { id: 5, name: 'Burak Bey', phone: '05556667788', pw: '1234' },
  ]);

  const [appts, setAppts] = useState<AppointmentItem[]>([
    { id: 1, cid: 2, name: 'Mert B.', svc: 1, stf: 1, date: addDays(today, 7), time: '11:00', st: 'onayli', chips: [] },
    { id: 2, cid: 1, name: 'Can Kaya', svc: 1, stf: 1, date: today, time: '15:00', st: 'onayli', chips: ['Ense: Natürel', 'Sessiz Tıraş', 'İkram: Sade Kahve'] },
    { id: 3, cid: 3, name: 'Selim Bey', svc: 1, stf: 1, date: today, time: '16:30', st: 'onayli', chips: [] },
    { id: 4, cid: 4, name: 'Ali V.', svc: 2, stf: 3, date: today, time: '10:00', st: 'tamam', chips: [] },
    { id: 5, cid: 1, name: 'Can Kaya', svc: 1, stf: 1, date: addDays(today, -20), time: '15:00', st: 'tamam', chips: ['Ense: Natürel'] },
    { id: 6, cid: 1, name: 'Can Kaya', svc: 3, stf: 1, date: addDays(today, -40), time: '16:00', st: 'tamam', chips: [] },
    { id: 7, cid: 1, name: 'Can Kaya', svc: 2, stf: 2, date: addDays(today, 12), time: '17:00', st: 'onayli', chips: [] },
  ]);

  const [off, setOff] = useState<Record<number, boolean>>({ 1: false, 2: false, 3: false });
  const [log, setLog] = useState<LogItem[]>([]);
  const [shops, setShops] = useState<ShopItem[]>([
    { n: 'Atelier de Coupe', u: 'atelier-de-coupe', a: 'Bağdat Cad. No: 342', t: '0216 000 00 00' },
  ]);

  const [me, setMe] = useState<number | null>(1); // Varsayılan Can Kaya oturumu

  // Müşteri Randevu Alma Durumu
  const [C, setC] = useState<{
    svc: number;
    stf: number;
    date: string;
    time: string | null;
    chips: string[];
    done: boolean;
  }>({
    svc: 1,
    stf: 1,
    date: today,
    time: null,
    chips: [],
    done: false,
  });

  // Giriş Formu State
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPw, setLoginPw] = useState('');

  // Yeni Müşteri Tanımlama State
  const [newCusName, setNewCusName] = useState('');
  const [newCusPhone, setNewCusPhone] = useState('');
  const [newCusPw, setNewCusPw] = useState('');

  // Periyodik Randevu Serisi State
  const [seriesCustomer, setSeriesCustomer] = useState<number>(5);
  const [seriesStartDate, setSeriesStartDate] = useState<string>(() => {
    let st = addDays(today, 1);
    while (new Date(addDays(st, 20) + 'T12:00:00').getDay() === 0) st = addDays(st, 1);
    return st;
  });
  const [seriesInterval, setSeriesInterval] = useState<number>(20);
  const [seriesTime, setSeriesTime] = useState<string>('16:00');
  const [seriesMonths, setSeriesMonths] = useState<number>(5);
  const [seriesPreview, setSeriesPreview] = useState<{
    cid: number;
    name: string;
    time: string;
    l: { date: string; moved?: number }[];
  } | null>(null);

  // Admin Müdahale & Arama State
  const [adminQuery, setAdminQuery] = useState('');
  const [editAptId, setEditAptId] = useState<number | null>(null);
  const [editStaffId, setEditStaffId] = useState<number>(1);
  const [editTimeVal, setEditTimeVal] = useState<string>('15:00');
  const [editNote, setEditNote] = useState<string>('Müşteri trafikte kaldığını iletti, saat ayarlandı.');

  // Yeni Salon State
  const [newShopName, setNewShopName] = useState('');
  const [newShopSlug, setNewShopSlug] = useState('');
  const [newShopAddress, setNewShopAddress] = useState('');
  const [newShopPhone, setNewShopPhone] = useState('');

  // LocalStorage senkronizasyonu
  useEffect(() => {
    try {
      const stored = localStorage.getItem('berberim2');
      if (stored) {
        const x = JSON.parse(stored);
        if (x.CUS) setCUS(x.CUS);
        if (x.appts) setAppts(x.appts);
        if (x.log) setLog(x.log);
        if (x.off) setOff(x.off);
        if (x.shops) setShops(x.shops);
      }
      const s = localStorage.getItem('berberim_s');
      if (s) {
        const numId = +s;
        setMe(numId);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const saveToStorage = (
    newCus = CUS,
    newAppts = appts,
    newLog = log,
    newOff = off,
    newShops = shops
  ) => {
    try {
      localStorage.setItem(
        'berberim2',
        JSON.stringify({ CUS: newCus, appts: newAppts, log: newLog, off: newOff, shops: newShops })
      );
    } catch (e) {
      console.error(e);
    }
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg((cur) => (cur === msg ? null : cur));
    }, 2600);
  };

  const sv = (id: number) => SV.find((x) => x.id === id) || SV[0];
  const sf = (id: number) => ST.find((x) => x.id === id) || ST[0];
  const currentCustomer = CUS.find((x) => x.id === me);

  const ntime = () => {
    const d = new Date();
    return d.getHours() * 60 + d.getMinutes();
  };

  const busy = (stf: number, date: string, t: string, ign?: number) => {
    const m = mm(t);
    return appts.some(
      (a) =>
        a.id !== ign &&
        a.stf === stf &&
        a.date === date &&
        !['iptal', 'noshow'].includes(a.st) &&
        m >= mm(a.time) &&
        m < mm(a.time) + sv(a.svc).d
    );
  };

  const slotState = (stf: number, date: string, t: string): ['off' | 'free', string] => {
    const m = mm(t);
    if (new Date(date + 'T12:00:00').getDay() === CLOSED_DAY) return ['off', 'Kapalı'];
    if (off[stf]) return ['off', '⛔ Usta İzinli'];
    if (m >= BS && m < BE) return ['off', '☕ Personel Molası'];
    if (date === today && m < ntime()) return ['off', 'Geçti'];
    if (busy(stf, date, t)) return ['off', '🔴 Dolu'];
    return ['free', 'Boş / Müsait'];
  };

  const slots = () => {
    const r: string[] = [];
    for (let m = OPEN; m < CLOSE; m += 30) r.push(tt(m));
    return r;
  };

  const addLog = (txt: string, a: AppointmentItem, prev: any, currentLog = log) => {
    const newLogItem: LogItem = {
      id: Date.now() + Math.random(),
      t: new Date().toTimeString().slice(0, 5),
      txt,
      a: a.id,
      prev: JSON.stringify(prev),
      u: false,
    };
    const updatedLog = [newLogItem, ...currentLog];
    setLog(updatedLog);
    return updatedLog;
  };

  const setApp = (aId: number, patch: Partial<AppointmentItem>, txt: string) => {
    let updatedAppts = [...appts];
    const idx = updatedAppts.findIndex((x) => x.id === aId);
    if (idx === -1) return;

    const prev = { ...updatedAppts[idx] };
    const updatedA = { ...updatedAppts[idx], ...patch };
    updatedAppts[idx] = updatedA;
    setAppts(updatedAppts);

    const updatedLog = addLog(txt, updatedA, prev);
    saveToStorage(CUS, updatedAppts, updatedLog, off, shops);
  };

  // Müşteri Giriş Yap
  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const c = CUS.find((x) => nd(x.phone) === nd(loginPhone) && x.pw === loginPw);
    if (!c) {
      showToast('Telefon veya şifre hatalı');
      return;
    }
    setMe(c.id);
    try {
      localStorage.setItem('berberim_s', String(c.id));
    } catch (err) {}
    showToast('Giriş yapıldı: ' + c.name);
  };

  // Müşteri Çıkış Yap
  const handleLogout = () => {
    setMe(null);
    try {
      localStorage.removeItem('berberim_s');
    } catch (err) {}
    showToast('Çıkış yapıldı');
  };

  // Müşteri Randevu Kaydet
  const handleBook = () => {
    if (!currentCustomer || !C.time) return;
    const newA: AppointmentItem = {
      id: Date.now(),
      cid: currentCustomer.id,
      name: currentCustomer.name,
      svc: C.svc,
      stf: C.stf,
      date: C.date,
      time: C.time,
      st: 'onayli',
      chips: [...C.chips],
    };
    const updatedAppts = [...appts, newA];
    setAppts(updatedAppts);
    const updatedLog = addLog(newA.name + ' online randevu aldı (' + newA.time + ')', newA, {
      ...newA,
      st: 'iptal',
    });
    saveToStorage(CUS, updatedAppts, updatedLog, off, shops);
    setC((prev) => ({ ...prev, done: true }));
    showToast('Randevu berberin ekranına düştü');
  };

  // Müşteri Tercih Çipi Aç/Kapa
  const toggleChip = (chip: string) => {
    setC((prev) => ({
      ...prev,
      chips: prev.chips.includes(chip) ? prev.chips.filter((x) => x !== chip) : [...prev.chips, chip],
    }));
  };

  // Berber: Randevu Durumu Değiştir
  const handleStatusChange = (id: number, s: AppointmentItem['st']) => {
    const a = appts.find((x) => x.id === id);
    if (!a) return;
    setApp(a.id, { st: s }, a.name + ' → ' + LB[s]);
  };

  // Berber: Randevuyu Tamamla (Akıllı Erken Tamamlanma Uyarılı)
  const handleFinish = (id: number) => {
    const a = appts.find((x) => x.id === id);
    if (!a) return;
    const end = mm(a.time) + sv(a.svc).d;
    if (
      a.date === today &&
      ntime() < end &&
      !confirm('⚠️ Randevu bitiş saati (' + tt(end) + ') henüz gelmedi. Erken mi bitirmek istiyorsunuz?')
    ) {
      return;
    }
    handleStatusChange(id, 'tamam');
    showToast('₺' + sv(a.svc).p + ' kasaya eklendi');
  };

  // Berber: Yeni Müşteri Tanımla
  const handleAddCustomer = () => {
    const n = newCusName.trim();
    const p = nd(newCusPhone);
    const w = newCusPw.trim();
    if (!n || p.length !== 10 || w.length < 4) {
      showToast('Ad, geçerli telefon (10 hane) ve en az 4 karakterli şifre gerekli');
      return;
    }
    if (CUS.some((c) => nd(c.phone) === p)) {
      showToast('Bu telefon zaten kayıtlı');
      return;
    }
    const newCustomerObj: CustomerItem = {
      id: Date.now(),
      name: n,
      phone: '0' + p,
      pw: w,
    };
    const updatedCUS = [...CUS, newCustomerObj];
    setCUS(updatedCUS);
    setNewCusName('');
    setNewCusPhone('');
    setNewCusPw('');
    saveToStorage(updatedCUS, appts, log, off, shops);
    showToast(n + ' tanımlandı');
  };

  // Berber: Şifre Değiştir
  const handleResetCustomerPw = (id: number) => {
    const w = prompt('Yeni şifre (en az 4 karakter):');
    if (w && w.trim().length >= 4) {
      const updatedCUS = CUS.map((c) => (c.id === id ? { ...c, pw: w.trim() } : c));
      setCUS(updatedCUS);
      saveToStorage(updatedCUS, appts, log, off, shops);
      showToast('Şifre güncellendi');
    }
  };

  // Berber: Müşteri Sil
  const handleDeleteCustomer = (id: number) => {
    const c = CUS.find((x) => x.id === id);
    if (!c) return;
    if (!confirm(c.name + ' silinsin mi? Randevuları kalır ama giriş yapamaz.')) return;
    const updatedCUS = CUS.filter((x) => x.id !== id);
    setCUS(updatedCUS);
    if (me === id) setMe(null);
    saveToStorage(updatedCUS, appts, log, off, shops);
  };

  // Berber: Periyodik Seri Önizleme Oluştur
  const handleCreateSeriesPreview = () => {
    const st = seriesStartDate;
    const n = +seriesInterval || 20;
    const mo = +seriesMonths || 5;
    const l: { date: string; moved?: number }[] = [];
    for (let d = st; d <= addDays(st, mo * 30); d = addDays(d, n)) {
      l.push({ date: d });
    }
    const c = CUS.find((x) => x.id === seriesCustomer);
    if (!c) {
      showToast('Önce müşteri tanımlayın');
      return;
    }
    setSeriesPreview({
      cid: c.id,
      name: c.name,
      time: seriesTime || '16:00',
      l,
    });
  };

  // Berber: Pazar gününü 1 gün önceye al
  const handleShiftSunday = (index: number) => {
    if (!seriesPreview) return;
    const newL = [...seriesPreview.l];
    newL[index] = { date: addDays(newL[index].date, -1), moved: 1 };
    setSeriesPreview({ ...seriesPreview, l: newL });
  };

  // Berber: Seriyi Ajandaya Kaydet
  const handleCommitSeries = () => {
    if (!seriesPreview) return;
    if (seriesPreview.l.some((d) => new Date(d.date + 'T12:00:00').getDay() === 0)) {
      showToast('Önce Pazara denk gelen randevuları taşıyın');
      return;
    }
    let updatedAppts = [...appts];
    let updatedLog = [...log];

    seriesPreview.l.forEach((d, i) => {
      const newA: AppointmentItem = {
        id: Date.now() + i,
        cid: seriesPreview.cid,
        name: seriesPreview.name,
        svc: 1,
        stf: 1,
        date: d.date,
        time: seriesPreview.time,
        st: 'onayli',
        chips: [],
      };
      updatedAppts.push(newA);
      updatedLog = addLog(seriesPreview.name + ' seri randevu #' + (i + 1), newA, { ...newA, st: 'iptal' }, updatedLog);
    });

    setAppts(updatedAppts);
    setLog(updatedLog);
    saveToStorage(CUS, updatedAppts, updatedLog, off, shops);
    showToast(seriesPreview.l.length + ' randevu ajandaya işlendi');
    setSeriesPreview(null);
  };

  // Admin: Müdahaleyi Kaydet
  const handleSaveAdminIntervention = (id: number) => {
    const a = appts.find((x) => x.id === id);
    if (!a) return;
    if (busy(editStaffId, a.date, editTimeVal, id)) {
      showToast('Seçilen usta o saatte dolu');
      return;
    }
    setEditAptId(null);
    setApp(
      a.id,
      { stf: editStaffId, time: editTimeVal },
      'Admin müdahalesi: ' + a.name + ' → ' + sf(editStaffId).n + ' ' + editTimeVal + ' (' + editNote + ')'
    );
    showToast('Güncellendi · WhatsApp onayı gönderildi');
  };

  // Admin: Tek Tuşla Geri Al (Rollback)
  const handleRollback = (index: number) => {
    const l = log[index];
    if (!l || l.u) return;
    const a = appts.find((x) => x.id === l.a);
    const p = JSON.parse(l.prev);
    if (!a) return;

    const updatedAppts = appts.map((item) => (item.id === a.id ? { ...item, ...p } : item));
    const updatedLog = log.map((item, idx) => (idx === index ? { ...item, u: true } : item));

    setAppts(updatedAppts);
    setLog(updatedLog);
    saveToStorage(CUS, updatedAppts, updatedLog, off, shops);
    showToast('Randevu eski haline getirildi');
  };

  // Admin Demo İptal
  const handleDemoCancel = () => {
    const a = appts.find((x) => x.name === 'Mert B.');
    if (!a) return;
    if (a.st === 'iptal') {
      showToast('Zaten iptal');
      return;
    }
    setApp(a.id, { st: 'iptal' }, 'Çırak Ali, Mert B. randevusunu iptal etti (Onaylı → İptal)');
  };

  // Admin: Yeni Salon Aç
  const handleCreateShop = () => {
    const n = newShopName.trim();
    const u = newShopSlug.trim();
    if (!n || !u) {
      showToast('Salon adı ve web adresi gerekli');
      return;
    }
    const updatedShops = [
      ...shops,
      {
        n,
        u: u.replace(/\s+/g, '-').toLowerCase(),
        a: newShopAddress || '-',
        t: newShopPhone || '-',
      },
    ];
    setShops(updatedShops);
    setNewShopName('');
    setNewShopSlug('');
    setNewShopAddress('');
    setNewShopPhone('');
    saveToStorage(CUS, appts, log, off, updatedShops);
    showToast('Salon açıldı');
  };

  // 7 günlük hızlı tarih dizisi
  const customerDays = [...Array(7)].map((_, i) => addDays(today, i));

  // Berber Görünümü Günlük Verileri
  const todayAppts = appts.filter((a) => a.date === today).sort((a, b) => a.time.localeCompare(b.time));
  const doneAppts = todayAppts.filter((a) => a.st === 'tamam');
  const noShowAppts = todayAppts.filter((a) => a.st === 'noshow');
  const todayKasa = doneAppts.reduce((sum, a) => sum + sv(a.svc).p, 0);

  // Müşterinin Randevuları
  const myAppointmentsList = currentCustomer
    ? appts.filter((a) => a.cid === currentCustomer.id).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
    : [];
  const myUpcoming = myAppointmentsList.filter(
    (a) => a.date >= today && ['onayli', 'geldi', 'koltukta'].includes(a.st)
  );
  const myPast = myAppointmentsList.filter((a) => !myUpcoming.includes(a)).reverse();

  // Admin Arama Sonuçları
  const cleanQ = adminQuery.trim().toLowerCase();
  const adminSearchResults = cleanQ
    ? appts.filter((a) => a.name.toLowerCase().includes(cleanQ) && a.st !== 'tamam')
    : [];

  return (
    <>
      <header>
        <div className="bar">
          <div className="logo">
            💈 Berberim<small>Atelier de Coupe</small>
          </div>
          <div className="tabs">
            <button className={view === 'c' ? 'on' : ''} onClick={() => setView('c')}>
              Müşteri
            </button>
            <button className={view === 'b' ? 'on' : ''} onClick={() => setView('b')}>
              Berber
            </button>
            <button className={view === 'a' ? 'on' : ''} onClick={() => setView('a')}>
              Süper Admin
            </button>
          </div>
        </div>
      </header>

      <main>
        {/* ========================================================================= */}
        {/* 1. MÜŞTERİ GÖRÜNÜMÜ                                                       */}
        {/* ========================================================================= */}
        {view === 'c' && (
          <section id="v-c">
            {!currentCustomer ? (
              <div className="card" style={{ maxWidth: '420px', margin: '30px auto' }}>
                <h2>Giriş Yap</h2>
                <p className="sub">
                  Berberin sana cep telefonu ve şifreni verdi. Bir kez giriş yap, oturumun açık kalır.
                </p>
                <form onSubmit={handleLogin}>
                  <label>
                    Cep telefonu
                    <input
                      type="tel"
                      inputMode="tel"
                      placeholder="05xx xxx xx xx"
                      autoComplete="username"
                      value={loginPhone}
                      onChange={(e) => setLoginPhone(e.target.value)}
                    />
                  </label>
                  <label>
                    Şifre
                    <input
                      type="password"
                      autoComplete="current-password"
                      value={loginPw}
                      onChange={(e) => setLoginPw(e.target.value)}
                    />
                  </label>
                  <button type="submit" className="btn" style={{ width: '100%' }}>
                    Giriş Yap
                  </button>
                </form>
              </div>
            ) : C.done ? (
              <>
                <div className="card" style={{ textAlign: 'center' }}>
                  <h2>✅ Randevun onaylandı</h2>
                  <p className="sub">Randevu berberin ekranına anında düştü.</p>
                  <button
                    className="btn"
                    onClick={() =>
                      setC((prev) => ({
                        ...prev,
                        done: false,
                        time: null,
                        chips: [],
                      }))
                    }
                  >
                    Yeni randevu
                  </button>
                </div>
                {/* Gelecek ve Geçmiş Randevularım */}
                <div className="card">
                  <h3>📅 Gelecek Randevularım</h3>
                  {myUpcoming.length > 0 ? (
                    myUpcoming.map((a) => (
                      <div key={a.id} className="li">
                        <div>
                          <b>{sv(a.svc).n}</b>
                          <small>
                            {fd(a.date)} · {a.time} · {sf(a.stf).n} · ₺{sv(a.svc).p}
                          </small>
                        </div>
                        <span className="badge">{LB[a.st]}</span>
                      </div>
                    ))
                  ) : (
                    <div className="sub">Gelecek randevun yok.</div>
                  )}
                </div>
                <div className="card">
                  <h3>🕘 Geçmiş Randevularım</h3>
                  {myPast.length > 0 ? (
                    myPast.map((a) => (
                      <div key={a.id} className="li">
                        <div>
                          <b>{sv(a.svc).n}</b>
                          <small>
                            {fd(a.date)} · {a.time} · {sf(a.stf).n} · ₺{sv(a.svc).p}
                          </small>
                        </div>
                        <span className="badge">{LB[a.st]}</span>
                      </div>
                    ))
                  ) : (
                    <div className="sub">Geçmiş randevun yok.</div>
                  )}
                </div>
              </>
            ) : (
              <>
                <h2>Online Randevu</h2>
                <p className="sub">
                  berberim.app/atelier-de-coupe · Hoş geldin, <b>{currentCustomer.name}</b> ·{' '}
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handleLogout();
                    }}
                    style={{ color: 'var(--mut)' }}
                  >
                    Çıkış
                  </a>
                </p>

                {/* 1. Hizmet */}
                <div className="card">
                  <h3>1 · Hizmet</h3>
                  <div className="grid">
                    {SV.map((s) => (
                      <button
                        key={s.id}
                        className={`opt ${C.svc === s.id ? 'sel' : ''}`}
                        onClick={() => setC((prev) => ({ ...prev, svc: s.id, time: null }))}
                      >
                        <b>{s.n}</b>
                        <span>
                          {s.d} dk · ₺{s.p}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Usta */}
                <div className="card">
                  <h3>2 · Usta</h3>
                  <div className="gold">⭐ Size Atanan Sabit Ustanız: Murat Can</div>
                  <div className="grid">
                    {ST.map((s) => (
                      <button
                        key={s.id}
                        className={`opt ${C.stf === s.id ? 'sel' : ''}`}
                        onClick={() => setC((prev) => ({ ...prev, stf: s.id, time: null }))}
                      >
                        <b>{s.n}</b>
                        <span>
                          {off[s.id] ? '⛔ Bugün izinli' : s.id === 1 ? 'Sabit ustan' : 'Müsait'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Tarih ve Saat */}
                <div className="card">
                  <h3>3 · Tarih ve saat</h3>
                  <div className="days">
                    {customerDays.map((d) => {
                      const x = new Date(d + 'T12:00:00');
                      const isClosed = x.getDay() === CLOSED_DAY;
                      return (
                        <button
                          key={d}
                          className={`day ${C.date === d ? 'sel' : ''}`}
                          disabled={isClosed}
                          onClick={() => setC((prev) => ({ ...prev, date: d, time: null }))}
                        >
                          <small>{DN[x.getDay()].slice(0, 3)}</small>
                          <b>{x.getDate()}</b>
                          <small>{isClosed ? 'Kapalı' : MON[x.getMonth()]}</small>
                        </button>
                      );
                    })}
                  </div>
                  <div className="slots">
                    {slots().map((t) => {
                      const [c, l] = slotState(C.stf, C.date, t);
                      return (
                        <button
                          key={t}
                          className={`slot ${c} ${C.time === t ? 'sel' : ''}`}
                          disabled={c === 'off'}
                          onClick={() => setC((prev) => ({ ...prev, time: t }))}
                        >
                          {t}
                          <small>{C.time === t ? 'Seçildi' : l}</small>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 4. Berber Tercihleri */}
                <div className="card">
                  <h3>4 · Berber tercihlerin</h3>
                  <div className="chips">
                    {CHIPS.map((chip) => (
                      <button
                        key={chip}
                        className={`chip ${C.chips.includes(chip) ? 'sel' : ''}`}
                        onClick={() => toggleChip(chip)}
                      >
                        🏷️ {chip}
                      </button>
                    ))}
                  </div>
                  <button className="btn" disabled={!C.time} onClick={handleBook}>
                    Randevuyu onayla{C.time ? ' · ' + fd(C.date) + ' ' + C.time : ''}
                  </button>
                </div>

                {/* Gelecek ve Geçmiş Randevularım */}
                <div className="card">
                  <h3>📅 Gelecek Randevularım</h3>
                  {myUpcoming.length > 0 ? (
                    myUpcoming.map((a) => (
                      <div key={a.id} className="li">
                        <div>
                          <b>{sv(a.svc).n}</b>
                          <small>
                            {fd(a.date)} · {a.time} · {sf(a.stf).n} · ₺{sv(a.svc).p}
                          </small>
                        </div>
                        <span className="badge">{LB[a.st]}</span>
                      </div>
                    ))
                  ) : (
                    <div className="sub">Gelecek randevun yok.</div>
                  )}
                </div>
                <div className="card">
                  <h3>🕘 Geçmiş Randevularım</h3>
                  {myPast.length > 0 ? (
                    myPast.map((a) => (
                      <div key={a.id} className="li">
                        <div>
                          <b>{sv(a.svc).n}</b>
                          <small>
                            {fd(a.date)} · {a.time} · {sf(a.stf).n} · ₺{sv(a.svc).p}
                          </small>
                        </div>
                        <span className="badge">{LB[a.st]}</span>
                      </div>
                    ))
                  ) : (
                    <div className="sub">Geçmiş randevun yok.</div>
                  )}
                </div>
              </>
            )}
          </section>
        )}

        {/* ========================================================================= */}
        {/* 2. BERBER PANELİ                                                          */}
        {/* ========================================================================= */}
        {view === 'b' && (
          <section id="v-b">
            <h2>Berber Paneli</h2>
            <p className="sub">
              Çalışma: 08:00–21:00 · Yemek molası 13:00–14:00 otomatik kilitli · Pazar kapalı
            </p>

            {/* Personel Durumu */}
            <div className="card">
              <h3>👥 Personel durumu</h3>
              {ST.map((s) => (
                <div key={s.id} className="li">
                  <b>{s.n}</b>
                  <button
                    className={`btn ${off[s.id] ? '' : 'gh'}`}
                    onClick={() => {
                      const updatedOff = { ...off, [s.id]: !off[s.id] };
                      setOff(updatedOff);
                      saveToStorage(CUS, appts, log, updatedOff, shops);
                    }}
                  >
                    {off[s.id] ? '⛔ İzinli (geri al)' : 'Bugün İzinli yap'}
                  </button>
                </div>
              ))}
            </div>

            {/* Canlı Koltuk Akışı */}
            <h3>📱 Canlı Koltuk Akışı</h3>
            {todayAppts.length > 0 ? (
              todayAppts.map((a) => (
                <div key={a.id} className={`ac ${a.st}`}>
                  <div className="top">
                    <div>
                      <b style={{ fontSize: '17px' }}>
                        {a.time} · {a.name}
                      </b>
                      <div style={{ color: 'var(--mut)' }}>
                        {sv(a.svc).n} · {sf(a.stf).n} · ₺{sv(a.svc).p}
                      </div>
                    </div>
                    <span className="badge">{LB[a.st]}</span>
                  </div>

                  {a.chips.length > 0 && (
                    <div className="tg">{a.chips.map((c) => '🏷️ ' + c).join(' | ')}</div>
                  )}

                  <div className="acts">
                    {a.st === 'onayli' && (
                      <>
                        <button
                          className="big"
                          style={{ background: 'var(--blue)' }}
                          onClick={() => handleStatusChange(a.id, 'geldi')}
                        >
                          👋 Geldi
                        </button>
                        <button
                          className="big"
                          style={{ background: 'var(--mut)' }}
                          onClick={() => handleStatusChange(a.id, 'noshow')}
                        >
                          Gelmedi
                        </button>
                      </>
                    )}
                    {a.st === 'geldi' && (
                      <button
                        className="big"
                        style={{ background: 'var(--pur)' }}
                        onClick={() => handleStatusChange(a.id, 'koltukta')}
                      >
                        ✂️ Koltukta
                      </button>
                    )}
                    {a.st === 'koltukta' && (
                      <button
                        className="big"
                        style={{ background: 'var(--ok)' }}
                        onClick={() => handleFinish(a.id)}
                      >
                        ✅ Tamamla
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="card">Bugün randevu yok.</div>
            )}

            {/* Müşteri Tanımla */}
            <div className="card">
              <h3>👤 Müşteri Tanımla</h3>
              <p className="sub">Müşteriyi sen tanımlarsın; telefon ve şifreyi ona ilet.</p>
              <div className="f2">
                <div>
                  <label>
                    Ad Soyad
                    <input
                      value={newCusName}
                      onChange={(e) => setNewCusName(e.target.value)}
                    />
                  </label>
                </div>
                <div>
                  <label>
                    Cep telefonu
                    <input
                      type="tel"
                      value={newCusPhone}
                      onChange={(e) => setNewCusPhone(e.target.value)}
                    />
                  </label>
                </div>
                <div>
                  <label>
                    Şifre
                    <input
                      placeholder="en az 4 karakter"
                      value={newCusPw}
                      onChange={(e) => setNewCusPw(e.target.value)}
                    />
                  </label>
                </div>
              </div>
              <button className="btn" onClick={handleAddCustomer}>
                Müşteriyi Ekle
              </button>

              <div style={{ marginTop: '14px' }}>
                {CUS.map((c) => (
                  <div key={c.id} className="li">
                    <div>
                      <b>{c.name}</b>
                      <small>
                        📱 {c.phone} · 🔑 {c.pw} · {appts.filter((a) => a.cid === c.id).length} randevu
                      </small>
                    </div>
                    <div className="acts">
                      <button className="btn gh" onClick={() => handleResetCustomerPw(c.id)}>
                        Şifre Değiştir
                      </button>
                      <button className="btn gh" onClick={() => handleDeleteCustomer(c.id)}>
                        Sil
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Periyodik Randevu Serisi */}
            <div className="card">
              <h3>🔁 Periyodik Randevu Serisi</h3>
              {!seriesPreview ? (
                <>
                  <p className="sub">Daimi müşteri için tek seferde takvim oluştur.</p>
                  <div className="f2">
                    <div>
                      <label>
                        Müşteri
                        <select
                          value={seriesCustomer}
                          onChange={(e) => setSeriesCustomer(+e.target.value)}
                        >
                          {CUS.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                    <div>
                      <label>
                        Başlangıç
                        <input
                          type="date"
                          value={seriesStartDate}
                          onChange={(e) => setSeriesStartDate(e.target.value)}
                        />
                      </label>
                    </div>
                    <div>
                      <label>
                        Döngü (gün)
                        <input
                          type="number"
                          value={seriesInterval}
                          onChange={(e) => setSeriesInterval(+e.target.value)}
                        />
                      </label>
                    </div>
                    <div>
                      <label>
                        Saat
                        <input
                          type="time"
                          value={seriesTime}
                          onChange={(e) => setSeriesTime(e.target.value)}
                        />
                      </label>
                    </div>
                    <div>
                      <label>
                        Süre (ay)
                        <input
                          type="number"
                          value={seriesMonths}
                          onChange={(e) => setSeriesMonths(+e.target.value)}
                        />
                      </label>
                    </div>
                  </div>
                  <button className="btn" onClick={handleCreateSeriesPreview}>
                    Seri Oluştur
                  </button>
                </>
              ) : (
                <>
                  {seriesPreview.l.map((d, i) => {
                    const sun = new Date(d.date + 'T12:00:00').getDay() === 0;
                    return (
                      <div key={i} className="li">
                        <div>
                          {i + 1}.{' '}
                          {sun ? (
                            <span className="warn">⚠️ {fd(d.date)} Pazar (kapalı)</span>
                          ) : d.moved ? (
                            <span className="warn">⚠️ {fd(d.date)} (Pazardan Alındı)</span>
                          ) : (
                            fd(d.date)
                          )}{' '}
                          · {seriesPreview.time}
                        </div>
                        {sun && (
                          <button className="btn gh" onClick={() => handleShiftSunday(i)}>
                            ⬅️ 1 Gün Önceye Al
                          </button>
                        )}
                      </div>
                    );
                  })}
                  <div className="acts" style={{ marginTop: '14px' }}>
                    <button className="btn" onClick={handleCommitSeries}>
                      {seriesPreview.l.length} Randevuyu Takvime İşle
                    </button>
                    <button className="btn gh" onClick={() => setSeriesPreview(null)}>
                      Vazgeç
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Gün Sonu Özeti */}
            <div className="card">
              <h3>🌙 Gün Sonu Özeti</h3>
              <div className="stats">
                <div className="stat">
                  <b>₺{todayKasa}</b>
                  <span>Bugünkü Kasa</span>
                </div>
                <div className="stat">
                  <b>{doneAppts.length}</b>
                  <span>Tamamlanan</span>
                </div>
                <div className="stat">
                  <b>{noShowAppts.length}</b>
                  <span>Gelmedi (No-Show)</span>
                </div>
              </div>
              {ST.map((s) => {
                const k = doneAppts
                  .filter((a) => a.stf === s.id)
                  .reduce((x, a) => x + sv(a.svc).p, 0);
                return (
                  <div key={s.id} className="li">
                    <span>{s.n}</span>
                    <b>Hakediş (%40): ₺{Math.round(k * 0.4)}</b>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* 3. SÜPER ADMİN                                                            */}
        {/* ========================================================================= */}
        {view === 'a' && (
          <section id="v-a">
            <h2>Süper Admin · Salih Bey</h2>
            <p className="sub">
              Supabase doluluk: %8.9 · {shops.length} salon · Lisans: aktif
            </p>

            {/* Yeni Salon Aç */}
            <div className="card">
              <h3>🏪 Yeni Salon Aç</h3>
              <div className="f2">
                <div>
                  <label>
                    Salon adı
                    <input
                      value={newShopName}
                      onChange={(e) => setNewShopName(e.target.value)}
                    />
                  </label>
                </div>
                <div>
                  <label>
                    Web adresi
                    <input
                      placeholder="salon-adi"
                      value={newShopSlug}
                      onChange={(e) => setNewShopSlug(e.target.value)}
                    />
                  </label>
                </div>
                <div>
                  <label>
                    Açık adres
                    <input
                      value={newShopAddress}
                      onChange={(e) => setNewShopAddress(e.target.value)}
                    />
                  </label>
                </div>
                <div>
                  <label>
                    Telefon
                    <input
                      value={newShopPhone}
                      onChange={(e) => setNewShopPhone(e.target.value)}
                    />
                  </label>
                </div>
              </div>
              <button className="btn" onClick={handleCreateShop}>
                Salonu Oluştur
              </button>

              <div style={{ marginTop: '14px' }}>
                {shops.map((s, idx) => (
                  <div key={idx} className="li">
                    <div>
                      <b>{s.n}</b>
                      <small>
                        berberim.app/{s.u} · {s.a} · {s.t}
                      </small>
                    </div>
                    <span className="seal">Lisans ✓</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Canlı Müdahale Masası */}
            <div className="card">
              <h3>🚨 Canlı Müdahale Masası</h3>
              <input
                placeholder="Müşteri ara (örn. Selim)"
                value={adminQuery}
                onChange={(e) => setAdminQuery(e.target.value)}
              />
              {adminSearchResults.length > 0 ? (
                adminSearchResults.map((a) =>
                  editAptId === a.id ? (
                    <div key={a.id} className="ac" style={{ marginTop: '10px' }}>
                      <b>{a.name}</b>
                      <div className="f2">
                        <div>
                          <label>
                            Usta
                            <select
                              value={editStaffId}
                              onChange={(e) => setEditStaffId(+e.target.value)}
                            >
                              {ST.map((s) => (
                                <option key={s.id} value={s.id}>
                                  {s.n}
                                </option>
                              ))}
                            </select>
                          </label>
                        </div>
                        <div>
                          <label>
                            Saat
                            <input
                              type="time"
                              value={editTimeVal}
                              onChange={(e) => setEditTimeVal(e.target.value)}
                            />
                          </label>
                        </div>
                      </div>
                      <label>
                        Not
                        <input
                          value={editNote}
                          onChange={(e) => setEditNote(e.target.value)}
                        />
                      </label>
                      <div className="acts">
                        <button className="btn" onClick={() => handleSaveAdminIntervention(a.id)}>
                          Kaydet &amp; Müdahale Et
                        </button>
                        <button className="btn gh" onClick={() => setEditAptId(null)}>
                          Kapat
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div key={a.id} className="li">
                      <div>
                        <b>{a.name}</b>
                        <small>
                          {fd(a.date)} {a.time} · {sf(a.stf).n} · {LB[a.st]}
                        </small>
                      </div>
                      <button
                        className="btn"
                        onClick={() => {
                          setEditAptId(a.id);
                          setEditStaffId(a.stf);
                          setEditTimeVal(a.time);
                        }}
                      >
                        ⚙️ Müdahale Et
                      </button>
                    </div>
                  )
                )
              ) : cleanQ ? (
                <div className="sub" style={{ marginTop: '8px' }}>
                  Sonuç yok.
                </div>
              ) : null}
            </div>

            {/* İşlem Geçmişi (Audit Log) */}
            <div className="card">
              <h3>📜 İşlem Geçmişi (Audit Log)</h3>
              {log.length > 0 ? (
                log.map((l, i) => (
                  <div key={l.id} className={`li log ${l.u ? 'u' : ''}`}>
                    <div>
                      <b className={l.u ? '' : 'red'}>{l.t}</b> · {l.txt}
                    </div>
                    {l.u ? (
                      <span className="seal">✓ Geri Alındı</span>
                    ) : (
                      <button className="btn gh" onClick={() => handleRollback(i)}>
                        ↩️ Tek Tuşla Geri Al
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <div className="sub">Henüz işlem yok. Berber panelinden bir işlem yapın.</div>
              )}

              <div className="acts" style={{ marginTop: '12px' }}>
                <button className="btn gh" onClick={handleDemoCancel}>
                  Demo: Çırak VIP randevuyu iptal etsin
                </button>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Toast Bildirim */}
      {toastMsg && <div className="toast">{toastMsg}</div>}
    </>
  );
}

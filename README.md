# 💈 Berberim — Akıllı Salon & Randevu Yönetim SaaS Platformu

Berberler, kuaförler ve güzellik salonları için geliştirilmiş; çok kiracılı (multi-tenant), rol bazlı, sıfır SMS maliyetli (Push Notification) ve akıllı periyodik randevu döngüsüne sahip yeni nesil randevu yönetim sistemi.

---

## 🚀 Özellikler

### 1. 👥 Rol Bazlı Erişim ve Güvenlik
- **Süper Admin (SaaS Sahibi)**: Tüm salonları, aylık SaaS aboneliklerini (MRR), tenant açma/kapama ve sistem metriklerini yönetir.
- **Salon Sahibi (Patron)**: Tüm dükkanın hasılatını, tüm koltukların ajandasını, personel komisyonlarını, Z-raporunu (nakit/kredi kartı kasa) ve salon otomasyon ayarlarını yönetir.
- **Personel (Stilist)**: Giriş yaptığında **yalnızca kendi koltuğuna ve kendi randevularına** erişebilir. Toplam salon cirosunu ve diğer personelin müşterilerini göremez.
- **Müşteri**: Kolay online randevu, doğrulanmış profil (tekrar ad/telefon sormaz), canlı slot seçimi ve randevu takibi.

### 2. 📅 Koltuk Ajandası & Dikey Timeline
- Berberim mobil uygulama referansına uygun dikey saat akışı (`16:30`, `17:00`, `17:30`...).
- Tek tıkla boş koltuğa hızlı randevu yazma veya **Usta Molası** kilidi koyma.
- Canlı koltuk durumları: *Onaylandı*, *Koltukta / Tıraş Başladı*, *Tamamlandı*, *İptal*.

### 3. 🔄 Akıllı Periyodik Tıraş Döngüsü
- Müşterinin saç uzama periyoduna göre **14, 20 veya 30 günde bir** otomatik randevu rezervasyonu.
- Süre dolduğunda müşteriye banka tarzı push bildirim ile hatırlatma.

### 4. 🔔 Sıfır SMS Maliyetli Bildirimler (Banka Standardı)
- SMS kontör maliyeti olmadan **FCM (Firebase Cloud Messaging)** ve **Web Push API** ile kilit ekranı bildirimleri.
- Randevuya 49 dakika kala acil durum ve onay bildirimi: *"Randevunuza 49 dakika kaldı. Geliyor musunuz? [Geliyorum / İptal]"*.

### 5. 💳 Finans, Kasa ve Karekod Standı
- Günlük ciro, nakit kasa ve POS dağılımı.
- Usta bazlı prim ve hak ediş hesaplama.
- Dükkan aynası veya kasası için indirilebilir **A5/A6 Masa Standı Karekodu**.

---

## 🛠️ Teknoloji Yığını

- **Frontend & Backend**: Next.js 16 (App Router, Turbopack, React 19)
- **Styling**: Tailwind CSS v4, Lucide Icons
- **Database**: PostgreSQL (Supabase DDL & RLS politikaları hazır)
- **Mobil API**: RESTful JSON endpoints (`/api/v1/...`)
- **Bildirimler**: Web Push API & Firebase Cloud Messaging

---

## 💻 Kurulum ve Geliştirme

```bash
# Bağımlılıkları yükleyin
npm install

# Geliştirme sunucusunu başlatın
npm run dev

# Üretim derlemesi
npm run build
```

Uygulama varsayılan olarak `http://localhost:3000` adresinde çalışır.

---

## 🔑 Test Kullanıcı Girişleri

- **Süper Admin**: `yldzsalih27@gmail.com` / `Yildiz.08`
- **Salon Sahibi**: `mehmet@salon.com`
- **Personel (Stilist)**: `seyfullah@salon.com` veya `yusuf@salon.com`
- **Müşteri**: `can@musteri.com`

---

## 📄 Lisans
Bu proje tescilli ticari SaaS yazılımıdır. Tüm hakları saklıdır.

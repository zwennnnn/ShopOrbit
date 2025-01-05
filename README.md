# 🌟 ShopOrbit

ShopOrbit, modern bir **E-Commerce** projesidir. Bu projede, kullanıcılar ve adminler için kapsamlı özellikler sunan gelişmiş bir alışveriş platformu geliştirilmiştir.

## 🚀 Kullanılan Teknolojiler

- **Frontend**: React, TailwindCSS
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Authentication**: JWT
- **Payment Gateway**: Stripe
- **Cloud Services**: Cloudinary

---

## ✨ Proje Özellikleri

### 🛍️ Kullanıcı Özellikleri
- Ürünleri sepete ekleme
- Satın alma işlemleri
- Sipariş geçmişini görüntüleme
- Kullanıcı bilgilerini güncelleme

### 🛠️ Admin Özellikleri
- Kategori ve ürün ekleme
- Sipariş kontrolü
- Gelişmiş Dashboard:
  - **Toplam Kazanç**
  - **Satılan Ürün Sayısı**
  - **Günlük Gelir Grafiği**
  - **Stok Uyarıları**
- Ürünlere indirim ve flash sale özellikleri ekleme (süre belirtilebilir).

---

## 🛠️ Kurulum Adımları

### 1️⃣ Repository'yi Klonlama
Projeyi bilgisayarınıza klonlayarak başlayın:
```bash
git clone https://github.com/username/ShopOrbit.git
cd ShopOrbit
```

### 2️⃣ Frontend Kurulumu
Frontend tarafını kurmak için şu adımları takip edin:

```bash
cd frontend
```

1. **Environment dosyasını oluşturun**:  
   `.env` dosyasına aşağıdaki değişkeni ekleyin:
   ```env
   VITE_STRIPE_PUBLIC_KEY=your_publishable_stripe_key
   ```

2. **Bağımlılıkları yükleyin**:
   ```bash
   npm install
   ```

3. **Frontend'i çalıştırın**:
   ```bash
   npm run dev
   ```

### 3️⃣ Backend Kurulumu
Backend tarafını kurmak için şu adımları takip edin:

```bash
cd ../backend
```

1. **Environment dosyasını oluşturun**:  
   `.env` dosyasına aşağıdaki değişkenleri ekleyin:
   ```env
   MONGODB_URI=your_mongo_db_uri
   JWT_SECRET=your_jwt_secret
   PORT=your_server_port
   CLOUDINARY_CLOUD_NAME=your_cloudinary_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   STRIPE_SECRET_KEY=your_stripe_secret_key
   REACT_APP_STRIPE_PUBLIC_KEY=your_publishable_stripe_key
   ```

2. **Bağımlılıkları yükleyin**:
   ```bash
   npm install
   ```

3. **Backend'i çalıştırın**:
   ```bash
   npm run dev
   ```

---


## 🤝 Katkı Sağlama
Katkıda bulunmak isterseniz:
1. Bu repoyu fork'layın.
2. Değişikliklerinizi yapın.
3. Bir pull request gönderin.

---

## 🛡️ Lisans
Bu proje MIT Lisansı ile lisanslanmıştır.

---

**💻 Mutlu Kodlamalar!** 🎉


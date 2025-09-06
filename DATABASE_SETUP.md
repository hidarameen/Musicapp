# Database Setup Instructions - إعداد قاعدة البيانات

## المشكلة
عند محاولة تسجيل الدخول كمدير باستخدام:
- اسم المستخدم: `admin`
- كلمة المرور: `123456`

كنت تحصل على خطأ "Unexpected token '<', '<!DOCTYPE '... is not valid JSON" لأن:
1. لم تكن نقاط نهاية المصادقة (authentication endpoints) موجودة في الخادم
2. التطبيق يحتاج إلى قاعدة بيانات PostgreSQL للعمل

## ما تم إصلاحه
1. ✅ تمت إضافة جميع نقاط نهاية المصادقة المفقودة:
   - `/api/auth/login` - لتسجيل الدخول
   - `/api/auth/register` - لإنشاء حساب جديد
   - `/api/auth/user` - للحصول على بيانات المستخدم الحالي
   - `/api/auth/logout` - لتسجيل الخروج

2. ✅ تمت إضافة جميع نقاط نهاية API لإدارة المحتوى:
   - الفنانين (Artists)
   - الألبومات (Albums)
   - الأغاني (Songs)
   - الفيديوهات (Videos)
   - قوائم التشغيل (Playlists)
   - المفضلات (Favorites)

3. ✅ تم إنشاء ملف `.env.example` للمتغيرات البيئية

## الخطوات المطلوبة لتشغيل التطبيق

### 1. إعداد قاعدة البيانات PostgreSQL

يستخدم هذا التطبيق Neon Database (PostgreSQL مُدار). لإعداد قاعدة البيانات:

#### الخيار أ: استخدام Neon (مجاني - موصى به)
1. اذهب إلى [https://neon.tech](https://neon.tech)
2. أنشئ حساباً مجانياً
3. أنشئ قاعدة بيانات جديدة
4. انسخ رابط الاتصال (Connection String)

#### الخيار ب: استخدام PostgreSQL محلي
```bash
# تثبيت PostgreSQL
sudo apt-get install postgresql postgresql-contrib

# إنشاء قاعدة البيانات
sudo -u postgres createdb music_db

# إنشاء مستخدم
sudo -u postgres createuser -P music_user
# أدخل كلمة مرور عند الطلب
```

### 2. تكوين متغيرات البيئة

```bash
# انسخ ملف المثال
cp .env.example .env

# افتح الملف وحدّث DATABASE_URL
nano .env
```

أضف رابط قاعدة البيانات:
```env
# إذا كنت تستخدم Neon:
DATABASE_URL=postgresql://username:password@ep-xyz.region.aws.neon.tech/database_name?sslmode=require

# إذا كنت تستخدم PostgreSQL محلي:
DATABASE_URL=postgresql://music_user:your_password@localhost:5432/music_db
```

### 3. إعداد جداول قاعدة البيانات

```bash
# تشغيل migrations لإنشاء الجداول
npm run db:push
```

### 4. تشغيل التطبيق

```bash
# تشغيل في وضع التطوير
npm run dev

# التطبيق سيعمل على http://localhost:5000
```

### 5. تسجيل الدخول كمدير

بعد تشغيل التطبيق وإعداد قاعدة البيانات:
1. اذهب إلى http://localhost:5000
2. سيتم إنشاء حساب المدير الافتراضي تلقائياً عند بدء التشغيل
3. استخدم:
   - اسم المستخدم: `admin`
   - كلمة المرور: `123456`

## نصائح مهمة

1. **الأمان**: تأكد من تغيير كلمة مرور المدير الافتراضية بعد تسجيل الدخول الأول

2. **متغيرات البيئة**: لا تشارك ملف `.env` أبداً في Git. تم إضافته إلى `.gitignore`

3. **قاعدة البيانات للإنتاج**: للإنتاج، استخدم خدمة قاعدة بيانات مُدارة مثل:
   - Neon
   - Supabase
   - Railway
   - Render

## استكشاف الأخطاء

### خطأ: "DATABASE_URL must be set"
- تأكد من وجود ملف `.env` في المجلد الرئيسي
- تأكد من صحة رابط قاعدة البيانات

### خطأ: "connect ECONNREFUSED"
- تأكد من أن خدمة PostgreSQL تعمل
- تأكد من صحة بيانات الاتصال (المنفذ، اسم المستخدم، كلمة المرور)

### خطأ: "relation 'users' does not exist"
- قم بتشغيل `npm run db:push` لإنشاء الجداول

## الدعم

إذا واجهت أي مشاكل:
1. تحقق من سجلات الخادم في Terminal
2. تحقق من Network tab في أدوات المطور بالمتصفح
3. تأكد من أن جميع المتغيرات البيئية مُعدة بشكل صحيح
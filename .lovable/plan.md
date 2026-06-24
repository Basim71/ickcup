## الهدف
ضمان أن الصور المرفوعة من لوحة الأدمن تظهر فوراً في صفحات اللغة والحجز والتأكيد دون تأخير ناتج عن كاش المتصفح.

## الوضع الحالي
- الصور تُحفظ حالياً كـ data URLs (base64) داخل جدول `settings` — هذه لا تتأثر بكاش المتصفح إطلاقاً، لكن في حال تحويلها لاحقاً إلى روابط http(s) (مثل Storage) سيظهر التأخير.
- `useSiteSettings` يشترك بـ realtime ويعيد الجلب عند أي تعديل، لكن المتصفح قد يخدم نفس الـ URL من الكاش.
- صفحة التأكيد تستخدم `settings.background_image` كخلفية أيضاً.

## التغييرات المقترحة

### 1. دالة مساعدة `withCacheBust(url, version)` في `src/lib/settings.ts`
- ترجع الـ URL كما هو إذا كان `data:` أو فارغاً.
- تضيف `?v=<updated_at-timestamp>` للروابط http(s) (وتدمج بشكل صحيح مع query موجود).

### 2. تمرير `updated_at` من قاعدة البيانات
- توسيع نوع `SiteSettings` ليشمل `updated_at`.
- تمريره من `useSiteSettings` بعد كل جلب/تحديث realtime.

### 3. استخدام الدالة في صفحات العرض
- `src/routes/index.tsx`: `withCacheBust(settings.language_background, settings.updated_at)`
- `src/routes/book.tsx`: `withCacheBust(settings.background_image, settings.updated_at)`
- `src/routes/success.tsx`: نفس الشيء للخلفية.

### 4. تحديث المعاينات في `src/routes/admin.settings.tsx`
- معاينة Booking و Language تستخدم نفس الدالة لتعكس آخر نسخة.

## ملاحظات تقنية
- مع data URLs الحاليّة لن يتغير شيء بصرياً (لا كاش أصلاً)، لكن يصبح النظام جاهزاً لأي تحويل مستقبلي لتخزين Storage.
- لا حاجة لتعديل قاعدة البيانات — `updated_at` موجود مسبقاً.

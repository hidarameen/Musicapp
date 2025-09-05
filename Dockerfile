
# استخدام Node.js كصورة أساسية
FROM node:18-alpine

# تعيين مجلد العمل
WORKDIR /app

# نسخ ملف package.json و package-lock.json
COPY package*.json ./

# تثبيت التبعيات
RUN npm ci

# نسخ باقي ملفات المشروع
COPY . .

# بناء المشروع
RUN npm run build

# فتح المنفذ 5000
EXPOSE 5000

# متغيرات البيئة
ENV NODE_ENV=production

# تشغيل التطبيق
CMD ["npm", "start"]

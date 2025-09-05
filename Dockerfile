# استخدام Node.js كصورة أساسية
FROM node:18-alpine

# تعيين مجلد العمل
WORKDIR /app

# نسخ ملف package.json و package-lock.json
COPY package*.json ./

# تثبيت التبعيات
RUN npm ci --only=production

# نسخ باقي ملفات المشروع
COPY . .

# بناء المشروع
RUN npm run build

# فتح المنفذ 5000
EXPOSE 5000

# تشغيل التطبيق
CMD ["npm", "start"]
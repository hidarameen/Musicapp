FROM node:18-alpine

# تعيين مجلد العمل
WORKDIR /app

# نسخ package.json و package-lock.json
COPY package*.json ./

# تثبيت كل الحزم بما فيها devDependencies
RUN npm install

# نسخ باقي ملفات المشروع
COPY . .

# بناء المشروع (vite + esbuild)
RUN npm run build

# فتح المنفذ 5000
EXPOSE 5000

# تشغيل التطبيق
CMD ["npm", "start"]

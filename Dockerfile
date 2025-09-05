# ======================
# مرحلة البناء (Build Stage)
# ======================
FROM node:18-alpine AS builder

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

# ======================
# مرحلة التشغيل (Production Stage)
# ======================
FROM node:18-alpine

WORKDIR /app

# نسخ package.json و package-lock.json فقط
COPY package*.json ./

# تثبيت dependencies فقط (أخف)
RUN npm ci --only=production

# نسخ ناتج البناء من مرحلة البناء
COPY --from=builder /app/dist ./dist

# فتح المنفذ 5000
EXPOSE 5000

# تشغيل التطبيق
CMD ["npm", "start"]

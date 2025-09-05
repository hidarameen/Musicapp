import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Shield, Users, Music, Eye, AlertTriangle, Phone, Mail } from "lucide-react";

export default function Terms() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            الشروط والأحكام وسياسة الخصوصية
          </h1>
          <p className="text-muted-foreground text-lg">
            تعرف على شروط الاستخدام وسياسة الخصوصية لمنصة الموسيقى العربية
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Navigation */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle className="text-lg">المحتويات</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <a href="#terms" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                  الشروط والأحكام
                </a>
                <a href="#privacy" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                  سياسة الخصوصية
                </a>
                <a href="#usage" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                  قواعد الاستخدام
                </a>
                <a href="#content" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                  حقوق المحتوى
                </a>
                <a href="#contact" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                  تواصل معنا
                </a>
              </CardContent>
            </Card>
          </div>

          {/* Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Terms and Conditions */}
            <Card id="terms">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-6 h-6" />
                  الشروط والأحكام
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">1. قبول الشروط</h3>
                  <p className="text-muted-foreground">
                    باستخدام منصة الموسيقى العربية، فإنك توافق على هذه الشروط والأحكام. إذا كنت لا توافق على أي من هذه الشروط، يرجى عدم استخدام المنصة.
                  </p>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold mb-2">2. وصف الخدمة</h3>
                  <p className="text-muted-foreground">
                    منصة الموسيقى العربية هي خدمة تدفق موسيقي تتيح للمستخدمين الاستماع إلى الأغاني العربية وإنشاء قوائم التشغيل ومشاركة الموسيقى. نحتفظ بالحق في تعديل أو إنهاء الخدمة في أي وقت.
                  </p>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold mb-2">3. حسابات المستخدمين</h3>
                  <p className="text-muted-foreground mb-2">
                    للوصول إلى بعض ميزات المنصة، يجب إنشاء حساب مستخدم. أنت مسؤول عن:
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li>الحفاظ على سرية معلومات حسابك</li>
                    <li>جميع الأنشطة التي تتم تحت حسابك</li>
                    <li>إخطارنا فوراً بأي استخدام غير مصرح به لحسابك</li>
                  </ul>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold mb-2">4. الاستخدام المقبول</h3>
                  <p className="text-muted-foreground mb-2">
                    يُحظر عليك:
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li>انتهاك أي قوانين محلية أو دولية</li>
                    <li>رفع أو مشاركة محتوى غير لائق أو مسيء</li>
                    <li>محاولة الوصول غير المصرح به إلى النظام</li>
                    <li>التداخل مع عمل المنصة أو خوادمها</li>
                  </ul>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold mb-2">5. إنهاء الحساب</h3>
                  <p className="text-muted-foreground">
                    نحتفظ بالحق في تعليق أو إنهاء حسابك في حالة انتهاك هذه الشروط. يمكنك أيضاً حذف حسابك في أي وقت من إعدادات الحساب.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Privacy Policy */}
            <Card id="privacy">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-6 h-6" />
                  سياسة الخصوصية
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">جمع المعلومات</h3>
                  <p className="text-muted-foreground mb-2">
                    نجمع المعلومات التالية:
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li>معلومات الحساب: الاسم، البريد الإلكتروني، تاريخ الميلاد</li>
                    <li>معلومات الاستخدام: الأغاني المستمعة، قوائم التشغيل، تفضيلات الموسيقى</li>
                    <li>معلومات تقنية: عنوان IP، نوع المتصفح، الجهاز المستخدم</li>
                  </ul>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold mb-2">استخدام المعلومات</h3>
                  <p className="text-muted-foreground mb-2">
                    نستخدم معلوماتك لـ:
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li>تقديم وتحسين خدماتنا</li>
                    <li>تخصيص تجربة الاستخدام وتقديم توصيات موسيقية</li>
                    <li>التواصل معك بشأن حسابك والخدمة</li>
                    <li>تحليل استخدام المنصة لتحسين الأداء</li>
                  </ul>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold mb-2">مشاركة المعلومات</h3>
                  <p className="text-muted-foreground">
                    لا نشارك معلوماتك الشخصية مع أطراف ثالثة إلا في الحالات التالية: بموافقتك الصريحة، لتقديم الخدمة، للامتثال للقوانين، أو لحماية حقوقنا.
                  </p>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold mb-2">أمان البيانات</h3>
                  <p className="text-muted-foreground">
                    نستخدم تدابير أمنية متقدمة لحماية معلوماتك، بما في ذلك التشفير وأنظمة الحماية الحديثة. ومع ذلك، لا يمكن ضمان الأمان الكامل عبر الإنترنت.
                  </p>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold mb-2">حقوقك</h3>
                  <p className="text-muted-foreground mb-2">
                    لديك الحق في:
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li>الوصول إلى معلوماتك الشخصية</li>
                    <li>تصحيح المعلومات غير الصحيحة</li>
                    <li>طلب حذف حسابك ومعلوماتك</li>
                    <li>سحب الموافقة على معالجة البيانات</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Usage Rules */}
            <Card id="usage">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-6 h-6" />
                  قواعد الاستخدام
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">السلوك المقبول</h3>
                  <p className="text-muted-foreground mb-2">
                    نتوقع من جميع المستخدمين:
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li>احترام الآخرين وثقافاتهم المختلفة</li>
                    <li>استخدام المنصة لأغراض قانونية فقط</li>
                    <li>عدم مشاركة محتوى مسيء أو غير لائق</li>
                    <li>احترام حقوق الملكية الفكرية</li>
                  </ul>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold mb-2">السلوك المحظور</h3>
                  <p className="text-muted-foreground mb-2">
                    يُحظر:
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li>التنمر أو المضايقة أو التهديد</li>
                    <li>نشر محتوى يحرض على العنف أو الكراهية</li>
                    <li>انتحال شخصية الآخرين</li>
                    <li>استخدام المنصة للأنشطة التجارية غير المصرح بها</li>
                    <li>محاولة اختراق أو إتلاف النظام</li>
                  </ul>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold mb-2">الإبلاغ عن المخالفات</h3>
                  <p className="text-muted-foreground">
                    إذا واجهت محتوى أو سلوكاً مخالفاً لهذه القواعد، يرجى الإبلاغ عنه فوراً من خلال أدوات الإبلاغ المتاحة في المنصة أو التواصل مع فريق الدعم.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Content Rights */}
            <Card id="content">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Music className="w-6 h-6" />
                  حقوق المحتوى
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">حقوق الطبع والنشر</h3>
                  <p className="text-muted-foreground">
                    جميع الأغاني والمحتوى الموسيقي على المنصة محمي بحقوق الطبع والنشر. المحتوى مُرخص للاستخدام الشخصي وغير التجاري فقط من خلال المنصة.
                  </p>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold mb-2">المحتوى المُنشأ من قِبل المستخدمين</h3>
                  <p className="text-muted-foreground">
                    عندما تنشئ قوائم تشغيل أو تشارك محتوى، فإنك تمنحنا ترخيصاً لاستخدام هذا المحتوى لتحسين الخدمة وتقديم التوصيات للمستخدمين الآخرين.
                  </p>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold mb-2">احترام الحقوق</h3>
                  <p className="text-muted-foreground">
                    نحترم حقوق الملكية الفكرية ونتعامل بجدية مع أي ادعاءات بانتهاك حقوق الطبع والنشر. إذا كنت تعتقد أن حقوقك قد انتُهكت، يرجى التواصل معنا فوراً.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Contact */}
            <Card id="contact">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="w-6 h-6" />
                  تواصل معنا
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">للاستفسارات والدعم</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="w-4 h-4" />
                      <span>support@arabicmusic.com</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="w-4 h-4" />
                      <span dir="ltr">+1-555-0123</span>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold mb-2">للشؤون القانونية</h3>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="w-4 h-4" />
                    <span>legal@arabicmusic.com</span>
                  </div>
                </div>

                <Separator />

                <div className="bg-muted/50 p-4 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium mb-1">آخر تحديث</p>
                      <p className="text-sm text-muted-foreground">
                        تم تحديث هذه الشروط في يناير 2024. قد نقوم بتحديثها من وقت لآخر، وسنقوم بإشعارك بأي تغييرات مهمة.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Music, Users, Video, Shield, LogIn } from "lucide-react";
import { Link } from "wouter";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <Music className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold">MusicHub</span>
          </div>
          <Button 
            onClick={handleLogin}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 rounded-lg transition-colors glow-effect"
            data-testid="button-login"
          >
            تسجيل الدخول
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-24 px-4">
        <div className="container mx-auto text-center">
          <div className="gradient-bg rounded-2xl p-12 text-white relative overflow-hidden">
            <div className="relative z-10">
              <h1 className="text-5xl font-bold mb-6">
                مرحباً بك في MusicHub
              </h1>
              <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
                منصة الموسيقى المتطورة التي تجمع أفضل الأغاني العربية والعالمية في مكان واحد. 
                استمتع بتجربة استماع فريدة مع واجهة عصرية ومتقدمة
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={handleLogin}
                  size="lg" 
                  className="bg-white/20 backdrop-blur-sm border border-white/30 px-8 py-4 rounded-xl hover:bg-white/30 transition-all text-lg font-medium hover-scale"
                  data-testid="button-hero-login"
                >
                  <LogIn className="w-5 h-5 mr-2" />
                  تسجيل الدخول
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-white/10 border-white/30 text-white hover:bg-white/20 px-8 py-4 rounded-xl text-lg font-medium hover-scale"
                  data-testid="button-hero-browse"
                  asChild
                >
                  <Link href="/browse">
                    <Music className="w-5 h-5 mr-2" />
                    تصفح الموسيقى
                  </Link>
                </Button>
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            ميزات المنصة
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="bg-card border-border hover:bg-muted transition-colors hover-scale">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center mb-4">
                  <Music className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-foreground">مكتبة موسيقية ضخمة</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  آلاف الأغاني من أشهر الفنانين العرب والعالميين مع إضافة محتوى جديد باستمرار
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border hover:bg-muted transition-colors hover-scale">
              <CardHeader>
                <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-green-500" />
                </div>
                <CardTitle className="text-foreground">مشاركة اجتماعية</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  أنشئ قوائم التشغيل الخاصة بك وشاركها مع الأصدقاء واكتشف ما يستمعون إليه
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border hover:bg-muted transition-colors hover-scale">
              <CardHeader>
                <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center mb-4">
                  <Video className="w-6 h-6 text-red-500" />
                </div>
                <CardTitle className="text-foreground">معرض الفيديوهات</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  شاهد أحدث الفيديوهات الموسيقية والحفلات الحية من فنانيك المفضلين
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border hover:bg-muted transition-colors hover-scale">
              <CardHeader>
                <div className="w-12 h-12 bg-accent/20 rounded-xl flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-accent" />
                </div>
                <CardTitle className="text-foreground">جودة عالية</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  استمتع بأفضل جودة صوت مع تقنيات متقدمة لضمان تجربة استماع مثالية
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-20 px-4 bg-card">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary mb-2">10K+</div>
              <div className="text-muted-foreground">أغنية متاحة</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-500 mb-2">500+</div>
              <div className="text-muted-foreground">فنان مميز</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-500 mb-2">50K+</div>
              <div className="text-muted-foreground">مستخدم نشط</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-accent mb-2">1M+</div>
              <div className="text-muted-foreground">ساعة استماع</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">
            انضم إلى مجتمع محبي الموسيقى
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            ابدأ رحلتك الموسيقية اليوم واستمتع بتجربة فريدة من نوعها
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={handleLogin}
              size="lg" 
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 rounded-xl text-lg font-medium glow-effect hover-scale"
              data-testid="button-cta-login"
            >
              <LogIn className="w-5 h-5 mr-2" />
              ابدأ الآن مجاناً
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="px-8 py-4 rounded-xl text-lg font-medium hover-scale"
              data-testid="button-cta-browse"
              asChild
            >
              <Link href="/browse">
                <Music className="w-5 h-5 mr-2" />
                تصفح بدون حساب
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4">
        <div className="container mx-auto text-center text-muted-foreground">
          <p>&copy; 2024 MusicHub. جميع الحقوق محفوظة.</p>
        </div>
      </footer>
    </div>
  );
}

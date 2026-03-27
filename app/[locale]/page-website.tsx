import { redirect } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { HugeiconsIcon } from "@hugeicons/react";
import { 
  Book01Icon, 
  PencilEdit01Icon, 
  LibraryIcon,
  ArrowRight01Icon
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { DesignBackground } from "@/components/shared/design-background";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("landing");
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    redirect(`/${locale}/`);
  } else {
    redirect(`/${locale}/login`);
  }
  return (
    <div className="relative min-h-screen flex flex-col bg-background selection:bg-primary/20">
      <DesignBackground />
      <Navbar />

      <main className="grow pt-16">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-36 pb-24 md:pt-48 md:pb-48 text-center">
          <div className="container mx-auto px-4 relative z-10 text-center flex flex-col items-center">
            <Badge variant="outline" className="mb-8 font-heading text-xs tracking-wider uppercase border-primary/20 text-primary px-4 py-1.5 backdrop-blur-sm animate-in fade-in duration-700">
              O Futuro da Pregação é Aberto
            </Badge>
            <h1 className="font-heading font-extrabold text-5xl md:text-7xl lg:text-8xl leading-tight md:leading-[1.1] tracking-tighter max-w-5xl mx-auto mb-8 bg-linear-to-b from-foreground via-foreground to-foreground/60 bg-clip-text text-transparent animate-in fade-in slide-in-from-bottom-5 duration-1000">
              {t("heroTitle")}
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed font-sans font-medium animate-in fade-in slide-in-from-bottom-5 duration-1000 fill-mode-both" style={{ animationDelay: "200ms" }}>
              {t("heroSubtitle")}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-5 duration-1000 fill-mode-both" style={{ animationDelay: "400ms" }}>
              {user ? (
                <Link href="/">
                  <Button size="lg" className="h-14 px-8 text-base font-bold rounded-2xl shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all hover:scale-[1.02] active:scale-[0.98]">
                    {t("accessApp")}
                    <HugeiconsIcon icon={ArrowRight01Icon} className="ml-2 size-5" />
                  </Button>
                </Link>
              ) : (
                <Link href="/register">
                  <Button size="lg" className="h-14 px-8 text-base font-bold rounded-2xl shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all hover:scale-[1.02] active:scale-[0.98]">
                    {t("getStarted")}
                    <HugeiconsIcon icon={ArrowRight01Icon} className="ml-2 size-5" />
                  </Button>
                </Link>
              )}
              <Link href="#features">
                <Button variant="outline" size="lg" className="h-14 px-8 text-base font-bold rounded-2xl backdrop-blur-sm border-border/40 hover:bg-muted/40 transition-all hover:scale-[1.02]">
                  {t("viewFeatures")}
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 md:py-36 relative">
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-20 flex flex-col items-center">
              <h2 className="font-heading font-bold text-3xl md:text-4xl lg:text-5xl tracking-tight mb-4">
                {t("featuresTitle")}
              </h2>
              <div className="w-20 h-1 bg-primary/40 mx-auto rounded-full" />
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="group p-8 rounded-3xl border border-border/40 bg-card/60 backdrop-blur-md hover:border-primary/20 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2">
                <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500">
                  <HugeiconsIcon icon={PencilEdit01Icon} className="size-7" />
                </div>
                <h3 className="font-heading font-bold text-xl mb-3 tracking-tight">{t("featureEditorTitle")}</h3>
                <p className="text-muted-foreground leading-relaxed text-sm">
                  {t("featureEditorDesc")}
                </p>
              </div>

              {/* Feature 2 */}
              <div className="group p-8 rounded-3xl border border-border/40 bg-card/60 backdrop-blur-md hover:border-primary/20 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2">
                <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500">
                  <HugeiconsIcon icon={Book01Icon} className="size-7" />
                </div>
                <h3 className="font-heading font-bold text-xl mb-3 tracking-tight">{t("featureBibleTitle")}</h3>
                <p className="text-muted-foreground leading-relaxed text-sm">
                  {t("featureBibleDesc")}
                </p>
              </div>

              {/* Feature 3 */}
              <div className="group p-8 rounded-3xl border border-border/40 bg-card/60 backdrop-blur-md hover:border-primary/20 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2">
                <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500">
                  <HugeiconsIcon icon={LibraryIcon} className="size-7" />
                </div>
                <h3 className="font-heading font-bold text-xl mb-3 tracking-tight">{t("featureLibraryTitle")}</h3>
                <p className="text-muted-foreground leading-relaxed text-sm">
                  {t("featureLibraryDesc")}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 md:py-36 flex flex-col items-center">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-4xl mx-auto p-12 md:p-20 rounded-[40px] border border-primary/10 bg-linear-to-br from-primary/5 via-primary/5 to-transparent backdrop-blur-xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-linear-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
              <div className="relative z-10 flex flex-col items-center">
                <h2 className="font-heading font-bold text-4xl md:text-5xl lg:text-6xl tracking-tighter mb-6 leading-[1.1]">
                  {t("ctaTitle")}
                </h2>
                <p className="text-muted-foreground text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
                  {t("ctaSubtitle")}
                </p>
                <Link href={user ? "/" : "/register"}>
                  <Button size="lg" className="h-16 px-10 text-lg font-bold rounded-2xl shadow-xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all">
                    {user ? t("accessApp") : t("getStarted")}
                    <HugeiconsIcon icon={ArrowRight01Icon} className="ml-2 size-6" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

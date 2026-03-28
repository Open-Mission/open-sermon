"use client";

import * as React from "react";
import { User } from "@supabase/supabase-js";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  UserCircleIcon,
  Mail01Icon,
  Call02Icon,
  Building03Icon,
  Briefcase01Icon,
  Globe02Icon,
  Clock01Icon,
  CheckmarkCircle02Icon,
  Note01Icon,
  Tick01Icon,
  ArrowLeft01Icon,
  Camera01Icon,
} from "@hugeicons/core-free-icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Link } from "@/i18n/navigation";
import { createBrowserClient } from "@supabase/ssr";

interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  church_name: string | null;
  church_role: string | null;
  bio: string | null;
  locale: string | null;
  timezone: string | null;
}

interface ProfileClientProps {
  user: User;
  profile: Profile | null;
  stats: {
    total: number;
    preached: number;
    inProgress: number;
    public: number;
  };
}

const timezones = [
  { value: "America/Sao_Paulo", label: "Brasília (GMT-3)" },
  { value: "America/New_York", label: "New York (GMT-5)" },
  { value: "America/Los_Angeles", label: "Los Angeles (GMT-8)" },
  { value: "Europe/London", label: "London (GMT+0)" },
  { value: "Europe/Paris", label: "Paris (GMT+1)" },
  { value: "Asia/Tokyo", label: "Tokyo (GMT+9)" },
];

export function ProfileClient({ user, profile, stats }: ProfileClientProps) {
  const t = useTranslations("profile");
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [isSaving, setIsSaving] = React.useState(false);
  const [avatarPreview, setAvatarPreview] = React.useState<string | null>(profile?.avatar_url || null);
  const [avatarFile, setAvatarFile] = React.useState<File | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [formData, setFormData] = React.useState({
    first_name: profile?.first_name || "",
    last_name: profile?.last_name || "",
    phone: profile?.phone || "",
    church_name: profile?.church_name || "",
    church_role: profile?.church_role || "",
    bio: profile?.bio || "",
    timezone: profile?.timezone || "America/Sao_Paulo",
  });

  const displayName = formData.first_name || user?.email?.split("@")[0] || "User";
  const initials = displayName?.substring(0, 2).toUpperCase() || "US";

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Imagem muito grande. Máximo 5MB.");
        return;
      }
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadAvatar = async (): Promise<string | null> => {
    if (!avatarFile) return null;

    const fileExt = avatarFile.name.split(".").pop();
    const fileName = `${user.id}/avatar.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(fileName, avatarFile, { upsert: true });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return null;
    }

    const { data } = supabase.storage.from("avatars").getPublicUrl(fileName);
    return data.publicUrl;
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const uploadedUrl = avatarFile ? await uploadAvatar() : null;
      const finalAvatarUrl = uploadedUrl || avatarPreview;

      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          avatar_url: finalAvatarUrl,
        }),
      });

      if (!response.ok) throw new Error();

      toast.success(t("saved"));
      router.refresh();
    } catch {
      toast.error(t("saveError"));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 md:px-8 py-8 space-y-8">
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="h-9 w-9 rounded-lg bg-muted/50 hover:bg-muted flex items-center justify-center transition-colors"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} size={18} className="text-muted-foreground" />
        </Link>
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground/90">
            {t("title")}
          </h1>
          <p className="text-sm text-muted-foreground/60">
            {t("subtitle")}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          icon={<HugeiconsIcon icon={Note01Icon} size={18} />}
          label={t("stats.totalSermons")}
          value={stats.total}
          color="text-foreground/70"
        />
        <StatCard
          icon={<HugeiconsIcon icon={Tick01Icon} size={18} />}
          label={t("stats.preached")}
          value={stats.preached}
          color="text-violet-500"
        />
        <StatCard
          icon={<HugeiconsIcon icon={UserCircleIcon} size={18} />}
          label={t("stats.inProgress")}
          value={stats.inProgress}
          color="text-amber-500"
        />
        <StatCard
          icon={<HugeiconsIcon icon={Globe02Icon} size={18} />}
          label={t("stats.public")}
          value={stats.public}
          color="text-blue-500"
        />
      </div>

      <section className="space-y-4">
        <div className="flex items-center gap-2 text-muted-foreground/50">
          <HugeiconsIcon icon={UserCircleIcon} size={16} strokeWidth={1.5} />
          <h2 className="text-sm font-medium tracking-tight">{t("personalInfo")}</h2>
        </div>
        
        <div className="bg-muted/20 rounded-2xl border border-border/30 p-6 space-y-5">
          <div className="flex items-center gap-4">
            <label className="relative cursor-pointer group">
              <Avatar className="h-16 w-16 border-2 border-border/50 group-hover:border-primary/50 transition-colors">
                {avatarPreview && <AvatarImage src={avatarPreview} alt={displayName} />}
                <AvatarFallback className="text-lg font-semibold bg-gradient-to-br from-primary/20 to-primary/10 text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <HugeiconsIcon icon={Camera01Icon} size={20} className="text-white" />
              </div>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </label>
            <div>
              <p className="font-medium text-foreground/90">{displayName}</p>
              <p className="text-sm text-muted-foreground/60">{user.email}</p>
              <p className="text-xs text-muted-foreground/40 mt-1">Clique na foto para alterar</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name" className="text-xs text-muted-foreground/70 font-medium">
                {t("firstName")}
              </Label>
              <Input
                id="first_name"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                className="bg-background/50 border-border/40"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name" className="text-xs text-muted-foreground/70 font-medium">
                {t("lastName")}
              </Label>
              <Input
                id="last_name"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                className="bg-background/50 border-border/40"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-xs text-muted-foreground/70 font-medium">
              {t("email")}
            </Label>
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/30 px-3 py-2 rounded-lg">
              <HugeiconsIcon icon={Mail01Icon} size={16} className="text-muted-foreground/50" />
              {user.email}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-xs text-muted-foreground/70 font-medium">
              {t("phone")}
            </Label>
            <div className="relative">
              <HugeiconsIcon 
                icon={Call02Icon} 
                size={16} 
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/40" 
              />
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="bg-background/50 border-border/40 pl-10"
                placeholder="+55 11 99999-9999"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio" className="text-xs text-muted-foreground/70 font-medium">
              {t("bio")}
            </Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder={t("bioPlaceholder")}
              className="bg-background/50 border-border/40 min-h-[80px] resize-none"
            />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-2 text-muted-foreground/50">
          <HugeiconsIcon icon={Building03Icon} size={16} strokeWidth={1.5} />
          <h2 className="text-sm font-medium tracking-tight">{t("churchInfo")}</h2>
        </div>
        
        <div className="bg-muted/20 rounded-2xl border border-border/30 p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="church_name" className="text-xs text-muted-foreground/70 font-medium">
              {t("churchName")}
            </Label>
            <div className="relative">
              <HugeiconsIcon 
                icon={Building03Icon} 
                size={16} 
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/40" 
              />
              <Input
                id="church_name"
                value={formData.church_name}
                onChange={(e) => setFormData({ ...formData, church_name: e.target.value })}
                className="bg-background/50 border-border/40 pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="church_role" className="text-xs text-muted-foreground/70 font-medium">
              {t("churchRole")}
            </Label>
            <div className="relative">
              <HugeiconsIcon 
                icon={Briefcase01Icon} 
                size={16} 
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/40" 
              />
              <Input
                id="church_role"
                value={formData.church_role}
                onChange={(e) => setFormData({ ...formData, church_role: e.target.value })}
                className="bg-background/50 border-border/40 pl-10"
                placeholder="Pastor, Líder de louvor, etc."
              />
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-2 text-muted-foreground/50">
          <HugeiconsIcon icon={Globe02Icon} size={16} strokeWidth={1.5} />
          <h2 className="text-sm font-medium tracking-tight">{t("preferences")}</h2>
        </div>
        
        <div className="bg-muted/20 rounded-2xl border border-border/30 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HugeiconsIcon icon={Globe02Icon} size={16} className="text-muted-foreground/50" />
              <span className="text-sm">{t("language")}</span>
            </div>
            <LocaleSwitcher />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HugeiconsIcon icon={Clock01Icon} size={16} className="text-muted-foreground/50" />
              <span className="text-sm">{t("timezone")}</span>
            </div>
            <select
              value={formData.timezone}
              onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
              className="bg-background/50 border border-border/40 rounded-lg px-3 py-1.5 text-sm"
            >
              {timezones.map((tz) => (
                <option key={tz.value} value={tz.value}>
                  {tz.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm">{t("appearance")}</span>
            <div className="flex bg-muted p-1 rounded-lg">
              {["light", "dark", "system"].map((mode) => (
                <button
                  key={mode}
                  onClick={() => setTheme(mode)}
                  className={cn(
                    "px-3 py-1 text-xs font-medium rounded-md transition-all",
                    theme === mode
                      ? "bg-background shadow-sm text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {t(mode as "light" | "dark" | "system")}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="flex justify-end pt-4">
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="min-w-[140px]"
        >
          {isSaving ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              {t("saving")}
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <HugeiconsIcon icon={CheckmarkCircle02Icon} size={18} />
              {t("save")}
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}

function StatCard({ 
  icon, 
  label, 
  value, 
  color 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: number; 
  color: string;
}) {
  return (
    <div className="bg-muted/20 rounded-xl border border-border/30 p-4 space-y-2">
      <div className={cn("text-muted-foreground/50", color)}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-semibold">{value}</p>
        <p className="text-[11px] text-muted-foreground/50">{label}</p>
      </div>
    </div>
  );
}

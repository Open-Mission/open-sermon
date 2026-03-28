"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  UserCircleIcon,
  Camera01Icon,
  CheckmarkCircle02Icon,
  ArrowRight02Icon,
} from "@hugeicons/core-free-icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { createBrowserClient } from "@supabase/ssr";

interface OnboardingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  email: string;
  onComplete: () => void;
}

export function OnboardingModal({
  open,
  onOpenChange,
  userId,
  email,
  onComplete,
}: OnboardingModalProps) {
  const router = useRouter();
  const [step, setStep] = React.useState<"name" | "avatar">("name");
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [avatarUrl, setAvatarUrl] = React.useState<string | null>(null);
  const [avatarFile, setAvatarFile] = React.useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const initials = firstName?.substring(0, 1).toUpperCase() || 
    email?.substring(0, 2).toUpperCase() || "US";

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
    const fileName = `${userId}/avatar.${fileExt}`;

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

  const handleContinue = () => {
    if (!firstName.trim()) {
      toast.error("Por favor, insira seu nome");
      return;
    }
    setStep("avatar");
  };

  const handleSkip = async () => {
    await saveProfile(null);
  };

  const handleComplete = async () => {
    await saveProfile(avatarPreview);
  };

  const saveProfile = async (avatarUrlToSave: string | null) => {
    setIsSubmitting(true);

    try {
      const uploadedUrl = avatarFile ? await uploadAvatar() : null;
      const finalAvatarUrl = uploadedUrl || avatarUrlToSave;

      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          avatar_url: finalAvatarUrl,
        }),
      });

      if (!response.ok) throw new Error();

      toast.success("Perfil configurado com sucesso!");
      onComplete();
      router.refresh();
    } catch {
      toast.error("Erro ao salvar perfil");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {step === "name" ? "Bem-vindo ao Open Sermon!" : "Sua foto de perfil"}
          </DialogTitle>
          <DialogDescription>
            {step === "name" 
              ? "Para começar, precisamos saber seu nome."
              : "Adicione uma foto para personalizar seu perfil."}
          </DialogDescription>
        </DialogHeader>

        {step === "name" ? (
          <div className="space-y-4 py-4">
            <div className="flex justify-center">
              <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center border-2 border-dashed border-primary/30">
                <HugeiconsIcon 
                  icon={UserCircleIcon} 
                  size={40} 
                  className="text-primary/50"
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="first_name" className="text-xs text-muted-foreground/70">
                  Nome *
                </Label>
                <Input
                  id="first_name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Seu primeiro nome"
                  className="bg-background/50 border-border/40"
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name" className="text-xs text-muted-foreground/70">
                  Sobrenome
                </Label>
                <Input
                  id="last_name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Seu sobrenome"
                  className="bg-background/50 border-border/40"
                />
              </div>
            </div>

            <Button
              onClick={handleContinue}
              disabled={!firstName.trim() || isSubmitting}
              className="w-full"
            >
              Continuar
              <HugeiconsIcon icon={ArrowRight02Icon} size={18} className="ml-2" />
            </Button>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="flex justify-center">
              <label className="relative cursor-pointer group">
                <Avatar className="h-24 w-24 border-2 border-border/50 group-hover:border-primary/50 transition-colors">
                  {avatarPreview ? (
                    <AvatarImage src={avatarPreview} alt="Avatar" />
                  ) : null}
                  <AvatarFallback className="text-2xl font-semibold bg-gradient-to-br from-primary/20 to-primary/10 text-primary">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <HugeiconsIcon icon={Camera01Icon} size={24} className="text-white" />
                </div>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </label>
            </div>

            <p className="text-center text-sm text-muted-foreground/60">
              Clique para adicionar uma foto
            </p>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleSkip}
                disabled={isSubmitting}
                className="flex-1"
              >
                Pular
              </Button>
              <Button
                onClick={handleComplete}
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Salvando...
                  </span>
                ) : (
                  <>
                    <HugeiconsIcon icon={CheckmarkCircle02Icon} size={18} className="mr-2" />
                    Concluir
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

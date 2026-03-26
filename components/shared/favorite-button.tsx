"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { StarIcon } from "@hugeicons/core-free-icons";
import { toggleFavorite } from "@/lib/sermon-actions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface FavoriteButtonProps {
  sermonId: string;
  initialIsFavorite: boolean;
}

export function FavoriteButton({
  sermonId,
  initialIsFavorite,
}: FavoriteButtonProps) {
  const router = useRouter();
  const [isFavorite, setIsFavorite] = React.useState(initialIsFavorite);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleToggle = async () => {
    setIsLoading(true);
    const result = await toggleFavorite(sermonId);
    setIsLoading(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      setIsFavorite(result.isFavorite ?? false);
      router.refresh();
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-8 gap-1 text-muted-foreground"
      onClick={handleToggle}
      disabled={isLoading}
    >
      <HugeiconsIcon
        icon={StarIcon}
        size={16}
        className={cn(isFavorite && "fill-yellow-500 text-yellow-500")}
      />
    </Button>
  );
}

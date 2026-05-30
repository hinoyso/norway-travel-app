"use client";
import { Button } from "@/components/ui/button";
import { getMapsUrl } from "@/lib/utils";
import { Navigation, MapPin } from "lucide-react";
import { isIOS } from "@/lib/utils";
import { useT } from "@/lib/i18n";

interface NavigationButtonsProps {
  address: string;
  label?: string;
}

export function NavigationButtons({ address }: NavigationButtonsProps) {
  const { t } = useT();
  const showApple = isIOS();

  function openMaps(platform: "google" | "apple") {
    window.open(getMapsUrl(address, platform), "_blank", "noopener,noreferrer");
  }

  return (
    <div className="flex gap-2">
      <Button variant="default" size="sm" className="flex-1 gap-2" onClick={() => openMaps("google")}>
        <Navigation className="h-4 w-4" />
        {t.activity.getDirections}
      </Button>
      {showApple && (
        <Button variant="outline" size="sm" className="flex-1 gap-2" onClick={() => openMaps("apple")}>
          <MapPin className="h-4 w-4" />
          Apple Maps
        </Button>
      )}
    </div>
  );
}

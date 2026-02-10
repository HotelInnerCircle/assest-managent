import { useState } from "react";
import { ASSET_OPTIONS } from "@/lib/formSchema";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Laptop,
  Monitor,
  Smartphone,
  Battery,
  Headphones,
  Package,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";

const ASSET_ICONS: Record<string, React.ReactNode> = {
  Laptop: <Laptop className="w-5 h-5" />,
  Desktop: <Monitor className="w-5 h-5" />,
  "Mobile Phone": <Smartphone className="w-5 h-5" />,
  "Charger / Adapter": <Battery className="w-5 h-5" />,
  Headset: <Headphones className="w-5 h-5" />,
  "Other Accessories": <Package className="w-5 h-5" />,
};

interface AssetSelectionProps {
  selected: string[];
  onNext: (selected: string[]) => void;
  onBack: () => void;
}

const AssetSelection = ({
  selected,
  onNext,
  onBack,
}: AssetSelectionProps) => {
  const [assets, setAssets] = useState<string[]>(selected);
  const [error, setError] = useState("");

  const toggle = (asset: string) => {
    setError("");
    setAssets((prev) =>
      prev.includes(asset)
        ? prev.filter((a) => a !== asset)
        : [...prev, asset]
    );
  };

  const handleNext = () => {
    if (assets.length === 0) {
      setError("Select at least one asset");
      return;
    }
    onNext(assets);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">
          Asset Selection
        </h2>
        <p className="text-muted-foreground mt-1">
          Choose assigned assets
        </p>
      </div>

      {/* Options */}
      <div className="grid gap-3">
        {ASSET_OPTIONS.map((asset) => (
          <label
            key={asset}
            className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-all ${
              assets.includes(asset)
                ? "border-primary bg-primary/5 shadow-soft"
                : "border-border hover:border-primary/40"
            }`}
          >
            <Checkbox
              checked={assets.includes(asset)}
              onCheckedChange={() => toggle(asset)}
            />
            <span className="text-primary">
              {ASSET_ICONS[asset]}
            </span>
            <Label className="cursor-pointer font-medium">
              {asset}
            </Label>
          </label>
        ))}
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {/* Actions */}
      <div className="flex justify-between pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        <Button
          type="button"
          onClick={handleNext}
          className="gap-2"
        >
          Next <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default AssetSelection;

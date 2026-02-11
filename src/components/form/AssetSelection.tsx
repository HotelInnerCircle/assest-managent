import { useState } from "react";
import { ASSET_OPTIONS, AssetOption } from "@/lib/formSchema";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { MdOutlineSimCard } from "react-icons/md";
import {
  Laptop,
  Monitor,
  Smartphone,
  Headphones,
  Package,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";

const ASSET_ICONS: Record<AssetOption, React.ReactNode> = {
  Laptop: <Laptop className="w-5 h-5" />,
  Desktop: <Monitor className="w-5 h-5" />,
  "Mobile Phone": <Smartphone className="w-5 h-5" />,
  "Tablet / iPad": <Smartphone className="w-5 h-5" />,
  "SIM Card": <MdOutlineSimCard className="w-5 h-5" />,
  Headset: <Headphones className="w-5 h-5" />,
  "Other Assets": <Package className="w-5 h-5" />,
};

interface Props {
  selected: AssetOption[];
  onNext: (v: AssetOption[]) => void;
  onBack: () => void;
}

export default function AssetSelection({ selected, onNext, onBack }: Props) {
  const [assets, setAssets] = useState<AssetOption[]>(selected);
  const [error, setError] = useState("");

  const toggle = (a: AssetOption) => {
    setAssets((prev) =>
      prev.includes(a)
        ? prev.filter((x) => x !== a)
        : [...prev, a]
    );
    setError(""); // clear error when selecting
  };

  const handleNext = () => {
    if (assets.length === 0) {
      setError("Please select at least one asset to continue.");
      return;
    }

    onNext(assets);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">
        Asset Selection <span className="text-red-500">*</span>
      </h2>

      <div className="grid sm:grid-cols-2 gap-3">
        {ASSET_OPTIONS.map((asset) => (
          <label
            key={asset}
            className={`flex gap-3 p-4 border rounded-lg cursor-pointer transition ${
              assets.includes(asset)
                ? "border-primary bg-primary/5"
                : "border-border hover:bg-muted/40"
            }`}
          >
            <Checkbox
              checked={assets.includes(asset)}
              onCheckedChange={() => toggle(asset)}
            />
            {ASSET_ICONS[asset]}
            <Label>{asset}</Label>
          </label>
        ))}
      </div>

      {error && (
        <p className="text-sm text-red-500 font-medium">
          {error}
        </p>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>

        <Button
          onClick={handleNext}
          disabled={assets.length === 0}
        >
          Next <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}

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

  const toggle = (a: AssetOption) =>
    setAssets((p) => (p.includes(a) ? p.filter((x) => x !== a) : [...p, a]));

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Asset Selection</h2>

      <div className="grid sm:grid-cols-2 gap-3">
        {ASSET_OPTIONS.map((asset) => (
          <label
            key={asset}
            className={`flex gap-3 p-4 border rounded-lg cursor-pointer ${
              assets.includes(asset)
                ? "border-primary bg-primary/5"
                : "border-border"
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

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <Button onClick={() => onNext(assets)}>
          Next <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  laptopSchema,
  mobileSchema,
  LaptopData,
  MobileData,
  LAPTOP_ACCESSORIES,
  MOBILE_ACCESSORIES,
  AssetOption,
  GenericAsset,
} from "@/lib/formSchema";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

import {
  ArrowLeft,
  ArrowRight,
  Laptop,
  Monitor,
  Smartphone,
  Headphones,
  Package,
  X,
} from "lucide-react";

/* ================= PROPS ================= */

interface AssetDetailsProps {
  selectedAssets: AssetOption[];
  assetDetails: Record<string, any>;
  onNext: (details: Record<string, any>) => void;
  onBack: () => void;
}

/* ================= COMPONENT ================= */

export default function AssetDetails({
  selectedAssets,
  assetDetails,
  onNext,
  onBack,
}: AssetDetailsProps) {
  const hasLaptop = selectedAssets.includes("Laptop");
  const hasDesktop = selectedAssets.includes("Desktop");
  const hasTablet = selectedAssets.includes("Tablet / iPad");
  const hasMobile = selectedAssets.includes("Mobile Phone");

  /* ---------------- FORMS ---------------- */

  const laptopForm = useForm<LaptopData>({
    resolver: zodResolver(laptopSchema),
    defaultValues: assetDetails.laptop || { brand: "", serialNumber: "" },
  });

  const desktopForm = useForm<LaptopData>({
    resolver: zodResolver(laptopSchema),
    defaultValues: assetDetails.desktop || { brand: "", serialNumber: "" },
  });

  const tabletForm = useForm<LaptopData>({
    resolver: zodResolver(laptopSchema),
    defaultValues: assetDetails.tablet || { brand: "", serialNumber: "" },
  });

  const mobileForm = useForm<MobileData>({
    resolver: zodResolver(mobileSchema),
    defaultValues: assetDetails.mobile || { brand: "", imeiNumber: "" },
  });

  /* ---------------- SIMPLE ASSETS ---------------- */

  const [simpleAssets, setSimpleAssets] = useState<Record<AssetOption, GenericAsset>>({
    Headset: assetDetails.Headset || {},
    "SIM Card": assetDetails["SIM Card"] || {},
    "Other Assets": assetDetails["Other Assets"] || {},
  });

  const updateSimple = (k: AssetOption, v: GenericAsset) =>
    setSimpleAssets((p) => ({ ...p, [k]: v }));

  /* ---------------- ACCESSORIES ---------------- */

  const [laptopAcc, setLaptopAcc] = useState<string[]>(assetDetails.laptop?.accessories || []);
  const [desktopAcc, setDesktopAcc] = useState<string[]>(assetDetails.desktop?.accessories || []);
  const [tabletAcc, setTabletAcc] = useState<string[]>(assetDetails.tablet?.accessories || []);
  const [mobileAcc, setMobileAcc] = useState<string[]>(assetDetails.mobile?.accessories || []);

  /* ---------------- IMAGES ---------------- */

  const [laptopImages, setLaptopImages] = useState<string[]>(assetDetails.laptop?.images || []);
  const [desktopImages, setDesktopImages] = useState<string[]>(assetDetails.desktop?.images || []);
  const [tabletImages, setTabletImages] = useState<string[]>(assetDetails.tablet?.images || []);
  const [mobileImages, setMobileImages] = useState<string[]>(assetDetails.mobile?.images || []);

  const uploadImages = async (files: FileList | null, setImages: any) => {
    if (!files) return;
    const uploaded: string[] = [];

    for (const file of Array.from(files)) {
      const ext = file.name.split(".").pop();
      const name = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { error } = await supabase.storage
        .from("asset-images")
        .upload(name, file);

      if (!error) {
        const { data } = supabase.storage
          .from("asset-images")
          .getPublicUrl(name);
        uploaded.push(data.publicUrl);
      }
    }

    setImages((p: string[]) => [...p, ...uploaded]);
  };

  /* ---------------- SUBMIT ---------------- */

  const handleSubmit = async () => {
    const result: any = {};

    const validateBlock = async (
      form: any,
      images: string[],
      name: string,
      acc: string[]
    ) => {
      if (!(await form.trigger()) || images.length === 0) {
        toast({ title: `${name} incomplete`, variant: "destructive" });
        return null;
      }
      return { ...form.getValues(), accessories: acc, images };
    };

    if (hasLaptop)
      result.laptop = await validateBlock(laptopForm, laptopImages, "Laptop", laptopAcc);
    if (hasDesktop)
      result.desktop = await validateBlock(desktopForm, desktopImages, "Desktop", desktopAcc);
    if (hasTablet)
      result.tablet = await validateBlock(tabletForm, tabletImages, "Tablet / iPad", tabletAcc);
    if (hasMobile)
      result.mobile = await validateBlock(mobileForm, mobileImages, "Mobile", mobileAcc);

    for (const a of ["Headset", "SIM Card", "Other Assets"] as AssetOption[]) {
      if (!selectedAssets.includes(a)) continue;

      const d = simpleAssets[a];
      if (
        (a === "Headset" && !d.brand) ||
        (a === "SIM Card" && !/^[6-9]\d{9}$/.test(d.simNumber || "")) ||
        (a === "Other Assets" && !d.description)
      ) {
        toast({ title: `${a} incomplete`, variant: "destructive" });
        return;
      }
      result[a] = d;
    }

    onNext(result);
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">Asset Details</h2>

      {hasLaptop && (
        <AssetBlock
          title="Laptop"
          icon={<Laptop />}
          form={laptopForm}
          accessories={laptopAcc}
          setAccessories={setLaptopAcc}
          images={laptopImages}
          setImages={setLaptopImages}
          uploadImages={uploadImages}
        />
      )}

      {hasDesktop && (
        <AssetBlock
          title="Desktop"
          icon={<Monitor />}
          form={desktopForm}
          accessories={desktopAcc}
          setAccessories={setDesktopAcc}
          images={desktopImages}
          setImages={setDesktopImages}
          uploadImages={uploadImages}
        />
      )}

      {hasTablet && (
        <AssetBlock
          title="Tablet / iPad"
          icon={<Monitor />}
          form={tabletForm}
          accessories={tabletAcc}
          setAccessories={setTabletAcc}
          images={tabletImages}
          setImages={setTabletImages}
          uploadImages={uploadImages}
        />
      )}

      {hasMobile && (
        <AssetBlock
          title="Mobile Phone"
          icon={<Smartphone />}
          form={mobileForm}
          accessories={mobileAcc}
          setAccessories={setMobileAcc}
          images={mobileImages}
          setImages={setMobileImages}
          uploadImages={uploadImages}
          isMobile
        />
      )}

      {selectedAssets.includes("Headset") && (
        <SimpleBlock
          title="Headset"
          icon={<Headphones />}
          value={simpleAssets.Headset}
          onChange={(v) => updateSimple("Headset", v)}
        />
      )}

      {selectedAssets.includes("SIM Card") && (
        <SimpleBlock
          title="SIM Card"
          icon={<Headphones />}
          value={simpleAssets["SIM Card"]}
          onChange={(v) => updateSimple("SIM Card", v)}
          isSim
        />
      )}

      {selectedAssets.includes("Other Assets") && (
        <SimpleBlock
          title="Other Assets"
          icon={<Package />}
          value={simpleAssets["Other Assets"]}
          onChange={(v) => updateSimple("Other Assets", v)}
          isOther
        />
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <Button onClick={handleSubmit}>
          Next <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}

/* ================= REUSABLE BLOCKS ================= */

const AssetBlock = ({
  title,
  icon,
  form,
  accessories,
  setAccessories,
  images,
  setImages,
  uploadImages,
  isMobile = false,
}: any) => (
  <div className="border rounded-lg p-5 space-y-4">
    <h3 className="flex gap-2 font-semibold">{icon} {title}</h3>

    <Input placeholder="Brand" {...form.register("brand")} />
    {!isMobile ? (
      <Input placeholder="Serial Number" {...form.register("serialNumber")} />
    ) : (
      <Input placeholder="IMEI Number" {...form.register("imeiNumber")} />
    )}

    <div className="flex flex-wrap gap-3">
      {(isMobile ? MOBILE_ACCESSORIES : LAPTOP_ACCESSORIES).map((a: string) => (
        <label key={a} className="flex gap-2 items-center">
          <Checkbox
            checked={accessories.includes(a)}
            onCheckedChange={() =>
              setAccessories((p: string[]) =>
                p.includes(a) ? p.filter(x => x !== a) : [...p, a]
              )
            }
          />
          {a}
        </label>
      ))}
    </div>

    <Label>Upload Images *</Label>
    <input type="file" multiple accept="image/*" onChange={e => uploadImages(e.target.files, setImages)} />

    <div className="grid grid-cols-3 gap-3">
      {images.map((img: string, i: number) => (
        <div key={i} className="relative">
          <img src={img} className="h-24 w-full object-cover rounded" />
          <button
            onClick={() => setImages((p: string[]) => p.filter((_, idx) => idx !== i))}
            className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ))}
    </div>
  </div>
);

const SimpleBlock = ({
  title,
  icon,
  value,
  onChange,
  isSim,
  isOther,
}: any) => (
  <div className="border rounded-lg p-5 space-y-4">
    <h3 className="flex gap-2 font-semibold">{icon} {title}</h3>

    {!isSim && !isOther && (
      <Input
        placeholder="Brand"
        value={value.brand || ""}
        onChange={e => onChange({ ...value, brand: e.target.value })}
      />
    )}

    {isSim && (
      <Input
        placeholder="SIM Number"
        maxLength={10}
        value={value.simNumber || ""}
        onChange={e => onChange({ ...value, simNumber: e.target.value })}
      />
    )}

    {isOther && (
      <textarea
        className="w-full border rounded-md p-3"
        placeholder="Describe the asset"
        value={value.description || ""}
        onChange={e => onChange({ ...value, description: e.target.value })}
      />
    )}
  </div>
);

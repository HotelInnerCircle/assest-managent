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
  X,
} from "lucide-react";

interface AssetDetailsProps {
  selectedAssets: string[];
  assetDetails: {
    laptop?: LaptopData & { images: string[] };
    desktop?: LaptopData & { images: string[] };
    mobile?: MobileData & { images: string[] };
  };
  onNext: (details: any) => void;
  onBack: () => void;
}

const AssetDetails = ({
  selectedAssets,
  assetDetails,
  onNext,
  onBack,
}: AssetDetailsProps) => {
  const hasLaptop = selectedAssets.includes("Laptop");
  const hasDesktop = selectedAssets.includes("Desktop");
  const hasMobile = selectedAssets.includes("Mobile Phone");

  /* -------------------- FORMS -------------------- */
  const laptopForm = useForm<LaptopData>({
    resolver: zodResolver(laptopSchema),
    defaultValues: assetDetails.laptop || {
      brand: "",
      serialNumber: "",
      accessories: [],
    },
  });

  const desktopForm = useForm<LaptopData>({
    resolver: zodResolver(laptopSchema),
    defaultValues: assetDetails.desktop || {
      brand: "",
      serialNumber: "",
      accessories: [],
    },
  });

  const mobileForm = useForm<MobileData>({
    resolver: zodResolver(mobileSchema),
    defaultValues: assetDetails.mobile || {
      brand: "",
      imeiNumber: "",
      accessories: [],
    },
  });

  /* -------------------- STATE -------------------- */
  const [laptopAccessories, setLaptopAccessories] = useState<string[]>(
    assetDetails.laptop?.accessories || []
  );
  const [desktopAccessories, setDesktopAccessories] = useState<string[]>(
    assetDetails.desktop?.accessories || []
  );
  const [mobileAccessories, setMobileAccessories] = useState<string[]>(
    assetDetails.mobile?.accessories || []
  );

  const [laptopImages, setLaptopImages] = useState<string[]>(
    assetDetails.laptop?.images || []
  );
  const [desktopImages, setDesktopImages] = useState<string[]>(
    assetDetails.desktop?.images || []
  );
  const [mobileImages, setMobileImages] = useState<string[]>(
    assetDetails.mobile?.images || []
  );

  /* -------------------- HELPERS -------------------- */
  const toggleAccessory = (
    list: string[],
    setList: (v: string[]) => void,
    item: string
  ) => {
    setList(list.includes(item) ? list.filter(a => a !== item) : [...list, item]);
  };

  const uploadImages = async (
    files: FileList | null,
    setImages: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    if (!files) return;

    const uploaded: string[] = [];

    for (const file of Array.from(files)) {
      const ext = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { error } = await supabase.storage
        .from("asset-images")
        .upload(fileName, file);

      if (!error) {
        const { data } = supabase.storage
          .from("asset-images")
          .getPublicUrl(fileName);
        uploaded.push(data.publicUrl);
      }
    }

    setImages(prev => [...prev, ...uploaded]);
  };

  /* -------------------- SUBMIT -------------------- */
  const handleSubmit = async () => {
    const result: any = {};
    let valid = true;

    if (hasLaptop) {
      const ok = await laptopForm.trigger();
      if (!ok || laptopImages.length === 0) {
        toast({ title: "Laptop details incomplete", variant: "destructive" });
        valid = false;
      } else {
        result.laptop = {
          ...laptopForm.getValues(),
          accessories: laptopAccessories,
          images: laptopImages,
        };
      }
    }

    if (hasDesktop) {
      const ok = await desktopForm.trigger();
      if (!ok || desktopImages.length === 0) {
        toast({ title: "Desktop details incomplete", variant: "destructive" });
        valid = false;
      } else {
        result.desktop = {
          ...desktopForm.getValues(),
          accessories: desktopAccessories,
          images: desktopImages,
        };
      }
    }

    if (hasMobile) {
      const ok = await mobileForm.trigger();
      if (!ok || mobileImages.length === 0) {
        toast({ title: "Mobile details incomplete", variant: "destructive" });
        valid = false;
      } else {
        result.mobile = {
          ...mobileForm.getValues(),
          accessories: mobileAccessories,
          images: mobileImages,
        };
      }
    }

    if (valid) onNext(result);
  };

  /* -------------------- UI -------------------- */
  return (
    <div className="space-y-8 animate-fade-in">
      <h2 className="text-2xl font-bold">Asset Details</h2>

      {/* ================= LAPTOP ================= */}
      {hasLaptop && (
        <AssetBlock
          title="Laptop"
          icon={<Laptop />}
          form={laptopForm}
          accessories={laptopAccessories}
          setAccessories={setLaptopAccessories}
          images={laptopImages}
          setImages={setLaptopImages}
          uploadImages={uploadImages}
        />
      )}

      {/* ================= DESKTOP ================= */}
      {hasDesktop && (
        <AssetBlock
          title="Desktop"
          icon={<Monitor />}
          form={desktopForm}
          accessories={desktopAccessories}
          setAccessories={setDesktopAccessories}
          images={desktopImages}
          setImages={setDesktopImages}
          uploadImages={uploadImages}
        />
      )}

      {/* ================= MOBILE ================= */}
      {hasMobile && (
        <AssetBlock
          title="Mobile Phone"
          icon={<Smartphone />}
          form={mobileForm}
          accessories={mobileAccessories}
          setAccessories={setMobileAccessories}
          images={mobileImages}
          setImages={setMobileImages}
          uploadImages={uploadImages}
          isMobile
        />
      )}

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <Button onClick={handleSubmit}>
          Next <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default AssetDetails;

/* ================= REUSABLE BLOCK ================= */

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
  <div className="p-5 border rounded-lg space-y-4">
    <h3 className="flex items-center gap-2 font-semibold">
      {icon} {title}
    </h3>

    <Input placeholder="Brand" {...form.register("brand")} />
    {!isMobile ? (
      <Input placeholder="Serial Number" {...form.register("serialNumber")} />
    ) : (
      <Input placeholder="IMEI Number" {...form.register("imeiNumber")} />
    )}

    <div className="flex flex-wrap gap-3">
      {(isMobile ? MOBILE_ACCESSORIES : LAPTOP_ACCESSORIES).map((acc: string) => (
        <label key={acc} className="flex gap-2 items-center">
          <Checkbox
            checked={accessories.includes(acc)}
            onCheckedChange={() =>
              setAccessories((prev: string[]) =>
                prev.includes(acc) ? prev.filter(a => a !== acc) : [...prev, acc]
              )
            }
          />
          {acc}
        </label>
      ))}
    </div>

    <Label>Upload {title} Images *</Label>
    <input
      type="file"
      multiple
      accept="image/*"
      onChange={e => uploadImages(e.target.files, setImages)}
    />

    <div className="grid grid-cols-3 gap-3">
      {images.map((img: string, i: number) => (
        <div key={i} className="relative">
          <img src={img} className="h-24 w-full object-cover rounded" />
          <button
            onClick={() =>
              setImages((prev: string[]) => prev.filter((_, idx) => idx !== i))
            }
            className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ))}
    </div>
  </div>
);

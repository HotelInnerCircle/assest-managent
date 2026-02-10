import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  laptopSchema,
  mobileSchema,
  LaptopData,
  MobileData,
  LAPTOP_ACCESSORIES,
  MOBILE_ACCESSORIES,
  TAB_ACCESSORIES,
  AssetOption,
  GenericAsset,
} from '@/lib/formSchema';

import { supabase } from '@/integrations/supabase/client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

import {
  ArrowLeft,
  ArrowRight,
  Laptop,
  Monitor,
  Smartphone,
  Headphones,
  Package,
  X,
} from 'lucide-react';

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
  const hasLaptop = selectedAssets.includes('Laptop');
  const hasDesktop = selectedAssets.includes('Desktop');
  const hasTablet = selectedAssets.includes('Tablet / iPad');
  const hasMobile = selectedAssets.includes('Mobile Phone');

  /* ---------------- FORMS ---------------- */

  const laptopForm = useForm<LaptopData>({
    resolver: zodResolver(laptopSchema),
    defaultValues: assetDetails.laptop || { brand: '', serialNumber: '' },
  });

  const desktopForm = useForm<LaptopData>({
    resolver: zodResolver(laptopSchema),
    defaultValues: assetDetails.desktop || { brand: '', serialNumber: '' },
  });

  const tabletForm = useForm<LaptopData>({
    resolver: zodResolver(laptopSchema),
    defaultValues: assetDetails.tablet || { brand: '', serialNumber: '' },
  });

  const mobileForm = useForm<MobileData>({
    resolver: zodResolver(mobileSchema),
    defaultValues: assetDetails.mobile || { brand: '', imeiNumber: '' },
  });

  /* ---------------- SIMPLE ASSETS ---------------- */

  const [simpleAssets, setSimpleAssets] = useState<
    Record<AssetOption, GenericAsset>
  >({
    Headset: assetDetails.Headset || {},
    'SIM Card': assetDetails['SIM Card'] || {},
    'Other Assets': assetDetails['Other Assets'] || {},
  });

  const [simpleErrors, setSimpleErrors] = useState<Record<string, string>>({});

  const updateSimple = (k: AssetOption, v: GenericAsset) =>
    setSimpleAssets((p) => ({ ...p, [k]: v }));

  /* ---------------- ACCESSORIES ---------------- */

  const [laptopAcc, setLaptopAcc] = useState<string[]>(
    assetDetails.laptop?.accessories || [],
  );
  const [desktopAcc, setDesktopAcc] = useState<string[]>(
    assetDetails.desktop?.accessories || [],
  );
  const [tabletAcc, setTabletAcc] = useState<string[]>(
    assetDetails.tablet?.accessories || [],
  );
  const [mobileAcc, setMobileAcc] = useState<string[]>(
    assetDetails.mobile?.accessories || [],
  );

  /* ---------------- IMAGES ---------------- */

  const [images, setImages] = useState<Record<string, string[]>>({
    laptop: assetDetails.laptop?.images || [],
    desktop: assetDetails.desktop?.images || [],
    tablet: assetDetails.tablet?.images || [],
    mobile: assetDetails.mobile?.images || [],
  });

  const [imageErrors, setImageErrors] = useState<Record<string, string>>({});

  const uploadImages = async (files: FileList | null, key: string) => {
    if (!files) return;

    const uploaded: string[] = [];

    for (const file of Array.from(files)) {
      const ext = file.name.split('.').pop();
      const name = `${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}.${ext}`;

      const { error } = await supabase.storage
        .from('asset-images')
        .upload(name, file);

      if (!error) {
        const { data } = supabase.storage
          .from('asset-images')
          .getPublicUrl(name);
        uploaded.push(data.publicUrl);
      }
    }

    setImages((p) => ({ ...p, [key]: [...p[key], ...uploaded] }));
    setImageErrors((p) => ({ ...p, [key]: '' }));
  };

  const removeImage = (key: string, index: number) => {
    setImages((p) => ({
      ...p,
      [key]: p[key].filter((_, i) => i !== index),
    }));
  };

  /* ---------------- SUBMIT ---------------- */

  const handleSubmit = async () => {
    const result: any = {};
    const imageErrs: Record<string, string> = {};
    const simpleErrs: Record<string, string> = {};

    const validateBlock = async (
      key: string,
      form: any,
      acc: string[],
    ) => {
      const ok = await form.trigger();
      if (!ok || images[key].length === 0) {
        if (images[key].length === 0)
          imageErrs[key] = 'At least one image is required';
        return null;
      }
      return { ...form.getValues(), accessories: acc, images: images[key] };
    };

    if (hasLaptop) {
      const v = await validateBlock('laptop', laptopForm, laptopAcc);
      if (!v) return setImageErrors(imageErrs);
      result.laptop = v;
    }

    if (hasDesktop) {
      const v = await validateBlock('desktop', desktopForm, desktopAcc);
      if (!v) return setImageErrors(imageErrs);
      result.desktop = v;
    }

    if (hasTablet) {
      const v = await validateBlock('tablet', tabletForm, tabletAcc);
      if (!v) return setImageErrors(imageErrs);
      result.tablet = v;
    }

    if (hasMobile) {
      const v = await validateBlock('mobile', mobileForm, mobileAcc);
      if (!v) return setImageErrors(imageErrs);
      result.mobile = v;
    }

    /* ----- SIMPLE ASSETS ----- */

    if (selectedAssets.includes('Headset') && !simpleAssets.Headset?.brand)
      simpleErrs.Headset = 'Brand is required';

    if (
      selectedAssets.includes('SIM Card') &&
      !/^[6-9]\d{9}$/.test(simpleAssets['SIM Card']?.simNumber || '')
    )
      simpleErrs['SIM Card'] = 'Valid SIM number required';

    if (
      selectedAssets.includes('Other Assets') &&
      !simpleAssets['Other Assets']?.description
    )
      simpleErrs['Other Assets'] = 'Description required';

    if (Object.keys(simpleErrs).length > 0) {
      setSimpleErrors(simpleErrs);
      return;
    }

    selectedAssets.includes('Headset') &&
      (result.Headset = simpleAssets.Headset);
    selectedAssets.includes('SIM Card') &&
      (result['SIM Card'] = simpleAssets['SIM Card']);
    selectedAssets.includes('Other Assets') &&
      (result['Other Assets'] = simpleAssets['Other Assets']);

    onNext(result);
  };

  /* ================= UI ================= */

  return (
    <div className='space-y-8'>
      <h2 className='text-2xl font-bold'>Asset Details</h2>

      {hasLaptop && (
        <AssetBlock
          assetType='laptop'
          title='Laptop'
          icon={<Laptop />}
          form={laptopForm}
          accessories={laptopAcc}
          setAccessories={setLaptopAcc}
          images={images.laptop}
          removeImage={removeImage}
          uploadImages={uploadImages}
          imageError={imageErrors.laptop}
        />
      )}

      {hasDesktop && (
        <AssetBlock
          assetType='desktop'
          title='Desktop'
          icon={<Monitor />}
          form={desktopForm}
          accessories={desktopAcc}
          setAccessories={setDesktopAcc}
          images={images.desktop}
          removeImage={removeImage}
          uploadImages={uploadImages}
          imageError={imageErrors.desktop}
        />
      )}

      {hasTablet && (
        <AssetBlock
          assetType='tablet'
          title='Tablet / iPad'
          icon={<Monitor />}
          form={tabletForm}
          accessories={tabletAcc}
          setAccessories={setTabletAcc}
          images={images.tablet}
          removeImage={removeImage}
          uploadImages={uploadImages}
          imageError={imageErrors.tablet}
        />
      )}

      {hasMobile && (
        <AssetBlock
          assetType='mobile'
          title='Mobile Phone'
          icon={<Smartphone />}
          form={mobileForm}
          accessories={mobileAcc}
          setAccessories={setMobileAcc}
          images={images.mobile}
          removeImage={removeImage}
          uploadImages={uploadImages}
          isMobile
          imageError={imageErrors.mobile}
        />
      )}

      {/* ===== SIMPLE ASSETS ===== */}

      {selectedAssets.includes('Headset') && (
        <SimpleBlock
          title='Headset'
          icon={<Headphones />}
          value={simpleAssets.Headset}
          error={simpleErrors.Headset}
          onChange={(v) => updateSimple('Headset', v)}
        />
      )}

      {selectedAssets.includes('SIM Card') && (
        <SimpleBlock
          title='SIM Card'
          icon={<Headphones />}
          value={simpleAssets['SIM Card']}
          error={simpleErrors['SIM Card']}
          onChange={(v) => updateSimple('SIM Card', v)}
          isSim
        />
      )}

      {selectedAssets.includes('Other Assets') && (
        <SimpleBlock
          title='Other Assets'
          icon={<Package />}
          value={simpleAssets['Other Assets']}
          error={simpleErrors['Other Assets']}
          onChange={(v) => updateSimple('Other Assets', v)}
          isOther
        />
      )}

      <div className='flex justify-between'>
        <Button variant='outline' onClick={onBack}>
          <ArrowLeft className='w-4 h-4 mr-2' /> Back
        </Button>
        <Button onClick={handleSubmit}>
          Next <ArrowRight className='w-4 h-4 ml-2' />
        </Button>
      </div>
    </div>
  );
}

/* ================= BLOCKS ================= */
const AssetBlock = ({
  assetType,
  title,
  icon,
  form,
  accessories,
  setAccessories,
  images,
  uploadImages,
  imageError,
  isMobile = false,
}: any) => {
  const ACCESSORIES =
    assetType === 'mobile'
      ? MOBILE_ACCESSORIES
      : assetType === 'tablet'
      ? TAB_ACCESSORIES
      : LAPTOP_ACCESSORIES;

  const {
    register,
    formState: { errors },
  } = form;

  return (
    <div className='border rounded-lg p-5 space-y-4'>
      <h3 className='flex gap-2 font-semibold'>
        {icon} {title}
      </h3>

      {/* BRAND */}
      <Input {...register('brand')} placeholder='Brand' />
      {errors.brand && (
        <p className='text-red-500 text-xs mt-1'>
          {errors.brand.message}
        </p>
      )}

      {/* SERIAL / IMEI */}
      {!isMobile ? (
        <>
          <Input
            {...register('serialNumber')}
            placeholder='Serial Number'
          />
          {errors.serialNumber && (
            <p className='text-red-500 text-xs mt-1'>
              {errors.serialNumber.message}
            </p>
          )}
        </>
      ) : (
        <>
          <Input
            {...register('imeiNumber')}
            placeholder='IMEI Number'
            maxLength={15}
          />
          {errors.imeiNumber && (
            <p className='text-red-500 text-xs mt-1'>
              {errors.imeiNumber.message}
            </p>
          )}
        </>
      )}

      {/* ACCESSORIES */}
      <div className='flex flex-wrap gap-3'>
        {ACCESSORIES.map((a: string) => (
          <label key={a} className='flex gap-2 items-center'>
            <Checkbox
              checked={accessories.includes(a)}
              onCheckedChange={() =>
                setAccessories((p: string[]) =>
                  p.includes(a) ? p.filter((x) => x !== a) : [...p, a],
                )
              }
            />
            {a}
          </label>
        ))}
      </div>

      {/* IMAGES */}
      <Label>Upload Images *</Label>
      <input
        type='file'
        multiple
        accept='image/*'
        onChange={(e) => uploadImages(e.target.files, assetType)}
      />
      {imageError && (
        <p className='text-red-500 text-xs mt-1'>{imageError}</p>
      )}

      {/* IMAGE PREVIEW */}
      <div className='grid grid-cols-3 gap-3'>
        {images.map((img: string, i: number) => (
          <div key={i} className='relative'>
            <img
              src={img}
              className='h-24 w-full object-cover rounded'
            />
            <button
              type='button'
              onClick={() =>
                form.setValue(
                  'images',
                  images.filter((_, idx) => idx !== i),
                )
              }
              className='absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full'
            >
              <X className='w-3 h-3' />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};


const SimpleBlock = ({
  title,
  icon,
  value,
  error,
  onChange,
  isSim,
  isOther,
}: any) => (
  <div className='border rounded-lg p-5 space-y-2'>
    <h3 className='flex gap-2 font-semibold'>
      {icon} {title}
    </h3>

    {!isSim && !isOther && (
      <Input
        placeholder='Brand'
        value={value.brand || ''}
        onChange={(e) => onChange({ ...value, brand: e.target.value })}
      />
    )}

    {isSim && (
      <Input
        placeholder='SIM Number'
        value={value.simNumber || ''}
        maxLength={10}
        onChange={(e) => onChange({ ...value, simNumber: e.target.value })}
      />
    )}

    {isOther && (
      <textarea
        className='w-full border rounded-md p-3'
        placeholder='Describe the asset'
        value={value.description || ''}
        onChange={(e) =>
          onChange({ ...value, description: e.target.value })
        }
      />
    )}

    {error && <p className='text-red-500 text-xs'>{error}</p>}
  </div>
);

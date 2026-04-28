'use client';

import { ChangeEvent, DragEvent, type CSSProperties, useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

type MessageKind = 'success' | 'error' | null;

type ImageItem = {
  id: string;
  file?: File;
  previewUrl: string;
  uploadedUrl?: string;
  name: string;
};

type SaveMode = 'publish' | 'draft';

type ColorOption = {
  name: string;
  hex: string;
};

const CATEGORY_OPTIONS = [
  'Jewellery',
  'African Wear',
  'Accessories',
  'Art & Craft',
  'Home & Living',
  'Gifted Carry',
] as const;

const SUBCATEGORY_OPTIONS: Record<string, string[]> = {
  Jewellery: [
    'Necklaces',
    'Earrings',
    'Bracelets',
    'Bangles',
    'Anklets',
    'Rings',
    'Hair Accessories',
  ],
  'African Wear': [
    'T-Shirts',
    'Embroidered Tops',
    'Maasai Shuka Wraps',
    'Jumpsuit Suits',
    'Sudanese Occasion Sets',
  ],
  Accessories: [
    'Beaded Sandals',
    'Kiondos',
    'Belts',
    'Bags & Pouches',
    'Key Holders',
  ],
  'Art & Craft': ['Wood Carvings', 'Soapstone', 'Mixed Media'],
  'Home & Living': ['Kitchen & Serving', 'Baskets & Storage', 'Wall & Table Decor'],
  'Gifted Carry': ['Gift Sets', 'Gift Wrapping', 'Custom Gift Boxes'],
};

const SIZE_OPTIONS: Record<string, string[]> = {
  'African Wear': ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  Accessories: ['EU36', 'EU37', 'EU38', 'EU39', 'EU40', 'EU41', 'EU42'],
};

const COLOR_OPTIONS: ColorOption[] = [
  { name: 'White', hex: '#ffffff' },
  { name: 'Black', hex: '#1c1c1c' },
  { name: 'Red', hex: '#C0392B' },
  { name: 'Brown', hex: '#8B5E3C' },
  { name: 'Green', hex: '#2E7D32' },
  { name: 'Blue', hex: '#1565C0' },
  { name: 'Cream', hex: '#F5F0EB' },
  { name: 'Terracotta', hex: '#8B5E3C' },
];

const panelStyle: CSSProperties = {
  backgroundColor: '#ffffff',
  border: '0.5px solid #f0f0f0',
  borderRadius: '2px',
  padding: '20px',
  marginBottom: '16px',
};

const panelLabelStyle: CSSProperties = {
  fontSize: '10px',
  letterSpacing: '2px',
  textTransform: 'uppercase',
  color: '#999',
  marginBottom: '16px',
  borderBottom: '0.5px solid #f0f0f0',
  paddingBottom: '10px',
};

const inputLabelStyle: CSSProperties = {
  fontSize: '10px',
  letterSpacing: '1.5px',
  textTransform: 'uppercase',
  color: '#999',
  marginBottom: '6px',
  display: 'block',
};

const inputStyle: CSSProperties = {
  height: '38px',
  border: '1px solid #e0e0e0',
  borderRadius: '2px',
  fontSize: '12px',
  padding: '0 12px',
  backgroundColor: '#fafafa',
  color: '#1c1c1c',
  width: '100%',
  outline: 'none',
};

const textareaStyle: CSSProperties = {
  minHeight: '100px',
  border: '1px solid #e0e0e0',
  borderRadius: '2px',
  fontSize: '12px',
  padding: '10px 12px',
  backgroundColor: '#fafafa',
  color: '#1c1c1c',
  width: '100%',
  outline: 'none',
  resize: 'vertical',
};

function sanitizeFileName(name: string) {
  return name.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9._-]/g, '');
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-[12px]" style={{ color: '#555' }}>
        {label}
      </span>
      <button
        type="button"
        aria-pressed={checked}
        onClick={() => onChange(!checked)}
        className="relative shrink-0 transition-colors"
        style={{
          width: '36px',
          height: '20px',
          borderRadius: '999px',
          backgroundColor: checked ? '#1c1c1c' : '#e0e0e0',
        }}
      >
        <span
          className="absolute top-[3px] transition-transform"
          style={{
            width: '14px',
            height: '14px',
            borderRadius: '999px',
            backgroundColor: '#ffffff',
            left: '3px',
            transform: checked ? 'translateX(16px)' : 'translateX(0)',
          }}
        />
      </button>
    </div>
  );
}

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const productId = typeof params?.id === 'string' ? params.id : '';

  const [isLoading, setIsLoading] = useState(true);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [artisan, setArtisan] = useState('By Sharon');
  const [careInstructions, setCareInstructions] = useState('');
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [price, setPrice] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [stockQuantity, setStockQuantity] = useState('10');
  const [lowStockAlert, setLowStockAlert] = useState('2');
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [isVisible, setIsVisible] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isNew, setIsNew] = useState(true);
  const [inStock, setInStock] = useState(true);
  const [images, setImages] = useState<ImageItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [submittingMode, setSubmittingMode] = useState<SaveMode | null>(null);
  const [message, setMessage] = useState('');
  const [messageKind, setMessageKind] = useState<MessageKind>(null);

  useEffect(() => {
    async function fetchProduct() {
      if (!productId) {
        router.push('/admin-v2/products');
        return;
      }

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();

      if (error || !data) {
        console.error('Error fetching product:', error);
        router.push('/admin-v2/products');
        return;
      }

      const nextImages = Array.isArray(data.images)
        ? data.images.map((url: string, index: number) => ({
            id: `${data.id}-${index}`,
            name: `Image ${index + 1}`,
            previewUrl: url,
            uploadedUrl: url,
          }))
        : [];

      setName(data.name || '');
      setDescription(data.description || '');
      setArtisan(data.artisan || 'By Sharon');
      setCareInstructions(data.care_instructions || '');
      setCategory(data.category || '');
      setSubcategory(data.subcategory || '');
      setPrice(data.price?.toString() || '');
      setSalePrice(data.sale_price?.toString() || '');
      setStockQuantity(data.stock_quantity?.toString() || '10');
      setLowStockAlert(data.low_stock_alert?.toString() || '2');
      setSelectedSizes(Array.isArray(data.sizes) ? data.sizes : []);
      setSelectedColors(Array.isArray(data.colors) ? data.colors : []);
      setIsVisible(data.is_visible ?? true);
      setIsFeatured(data.is_featured ?? false);
      setIsNew(data.is_new ?? true);
      setInStock(Number(data.stock_quantity || 0) > 0);
      setImages(nextImages);
      setIsLoading(false);
    }

    fetchProduct();
  }, [productId, router]);

  const activeSubcategories = category ? SUBCATEGORY_OPTIONS[category] || [] : [];
  const showVariants = category === 'African Wear' || category === 'Accessories';
  const activeSizeOptions = showVariants ? SIZE_OPTIONS[category] || [] : [];

  function updateMessage(nextMessage: string, kind: MessageKind) {
    setMessage(nextMessage);
    setMessageKind(kind);
  }

  function handleCategoryChange(nextCategory: string) {
    setCategory(nextCategory);
    const nextSubcategories = SUBCATEGORY_OPTIONS[nextCategory] || [];
    setSubcategory(nextSubcategories.includes(subcategory) ? subcategory : '');

    if (nextCategory !== 'African Wear' && nextCategory !== 'Accessories') {
      setSelectedSizes([]);
      setSelectedColors([]);
    }
  }

  function toggleSize(size: string) {
    setSelectedSizes((current) =>
      current.includes(size) ? current.filter((item) => item !== size) : [...current, size],
    );
  }

  function toggleColor(colorName: string) {
    setSelectedColors((current) =>
      current.includes(colorName)
        ? current.filter((item) => item !== colorName)
        : [...current, colorName],
    );
  }

  function removeImage(imageId: string) {
    setImages((current) => {
      const target = current.find((image) => image.id === imageId);
      if (target && target.file && target.previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(target.previewUrl);
      }

      return current.filter((image) => image.id !== imageId);
    });
  }

  function addFiles(fileList: FileList | null) {
    if (!fileList) {
      return;
    }

    const files = Array.from(fileList);
    const remainingSlots = 6 - images.length;

    if (remainingSlots <= 0) {
      updateMessage('You can upload up to 6 images only.', 'error');
      return;
    }

    const accepted: ImageItem[] = [];
    let validationError = '';

    files.slice(0, remainingSlots).forEach((file) => {
      const isValidType = file.type === 'image/jpeg' || file.type === 'image/png';
      const isValidSize = file.size <= 5 * 1024 * 1024;

      if (!isValidType) {
        validationError = 'Only JPG and PNG images are allowed.';
        return;
      }

      if (!isValidSize) {
        validationError = 'Each image must be 5MB or smaller.';
        return;
      }

      accepted.push({
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        file,
        previewUrl: URL.createObjectURL(file),
        name: file.name,
      });
    });

    if (accepted.length) {
      setImages((current) => [...current, ...accepted]);
      setMessage('');
      setMessageKind(null);
    } else if (validationError) {
      updateMessage(validationError, 'error');
    }

    if (files.length > remainingSlots && !validationError) {
      updateMessage('Only the first 6 images can be added.', 'error');
    }
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    addFiles(event.target.files);
    event.target.value = '';
  }

  function handleDrop(event: DragEvent<HTMLButtonElement>) {
    event.preventDefault();
    setIsDragging(false);
    addFiles(event.dataTransfer.files);
  }

  function validateRequiredFields() {
    if (!images.length) {
      updateMessage('Please upload at least one product photo.', 'error');
      return false;
    }

    if (!name.trim()) {
      updateMessage('Please enter the product name.', 'error');
      return false;
    }

    if (!category) {
      updateMessage('Please select a category.', 'error');
      return false;
    }

    if (!price || Number.isNaN(parseFloat(price))) {
      updateMessage('Please enter a valid price.', 'error');
      return false;
    }

    if (!stockQuantity || Number.isNaN(parseInt(stockQuantity, 10))) {
      updateMessage('Please enter a valid stock quantity.', 'error');
      return false;
    }

    return true;
  }

  async function uploadImages() {
    const uploadedUrls: string[] = [];

    for (const image of images) {
      if (image.uploadedUrl) {
        uploadedUrls.push(image.uploadedUrl);
        continue;
      }

      if (!image.file) {
        throw new Error('Missing image file for upload.');
      }

      const timestamp = Date.now();
      const storagePath = `products/${timestamp}-${sanitizeFileName(image.file.name)}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(storagePath, image.file, {
          upsert: false,
          contentType: image.file.type,
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage.from('product-images').getPublicUrl(storagePath);
      uploadedUrls.push(data.publicUrl);
    }

    return uploadedUrls;
  }

  async function handleSave(mode: SaveMode) {
    if (!validateRequiredFields() || !productId) {
      return;
    }

    setSubmittingMode(mode);
    updateMessage('', null);

    try {
      const uploadedImageUrls = await uploadImages();
      const productPayload = {
        name: name.trim(),
        description: description.trim() || null,
        price: parseFloat(price),
        sale_price: salePrice ? parseFloat(salePrice) : null,
        category,
        subcategory: subcategory || null,
        stock_quantity: parseInt(stockQuantity, 10),
        low_stock_alert: lowStockAlert ? parseInt(lowStockAlert, 10) : 0,
        images: uploadedImageUrls,
        sizes: selectedSizes,
        colors: selectedColors,
        artisan: artisan.trim() || 'By Sharon',
        care_instructions: careInstructions.trim() || null,
        is_visible: mode === 'draft' ? false : isVisible,
        is_featured: isFeatured,
        is_new: isNew,
      };

      const { error } = await supabase.from('products').update(productPayload).eq('id', productId);

      if (error) {
        throw error;
      }

      setImages((current) =>
        current.map((image, index) => ({
          id: image.id,
          name: image.name,
          previewUrl: uploadedImageUrls[index] || image.previewUrl,
          uploadedUrl: uploadedImageUrls[index],
        })),
      );

      if (mode === 'publish') {
        updateMessage('Product updated successfully', 'success');
        window.setTimeout(() => {
          router.push('/admin-v2/products');
        }, 1500);
      } else {
        updateMessage('Saved as draft', 'success');
      }
    } catch (error) {
      console.error('Error saving product:', error);
      updateMessage('Failed to save product. Please try again.', 'error');
    } finally {
      setSubmittingMode(null);
    }
  }

  const checklistItems = [
    { label: 'At least 1 photo uploaded', done: images.length > 0 },
    { label: 'Product name entered', done: Boolean(name.trim()) },
    { label: 'Category selected', done: Boolean(category) },
    { label: 'Price set', done: Boolean(price && !Number.isNaN(parseFloat(price))) },
    {
      label: 'Stock quantity set',
      done: Boolean(stockQuantity && !Number.isNaN(parseInt(stockQuantity, 10))),
    },
  ];

  if (isLoading) {
    return <div className="text-xs text-gray-500">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1
          style={{
            fontSize: '13px',
            fontWeight: 500,
            color: '#1c1c1c',
          }}
        >
          Edit Product
        </h1>
      </div>

      {message ? (
        <div
          className="rounded-sm border px-4 py-3 text-[12px]"
          style={{
            borderColor: messageKind === 'error' ? '#f2c5c5' : '#cfe8d7',
            color: messageKind === 'error' ? '#c0392b' : '#2e7d32',
            backgroundColor: messageKind === 'error' ? '#fff5f5' : '#f3fbf5',
          }}
        >
          {message}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,65fr)_minmax(0,35fr)]">
        <div>
          <section style={panelStyle}>
            <div style={panelLabelStyle}>Images</div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(event) => {
                event.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className="flex w-full flex-col items-center justify-center px-6 text-center transition-colors"
              style={{
                minHeight: '180px',
                border: '1px dashed #e0e0e0',
                borderRadius: '2px',
                backgroundColor: isDragging ? '#fcfaf8' : '#ffffff',
              }}
            >
              <span className="text-[12px]" style={{ color: '#1c1c1c' }}>
                Click to upload photos
              </span>
              <span className="mt-2 text-[11px]" style={{ color: '#999' }}>
                JPG or PNG · Max 5MB each · Up to 6 images
              </span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/png,image/jpeg"
              onChange={handleFileChange}
              className="hidden"
            />

            {images.length ? (
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {images.map((image, index) => (
                  <div
                    key={image.id}
                    className="relative overflow-hidden"
                    style={{
                      borderRadius: '2px',
                      border: '0.5px solid #f0f0f0',
                      backgroundColor: '#fafafa',
                    }}
                  >
                    <img
                      src={image.previewUrl}
                      alt={image.name}
                      className="h-32 w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(image.id)}
                      className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center text-[16px]"
                      style={{
                        borderRadius: '999px',
                        backgroundColor: 'rgba(28,28,28,0.8)',
                        color: '#ffffff',
                      }}
                    >
                      x
                    </button>
                    <div className="flex items-center justify-between px-3 py-2">
                      <span className="truncate text-[10px]" style={{ color: '#666' }}>
                        {image.name}
                      </span>
                      {index === 0 ? (
                        <span
                          className="ml-2 shrink-0 px-2 py-1 text-[9px] uppercase"
                          style={{
                            borderRadius: '2px',
                            backgroundColor: '#1c1c1c',
                            color: '#ffffff',
                            letterSpacing: '1px',
                          }}
                        >
                          Main
                        </span>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </section>

          <section style={panelStyle}>
            <div style={panelLabelStyle}>Product Details</div>
            <div className="space-y-4">
              <div>
                <label style={inputLabelStyle}>Product Name</label>
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  style={inputStyle}
                  required
                />
              </div>

              <div>
                <label style={inputLabelStyle}>Description</label>
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Describe the piece - its Swahili name meaning, how it's made, how to wear it..."
                  style={textareaStyle}
                />
              </div>

              <div>
                <label style={inputLabelStyle}>Artisan</label>
                <input
                  value={artisan}
                  onChange={(event) => setArtisan(event.target.value)}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={inputLabelStyle}>Care Instructions</label>
                <input
                  value={careInstructions}
                  onChange={(event) => setCareInstructions(event.target.value)}
                  placeholder="e.g. Avoid water, store in pouch provided"
                  style={inputStyle}
                />
              </div>
            </div>
          </section>

          <section style={panelStyle}>
            <div style={panelLabelStyle}>Category</div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label style={inputLabelStyle}>Category</label>
                <select
                  value={category}
                  onChange={(event) => handleCategoryChange(event.target.value)}
                  style={inputStyle}
                  required
                >
                  <option value="">Select category</option>
                  {CATEGORY_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={inputLabelStyle}>Subcategory</label>
                <select
                  value={subcategory}
                  onChange={(event) => setSubcategory(event.target.value)}
                  style={inputStyle}
                  disabled={!category}
                >
                  <option value="">Select subcategory</option>
                  {activeSubcategories.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          <section style={panelStyle}>
            <div style={panelLabelStyle}>Pricing &amp; Stock</div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label style={inputLabelStyle}>Price (KES)</label>
                <input
                  type="number"
                  value={price}
                  onChange={(event) => setPrice(event.target.value)}
                  style={inputStyle}
                  required
                />
              </div>

              <div>
                <label style={inputLabelStyle}>Sale Price (KES)</label>
                <input
                  type="number"
                  value={salePrice}
                  onChange={(event) => setSalePrice(event.target.value)}
                  placeholder="Optional"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={inputLabelStyle}>Stock Quantity</label>
                <input
                  type="number"
                  value={stockQuantity}
                  onChange={(event) => setStockQuantity(event.target.value)}
                  style={inputStyle}
                  required
                />
              </div>

              <div>
                <label style={inputLabelStyle}>Low Stock Alert</label>
                <input
                  type="number"
                  value={lowStockAlert}
                  onChange={(event) => setLowStockAlert(event.target.value)}
                  placeholder="Alert when below"
                  style={inputStyle}
                />
              </div>
            </div>
          </section>

          {showVariants ? (
            <section style={panelStyle}>
              <div style={panelLabelStyle}>Variants</div>
              <div className="space-y-5">
                <div>
                  <label style={inputLabelStyle}>Sizes</label>
                  <div className="flex flex-wrap gap-2">
                    {activeSizeOptions.map((size) => {
                      const isSelected = selectedSizes.includes(size);
                      return (
                        <button
                          key={size}
                          type="button"
                          onClick={() => toggleSize(size)}
                          className="transition-colors"
                          style={{
                            fontSize: '10px',
                            padding: '4px 10px',
                            border: '1px solid #e0e0e0',
                            borderRadius: '2px',
                            color: isSelected ? '#ffffff' : '#666',
                            backgroundColor: isSelected ? '#1c1c1c' : '#ffffff',
                            cursor: 'pointer',
                          }}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label style={inputLabelStyle}>Colors</label>
                  <div className="flex flex-wrap gap-3">
                    {COLOR_OPTIONS.map((color) => {
                      const isSelected = selectedColors.includes(color.name);
                      return (
                        <button
                          key={color.name}
                          type="button"
                          onClick={() => toggleColor(color.name)}
                          className="flex items-center gap-2 px-2 py-1 transition-colors"
                          style={{
                            border: '1px solid #e0e0e0',
                            borderRadius: '2px',
                            backgroundColor: isSelected ? '#f8f8f6' : '#ffffff',
                          }}
                        >
                          <span
                            style={{
                              width: '14px',
                              height: '14px',
                              borderRadius: '999px',
                              backgroundColor: color.hex,
                              border: color.hex === '#ffffff' ? '1px solid #d8d8d8' : 'none',
                            }}
                          />
                          <span className="text-[10px]" style={{ color: '#666' }}>
                            {color.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </section>
          ) : null}
        </div>

        <div>
          <section style={panelStyle}>
            <div style={panelLabelStyle}>Publish</div>
            <div className="space-y-4">
              <ToggleRow label="Visible on shop" checked={isVisible} onChange={setIsVisible} />
              <ToggleRow
                label="Featured on homepage"
                checked={isFeatured}
                onChange={setIsFeatured}
              />
              <ToggleRow label="Mark as New" checked={isNew} onChange={setIsNew} />
              <ToggleRow label="In Stock" checked={inStock} onChange={setInStock} />
            </div>

            <div className="mt-6 space-y-3">
              <button
                type="button"
                onClick={() => handleSave('publish')}
                disabled={submittingMode !== null}
                className="w-full transition-opacity disabled:opacity-60"
                style={{
                  height: '44px',
                  backgroundColor: '#1c1c1c',
                  color: '#ffffff',
                  fontSize: '11px',
                  letterSpacing: '3px',
                  borderRadius: '2px',
                }}
              >
                {submittingMode === 'publish' ? 'UPDATING...' : 'PUBLISH PRODUCT'}
              </button>

              <button
                type="button"
                onClick={() => handleSave('draft')}
                disabled={submittingMode !== null}
                className="w-full transition-colors disabled:opacity-60"
                style={{
                  height: '40px',
                  backgroundColor: 'transparent',
                  border: '1px solid #e0e0e0',
                  color: '#555',
                  fontSize: '11px',
                  letterSpacing: '3px',
                  borderRadius: '2px',
                }}
              >
                {submittingMode === 'draft' ? 'SAVING...' : 'SAVE AS DRAFT'}
              </button>
            </div>
          </section>

          <section style={panelStyle}>
            <div style={panelLabelStyle}>Before Publishing</div>
            <div className="space-y-3">
              {checklistItems.map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <span
                    className="text-[14px]"
                    style={{ color: item.done ? '#2e7d32' : '#999' }}
                  >
                    {item.done ? '[OK]' : '[ ]'}
                  </span>
                  <span className="text-[12px]" style={{ color: '#555' }}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section style={panelStyle}>
            <div style={panelLabelStyle}>Photo Tips</div>
            <div className="space-y-3 text-[12px]" style={{ color: '#555' }}>
              <p>Use natural window light</p>
              <p>Warm cream background</p>
              <p>Show jewelry being worn</p>
              <p>Square format 1080x1080px</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

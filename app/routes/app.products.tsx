import { useState, useEffect, useCallback, useRef } from "react";
import {
  Card,
  Button,
  Input,
  Textarea,
  Modal,
  PageHeader,
  EmptyState,
  Badge,
  Spinner,
} from "~/components/ui";
import { Package, Plus, Pencil, Trash2, ImagePlus, ExternalLink } from "lucide-react";

interface Product {
  _id: string;
  name: string;
  imageUrl?: string;
  description?: string;
  price: string;
  purchaseLink?: string;
  rotationOrder?: number;
  isActive?: boolean;
}

interface ProductFormData {
  name: string;
  imageUrl: string;
  description: string;
  price: string;
  purchaseLink: string;
}

const EMPTY_FORM: ProductFormData = {
  name: "",
  imageUrl: "",
  description: "",
  price: "",
  purchaseLink: "",
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductFormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<ProductFormData>>({});
  const [uploadingImage, setUploadingImage] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch("/api/postpilot/products");
      const data = await res.json();
      setProducts(data.data ?? []);
    } catch (err) {
      console.error("Failed to fetch products:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  function openAdd() {
    setEditingProduct(null);
    setForm(EMPTY_FORM);
    setErrors({});
    setModalOpen(true);
  }

  function openEdit(product: Product) {
    setEditingProduct(product);
    setForm({
      name: product.name,
      imageUrl: product.imageUrl ?? "",
      description: product.description ?? "",
      price: product.price,
      purchaseLink: product.purchaseLink ?? "",
    });
    setErrors({});
    setModalOpen(true);
  }

  function validateForm(): boolean {
    const newErrors: Partial<ProductFormData> = {};
    if (!form.name.trim()) newErrors.name = "Product name is required";
    if (!form.price.trim()) newErrors.price = "Price is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSave() {
    if (!validateForm()) return;
    setSaving(true);
    try {
      const url = editingProduct
        ? `/api/postpilot/products/${editingProduct._id}`
        : "/api/postpilot/products";
      const method = editingProduct ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setModalOpen(false);
        await fetchProducts();
      }
    } catch (err) {
      console.error("Save failed:", err);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this product? This action cannot be undone.")) return;
    setDeleting(id);
    try {
      await fetch(`/api/postpilot/products/${id}`, { method: "DELETE" });
      await fetchProducts();
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setDeleting(null);
    }
  }

  async function handleImageUpload(file: File) {
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/uploader/image", {
        method: "POST",
        body: formData,
      });
      const result = await res.json();
      if (result.success && result.data?.url) {
        setForm((f) => ({ ...f, imageUrl: result.data.url }));
      }
    } catch (err) {
      console.error("Image upload failed:", err);
    } finally {
      setUploadingImage(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-5xl">
      <PageHeader
        title="Product Catalog"
        description="Manage the products that PostPilot will promote. They rotate daily."
        action={
          <Button onClick={openAdd}>
            <Plus className="w-4 h-4" />
            Add Product
          </Button>
        }
      />

      {products.length === 0 ? (
        <EmptyState
          icon={<Package className="w-6 h-6" />}
          title="No products yet"
          description="Add your first product to start promoting it on social media."
          action={
            <Button onClick={openAdd}>
              <Plus className="w-4 h-4" />
              Add Product
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product, idx) => (
            <Card key={product._id} className="overflow-hidden">
              {/* Image */}
              <div className="relative bg-muted h-44">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-10 h-10 text-muted-foreground/30" />
                  </div>
                )}
                <div className="absolute top-2 left-2">
                  <Badge variant="neutral" className="text-xs">
                    #{idx + 1}
                  </Badge>
                </div>
                {!product.isActive && (
                  <div className="absolute top-2 right-2">
                    <Badge variant="warning" className="text-xs">Inactive</Badge>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-semibold text-foreground text-sm leading-tight line-clamp-1">
                    {product.name}
                  </h3>
                  <Badge variant="primary" className="shrink-0">{product.price}</Badge>
                </div>
                {product.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3 leading-relaxed">
                    {product.description}
                  </p>
                )}
                {product.purchaseLink && (
                  <a
                    href={product.purchaseLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline flex items-center gap-1 mb-3"
                  >
                    <ExternalLink className="w-3 h-3" />
                    View product
                  </a>
                )}
                <div className="flex gap-2 mt-auto pt-2 border-t border-border">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1"
                    onClick={() => openEdit(product)}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:bg-destructive/10"
                    onClick={() => handleDelete(product._id)}
                    loading={deleting === product._id}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingProduct ? "Edit Product" : "Add Product"}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} loading={saving}>
              {editingProduct ? "Save Changes" : "Add Product"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Product Name"
            required
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            error={errors.name}
            placeholder="e.g. Handmade Soy Candle"
          />
          <Input
            label="Price"
            required
            value={form.price}
            onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
            error={errors.price}
            placeholder="e.g. $24.99"
          />
          <Textarea
            label="Description"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            rows={3}
            placeholder="Brief product description for social captions..."
          />
          <Input
            label="Purchase Link"
            type="url"
            value={form.purchaseLink}
            onChange={(e) => setForm((f) => ({ ...f, purchaseLink: e.target.value }))}
            placeholder="https://yourstore.com/product"
          />

          {/* Image upload */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Product Image</label>
            <div
              className="border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:border-primary transition-colors"
              onClick={() => imageInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files[0];
                if (file) handleImageUpload(file);
              }}
            >
              {form.imageUrl ? (
                <div className="flex flex-col items-center gap-2">
                  <img
                    src={form.imageUrl}
                    alt="Preview"
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                  <span className="text-xs text-muted-foreground">Click to change</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 py-2">
                  {uploadingImage ? (
                    <Spinner className="text-primary" />
                  ) : (
                    <ImagePlus className="w-8 h-8 text-muted-foreground" />
                  )}
                  <span className="text-sm text-muted-foreground">
                    {uploadingImage ? "Uploading..." : "Click or drag to upload image"}
                  </span>
                </div>
              )}
            </div>
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImageUpload(file);
              }}
            />
            <p className="text-xs text-muted-foreground">
              Or paste an image URL:
            </p>
            <Input
              value={form.imageUrl}
              onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
              placeholder="https://example.com/image.jpg"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}

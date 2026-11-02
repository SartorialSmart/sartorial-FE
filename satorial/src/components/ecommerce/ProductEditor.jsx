import React, { useEffect, useState, useMemo } from "react";
import { Form, Input, Select, Switch, Button, message, Divider, Card, Spin } from "antd";
import EcommerceService from "../../services/EcommerceService";
import InventoryService from "../../services/InventoryService";
import { SIZE_CATEGORIES } from "../../constants/productionConstants";

const { TextArea } = Input;

const ProductEditor = ({ storeId, product, onSaved }) => {
  const [form] = Form.useForm();
  const [inventories, setInventories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [invLoading, setInvLoading] = useState(false);
  const [catLoading, setCatLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load categories for dropdown — ready-made products grouped by inventory categories
  useEffect(() => {
    setCatLoading(true);
    // Try with_counts for badge; fallback to plain list
    InventoryService.listInventoryCategory({ with_counts: true })
      .then((data) => {
        const list = Array.isArray(data) ? data : data?.results || data?.data || [];
        setCategories(list);
      })
      .catch(() => InventoryService.listInventoryCategory().then((d) => setCategories(Array.isArray(d) ? d : [])).catch(() => {}))
      .finally(() => setCatLoading(false));
  }, []);

  const loadInventories = async (categoryId) => {
    setInvLoading(true);
    try {
      const params = { in_stock: true };
      if (categoryId) params.category = categoryId;
      const data = await InventoryService.listInventory(params);
      setInventories(Array.isArray(data) ? data : data?.results || data?.data || []);
    } catch {
      setInventories([]);
    } finally {
      setInvLoading(false);
    }
  };

  useEffect(() => { loadInventories(selectedCategory); }, [selectedCategory]);

  // If editing, preselect its category once inventories/categories loaded
  useEffect(() => {
    if (product?.inventory && inventories.length && !selectedCategory) {
      const inv = inventories.find((i) => String(i.id) === String(product.inventory));
      if (inv?.category) setSelectedCategory(String(inv.category));
    }
  }, [product, inventories, selectedCategory]);

  useEffect(() => {
    if (product) {
      const initialSizes = product.available_sizes?.length
        ? product.available_sizes
        : product.size_category
        ? [product.size_category]
        : product.variants?.length
        ? [...new Set(product.variants.map((v) => v.size).filter(Boolean))]
        : [];
      form.setFieldsValue({
        title: product.title,
        description: product.description,
        inventory: product.inventory,
        status: product.status || "draft",
        is_featured: product.is_featured,
        image_url: product.web_images?.[0]?.cloudinary_url || "",
        price: product.price || product.variants?.[0]?.price || product.inventory_selling_price || "",
        sizes: initialSizes.filter((s) => s && s !== "One Size"),
      });
    }
  }, [product, form]);

  const handleSave = async (values) => {
    setLoading(true);
    try {
      let saved;
      const payload = { ...values, store: storeId };
      if (product?.id) {
        saved = await EcommerceService.updateProduct(product.id, payload);
        message.success("Product updated");
      } else {
        saved = await EcommerceService.createProduct(payload);
        message.success("Product created");
      }
      onSaved?.(saved);
    } catch (e) {
      message.error(e.response?.data?.error || JSON.stringify(e.response?.data) || "Save failed");
    } finally { setLoading(false); }
  };

  const categoryOptions = useMemo(() => categories.map((c) => ({
    value: String(c.id),
    label: c.item_count != null ? `${c.name} (${c.item_count})` : c.name,
  })), [categories]);

  const inventoryOptions = useMemo(() => inventories.map((inv) => ({
    value: inv.id,
    label: `${inv.item_name} — ${inv.sku || String(inv.id).slice(0,8)} (${inv.quantity} ${inv.unit_of_measurement})${inv.category_name ? ` · ${inv.category_name}` : ""}${inv.size_category ? ` · ${inv.size_category}` : ""}${inv.selling_price ? ` · ₦${inv.selling_price}` : ""}`,
  })), [inventories]);

  const sizeOptions = useMemo(() => SIZE_CATEGORIES.map((s) => ({ value: s.value, label: s.label })), []);

  const watchedInventory = Form.useWatch("inventory", form);
  const watchedImageUrl = Form.useWatch("image_url", form);
  const watchedPrice = Form.useWatch("price", form);
  const selectedInvForPreview = useMemo(() => inventories.find((i) => String(i.id) === String(watchedInventory)), [inventories, watchedInventory]);
  const inheritedPreviewUrl = selectedInvForPreview?.image_url || "";
  const existingPreviewUrl = product?.web_images?.[0]?.cloudinary_url || "";
  const previewUrl = (watchedImageUrl && String(watchedImageUrl).trim()) || inheritedPreviewUrl || existingPreviewUrl;

  // Auto-fill price from selected inventory's selling_price (ready-made pricing)
  useEffect(() => {
    if (!watchedInventory) return;
    const inv = inventories.find((i) => String(i.id) === String(watchedInventory));
    const invPrice = inv?.selling_price;
    const currentPrice = form.getFieldValue("price");
    // Only auto-fill if price field is still empty and inventory has a price
    if (invPrice != null && (currentPrice === undefined || currentPrice === "" || currentPrice === null)) {
      form.setFieldsValue({ price: String(invPrice) });
    }
  }, [watchedInventory, inventories, form]);

  return (
    <Card title={product ? "Edit product" : "New product"}>
      <Form form={form} layout="vertical" onFinish={handleSave}>
        <Form.Item name="title" label="Title" rules={[{ required: true }]}>
          <Input placeholder="e.g. Agbada 2.0" />
        </Form.Item>
        <Form.Item name="description" label="Description">
          <TextArea rows={3} />
        </Form.Item>
        <Form.Item label="Inventory category (filter ready-made products)">
          <Select
            allowClear
            placeholder={catLoading ? "Loading categories..." : "All categories — filter ready-made stock"}
            showSearch
            optionFilterProp="label"
            loading={catLoading}
            value={selectedCategory}
            onChange={(val) => {
              setSelectedCategory(val || null);
              // clear inventory pick when category changes so stale value isn't kept
              form.setFieldsValue({ inventory: undefined });
            }}
            options={categoryOptions}
            notFoundContent={catLoading ? <Spin size="small" /> : "No categories"}
          />
        </Form.Item>
        <Form.Item name="inventory" label="Link finished Inventory (sellable stock)" extra={selectedCategory ? "Showing ready-made items in selected category" : "Showing all ready-made items (quantity > 0) — filter by category above"}>
          <Select
            allowClear
            placeholder={invLoading ? "Loading stock..." : "Select inventory with selling_price & stock"}
            showSearch
            optionFilterProp="label"
            loading={invLoading}
            notFoundContent={invLoading ? <Spin size="small" /> : selectedCategory ? "No ready-made items in this category" : "No ready-made items in stock"}
            options={inventoryOptions}
          />
        </Form.Item>
        <Form.Item
          name="price"
          label="Price (₦)"
          rules={[{ required: false, message: "Price needed for storefront display" }]}
          extra={
            selectedInvForPreview?.selling_price
              ? `Inventory selling price is ₦${selectedInvForPreview.selling_price} — leave blank to use it, or enter a custom storefront price to override.`
              : "Set the storefront price — if blank and inventory has a selling price, that will be used; otherwise you can set it here. Price is required for storefront display."
          }
        >
          <Input type="number" step="0.01" min="0" placeholder="e.g. 25000 — leave blank to inherit inventory price" allowClear />
        </Form.Item>
        <Form.Item
          name="sizes"
          label="Available sizes"
          extra="Select sizes developed during production (XL, XXL, XS, XXS …). Storefront will show these instead of 'One Size'. Leave empty to use the production size automatically."
        >
          <Select mode="multiple" allowClear placeholder="Select sizes — variants will be created per size" options={sizeOptions} maxTagCount={4} />
        </Form.Item>
        <Form.Item
          name="image_url"
          label="Product image"
          extra={
            watchedImageUrl
              ? "Custom URL will replace the finished-product photo on the storefront."
              : inheritedPreviewUrl
              ? "Inherited from finished product photo — leave blank to keep it, or paste a Cloudinary URL to replace."
              : existingPreviewUrl
              ? "Current storefront image — paste a new URL to replace it."
              : "No finished-product photo yet — paste a Cloudinary URL or leave blank."
          }
        >
          <div className="space-y-2">
            <Input placeholder="https://res.cloudinary.com/.../product.jpg — leave blank to keep inherited image" allowClear />
            {previewUrl ? (
              <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg border border-gray-200">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                  onError={(e) => { e.currentTarget.style.display = "none"; }}
                />
                <div className="text-xs text-gray-600">
                  <p className="font-medium">{watchedImageUrl ? "Custom image preview" : inheritedPreviewUrl ? "Inherited from production / inventory" : "Current storefront image"}</p>
                  <p className="text-gray-400 break-all">{previewUrl.slice(0, 60)}{previewUrl.length > 60 ? "…" : ""}</p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-400">No image — finished product has no photo yet. Add one in production or paste a URL above.</p>
            )}
          </div>
        </Form.Item>
        <Form.Item name="status" label="Status">
          <Select options={[{ value: "draft", label: "Draft" }, { value: "published", label: "Published" }, { value: "archived", label: "Archived" }]} />
        </Form.Item>
        <Form.Item name="is_featured" label="Featured" valuePropName="checked">
          <Switch />
        </Form.Item>
        <Button type="primary" htmlType="submit" loading={loading}>Save</Button>
      </Form>
    </Card>
  );
};

export default ProductEditor;

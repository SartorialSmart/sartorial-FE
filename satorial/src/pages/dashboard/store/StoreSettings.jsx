import React, { useEffect, useState } from "react";
import {
  Card,
  Form,
  Input,
  Button,
  message,
  Select,
  Switch,
  Tabs,
  Alert,
  Space,
  Modal,
  Tag,
  Typography,
  Spin,
} from "antd";
import {
  EyeOutlined,
  CheckCircleOutlined,
  PlusOutlined,
  ShopOutlined,
  DeleteOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import EcommerceService from "../../../services/EcommerceService";
import StoreDomainSettings from "../../../components/ecommerce/StoreDomainSettings";
import StoreAppearanceEditor from "../../../components/ecommerce/StoreAppearanceEditor";

const { Text, Paragraph } = Typography;

const slugify = (text) =>
  (text || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
    .slice(0, 60);

// Helper to unwrap paginated or bare array responses defensively
const unwrapStores = (raw) => {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw.results)) return raw.results;
  if (Array.isArray(raw.data)) return raw.data;
  if (Array.isArray(raw.stores)) return raw.stores;
  // single object wrapped?
  if (raw.store_name && raw.store_slug) return [raw];
  return [];
};

const StoreSettings = () => {
  const [stores, setStores] = useState([]);
  const [store, setStore] = useState(null); // single-store mode: stores[0]
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();

  const [createSlugPreview, setCreateSlugPreview] = useState("");
  const [editSlugPreview, setEditSlugPreview] = useState("");
  const [createSlugManuallyEdited, setCreateSlugManuallyEdited] = useState(false);
  const [editSlugManuallyEdited, setEditSlugManuallyEdited] = useState(false);

  const [savingCreate, setSavingCreate] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [savedInfo, setSavedInfo] = useState(null);

  const load = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const raw = await EcommerceService.listStores();
      const arr = unwrapStores(raw);
      setStores(arr);
      const first = arr[0] || null;
      setStore(first);
      if (first) {
        editForm.setFieldsValue({
          store_name: first.store_name,
          store_slug: first.store_slug,
          currency: first.currency,
          description: first.description,
          is_active: first.is_active,
        });
        setEditSlugPreview(first.store_slug || "");
        setEditSlugManuallyEdited(false);
      } else {
        editForm.resetFields();
        setEditSlugPreview("");
      }
    } catch (e) {
      const status = e.response?.status;
      const rawData = e.response?.data;
      const msg =
        rawData?.detail ||
        rawData?.error ||
        rawData?.message ||
        (typeof rawData === "string" ? rawData : null) ||
        e.message ||
        "Failed to load store";
      setLoadError({ status, message: msg, raw: rawData, url: e.config?.url });
      console.error("[StoreSettings] listStores failed:", { status, rawData, error: e });
      setStores([]);
      setStore(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openPreview = (slug) => {
    const target = slug || store?.store_slug || savedInfo?.slug;
    if (!target) return;
    window.open(`/store/${target}`, "_blank", "noopener,noreferrer");
  };

  // ---- Create (modal) — only when no store exists (1 per org) ----
  const handleCreateValuesChange = (changed) => {
    if ("store_name" in changed && !createSlugManuallyEdited) {
      const nextSlug = slugify(changed.store_name);
      createForm.setFieldsValue({ store_slug: nextSlug });
      setCreateSlugPreview(nextSlug);
    }
    if ("store_slug" in changed) {
      setCreateSlugPreview(slugify(changed.store_slug));
    }
  };

  const handleCreate = async (values) => {
    const payload = { ...values, store_slug: slugify(values.store_slug || values.store_name) };
    setSavingCreate(true);
    setSavedInfo(null);
    try {
      const created = await EcommerceService.createStore(payload);
      message.success({ content: `Store "${created.store_name}" created — ${created.store_slug}`, duration: 4 });
      setSavedInfo({ type: "created", slug: created.store_slug, name: created.store_name });
      setCreateOpen(false);
      createForm.resetFields();
      setCreateSlugPreview("");
      setCreateSlugManuallyEdited(false);
      await load();
    } catch (e) {
      const msg =
        e.response?.data?.error ||
        e.response?.data?.store_slug?.[0] ||
        e.response?.data?.store_name?.[0] ||
        e.response?.data?.detail ||
        JSON.stringify(e.response?.data) ||
        "Failed to create store";
      message.error({ content: msg, duration: 5 });
      setSavedInfo({ type: "error", msg });
      console.error("[StoreSettings] createStore failed:", e.response?.data || e);
    } finally {
      setSavingCreate(false);
    }
  };

  // ---- Edit (tabs) ----
  const handleEditValuesChange = (changed) => {
    if ("store_name" in changed && !editSlugManuallyEdited) {
      const nextSlug = slugify(changed.store_name);
      editForm.setFieldsValue({ store_slug: nextSlug });
      setEditSlugPreview(nextSlug);
    }
    if ("store_slug" in changed) {
      setEditSlugPreview(slugify(changed.store_slug));
    }
  };

  const handleUpdate = async (values) => {
    if (!store) return;
    const payload = { ...values };
    if (payload.store_slug !== undefined) payload.store_slug = slugify(payload.store_slug);
    setSavingEdit(true);
    setSavedInfo(null);
    try {
      const updated = await EcommerceService.updateStore(store.id, payload);
      message.success({ content: `Store "${updated.store_name}" saved`, duration: 3 });
      setStore(updated);
      setStores([updated]);
      setEditSlugPreview(updated.store_slug || payload.store_slug);
      setSavedInfo({ type: "saved", slug: updated.store_slug, name: updated.store_name });
    } catch (e) {
      const msg =
        e.response?.data?.error ||
        e.response?.data?.store_slug?.[0] ||
        e.response?.data?.detail ||
        JSON.stringify(e.response?.data) ||
        "Failed to save";
      message.error({ content: msg, duration: 5 });
      setSavedInfo({ type: "error", msg });
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDelete = async () => {
    if (!store) return;
    try {
      await EcommerceService.deleteStore(store.id);
      message.success("Store deleted — you can now create a new one");
      setStore(null);
      setStores([]);
      setSavedInfo(null);
      editForm.resetFields();
    } catch (e) {
      const msg = e.response?.data?.error || e.response?.data?.detail || JSON.stringify(e.response?.data) || "Failed to delete";
      message.error({ content: msg, duration: 5 });
    }
  };

  const handleStoreUpdatedFromChild = (updated) => {
    setStore(updated);
    setStores([updated]);
  };

  if (loading) {
    return (
      <div className="max-w-3xl flex justify-center py-16">
        <Spin tip="Loading storefront..." />
      </div>
    );
  }

  // ---- No store yet (1-per-org) ----
  if (!store) {
    return (
      <div className="max-w-2xl space-y-4">
        <div className="flex items-center gap-2">
          <ShopOutlined className="text-xl" />
          <h2 className="text-xl font-semibold m-0">Storefront</h2>
        </div>

        {loadError && (
          <Alert
            type="error"
            showIcon
            message={`Couldn’t load your store${loadError.status ? ` (HTTP ${loadError.status})` : ""}`}
            description={
              <div className="space-y-2">
                <div>{loadError.message}</div>
                <div className="text-xs text-gray-500">
                  <div>
                    Request: <Text code>{loadError.url || "GET /ecommerce/stores/"}</Text>
                  </div>
                  <div>
                    Check: <Text code>VITE_BASE_URL</Text> is{" "}
                    <Text code>{import.meta.env.VITE_BASE_URL || "(not set)"}</Text> — must match the backend where
                    you created the store, and you’re logged in as the same Organization user. Open DevTools → Network
                    → <Text code>GET /ecommerce/stores/</Text> and Console for <Text code>[StoreSettings]</Text> log.
                  </div>
                </div>
                {loadError.raw && (
                  <details className="text-xs">
                    <summary className="cursor-pointer text-gray-600">Show server response</summary>
                    <pre className="mt-2 p-2 bg-gray-50 rounded overflow-auto max-h-40">
                      {typeof loadError.raw === "string" ? loadError.raw : JSON.stringify(loadError.raw, null, 2)}
                    </pre>
                  </details>
                )}
                <Button size="small" onClick={load} className="mt-2">
                  Retry
                </Button>
              </div>
            }
          />
        )}

        {savedInfo?.type === "created" && (
          <Alert
            type="success"
            showIcon
            icon={<CheckCircleOutlined />}
            message={`Store "${savedInfo.name}" created`}
            description={
              <Space direction="vertical" size={8}>
                <span>
                  Your storefront is live at <span className="font-mono font-semibold">/store/{savedInfo.slug}</span>
                </span>
                <Button icon={<EyeOutlined />} onClick={() => openPreview(savedInfo.slug)}>
                  Preview storefront
                </Button>
              </Space>
            }
          />
        )}
        {savedInfo?.type === "error" && (
          <Alert type="error" showIcon message="Could not create store" description={savedInfo.msg} />
        )}

        <Card title="Create your storefront">
          <Form form={createForm} layout="vertical" onFinish={handleCreate} onValuesChange={handleCreateValuesChange}>
            <Form.Item name="store_name" label="Store name" rules={[{ required: true }]}>
              <Input placeholder="My Fashion Store" autoFocus />
            </Form.Item>
            <Form.Item
              name="store_slug"
              label="Slug (URL)"
              extra={
                createSlugPreview ? (
                  <span className="text-xs text-gray-500">
                    Preview: <span className="font-mono">sartorialsmart.com/store/{createSlugPreview}</span> ·{" "}
                    <span className="font-mono">{createSlugPreview}.sartorialsmart.com</span>
                  </span>
                ) : (
                  <span className="text-xs text-gray-400">Auto-generated from store name — editable. Lowercase, hyphens only.</span>
                )
              }
            >
              <Input
                placeholder="my-fashion-store"
                addonBefore="sartorialsmart.com/store/"
                onChange={() => setCreateSlugManuallyEdited(true)}
                onBlur={(e) => {
                  const v = slugify(e.target.value);
                  createForm.setFieldsValue({ store_slug: v });
                  setCreateSlugPreview(v);
                }}
              />
            </Form.Item>
            <Form.Item name="currency" label="Currency" initialValue="NGN">
              <Select options={[{ value: "NGN", label: "NGN" }, { value: "USD", label: "USD" }, { value: "GHS", label: "GHS" }]} />
            </Form.Item>
            <Form.Item name="description" label="Description">
              <Input.TextArea rows={3} placeholder="What do you sell?" />
            </Form.Item>
            <Button type="primary" htmlType="submit" loading={savingCreate} icon={<PlusOutlined />}>
              Create store
            </Button>
          </Form>
        </Card>

        {/* Also keep modal for consistency if opened via other flows */}
        <Modal
          title="Create your storefront"
          open={createOpen}
          onCancel={() => {
            setCreateOpen(false);
            createForm.resetFields();
            setCreateSlugPreview("");
            setCreateSlugManuallyEdited(false);
          }}
          footer={null}
          destroyOnClose
          width={560}
        >
          <Form form={createForm} layout="vertical" onFinish={handleCreate} onValuesChange={handleCreateValuesChange}>
            <Form.Item name="store_name" label="Store name" rules={[{ required: true }]}>
              <Input placeholder="My Fashion Store" autoFocus />
            </Form.Item>
            <Form.Item name="store_slug" label="Slug (URL)">
              <Input addonBefore="sartorialsmart.com/store/" placeholder="my-fashion-store" />
            </Form.Item>
            <Form.Item name="currency" label="Currency" initialValue="NGN">
              <Select options={[{ value: "NGN", label: "NGN" }, { value: "USD", label: "USD" }]} />
            </Form.Item>
            <Form.Item name="description" label="Description">
              <Input.TextArea rows={3} />
            </Form.Item>
            <Button type="primary" htmlType="submit" loading={savingCreate}>
              Create store
            </Button>
          </Form>
        </Modal>
      </div>
    );
  }

  // ---- Store exists (1-per-org) ----
  const tabItems = [
    {
      key: "general",
      label: "General",
      children: (
        <>
          {savedInfo?.type === "saved" && (
            <Alert
              type="success"
              showIcon
              icon={<CheckCircleOutlined />}
              className="mb-4"
              message={`Store "${savedInfo.name}" saved`}
              description={
                <Space direction="vertical" size={8}>
                  <span>
                    Live at <span className="font-mono font-semibold">/store/{savedInfo.slug}</span>
                  </span>
                  <Button icon={<EyeOutlined />} onClick={() => openPreview(savedInfo.slug)}>
                    Preview storefront
                  </Button>
                </Space>
              }
            />
          )}
          {savedInfo?.type === "error" && (
            <Alert type="error" showIcon className="mb-4" message="Save failed" description={savedInfo.msg} />
          )}
          <Card
            title="Store settings"
            extra={
              store?.store_slug && (
                <Button icon={<EyeOutlined />} onClick={() => openPreview()}>
                  Preview storefront
                </Button>
              )
            }
          >
            <Form form={editForm} layout="vertical" onFinish={handleUpdate} onValuesChange={handleEditValuesChange}>
              <Form.Item name="store_name" label="Store name" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item
                name="store_slug"
                label="Slug"
                extra={
                  editSlugPreview ? (
                    <span className="text-xs text-gray-500">
                      Preview: <span className="font-mono">sartorialsmart.com/store/{editSlugPreview}</span> ·{" "}
                      <span className="font-mono">{editSlugPreview}.sartorialsmart.com</span>
                      {store?.store_slug && editSlugPreview !== store.store_slug && (
                        <span className="text-amber-600"> — changing slug will change your store URL</span>
                      )}
                    </span>
                  ) : null
                }
              >
                <Input
                  addonBefore="sartorialsmart.com/store/"
                  onChange={() => setEditSlugManuallyEdited(true)}
                  onBlur={(e) => {
                    const v = slugify(e.target.value);
                    editForm.setFieldsValue({ store_slug: v });
                    setEditSlugPreview(v);
                  }}
                />
              </Form.Item>
              <Form.Item name="currency" label="Currency">
                <Select options={[{ value: "NGN", label: "NGN" }, { value: "USD", label: "USD" }, { value: "GHS", label: "GHS" }]} />
              </Form.Item>
              <Form.Item name="description" label="Description">
                <Input.TextArea rows={3} />
              </Form.Item>
              <Form.Item name="is_active" label="Active" valuePropName="checked">
                <Switch />
              </Form.Item>
              <Space>
                <Button type="primary" htmlType="submit" loading={savingEdit}>
                  Save
                </Button>
                <Button icon={<EyeOutlined />} onClick={() => openPreview(editSlugPreview)}>
                  Preview
                </Button>
                <Button danger icon={<DeleteOutlined />} onClick={handleDelete}>
                  Delete store
                </Button>
              </Space>
            </Form>
          </Card>
        </>
      ),
    },
    {
      key: "appearance",
      label: "Appearance",
      children: <StoreAppearanceEditor store={store} onUpdated={handleStoreUpdatedFromChild} />,
    },
    {
      key: "domain",
      label: "Domain",
      children: <StoreDomainSettings store={store} onUpdated={handleStoreUpdatedFromChild} />,
    },
  ];

  return (
    <div className="max-w-3xl space-y-4">
      <div className="flex items-center gap-3">
        <ShopOutlined className="text-xl text-gray-600" />
        <div>
          <h2 className="text-lg font-semibold m-0">{store.store_name}</h2>
          <Text type="secondary" className="font-mono">
            /store/{store.store_slug} · {store.currency}
          </Text>
        </div>
        <Tag color={store.is_active ? "green" : "red"}>{store.is_active ? "Active" : "Inactive"}</Tag>
      </div>

      <Tabs items={tabItems} defaultActiveKey="general" />
    </div>
  );
};

export default StoreSettings;

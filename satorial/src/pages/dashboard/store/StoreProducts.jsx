import React, { useEffect, useState } from "react";
import { Card, Table, Button, Tag, Space, message, Modal, Alert, Typography, Spin } from "antd";
import { ShopOutlined } from "@ant-design/icons";
import EcommerceService from "../../../services/EcommerceService";
import ProductEditor from "../../../components/ecommerce/ProductEditor";
import EcommerceSideBarLayout from "../../../components/navs/EcommerceSideBarLayout";

const { Text } = Typography;

const unwrapStores = (raw) => {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw.results)) return raw.results;
  if (Array.isArray(raw.data)) return raw.data;
  if (Array.isArray(raw.stores)) return raw.stores;
  if (raw.store_name && raw.store_slug) return [raw];
  return [];
};

const StoreProducts = () => {
  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [editing, setEditing] = useState(null);
  const [open, setOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const raw = await EcommerceService.listStores();
      const list = unwrapStores(raw);
      const first = list[0] || null;
      setStore(first);
      if (first) {
        const prodsRaw = await EcommerceService.listProducts({ store: first.id }).catch((e) => {
          console.error("[StoreProducts] listProducts failed:", e.response?.data || e);
          throw e;
        });
        const prods = Array.isArray(prodsRaw) ? prodsRaw : prodsRaw?.results || prodsRaw?.data || [];
        setProducts(prods);
      } else {
        setProducts([]);
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
      console.error("[StoreProducts] listStores failed:", { status, rawData, error: e });
      setStore(null);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const refreshProducts = async () => {
    if (!store) return;
    try {
      const prodsRaw = await EcommerceService.listProducts({ store: store.id });
      const prods = Array.isArray(prodsRaw) ? prodsRaw : prodsRaw?.results || prodsRaw?.data || [];
      setProducts(prods);
    } catch (e) {
      console.error("[StoreProducts] refresh failed:", e.response?.data || e);
      message.error("Failed to refresh products");
    }
  };

  if (loading) {
    return (
      <EcommerceSideBarLayout>
        <div className="flex justify-center py-16">
          <Spin tip="Loading your store..." />
        </div>
      </EcommerceSideBarLayout>
    );
  }

  // No store — 1 per org empty state
  if (!store) {
    return (
      <EcommerceSideBarLayout>
        <div className="space-y-6 max-w-3xl">
          {loadError && (
            <Alert
              type="error"
              showIcon
              message={`Couldn’t load your store${loadError.status ? ` (HTTP ${loadError.status})` : ""}`}
              description={
                <div className="space-y-2">
                  <div>{loadError.message}</div>
                  <div className="text-xs text-gray-500">
                    Request: <Text code>{loadError.url || "GET /ecommerce/stores/"}</Text> · VITE_BASE_URL:{" "}
                    <Text code>{import.meta.env.VITE_BASE_URL || "(not set)"}</Text>
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
                  <div className="text-xs text-gray-500">
                    Check DevTools → Network → GET /ecommerce/stores/ and Console for [StoreProducts] log. Ensure you’re
                    logged in as the same Organization that created the store.
                  </div>
                </div>
              }
            />
          )}
          <Card title="Store products">
            <div className="text-center py-6">
              <ShopOutlined className="text-4xl text-gray-300 mb-3" />
              <p className="text-gray-600 mb-2">You don’t have a storefront yet.</p>
              <p className="text-sm text-gray-500 mb-4">Create it first, then add products to it.</p>
              <Button type="primary" href="/store/settings">
                Create your store
              </Button>
            </div>
          </Card>
        </div>
      </EcommerceSideBarLayout>
    );
  }

  // Store exists — single-store mode: no dropdown needed (desu ne)
  return (
    <EcommerceSideBarLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <ShopOutlined />
          <Text type="secondary">
            Adding products to <Text strong>{store.store_name}</Text>{" "}
            <Text code className="font-mono">
              /store/{store.store_slug}
            </Text>{" "}
            · {store.currency}
          </Text>
          <Tag color={store.is_active ? "green" : "red"}>{store.is_active ? "Active" : "Inactive"}</Tag>
        </div>

        <Card
          title={`Products — ${store.store_name}`}
          extra={
            <Button
              type="primary"
              onClick={() => {
                setEditing(null);
                setOpen(true);
              }}
            >
              Add product to {store.store_name}
            </Button>
          }
        >
          <Table
            rowKey="id"
            dataSource={products}
            columns={[
              { title: "Title", dataIndex: "title" },
              { title: "Slug", dataIndex: "slug" },
              { title: "Status", dataIndex: "status", render: (v) => <Tag color={v === "published" ? "green" : "orange"}>{v}</Tag> },
              { title: "Featured", dataIndex: "is_featured", render: (v) => (v ? "Yes" : "No") },
              { title: "Stock", dataIndex: "current_stock" },
              {
                title: "Actions",
                render: (_, rec) => (
                  <Space>
                    <Button
                      onClick={() => {
                        setEditing(rec);
                        setOpen(true);
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      danger
                      onClick={async () => {
                        await EcommerceService.deleteProduct(rec.id);
                        message.success("Deleted");
                        refreshProducts();
                      }}
                    >
                      Delete
                    </Button>
                  </Space>
                ),
              },
            ]}
            locale={{
              emptyText: `No products yet in ${store.store_name}. Click “Add product” to create your first one.`,
            }}
          />
        </Card>
        <Modal open={open} onCancel={() => setOpen(false)} footer={null} width={700} destroyOnClose>
          <ProductEditor
            storeId={store.id}
            product={editing}
            onSaved={async () => {
              setOpen(false);
              await refreshProducts();
            }}
          />
        </Modal>
      </div>
    </EcommerceSideBarLayout>
  );
};

export default StoreProducts;

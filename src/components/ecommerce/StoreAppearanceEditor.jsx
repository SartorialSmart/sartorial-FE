import React, { useEffect, useState } from "react";
import { Card, Form, Input, Select, Button, message, ColorPicker, Switch, Typography, Alert, Space } from "antd";
import { EyeOutlined, CheckCircleOutlined } from "@ant-design/icons";
import EcommerceService from "../../services/EcommerceService";

const { Text } = Typography;

const defaultTheme = {
  primary_color: "#2563eb",
  secondary_color: "#7c3aed",
  accent_color: "#f59e0b",
  background: "#ffffff",
  font_family: "Inter",
  banner_url: "",
  hero_layout: "centered",
  card_style: "rounded",
  show_featured_header: true,
  custom_css: "",
};

const StoreAppearanceEditor = ({ store, onUpdated }) => {
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const t = { ...defaultTheme, ...(store?.theme || {}) };
    form.setFieldsValue({
      primary_color: t.primary_color,
      secondary_color: t.secondary_color,
      accent_color: t.accent_color,
      background: t.background,
      font_family: t.font_family,
      banner_url: t.banner_url,
      hero_layout: t.hero_layout,
      card_style: t.card_style,
      show_featured_header: t.show_featured_header,
      seo_title: store?.seo_title || "",
      seo_description: store?.seo_description || "",
      logo: store?.logo || "",
      custom_css: t.custom_css || "",
    });
  }, [store, form]);

  const handleSave = async (values) => {
    const theme = {
      primary_color: typeof values.primary_color === "string" ? values.primary_color : values.primary_color?.toHexString?.() || defaultTheme.primary_color,
      secondary_color: typeof values.secondary_color === "string" ? values.secondary_color : values.secondary_color?.toHexString?.() || defaultTheme.secondary_color,
      accent_color: typeof values.accent_color === "string" ? values.accent_color : values.accent_color?.toHexString?.() || defaultTheme.accent_color,
      background: typeof values.background === "string" ? values.background : values.background?.toHexString?.() || defaultTheme.background,
      font_family: values.font_family,
      banner_url: values.banner_url,
      hero_layout: values.hero_layout,
      card_style: values.card_style,
      show_featured_header: values.show_featured_header,
      custom_css: values.custom_css,
    };
    setSaving(true);
    setSaved(false);
    try {
      const updated = await EcommerceService.updateStore(store.id, {
        logo: values.logo,
        seo_title: values.seo_title,
        seo_description: values.seo_description,
        theme,
      });
      message.success({ content: "Appearance saved — storefront will reflect immediately", duration: 3 });
      setSaved(true);
      onUpdated?.(updated);
    } catch (e) {
      const msg = e.response?.data?.error || JSON.stringify(e.response?.data) || "Save failed";
      message.error({ content: msg, duration: 5 });
    } finally { setSaving(false); }
  };

  const openPreview = () => {
    if (!store?.store_slug) return;
    window.open(`/store/${store.store_slug}`, "_blank", "noopener,noreferrer");
  };

  if (!store) return null;

  return (
    <Card
      title="Appearance & branding"
      extra={
        <Space>
          <Text type="secondary">Live on /store/{store.store_slug}</Text>
          <Button icon={<EyeOutlined />} onClick={openPreview}>Preview storefront</Button>
        </Space>
      }
    >
      {saved && (
        <Alert
          type="success"
          showIcon
          icon={<CheckCircleOutlined />}
          className="mb-4"
          message="Appearance saved"
          description={
            <Space direction="vertical" size={8}>
              <span>Your storefront theme is live.</span>
              <Button icon={<EyeOutlined />} onClick={openPreview}>Preview storefront</Button>
            </Space>
          }
        />
      )}
      <Form form={form} layout="vertical" onFinish={handleSave}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Form.Item name="primary_color" label="Primary color">
            <ColorPicker showText />
          </Form.Item>
          <Form.Item name="secondary_color" label="Secondary color">
            <ColorPicker showText />
          </Form.Item>
          <Form.Item name="accent_color" label="Accent color">
            <ColorPicker showText />
          </Form.Item>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Form.Item name="background" label="Page background">
            <ColorPicker showText />
          </Form.Item>
          <Form.Item name="font_family" label="Font">
            <Select options={[
              { value: "Inter", label: "Inter (default)" },
              { value: "Poppins", label: "Poppins" },
              { value: "Manrope", label: "Manrope" },
              { value: "Playfair Display", label: "Playfair Display (elegant)" },
              { value: "Space Grotesk", label: "Space Grotesk" },
            ]} />
          </Form.Item>
        </div>
        <Form.Item name="logo" label="Logo URL">
          <Input placeholder="https://res.cloudinary.com/.../logo.png" />
        </Form.Item>
        <Form.Item name="banner_url" label="Hero banner image URL">
          <Input placeholder="https://res.cloudinary.com/.../banner.jpg — shown at top of storefront" />
        </Form.Item>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Form.Item name="hero_layout" label="Hero layout">
            <Select options={[
              { value: "centered", label: "Centered" },
              { value: "split", label: "Split (image left, text right)" },
              { value: "full", label: "Full-bleed banner" },
              { value: "minimal", label: "Minimal (no banner)" },
            ]} />
          </Form.Item>
          <Form.Item name="card_style" label="Product card style">
            <Select options={[
              { value: "rounded", label: "Rounded" },
              { value: "sharp", label: "Sharp" },
              { value: "elevated", label: "Elevated shadow" },
              { value: "minimal", label: "Minimal" },
            ]} />
          </Form.Item>
          <Form.Item name="show_featured_header" label="Show featured header" valuePropName="checked">
            <Switch />
          </Form.Item>
        </div>
        <Form.Item name="seo_title" label="SEO title (browser tab)">
          <Input maxLength={150} placeholder="e.g. Ada's Atelier — Lagos Luxury" />
        </Form.Item>
        <Form.Item name="seo_description" label="SEO description">
          <Input.TextArea rows={2} maxLength={300} />
        </Form.Item>
        <Form.Item name="custom_css" label="Custom CSS (advanced, optional)">
          <Input.TextArea rows={3} placeholder="e.g. .store-hero { letter-spacing: 0.02em; }" />
        </Form.Item>
        <Space>
          <Button type="primary" htmlType="submit" loading={saving}>Save appearance</Button>
          <Button icon={<EyeOutlined />} onClick={openPreview}>Preview storefront</Button>
        </Space>
      </Form>
      <div className="mt-6 p-3 bg-gray-50 rounded text-sm text-gray-600">
        Preview: open <a href={`/store/${store.store_slug}`} target="_blank" rel="noreferrer" className="text-blue-600 underline">/store/{store.store_slug}</a> in a new tab. Changes apply instantly (no rebuild). Custom domains share the same theme.
      </div>
    </Card>
  );
};

export default StoreAppearanceEditor;

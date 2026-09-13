import React, { useEffect, useState } from "react";
import { Card, Form, Input, Select, Switch, Button, Table, Tag, Space, message } from "antd";
import EcommerceService from "../../../services/EcommerceService";
import EcommerceSideBarLayout from "../../../components/navs/EcommerceSideBarLayout";

const StoreIntegrations = () => {
  const [stores, setStores] = useState([]);
  const [configs, setConfigs] = useState([]);
  const [errors, setErrors] = useState([]);
  const [form] = Form.useForm();

  const load = async () => {
    const st = await EcommerceService.listStores().catch(() => []);
    setStores(Array.isArray(st) ? st : st.results || []);
    const cfg = await EcommerceService.listExternalConfigs().catch(() => []);
    setConfigs(Array.isArray(cfg) ? cfg : cfg.results || []);
    const err = await EcommerceService.listSyncErrors().catch(() => []);
    setErrors(Array.isArray(err) ? err : err.results || []);
  };
  useEffect(() => { load(); }, []);

  const handleCreate = async (values) => {
    try {
      await EcommerceService.createExternalConfig(values);
      message.success("Integration saved");
      form.resetFields();
      load();
    } catch (e) {
      message.error(e.response?.data?.error || JSON.stringify(e.response?.data) || "Failed");
    }
  };

  return (
    <EcommerceSideBarLayout>
      <div className="space-y-4">
        <Card title="Connect Shopify / WooCommerce">
          <Form form={form} layout="vertical" onFinish={handleCreate}>
            <Form.Item name="store" label="Store" rules={[{ required: true }]}><Select options={stores.map((s) => ({ value: s.id, label: `${s.store_name} (${s.store_slug})` }))} /></Form.Item>
            <Form.Item name="platform" label="Platform" rules={[{ required: true }]}><Select options={[{ value: "shopify", label: "Shopify" }, { value: "woocommerce", label: "WooCommerce" }]} /></Form.Item>
            <Form.Item name="store_url" label="Store URL" rules={[{ required: true }]}><Input placeholder="https://myshop.myshopify.com or https://example.com" /></Form.Item>
            <Form.Item name="api_key" label="API Key / Consumer Key"><Input /></Form.Item>
            <Form.Item name="api_secret" label="API Secret / Consumer Secret"><Input.Password /></Form.Item>
            <Form.Item name="access_token" label="Access Token (Shopify)"><Input.Password /></Form.Item>
            <Form.Item name="webhook_secret" label="Webhook secret (HMAC)"><Input.Password /></Form.Item>
            <Form.Item name="is_enabled" label="Enabled" valuePropName="checked"><Switch /></Form.Item>
            <Form.Item name="sync_enabled" label="Sync inventory automatically" valuePropName="checked"><Switch /></Form.Item>
            <Button type="primary" htmlType="submit">Save integration</Button>
          </Form>
        </Card>
        <Card title="Connected stores">
          <Table rowKey="id" dataSource={configs} columns={[
            { title: "Platform", dataIndex: "platform", render: (v) => <Tag>{v}</Tag> },
            { title: "URL", dataIndex: "store_url" },
            { title: "Enabled", dataIndex: "is_enabled", render: (v) => v ? "Yes" : "No" },
            { title: "Sync", dataIndex: "sync_enabled", render: (v) => v ? "Yes" : "No" },
            { title: "Last synced", dataIndex: "last_synced_at", render: (v) => v ? new Date(v).toLocaleString() : "—" },
          ]} />
        </Card>
        <Card title="Sync errors (DLQ)">
          <Table rowKey="id" dataSource={errors} columns={[
            { title: "Platform", dataIndex: "platform" },
            { title: "Entity", dataIndex: "entity_type" },
            { title: "Error", dataIndex: "error_message", ellipsis: true },
            { title: "Resolved", dataIndex: "resolved", render: (v) => v ? <Tag color="green">Yes</Tag> : <Tag color="red">No</Tag> },
            { title: "Created", dataIndex: "created_at", render: (v) => new Date(v).toLocaleDateString() },
          ]} />
        </Card>
      </div>
    </EcommerceSideBarLayout>
  );
};

export default StoreIntegrations;

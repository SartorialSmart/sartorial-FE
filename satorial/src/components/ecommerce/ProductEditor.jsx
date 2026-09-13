import React, { useEffect, useState } from "react";
import { Form, Input, Select, Switch, Button, message, Divider, Card } from "antd";
import EcommerceService from "../../services/EcommerceService";
import InventoryService from "../../services/InventoryService";

const { TextArea } = Input;

const ProductEditor = ({ storeId, product, onSaved }) => {
  const [form] = Form.useForm();
  const [inventories, setInventories] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { InventoryService.listInventory().then(setInventories).catch(() => {}); }, []);

  useEffect(() => {
    if (product) {
      form.setFieldsValue({
        title: product.title,
        description: product.description,
        inventory: product.inventory,
        status: product.status || "draft",
        is_featured: product.is_featured,
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

  return (
    <Card title={product ? "Edit product" : "New product"}>
      <Form form={form} layout="vertical" onFinish={handleSave}>
        <Form.Item name="title" label="Title" rules={[{ required: true }]}>
          <Input placeholder="e.g. Agbada 2.0" />
        </Form.Item>
        <Form.Item name="description" label="Description">
          <TextArea rows={3} />
        </Form.Item>
        <Form.Item name="inventory" label="Link finished Inventory (sellable stock)">
          <Select allowClear placeholder="Select inventory with selling_price & stock" showSearch optionFilterProp="label"
            options={inventories.map((inv) => ({ value: inv.id, label: `${inv.item_name} — ${inv.sku || inv.id} (${inv.quantity} ${inv.unit_of_measurement})` }))} />
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

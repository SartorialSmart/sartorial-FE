import React, { useState } from "react";
import { Card, Form, Input, Button, message, Select } from "antd";
import EcommerceService from "../../services/EcommerceService";

const Checkout = () => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const handleCheckout = async (values) => {
    const cart = JSON.parse(localStorage.getItem("ecom_cart") || "[]");
    if (!cart.length) return message.warning("Cart empty");
    const store = cart[0].store;
    const items = cart.map((c) => ({ variant_id: c.variant_id, sku_code: c.sku_code, quantity: c.quantity }));
    setLoading(true);
    try {
      const order = await EcommerceService.checkout({
        store,
        items,
        customer: { name: values.name, email: values.email, phone: values.phone },
        shipping_address: { address: values.address },
        gateway: values.gateway,
      });
      message.success(`Order ${order.order_number} created`);
      // Init payment
      const pay = await EcommerceService.payOrder(order.id, { gateway: values.gateway, email: values.email });
      if (pay.authorization_url) {
        window.location.href = pay.authorization_url;
      } else {
        localStorage.removeItem("ecom_cart");
        message.info("Order placed. Pay on delivery or via gateway.");
      }
    } catch (e) {
      message.error(e.response?.data?.error || JSON.stringify(e.response?.data) || "Checkout failed");
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <Card title="Checkout">
        <Form form={form} layout="vertical" onFinish={handleCheckout}>
          <Form.Item name="name" label="Full name" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: "email" }]}><Input /></Form.Item>
          <Form.Item name="phone" label="Phone"><Input /></Form.Item>
          <Form.Item name="address" label="Shipping address" rules={[{ required: true }]}><Input.TextArea /></Form.Item>
          <Form.Item name="gateway" label="Payment gateway" initialValue="paystack"><Select options={[{ value: "paystack", label: "Paystack" }, { value: "flutterwave", label: "Flutterwave" }]} /></Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>Place order & Pay</Button>
        </Form>
      </Card>
    </div>
  );
};

export default Checkout;

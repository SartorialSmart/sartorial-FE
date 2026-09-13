import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, Button, InputNumber, List, message } from "antd";

const Cart = () => {
  const [cart, setCart] = useState([]);

  useEffect(() => { setCart(JSON.parse(localStorage.getItem("ecom_cart") || "[]")); }, []);

  const updateQty = (idx, qty) => {
    const next = [...cart]; next[idx].quantity = qty; setCart(next); localStorage.setItem("ecom_cart", JSON.stringify(next));
  };
  const remove = (idx) => {
    const next = cart.filter((_, i) => i !== idx); setCart(next); localStorage.setItem("ecom_cart", JSON.stringify(next));
  };
  const total = cart.reduce((s, it) => s + Number(it.price) * it.quantity, 0);

  if (cart.length === 0) return <div className="max-w-2xl mx-auto p-4"><Card>No items in cart. <Link to="/">Browse store</Link></Card></div>;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <Card title="Cart">
        <List dataSource={cart} renderItem={(item, idx) => (
          <List.Item actions={[<Button danger onClick={() => remove(idx)}>Remove</Button>]}>
            <List.Item.Meta title={item.title} description={`${item.sku_code} — ₦${item.price}`} />
            <InputNumber min={1} value={item.quantity} onChange={(v) => updateQty(idx, v)} />
          </List.Item>
        )} />
        <div className="mt-4 flex justify-between items-center">
          <span className="font-bold">Total: ₦{total.toFixed(2)}</span>
          <Link to={`/store/${cart[0]?.store || "store"}/checkout`}><Button type="primary">Checkout</Button></Link>
        </div>
      </Card>
    </div>
  );
};

export default Cart;

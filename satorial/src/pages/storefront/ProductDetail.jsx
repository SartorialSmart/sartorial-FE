import React, { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { Card, Button, Tag, Descriptions, Spin, message } from "antd";
import EcommerceService from "../../services/EcommerceService";

const ProductDetail = () => {
  const { productSlug } = useParams();
  const [searchParams] = useSearchParams();
  const storeParam = searchParams.get("store");
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    EcommerceService.productDetail(productSlug, { store: storeParam }).then(setProduct).catch(() => message.error("Product not found")).finally(() => setLoading(false));
  }, [productSlug, storeParam]);

  const addToCart = () => {
    if (!selected) return message.warning("Select a variant");
    const cart = JSON.parse(localStorage.getItem("ecom_cart") || "[]");
    cart.push({ variant_id: selected.id, sku_code: selected.sku_code, title: product.title, price: selected.price, quantity: 1, store: storeParam });
    localStorage.setItem("ecom_cart", JSON.stringify(cart));
    message.success("Added to cart");
  };

  if (loading) return <div className="flex justify-center p-8"><Spin /></div>;
  if (!product) return <div className="p-8">Not found</div>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Card title={product.title} cover={product.web_images?.[0]?.cloudinary_url && <img alt={product.title} src={product.web_images[0].cloudinary_url} className="max-h-96 object-contain w-full" />}>
        <p>{product.description}</p>
        <Descriptions column={1} size="small">
          <Descriptions.Item label="Status">{product.status}</Descriptions.Item>
          <Descriptions.Item label="Stock">{product.current_stock ?? "—"}</Descriptions.Item>
        </Descriptions>
        <div className="mt-4">
          <h4 className="font-semibold mb-2">Variants</h4>
          <div className="flex flex-wrap gap-2">
            {product.variants?.map((v) => (
              <Tag key={v.id} color={selected?.id === v.id ? "blue" : undefined} onClick={() => setSelected(v)} className="cursor-pointer p-2">
                {v.sku_code} — {v.size}/{v.color} — ₦{v.price} ({v.stock_available} in stock)
              </Tag>
            ))}
          </div>
          <Button type="primary" className="mt-4" onClick={addToCart}>Add to cart</Button>
        </div>
      </Card>
    </div>
  );
};

export default ProductDetail;

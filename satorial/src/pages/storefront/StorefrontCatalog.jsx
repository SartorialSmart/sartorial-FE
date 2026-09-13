import React, { useEffect, useState } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { Card, Input, Tag, Spin, Empty, Typography } from "antd";
import EcommerceService from "../../services/EcommerceService";

const { Meta } = Card;
const { Search } = Input;

const StorefrontCatalog = () => {
  const { storeSlug } = useParams();
  const [searchParams] = useSearchParams();
  const storeParam = storeSlug || searchParams.get("store") || window.location.hostname.split(".")[0];
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCatalog = async (search = "") => {
    setLoading(true);
    try {
      const res = await EcommerceService.catalog({ store: storeParam, search });
      setData(res);
    } catch (e) {
      setData({ products: [], error: e.response?.data?.error || e.message });
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchCatalog(); }, [storeParam]);

  if (loading) return <div className="flex justify-center p-8"><Spin /></div>;
  if (!data || data.error) return <Empty description={data?.error || "Store not found"} className="p-8" />;

  const store = data.store || data.results?.store;
  const products = data.products || data.results?.products || data.results || [];
  const theme = store?.theme || {};
  const primary = theme.primary_color || "#2563eb";
  const bg = theme.background || "#ffffff";
  const font = theme.font_family || "Inter";
  const banner = theme.banner_url;
  const heroLayout = theme.hero_layout || "centered";
  const cardStyle = theme.card_style || "rounded";
  const customCss = theme.custom_css || "";

  const cardClass =
    cardStyle === "sharp" ? "rounded-none" :
    cardStyle === "minimal" ? "rounded-lg shadow-none border" :
    cardStyle === "elevated" ? "rounded-xl shadow-xl" :
    "rounded-xl shadow";

  return (
    <div style={{ background: bg, fontFamily: font, minHeight: "100vh" }} className="pb-8">
      {customCss && <style>{customCss}</style>}
      {/* Hero */}
      {banner && heroLayout !== "minimal" ? (
        <div style={{ background: `linear-gradient(90deg, ${primary}dd, #00000000), url(${banner}) center/cover` }} className={heroLayout === "full" ? "h-80 flex items-center" : heroLayout === "split" ? "grid md:grid-cols-2 h-72" : "h-64 flex items-center justify-center text-center"}>
          <div className="max-w-6xl mx-auto p-6 text-white">
            {store?.logo && <img src={store.logo} alt="logo" className="h-12 mb-3 bg-white/90 rounded p-1" />}
            <Typography.Title level={2} style={{ color: "white", margin: 0 }}>{store?.store_name}</Typography.Title>
            <Typography.Text style={{ color: "white" }}>{store?.description?.slice(0, 120)}</Typography.Text>
          </div>
          {heroLayout === "split" && <div className="hidden md:block" style={{ background: `url(${banner}) center/cover` }} />}
        </div>
      ) : (
        <div className="max-w-6xl mx-auto p-4 pt-6">
          <div className="flex items-center gap-3">
            {store?.logo && <img src={store.logo} alt="logo" className="h-10 w-10 rounded object-cover border" />}
            <Typography.Title level={3} style={{ margin: 0, color: primary }}>{store?.store_name || store?.store_slug} — Storefront</Typography.Title>
          </div>
          <Typography.Text type="secondary">{store?.description}</Typography.Text>
        </div>
      )}

      <div className="max-w-6xl mx-auto p-4">
        <Search placeholder="Search products" onSearch={(v) => fetchCatalog(v)} className="mb-4 max-w-md" />
        {products.length === 0 ? <Empty description="No products available" /> : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((p) => (
              <Link key={p.id} to={`/store/${store.store_slug}/product/${p.slug}?store=${store.store_slug}`}>
                <Card hoverable className={cardClass} style={{ borderTop: `3px solid ${primary}` }} cover={p.web_images?.[0]?.cloudinary_url ? <img alt={p.title} src={p.web_images[0].cloudinary_url} className="h-48 object-cover" /> : <div className="h-48 bg-gray-100 flex items-center justify-center">No image</div>}>
                  <Meta title={p.title} description={p.description?.slice(0, 80)} />
                  <div className="mt-2 flex gap-2 flex-wrap">
                    {p.is_featured && <Tag color={primary}>Featured</Tag>}
                    {p.variants?.slice(0, 2).map((v) => <Tag key={v.id}>₦{v.price} — {v.size}</Tag>)}
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StorefrontCatalog;

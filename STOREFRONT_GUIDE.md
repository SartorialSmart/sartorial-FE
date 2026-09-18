# Sartorial Smart — Self-Hosted Storefront Guide
## Complete Tutorial: Deploy, Customize, and Manage Your Organization Storefront (Shopify / WooCommerce Aware)

**Version:** 2.2 • **Stack:** `Django 6 + DRF + Celery + Postgres` (`sartorial-BE/ecommerce`) ↔ `Vite + React 19 + AntD` (`satorial`)
**Last verified:** 2026-09-15 • `manage.py check` + `vite build` (6676 modules) passing. Contents match `ecommerce-plan.txt:1`, `ecommerce/models/store.py:18`, `ecommerce/models/catalog.py:8`, and frontend `satorial/src/components/ecommerce/ProductEditor.jsx:1` (category + image + price + sizes wiring).

> **What changed in 2.2 (Sep 14, 2026):**
> - **Category dropdown** — `ProductEditor` now filters ready-made inventory by `InventoryCategory` (`GET /ecommerce/inventory-categories/` with `item_count`). Backend `AvailableInventoryAPIView` supports `?category=<id>&search=&in_stock=true` (`ecommerce/api/views.py:121`).
> - **Image wiring** — `ProductionOrder.image_url` → `Inventory.image_url` → auto `WebImage` inheritance (`ecommerce/api/views.py:229` `_wire_product_image`). `ProductEditor` shows live preview, lets you keep inherited photo or paste a Cloudinary URL to replace (`satorial/src/components/ecommerce/ProductEditor.jsx:183`).
> - **Price** — `Inventory.selling_price` auto-fills storefront price; explicit `price` overrides. Backend `_wire_product_pricing` creates/updates `WebVariant(price)` (`ecommerce/api/views.py:283`). `StorefrontCatalog` + `ProductDetail` display `price → inventory_selling_price → variant.price` fallback.
> - **Sizes** — real production sizes (`XL/XXL/XS/XXS…`, `size_category`) surface on storefront instead of generic `One Size`. `ProductEditor` multi-select creates one `WebVariant` per size (`satorial/src/components/ecommerce/ProductEditor.jsx:176`). `WebProductSerializer` exposes `available_sizes/size_category/gender_target` (`ecommerce/api/serializers.py:104`).

---

### Table of Contents
1. [What you are getting](#what-you-are-getting)
2. [Mental model (ERP → Storefront)](#mental-model)
3. [Prerequisites](#prerequisites)
4. [Backend deployment (one-time, DevOps)](#backend-deployment)
5. [Frontend deployment (one-time)](#frontend-deployment)
6. [Organization guide — Create your store](#create-your-store)
7. [Manage the store (settings, appearance, domain)](#manage-the-store)
8. [Sell finished inventory: products, variants, images (wired)](#sell-finished-inventory)
9. [Orders, checkout & payments (Paystack/Flutterwave)](#orders-checkout--payments)
10. [Shopify & WooCommerce sync (two-way)](#shopify--woocommerce-sync)
11. [Domain modes — path, subdomain, custom domain (detailed)](#domain-modes)
12. [How custom domain verification works (under the hood)](#custom-domain-verification-details)
13. [Day-to-day stewardship](#day-to-day-stewardship)
14. [Deployment for customizations (theme hot-reload)](#deployment-for-customizations)
15. [Troubleshooting & FAQ](#troubleshooting--faq)
16. [Reference — API & environment](#reference)

---

### What you are getting

A **single Django app** `ecommerce` (`sartorial-BE/ecommerce/apps.py:4`) adds:

- **Storefront identity** `Store` — one per `CustomUser.role==Organization` (`users/models.py:53`). Holds `store_name`, `store_slug` (unique), optional `custom_domain` (verified), `currency NGN`, `description` + `tagline`, `logo`, `theme JSON`, `is_active`, `seo_title/description`. Powers three URL modes without code changes. New in 2.2: `tagline`, auto slug lowercasing, reserved slugs `{api, admin, store, stores, www, app, cname, static, media, swagger, redoc}` (`ecommerce/models/store.py:9`).
- **Catalog** `WebProduct` + `WebImage` + `WebVariant` (`ecommerce/models/catalog.py:8`) — self-hosted “Product/Variant” that links to finished `inventories.Inventory` (`inventories/models.py:42` + `sku:61` + `selling_price:71` + `image_url:74` + `size_category:78`) and optionally `production.ProductionOrder` (`production/models.py:10` + `size_category:98` + `image_url:115` + `gender_target:91`). Only `status==published` + has-stock are public. Serializer now exposes `price / inventory_selling_price / size_category / gender_target / available_sizes / production_order_title` (`ecommerce/api/serializers.py:98`).
- **Ready-made helpers** `AvailableInventoryAPIView` + `AvailableInventoryCategoriesAPIView` (`ecommerce/api/views.py:121`) — org-scoped, filterable by `?category=&search=&in_stock=` and `?with_counts` for the ProductEditor dropdowns (`satorial/src/services/EcommerceService.jsx:78`).
- **Orders** `CustomerOrder` + `OrderItem` (`ecommerce/models/orders.py:7`) with Paystack/Flutterwave `gateway_ref`, atomic `select_for_update()` decrements, `order_number ORD-<SLUG>-<hex>` generation.
- **External sync** `ExternalStoreConfig` + `SyncErrorLog` (`ecommerce/models/integrations.py:9`) with encrypted credentials (`payments/encryption.py:47`), Celery `40/m` Shopify GraphQL + Woo ` /batch` adapters, `default_retry_delay 5m ×3`, DLQ, and `02:00 WAT` reconciliation.
- **Resolution** `ecommerce/middleware/store_resolution.py:14` `StoreResolutionMiddleware` — reads `HTTP_HOST` (not `get_host()` to allow custom domains before `ALLOWED_HOSTS` wildcard) and sets `request.store` for `custom_domain` → `subdomain` → `path` fallback.
- **Frontend** public `StorefrontCatalog`/`ProductDetail`/`Cart`/`Checkout` (themed, price + real-size aware) + admin `StoreProducts`/`StoreOrders`/`StoreIntegrations`/`StoreSettings` (tabs General/Appearance/Domain) inside `EcommerceSideBarLayout` (`satorial/src/components/navs/EcommerceSideBarLayout.jsx:1`) and alias `/settings/storefront` inside `SettingsSideBarLayout`.

Admin stays consistent (Header+Sidebar). Customization is **public-only**; admin is never bare.

---

### Mental model

| ERP term | Shopify | WooCommerce | Self-Hosted (`ecommerce`) | Notes |
|---|---|---|---|---|
| Garment / Style | Product | Variable Product | `WebProduct` (Parent) | Master design (e.g. “Agbada 2.0”) |
| SKU / Ready-Made Item | Variant | Variation | `WebVariant` (`sku_code` = `Inventory.sku`) | Physical asset `color+size` |
| Fabric Stock (raw) | — | — | `Inventory` not pushed | Internal only |
| Finished Inventory | Available Inventory | Stock Quantity | `inventory.quantity` / `variant.inventory_quantity` | Must be >0 to appear |
| Measurement Template | Metafield | Attribute | `Product Specs` JSON | Optional |
| Production Size (`XL/XXL`) | Variant option | Variation attribute | `available_sizes` / `size_category` | Real sizes replace “One Size” |
| Finished Photo | Product image | Product image | `Inventory.image_url` → `WebImage.cloudinary_url` | Wired automatically |

Flow: `ProductionOrder(size_category + image_url)` → `Complete → Add to Inventory` (carries `size_category` + `image_url` to `Inventory`) → `WebProduct` (title/desc, publish, optional explicit `price/image_url/sizes`) → auto `WebVariant`(s) + `WebImage` wired by `_wire_product_pricing` / `_wire_product_image` → public catalog `GET /api/v1/ecommerce/storefront/catalog/?store=<slug|domain]` → `Checkout` → `Paystack/Flutterwave webhook` → atomic decrement.

---

### Prerequisites

**Operator (deploy):** `Python 3.12+`, `Postgres 14+`, `Redis 7+`, `Node 20+`, `Cloudinary` account, `Paystack` + `Flutterwave` test keys, DNS access (for `*.sartorialsmart.com` + optional TXT), domain for custom domains, `SSL` (Cloudflare SaaS or `Let's Encrypt`).

**Organization (merchant):** `Organization` login, at least one finished `Inventory` item with `selling_price` and `quantity>0` (`/inventory/list/overview`). For best storefront results, ensure finished inventory has a **photo** (`image_url`) and a **real size** (`size_category` like `XL`, not `One Size`) — these flow from `Production → Complete → Inventory` automatically.

---

### Backend deployment (one-time, DevOps)

#### 1. Clone & install

```bash
git clone <sartorial-BE> && cd sartorial-BE
python -m venv .venv && source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt  # or: pip install uv && uv sync
# .env — minimum
cat > .env <<'EOF'
SECRET_KEY=<long-random>
DEBUG=False
DB_NAME=sartorial
DB_USER=sartorial
DB_PASSWORD=<pw>
DB_HOST=127.0.0.1
DB_PORT=5432
USE_SQLITE=False
REDIS_URL=redis://127.0.0.1:6379/0
CELERY_BROKER_URL=redis://127.0.0.1:6379/0
PAYSTACK_SECRET_KEY=sk_live_...
PAYSTACK_PUBLIC_KEY=pk_live_...
FLUTTERWAVE_WEBHOOK_SECRET=<hash from dashboard>
CLOUD_NAME=<cloudinary>
API_KEY=<>
API_SECRET=<>
ALLOWED_HOSTS=api.sartorialsmart.com,127.0.0.1,localhost,.sartorialsmart.com,*
ECOMMERCE_CNAME_TARGET=cname.sartorialsmart.com
ECOMMERCE_SUBDOMAIN_ROOTS=sartorialsmart.com
FRONTEND_URL=https://sartorialsmart.com
EOF
```

`core/settings.py:37` now reads `ALLOWED_HOSTS` from env, wildcard `*` is required so `ecommerce/middleware/store_resolution.py:20` can accept arbitrary `shop.merchant.com` without `DisallowedHost` (it uses `META['HTTP_HOST']`).

#### 2. DB & migrations

```bash
python manage.py migrate
python manage.py makemigrations ecommerce  # already: ecommerce/migrations/0001_initial.py + 0002_store_tagline.py
python manage.py migrate  # also: inventories/migrations/0009_add_finished_image_url.py + 0010_add_size_category.py, production/migrations/0005_add_finished_image_url.py
python manage.py check  # should say "System check identified no issues (1 silenced)."
```

New tables: `ecommerce_store`, `ecommerce_webproduct`, `ecommerce_webimage`, `ecommerce_webvariant`, `ecommerce_customerorder`, `ecommerce_orderitem`, `ecommerce_externalstoreconfig`, `ecommerce_syncerrorlog`. Added columns: `inventories.Inventory.image_url + size_category`, `production.ProductionOrder.image_url`, `ecommerce_store.tagline`.

#### 3. Wire app

`core/settings.py:42` must contain `"ecommerce"` in `INSTALLED_APPS` (done), `core/settings.py:79` adds `ecommerce.middleware.StoreResolutionMiddleware` after `CommonMiddleware`, `core/urls.py:52` mounts `path("api/v1/ecommerce/", include("ecommerce.api.urls"))` and `path("api/v1/ecommerce/webhooks/", include("ecommerce.webhooks.urls"))`. Beat schedule `core/settings.py:309` adds `ecommerce-reconciliation` (02:00 WAT) + `ecommerce-verify-pending-domains` hourly.

`pyproject.toml` adds `ecommerce` to `packages`, `known-first-party`, `coverage.source`.

#### 4. Redis + Celery

```bash
redis-server &
celery -A core worker -l info --concurrency 2  # respects tasks rate_limit="40/m" (Shopify) / "30/m" (Woo)
celery -A core beat -l info  # needed for reconciliation + domain verify
# On systemd, create core-worker.service / core-beat.service; on Docker, add services
```

`core/celery.py:1` autodiscovers `ecommerce.tasks.sync_tasks`, `reconciliation`, `domain_tasks`. Tests use `CELERY_TASK_ALWAYS_EAGER=True` (`core/settings.py:301`).

#### 5. Wildcard DNS & SSL (once)

- Root: `A sartorialsmart.com → <LB IP>`
- Wildcard: `CNAME *.sartorialsmart.com → cname.sartorialsmart.com`  (or `A *.sartorialsmart.com → <LB IP>`)
- Issue `*.sartorialsmart.com` cert (`Let's Encrypt` `certbot -d sartorialsmart.com -d *.sartorialsmart.com --manual --preferred-challenges dns`) or Cloudflare “Wildcard” + “SSL → Full”. For custom domains, either **Cloudflare for SaaS** (recommended: `cname.sartorialsmart.com` as origin, orange-cloud, auto-cert) or `nginx` + `certbot --nginx -d shop.merchant.com`.

No code rebuild needed for new subdomains — `StoreResolutionMiddleware` does it.

#### 6. Nginx (example)

```nginx
server {
  listen 443 ssl;
  server_name api.sartorialsmart.com ~^(?<sub>.+)\.sartorialsmart\.com$;
  ssl_certificate /etc/letsencrypt/live/sartorialsmart.com/fullchain.pem;
  location / { proxy_pass http://127.0.0.1:8000; proxy_set_header Host $host; }
}
# Custom domains: same server block, any Host hits Django; ALLOWED_HOSTS=* passes, middleware decides.
```

#### 7. Run

```bash
gunicorn core.wsgi:application --bind 0.0.0.0:8000 --workers 3
# Health:
curl -s https://api.sartorialsmart.com/api/v1/ecommerce/storefront/catalog/?store=test-store | head
curl -s https://api.sartorialsmart.com/api/v1/ecommerce/inventory-categories/ -H "Authorization: Bearer <token>" | head
```

---

### Frontend deployment (one-time)

```bash
cd satorial
npm ci
# .env
echo "VITE_BASE_URL=https://api.sartorialsmart.com/api/v1/" > .env
npm run build  # satorial/dist — 6676 modules expected
# Host dist/: Vercel / Netlify / Nginx static
# Vercel: framework Vite, output satorial/dist
```

` satorial/utils/axiosConfig.jsx:7` marks `/ecommerce/storefront/` + `/ecommerce/webhooks/` as `PUBLIC_ENDPOINTS` (no bearer). `satorial/src/App.jsx:199` mounts public ` /store/:storeSlug` + ` /cart` + `/checkout` and protected `/store/*` + `/settings/storefront` (`satorial/src/pages/settingsPages/SettingsStorefrontDisplay.jsx:1`).

---

### Create your store

1. **Sign in** as `Organization`.
2. **Sidebar → Settings → Storefront** (`/settings/storefront`). This is the correct place — alias `/store/settings` also works but Settings is canonical. `satorial/src/components/navs/SettingsSideBarLayout.jsx:19` adds the icon.
3. **Create form** (`satorial/src/pages/dashboard/store/StoreSettings.jsx:36`): `Store name` (e.g. “Ada’s Atelier”), optional `Slug` (auto slugifies `store_name` if blank; `ecommerce/models/store.py:90` loop ensures uniqueness; reserved `api, admin, store, www, cname` blocked), `Currency` (NGN/USD/GHS), `Description`. Click **Create store**. One store per org initially (enforced `StoreAdminAPIView.post`).
4. You now have: Path `https://sartorialsmart.com/store/<slug>` and Subdomain `https://<slug>.sartorialsmart.com` active immediately — no DNS needed. Test: open `https://<slug>.sartorialsmart.com` — `StoreResolutionMiddleware` will resolve `sub` before hitting DB.

Manage later under **Dashboard → Ecommerce Storefront** card (`satorial/src/pages/dashboard/DashboardLayout.jsx:111`) or Settings.

---

### Manage the store

Tabs in `StoreSettings` (`Tabs` General/Appearance/Domain):

**General:** edit `store_name/slug/currency/description/tagline/is_active`. Saving does `PUT /ecommerce/stores/<id>/` (`satorial/src/services/EcommerceService.jsx:1` `updateStore`). `is_active=False` hides from all catalogs. `tagline` is a short subtitle shown under store name on some hero layouts.

**Appearance:** `satorial/src/components/ecommerce/StoreAppearanceEditor.jsx:1` — live on `/store/<slug>` without rebuild (theme is JSON in `Store.theme`).

| Field | Effect where |
|---|---|
| `primary_color`, `secondary_color`, `accent_color` (`ColorPicker`) | Hero gradient, card top border, featured tag (`satorial/src/pages/storefront/StorefrontCatalog.jsx:20` `primary`/`bg`/`custom_css` style) |
| `background`, `font_family` | Page `background`, `fontFamily` wrapper |
| `logo` (Cloudinary URL) | Hero `img` + header; also `Header.jsx:250` org logo if org |
| `banner_url` | Hero background (`linear-gradient(primary, transparent), url(banner)`) |
| `hero_layout` `centered/split/full/minimal` | `StorefrontCatalog` hero variant |
| `card_style` `rounded/sharp/elevated/minimal` | `cardClass` per product |
| `seo_title/seo_description` | Browser tab + meta (store serializer exposes) |
| `custom_css` | Injected `<style>{custom_css}</style>` |

Click **Save appearance** → `EcommerceService.updateStore(id, {logo, seo_title, ..., theme})`. Preview by opening ` /store/<slug>` in new tab — hot-reload, no deploy.

**Domain:** see [Domain modes](#domain-modes).

---

### Sell finished inventory

Prereq: Create finished goods via **Inventory → List → Add** (`/inventory/list/overview`) with `SKU`, `selling_price`, `quantity`, `category`, optional `image_url` + `size_category` (`inventories/models.py:74`). Or **Production → Orders** → `Completed` → `Add to Inventory` — this now carries `ProductionOrder.image_url → Inventory.image_url` and `size_category` automatically (`production/views.py:28`, `sartorial-BE` `b726e28`).

> **Why this matters (2.2 wiring):** Production is where you set the real size (`XL/XXL/XS/XXS…` via `ProductionOrder.size_category`) and the finished photo (`image_url`). When you “Add to Inventory”, both fields are copied to `Inventory`. When you later create a `WebProduct` from that inventory, the storefront inherits them automatically — so you don’t have to re-upload photos or re-type sizes.

**1. Products** (`/store/products` → `StoreProducts` + `ProductEditor` `satorial/src/components/ecommerce/ProductEditor.jsx:1`):
- Click **Add product** → modal opens. Top field **Inventory category (filter)** (`satorial/src/components/ecommerce/ProductEditor.jsx:136`): searchable `Select` loaded from `GET /ecommerce/inventory-categories/` (`EcommerceService.inventoryCategories`) with counts like “Agbada (12)”. Pick a category to narrow ready-made stock.
- Next field **Link finished Inventory**: searchable `Select` of `EcommerceService.availableInventory({category, in_stock:true, search})` (`ecommerce/api/views.py:121`), org-scoped, filtered to `quantity>0` by default. Each option shows `item_name — SKU (qty unit) · category · size · ₦price` (`satorial/src/components/ecommerce/ProductEditor.jsx:100`). Leave empty for a manual listing.
- Fields:
  - `Title` (“Agbada 2.0”) — required, auto slug from title if `slug` blank (`ecommerce/models/catalog.py:63`).
  - `Description` — optional.
  - `Price (₦)` (`satorial/src/components/ecommerce/ProductEditor.jsx:164`) — **auto-fills** from selected inventory’s `selling_price` if you leave it blank (watches `Form.useWatch("inventory")`). Enter a custom value to override (e.g. storefront promo price). Stored as `WebVariant.price`; `WebProductSerializer.price` falls back to variant price → inventory `selling_price` (`ecommerce/api/serializers.py:161`).
  - `Available sizes` (`satorial/src/components/ecommerce/ProductEditor.jsx:176`) — multi-select of `SIZE_CATEGORIES` (`XXXS … XXXXL, One Size, Custom`) (`satorial/src/constants/productionConstants.js`). Select the sizes you produced (e.g. `XL`, `XXL`). If you leave empty, backend uses `ProductionOrder.size_category` or `Inventory.size_category` automatically. Each selected size becomes a `WebVariant(size=…)`.
  - `Product image` (`satorial/src/components/ecommerce/ProductEditor.jsx:183`) — `image_url` input with live preview. Behavior: (a) if you paste a URL → that becomes the storefront cover `WebImage`, replacing any existing; (b) if blank and product has no image → inherits `Inventory.image_url` (which came from `ProductionOrder.image_url`) automatically (`ecommerce/api/views.py:229` `_wire_product_image`); (c) if product already has an image and field blank → keeps current image.
  - `Status` `draft/published/archived`, `Featured` switch.
- Click **Save** → `POST /ecommerce/products/` (`WebProductAdminAPIView.post`) validates `store.organization==org`. After save, backend runs `_wire_product_image` + `_wire_product_pricing` (creates variants per size + image), then if `published` enqueues `sync_product_to_external.delay` for each enabled `ExternalStoreConfig` (`ecommerce/api/views.py:464`).
- Table shows `Title/Slug/Status/Featured/Stock` (`WebProductSerializer.current_stock` sums `variants` or `inventory.quantity`).

**2. Variants — how sizes become variants (new detail):**
- You no longer need to manually add variants per SKU in most cases. The wiring (`ecommerce/api/views.py:283` `_wire_product_pricing`) handles:
  - **No variants yet + single real size** (e.g. `XL` from production) → creates one `WebVariant(sku_code=Inventory.sku or SKU-<id8>, price=…, size=XL, inventory_quantity=Inventory.quantity)`.
  - **No variants + multiple sizes** (you picked `XL, XXL`) → creates one variant per size, sku `AGB-BLU-XL`, `AGB-BLU-XXL` (deduped).
  - **Variants exist + generic One Size** → if you later pick a real size and save, the generic variant’s `size` is upgraded.
  - **Variants exist + explicit new price** → updates default variant price.
- You can still manage variants directly via API `POST /ecommerce/products/<id>/variants/` (`satorial/src/services/EcommerceService.jsx:1` `createVariant`): `sku_code` must match `Inventory.sku` for stock sync, `color`, `size` (`ProductionOrder.size_category` values), `price`, `compare_at_price`, `inventory_quantity` (if not linking `inventory_item`), `weight`, `is_active`. Unique per `(web_product, sku_code)`.
- `WebVariant.stock_available` (`ecommerce/models/catalog.py:145`) prefers `inventory_item.quantity` if FK set, else `inventory_quantity`. Public catalog skips variants with 0 stock.

**3. Images:** `POST /ecommerce/products/<id>/images/` → `WebImage` (`cloudinary_url`, `display_order`). Ordered `display_order` (cover is `[0]`). The new auto-wire means most stores never need this — just set `ProductionOrder.image_url` or paste one `image_url` in `ProductEditor`.

**4. Publish:** set product `status=published` → `is_published=True` (`WebProduct.save`). Only published + has-stock appear in `GET /ecommerce/storefront/catalog/?store=<slug>` (`ecommerce/api/views.py:564` `StorefrontCatalogListView`). Draft remains admin-only. Frontend `StorefrontCatalog` displays `₦price` (fallback `variants[0].price` or `inventory_selling_price`) and real sizes (`available_sizes` → `size_category` → variant sizes, filtering out `One Size` when a real size exists) (`satorial/src/pages/storefront/StorefrontCatalog.jsx:82`).

**Workflow tip — end-to-end example (new in 2.2):**
1. **Production:** Create order “Agbada 2.0”, set `size_category=XL`, `gender_target=Male`, upload `image_url=https://res.cloudinary.com/.../agbada.jpg` (`production/models.py:115`).
2. **Complete:** Mark `Completed` → `Add to Inventory` → creates `Inventory {item_name: "Agbada 2.0", sku: AGB-BLU-XL, quantity: 20, selling_price: 45000, image_url: same, size_category: XL, category: Agbada}`.
3. **Store:** `/store/products` → **Add product** → pick category “Agbada” → pick “Agbada 2.0 — AGB-BLU-XL (20 pcs) · Agbada · XL · ₦45000”. Price auto-fills `45000`, preview shows the production photo. Pick sizes `XL, XXL` if you also made XXL, or leave blank to get single `XL`. Click Save, set `Published`.
4. **Storefront:** `/store/<slug>` shows card: “Agbada 2.0” + photo + `₦45,000` + tags `XL` (and `XXL` if multi) + `Male`, not generic `One Size`.

---

### Orders, checkout & payments

**Catalog (public):** `StorefrontCatalog` fetches `EcommerceService.catalog({store, search})` (`AllowAny`). Response `{store:{...theme...}, products:[...variants...]}` — already filtered for stock (`StorefrontCatalogListView` filters before `CustomPagination`). Paginated via `common/pagination.py:4`. New: each product includes `price`, `inventory_selling_price`, `available_sizes`, `size_category`, `gender_target`, `production_order_title` for richer cards.

#### Shopping cart — how it works for customers (no login needed)

The cart is **browser-only** (`localStorage` key `ecom_cart`), so shoppers do not need a Sartorial account to buy — anyone who can open your storefront can buy.

- **Where the code lives:** `satorial/src/pages/storefront/ProductDetail.jsx:18` `addToCart`, `satorial/src/pages/storefront/Cart.jsx:1`, `satorial/src/pages/storefront/Checkout.jsx:1`, and `StorefrontCatalog.jsx:20` (search + product grid). Routes ` /store/:storeSlug`, `/store/:storeSlug/product/:productSlug`, `/cart`, `/store/:storeSlug/checkout` are public (`satorial/src/App.jsx:226`).
- **Step 1 — Add to cart:** On product detail, shopper must pick a **variant** (`sku_code/size/color`, e.g. `AGB-BLU-XL — XL/Blue — ₦45,000 (20 in stock)`) (`ProductDetail.jsx:57` Tag list). Clicking a variant sets `selected`. **Add to cart** (`ProductDetail.jsx:18`) validates selection, then does: `cart = JSON.parse(localStorage.getItem("ecom_cart")||"[]"); cart.push({variant_id: selected.id, sku_code, title: product.title, price: selected.price, quantity:1, store: storeParam}); localStorage.setItem("ecom_cart", JSON.stringify(cart))` and shows `message.success("Added to cart")`. First item’s `store` (`?store=` from `searchParams`) anchors the cart to that store. The cart is **not de-duplicated** — adding same variant twice creates two lines (qty 1+1) rather than incrementing.
- **Step 2 — View cart:** `/cart` (`Cart.jsx:5`) loads on mount `useEffect(() => setCart(JSON.parse(localStorage.getItem("ecom_cart")||"[]")))`. It renders AntD `List` with `InputNumber min=1` per line (`Cart.jsx:23`), recalculates `total = cart.reduce((s,it)=>s+Number(it.price)*it.quantity,0)` (`Cart.jsx:16`), shows `Total: ₦{total.toFixed(2)}`. Buttons: **Remove** (`Cart.jsx:14` filter), **updateQty** (`Cart.jsx:10` updates that index and re-persists). Empty cart shows `<Card>No items in cart. Browse store</Card>` with link (`Cart.jsx:18`). **Checkout** button links to `/store/${cart[0]?.store || "store"}/checkout` (`Cart.jsx:31`) — thus whole cart is assumed single-store (taken from first item).
- **Step 3 — No stock reservation:** Adding to cart does **not** reserve stock on server. Stock is checked **only at checkout** via `select_for_update()` (`ecommerce/api/views.py:684`). Two shoppers adding same last item to cart can both see it; first to complete checkout wins. This matches low-spec safety and is documented in guide.
- **Step 4 — Persistence / clearing:** `Cart` persists across page reloads until checkout succeeds or shopper clicks **Remove**. `Checkout.jsx:29` clears on success (`localStorage.removeItem("ecom_cart")`). If shopper closes tab, reopening restores cart because localStorage survives. No backend clears it.

> **Operator note:** Because cart is localStorage + `store` param, deep-linking works: `https://<slug>.sartorialsmart.com/product/<productSlug>?store=<slug>` still knows which store to checkout against. Mixing items from two different stores into one cart is currently unchecked — such a cart would send `store=firstStore` with variant_ids from second store and checkout would return `Variant not found` (404). For now, shoppers should not cross stores in one checkout.

**Checkout** (`/store/<slug>/checkout` or `/checkout`):
- Form `name/email/phone/address/gateway` → `POST /ecommerce/storefront/orders/` (`CheckoutAPIView:684`) with `{store, items:[{variant_id|sku_code, quantity}], customer, shipping_address}`. Validates `select_for_update()` stock (insufficient → `400 Insufficient stock for ... (have N)`), creates `CustomerOrder` (`status=pending, payment_status=PENDING, gateway_ref=ref_...`, `total_amount` computed from `variant.price`, `order_number ORD-<SLUG>-<hex>`), plus `OrderItem`(s) snapping `unit_price`.
- Next: `POST /ecommerce/storefront/orders/<id>/pay/` (`OrderPayInitAPIView` `ecommerce/api/views.py:800`) with `gateway` fallback to `PaymentGatewayConfig.get_active()` (`payments/models.py:16`). Returns mock `authorization_url` `https://checkout.<gateway>.com/pay/<ref>` in dev; in prod, calls `requests.post https://api.paystack.co/transaction/initialize` with `cfg.secret_key`.

#### Where to integrate Paystack / Flutterwave to **receive** payments — honest gap

> **Common confusion:** *Customers (shoppers) never integrate Paystack.* Customers just **pay** via Paystack/Flutterwave. The **Organization (store owner)** is who wants to **receive** money. Today that is **not per-organization** — read carefully.

- **Current reality (platform-level, Sep 2026):** `PaymentGatewayConfig` (`sartorial-BE/payments/models.py:16`) holds exactly **one global** Paystack row + one Flutterwave row, each with `test_secret_key/live_secret_key/test_public_key/live_public_key/webhook_secret`, fields `is_enabled/is_active/test_mode`, and single-active invariant (`payments/models.py:60`). Only **Platform Super Admin** (`IsSuperAdmin`, `payments/admin_views.py:1`, routes `platform_admin/urls.py:239` `payment-gateways/<gateway>/…`) can read masked keys (`payments/serializers.py:21` `••••abcd`), set test vs live via `PaymentGatewayUpdateSerializer` (`payments/serializers.py:76`), `activate` (`PaymentGatewayActivateView` `payments/admin_views.py:66` validates `has_active_secret`), and `test-connection`/`generate-webhook-secret`. There is **no UI** in `StoreSettings/StoreIntegrations/EcommerceService` (`satorial/src/services/EcommerceService.jsx:1`) nor any `apiEndpoints.jsx:403` `ECOMMERCE` route for an org to set its own Paystack secret. The ecommerce checkout `OrderPayInitAPIView:806` picks `PaymentGatewayConfig.get_active()` as fallback gateway — i.e. **all storefronts share the active platform key**.
- **What this means:** All shoppers pay into the **platform’s Paystack settlement account**, not the individual org’s. Money lands in one place. The operator must **settle manually** to each org (bank transfer) or extend the module. This is workable for early pilot but not for scale. It is **not** that “customers integrate Paystack in Settings → Storefront” — that screen does not exist yet.
- **Paystack docs expectation:** Paystack wants per-merchant keys or `subaccount` splits. The current `paystack.py:29` `initialize_transaction` payload **does not send** `subaccount`/`bearer` fields (`payments/gateways/paystack.py:29` only sends `email, amount*100, reference, callback_url, metadata, plan`). `ecommerce/api/views.py:800` stub also returns `https://checkout.paystack.com/pay/<ref>` mock instead of calling `get_gateway(...).initialize_transaction(...)`. Real prod call (commented in file `views.py:830`) would need per-store key selection.
- **Recommended design (to implement next):** Add **per-store payout config** — e.g. `Store.paystack_subaccount_code` + `paystack_split_code` (or full `StorePaymentConfig` FK with encrypted `paystack_secret_key` + `paystack_public_key` + `paystack_subaccount_code` + `webhook_key`), or reuse `PaymentGatewayConfig` with `organization FK` (allow multiple active per org, scoping `get_active(org)`). Then `Checkout → OrderPayInit` would resolve `store.paystack_subaccount_code || store.organization_payment_config.secret_key || platform_active.secret_key`, pass `subaccount` & `bearer` to Paystack init, and verify webhooks against **that store’s** secret (store-resolved via `StoreResolutionMiddleware` + `gateway_ref → store`). Steps for org: **Settings → Storefront → Payments tab** (new) → paste Paystack `Secret key` (`sk_live_…`), `Public key`, click **Generate webhook secret** → paste webhook URL `https://api.sartorialsmart.com/api/v1/ecommerce/webhooks/paystack/` into Paystack dashboard → **Test connection**. Until that exists, keep platform central config.
- **How to wire it today (operator):** Platform owner: get Paystack `Secret/Live` + public from `dashboard.paystack.com` → call `PATCH /api/v1/admin/payment-gateways/paystack/` with `live_secret_key, live_public_key, test_mode: false, is_enabled: true` → `POST .../activate/` → set Env `PAYSTACK_SECRET_KEY` fallback (`core/settings.py` `settings.PAYSTACK_SECRET_KEY`) + add webhook URL `https://api.sartorialsmart.com/api/v1/ecommerce/webhooks/paystack/` in Paystack → listen `charge.success`. Flutterwave similarly via `HTTP_VERIF_HASH`.
- **For the org to receive orders today:** Nothing to enter. Just set store `status=published`, ensure products with `selling_price` exist, then shoppers pay. After webhook marks `PAID`, orders appear in `/store/orders` (`StoreOrders.jsx:1` → `GET /ecommerce/admin/orders/`) with `payment_status=PAID`. Settle later with platform.

**Payment webhooks** (`AllowAny` + HMAC):
- Paystack `POST /ecommerce/webhooks/paystack/` (`ecommerce/webhooks/payments.py:18` `PaystackWebhookView`) checks `HTTP_X_PAYSTACK_SIGNATURE` `hmac.sha512(body, secret)` where `secret = PaymentGatewayConfig.secret_key || settings.PAYSTACK_SECRET_KEY`. On `charge.success`, idempotent via `payments/models.py:84` `WebhookEvent (gateway+event_id)`, `select_for_update()` `CustomerOrder` → `PAID` (and `status=paid`) → loop `OrderItem` → decrement `Inventory` or `WebVariant` atomically, mark `WebhookEvent.processed`.
- Flutterwave `POST /ecommerce/webhooks/flutterwave/` checks `HTTP_VERIF_HASH` vs `PaymentGatewayConfig.webhook_secret`.

**Admin orders:** `/store/orders` (`StoreOrders`) → `GET /ecommerce/admin/orders/` (`IsAuthenticated` + `IsOrganizationOrStaffUser`) — update `PATCH /ecommerce/admin/orders/<id>/ {status: "fulfilled"}`.

**Test payment locally:**
```bash
python manage.py shell
from django.test import RequestFactory; import hmac, hashlib, json; from django.conf import settings
from ecommerce.models import CustomerOrder; order=CustomerOrder.objects.last()
payload={"event":"charge.success","data":{"reference":order.gateway_ref,"id":123}}; body=json.dumps(payload).encode()
sig=hmac.new(settings.PAYSTACK_SECRET_KEY.encode(), body, hashlib.sha512).hexdigest()
from rest_framework.test import APIRequestFactory
req=APIRequestFactory().post("/api/v1/ecommerce/webhooks/paystack/", data=body, content_type="application/json", HTTP_X_PAYSTACK_SIGNATURE=sig)
from ecommerce.webhooks.payments import PaystackWebhookView; print(PaystackWebhookView.as_view()(req).status_code)
```

---

### Shopify & WooCommerce sync

**Connect** (`/store/integrations` → `StoreIntegrations`):
- Form `Store, Platform (shopify|woocommerce), Store URL, api_key/api_secret/access_token, webhook_secret, is_enabled, sync_enabled`.
- `POST /ecommerce/external-configs/` (`ExternalConfigAPIView`) encrypted via `EncryptedTextField`, `unique (store, platform, store_url)`.

**Adapters:** `ecommerce/integrations/shopify_adapter.py:1` GraphQL/REST `40/m`, `woocommerce_adapter.py:1` `/batch` (low-spec safe). Transformers `transformers.py:9` (`ShopifyPayloadTransformer` spec `ecommerce-implementation.md:36`).

**Outbound (ERP → remote):** `WebProduct.save → post_save` + `WebVariant.post_save` (`ecommerce/signals.py:10`) → `ecommerce/tasks/sync_tasks.py:9` `sync_product_to_external` / `sync_inventory_to_external` with `retry 5m×3`, `SyncErrorLog` on `MaxRetries`. Also triggered explicitly on `WebProductAdminAPIView` publish (`ecommerce/api/views.py:464`).

**Inbound (remote → ERP):**
- Shopify `POST /ecommerce/webhooks/shopify/` (`shopify.py:9` `verify_shopify_hmac` `base64(sha256(body, secret))` vs `X-Shopify-Hmac-SHA256`, topic `orders/paid`) → `select_for_update()` decrement per `sku`.
- Woo `POST /ecommerce/webhooks/woocommerce/` (`woocommerce.py:9` `hmac sha256` vs `X-Wc-Webhook-Signature`, status `processing`) → same.
- Both dev-accept if `webhook_secret` empty (logs warning).

**Configure webhooks on platforms:**
- Shopify: Admin → Settings → Notifications → Webhooks → `https://api.sartorialsmart.com/api/v1/ecommerce/webhooks/shopify/` events `orders/paid`, HMAC `webhook_secret`.
- Woo: WP → Woo → Settings → Advanced → Webhooks → `https://api.sartorialsmart.com/api/v1/ecommerce/webhooks/woocommerce/` topic `Order created` (or `order.processing`), secret.

**Reconciliation:** `ecommerce/tasks/reconciliation.py:1` pulled `pull_remote_inventory()` bulk GET, compares `WebVariant.stock_available` vs remote, logs `SyncErrorLog` mismatches. **DLQ UI** `StoreIntegrations` → `Sync errors` table (`GET /ecommerce/sync-errors/`).

---

### Domain modes

Set in `StoreDomainSettings` (`satorial/src/components/ecommerce/StoreDomainSettings.jsx:1`):

**A. Path (default):** `https://sartorialsmart.com/store/<store_slug>` — always works, no DNS. Ideal for testing and for orgs that don’t own a domain yet.

**B. Subdomain:** `https://<store_slug>.sartorialsmart.com` — needs wildcard `*.sartorialsmart.com → <LB IP>` + `*.sartorialsmart.com` cert (see [Backend deployment §5](#backend-deployment)). No per-store config; create store and it works because `StoreResolutionMiddleware` checks `host.endswith("."+root)` for each `ECOMMERCE_SUBDOMAIN_ROOTS`. Example: `adas-atelier.sartorialsmart.com`.

**C. Custom domain:** e.g. `shop.merchant.com` or `shopadabyada.com` — your own domain you bought (from Namecheap, GoDaddy, Cloudflare, Google Domains, etc.). Visitors see only your brand, e.g. `https://shop.adabyada.com` instead of `sartorialsmart.com/store/...`. Requires two DNS records and one verification click (detailed next section).

| Mode | URL example | DNS needed? | SSL | When to use |
|---|---|---|---|---|
| Path | `sartorialsmart.com/store/adas-atelier` | No | Platform cert | Start immediately, share link |
| Subdomain | `adas-atelier.sartorialsmart.com` | Wildcard once (operator) | Wildcard cert `*.sartorialsmart.com` | Professional, no domain cost |
| Custom | `shop.adabyada.com` | Per-store CNAME + TXT | Auto via Cloudflare for SaaS or Let’s Encrypt | Brand-owned domain |

All three resolve to the **same** `Store` row — switch without recreating products. Frontend `axiosConfig` hits same API; `StorefrontCatalog` can be called via `?store=shop.merchant.com` or via `Host: shop.merchant.com` (middleware path). For public visitors on custom domain, `https://shop.merchant.com/` alone resolves (no `/store/<slug>` prefix needed).

**Where to set it:** **Settings → Storefront → Domain** tab (`satorial/src/pages/dashboard/store/StoreSettings.jsx:476`).

---

### Custom domain verification details

This section is the **enhanced guide for custom domains** — how a non-technical org can connect `shop.yourdomain.com` to their Sartorial storefront.

#### What happens technically (simple picture)

1. You type `shop.merchant.com` into **Domain** tab and click **Save** → backend lowercases it, validates it’s a real domain (`ecommerce/models/store.py:13` `FQDN_RE`), generates a secret token like `sartorial-verify-91e8dc4a9b2c101a` if not exists (`ecommerce/models/store.py:102`), and shows you two DNS instructions.
2. You go to **where you bought your domain** (your DNS provider) and add the two records.
3. You click **Verify now** → browser calls `POST /ecommerce/stores/<id>/domains/verify/` → Celery `verify_store_domain_task.delay` → `store_service.verify_store_domain` does `dns.resolver.resolve(TXT "_sartorial-verify.shop.merchant.com")` (`ecommerce/services/store_service.py:21`) with 5s timeout. If the TXT value equals the token, it sets `domain_verified=True`, `domain_verified_at=now`. Hourly Celery beat `verify_pending_domains` retries pending domains automatically (`ecommerce/tasks/domain_tasks.py:24`).
4. Middleware `StoreResolutionMiddleware` now matches `Store.custom_domain==host AND domain_verified` **first** (before subdomain) (`ecommerce/middleware/store_resolution.py:48`), so `https://shop.merchant.com/` shows your catalog.
5. Frontend helpers `StoreSerializer.verification_txt_name` + `cname_target` (`ecommerce/api/serializers.py:15`) expose the exact values to display.

#### Step-by-step for org (no jargon)

**Prerequisite:** You own a domain (e.g. `adabyada.com` bought on Namecheap/GoDaddy/Cloudflare). If you don’t, buy one first — any provider works.

**Step 1 — Save domain in Sartorial**
- Open **Settings → Storefront → Domain** → type `shop.adabyada.com` (or `store.adabyada.com`, or apex `adabyada.com` — but subdomain like `shop.` is recommended; see apex note below) into “Custom domain” → **Save**. It must be lowercased, no `https://`, no trailing slash.

**Step 2 — Add two DNS records at your provider**

You will see (example for token `sartorial-verify-91e8dc4a9b2c101a`):
- `TXT _sartorial-verify.shop.adabyada.com = sartorial-verify-91e8dc4a9b2c101a`
- `CNAME shop.adabyada.com → cname.sartorialsmart.com` (or `A` if apex — see below)

*Provider walkthroughs (generic, UI varies):*

- **Cloudflare:** DNS → Add record → Type `TXT`, Name `_sartorial-verify.shop`, Content `sartorial-verify-…`, TTL Auto. Add record → Type `CNAME`, Name `shop`, Target `cname.sartorialsmart.com`, Proxy **DNS only** (grey cloud) initially, or orange-cloud if using Cloudflare for SaaS.
- **Namecheap:** Domain List → Manage → Advanced DNS → Add New Record → `TXT Record`, Host `_sartorial-verify.shop`, Value `sartorial-verify-…`, TTL Automatic. Add New Record → `CNAME Record`, Host `shop`, Value `cname.sartorialsmart.com.` (trailing dot), TTL Automatic.
- **GoDaddy:** My Products → DNS → Add → `Type TXT`, Name `_sartorial-verify.shop`, Value `sartorial-verify-…`; Add → `Type CNAME`, Name `shop`, Value `cname.sartorialsmart.com`, TTL 1 hour.
- **Google Domains / Squarespace:** DNS → Custom records → `TXT _sartorial-verify.shop → sartorial-verify-…`; `CNAME shop → cname.sartorialsmart.com`.

*Important notes:*
- **Apex vs subdomain:** You can point `adabyada.com` (apex, no `shop.`) but DNS spec says CNAME at apex is not allowed — use `A` record to `cname.sartorialsmart.com`’s IP (ask operator for IP) or use Cloudflare’s `CNAME flattening` / `ALIAS` / `ANAME`. Subdomain `shop.adabyada.com` with CNAME is simplest.
- **Blocklist:** You cannot use `*.sartorialsmart.com` as custom domain — `ecommerce/models/store.py:84` blocks it (“Use subdomain mode for sartorialsmart.com domains.”).
- **Lowercased:** `Shop.Merchant.COM` is saved as `shop.merchant.com`.

**Step 3 — Verify now**
- Back in **Domain** tab, click **Verify now** (`satorial/src/components/ecommerce/StoreDomainSettings.jsx:21` `EcommerceService.verifyDomain`). You’ll see “Verification queued. Polling…”. After ~2s it fetches fresh store; if `domain_verified` green ✅, you’re done. If “Not verified yet. Check DNS propagation.” → wait and retry.

**Propagation:** DNS can take 5 minutes to 2 hours. Even after you add records, they may not be visible worldwide yet. Hourly beat will auto-verify; you can also click **Verify now** multiple times.

**Step 4 — Test**
- Path `https://sartorialsmart.com/store/<slug>` should still work.
- Subdomain `https://<slug>.sartorialsmart.com` should still work.
- Custom `https://shop.adabyada.com/` (note trailing `/` only) should now show your storefront without `/store/<slug>` prefix. Try `https://shop.adabyada.com` → catalog loads via middleware `request.store` resolved as `custom_domain` (mode `custom_domain`).
- API direct: `GET https://api.sartorialsmart.com/api/v1/ecommerce/storefront/catalog/?store=shop.adabyada.com` should return `{store:{…}, products:[…]}`.

**Check via shell (operator):**
```bash
python manage.py shell
from ecommerce.models import Store
s = Store.objects.get(slug='adas-atelier')
print(s.verification_txt_name)  # _sartorial-verify.shop.adabyada.com
print(s.domain_verification_token)  # sartorial-verify-91e8dc...
print(s.cname_target)  # cname.sartorialsmart.com
print(s.domain_verified, s.domain_verified_at)
# DNS check (needs dnspython):
python manage.py shell -c "from ecommerce.services.store_service import verify_store_domain; from ecommerce.models import Store; import sys; s=Store.objects.get(slug=sys.argv[1]); print(verify_store_domain(s))" adas-atelier
# Or shell dig:
dig TXT _sartorial-verify.shop.adabyada.com +short
dig CNAME shop.adabyada.com +short
```

**SSL (https):**
- **Cloudflare for SaaS (recommended):** Operator sets `cname.sartorialsmart.com` as SaaS origin; when merchant CNAMES to it, Cloudflare auto-provisions a cert for `shop.merchant.com` (orange-cloud, “SSL → Full”). Zero per-store Let’s Encrypt.
- **Let’s Encrypt:** Operator runs `certbot --nginx -d shop.merchant.com` after verification; needs to repeat per domain (not scalable, but works for few).
- Until cert is issued, `https://shop.merchant.com` may show cert warning; verification itself does not require https — TXT still works over DNS.

**Switching / removing:** To revert to path/subdomain, clear the custom_domain field (set null) and Save — backend clears `domain_verified/token` (`ecommerce/models/store.py:104`). Products stay.

#### Verification failure cases

| Symptom | Cause | Fix |
|---|---|---|
| “No custom domain set” on Verify | You clicked Verify before Save | Save domain first |
| Verify returns `verified: false` persistently | TXT not found / typo / propagation | `dig TXT _sartorial-verify.…` — does it match token exactly? No extra spaces. Check host is `_sartorial-verify.shop` not `shop`. Wait 30m and retry. |
| `dnspython not installed` | Dev fallback returns False | `pip install dnspython` on backend (`sartorial-BE` requirement) |
| `DisallowedHost` | `ALLOWED_HOSTS` missing `*` | `core/settings.py:37` must contain `*` or explicit domain; verify `ALLOWED_HOSTS` env |
| Custom domain blocked | Tried `foo.sartorialsmart.com` | Use subdomain mode, not custom, for that host |
| Apex CNAME not allowed | Provider rejects `CNAME @` | Use subdomain `shop.` or provider’s ALIAS/CNAME-flattening to `cname.sartorialsmart.com` |

---

### Day-to-day stewardship

| Task | Where | Notes |
|---|---|---|
| Add item for sale | Inventory → Products → New product → Publish | Pick category → pick inventory → price auto-fills → pick sizes → image preview → Publish |
| Price change | Products → Edit → price → Save | Explicit price overrides `selling_price`; triggers `sync_inventory_to_external` if sync enabled |
| Add photo later | Product → Edit → paste `image_url` → Save | Replaces cover `WebImage`; if blank, inherited photo stays |
| Change sizes | Product → Edit → sizes multi-select → Save | Creates additional `WebVariant` rows if multi-size and single variant existed |
| Stock dispense | Inventory → Dispense / Orders → Materials → Dispense | `DispenseInventory.save:135` `select_for_update()` safe |
| View orders | `/store/orders` | Filter `store, status`; `StoreOrders.jsx` |
| Fulfill | Order → PATCH status `fulfilled` | Optionally sync to Shopify/Woo |
| Sync failure | `/store/integrations` → DLQ table | `resolved` toggle, `last_synced_at` |
| Reconcile | Automatic 02:00 WAT | Manual trigger: `celery call ecommerce.tasks.reconciliation.reconcile_external_inventory` |
| Domain verify | Settings → Storefront → Domain → Verify now | Check `dig TXT _sartorial-verify....` |
| Inactive store | General → `is_active off` | Hides from catalog, keeps data |

Script helpers:

```bash
# Pending domains
python manage.py shell -c "from ecommerce.tasks.domain_tasks import verify_pending_domains; verify_pending_domains.delay()"
# Force sync one product
python manage.py shell -c "from ecommerce.tasks.sync_tasks import sync_product_to_external; sync_product_to_external.delay('product-uuid','shopify')"
# Check wiring of a product
python manage.py shell -c "from ecommerce.models import WebProduct; p=WebProduct.objects.select_related('inventory','production_order').prefetch_related('web_images','variants').first(); print(p.title, p.slug, list(p.web_images.values_list('cloudinary_url', flat=True)), list(p.variants.values('sku_code','size','price','inventory_quantity')))"
```

---

### Deployment for customizations

Theme is **hot-reload** — `Store.theme` JSON is returned on every `catalog` call; `StorefrontCatalog.jsx:20` applies `primary/background/font/banner/cardStyle/customCss` inline, no rebuild. Steps to deploy a new customization option:

1. **Backend model** (if new key needs validation): extend `Store.theme` handling in `ecommerce/models/store.py:10` / `ecommerce/api/serializers.py:1` `StoreSerializer.theme` (already `JSONField` — schemaless, no migration for new keys).
2. **Admin UI** `StoreAppearanceEditor.jsx:1` — add control (e.g. `borderRadius` slider) and include in `theme` payload.
3. **Public renderer** `StorefrontCatalog.jsx:20` — read `theme.newKey` and apply `<style>` or `style={{}}`.
4. **Build frontend** `npm run build` + deploy `satorial/dist`. Backend not needing deploy if only JSON key.

For a **new domain mode** (e.g. `store_slug.app.sartorialsmart.com`), add root to `ECOMMERCE_SUBDOMAIN_ROOTS` env and `core/settings.py`.

For **new inventory fields** (e.g. `fabric_type`): add to `inventories/models.py:74`, expose in `inventories/serializers.py:Category`, ensure `AvailableInventoryAPIView` selects it, update `ProductEditor` options label and `StorefrontCatalog` card to show it.

---

### Troubleshooting & FAQ

**Q: “I should create a store in settings, yet I couldn’t find anywhere”** → Settings → Storefront (`/settings/storefront`) — `SettingsSideBarLayout.jsx:19` now has Storefront. Also `/store/settings` works (`EcommerceSideBarLayout`).

**Q: `/store/products` has no sidebar/header?** Fixed via `EcommerceSideBarLayout` (`satorial/src/components/navs/EcommerceSideBarLayout.jsx:1`); all `/store/*` now have `Header`+`Sidebar`.

**Q: Custom domain `DisallowedHost`?** `ALLOWED_HOSTS` must contain `*` (or explicit domain) — `core/settings.py:37` now `*, .sartorialsmart.com`. Middleware uses `META` to avoid premature `get_host()` check. Also install `dnspython`.

**Q: TXT verified but custom domain still not resolving?** Check `CNAME` points to `cname.sartorialsmart.com` (`dig CNAME shop.…`), `is_active=True`, `domain_verified=True`. Try API `GET /storefront/catalog/?store=shop.…` vs visiting host directly — latter needs middleware host header.

**Q: Shopify HMAC 403?** Ensure `ExternalStoreConfig.webhook_secret` equals shop’s secret and payload is raw `request.body` base64 sha256.

**Q: Catalog empty?** Check `WebProduct.status=published`, at least one `WebVariant` with `stock_available>0`, `Store.is_active=True`, `?store=<correct slug>`. New: if you just created product but inventory quantity is 0, it’s filtered — confirm `Inventory.quantity>0`. Also ensure variants were wired (check `WebProductSerializer` `variants` not empty; if empty and price not set, catalog will be empty until stock variants exist).

**Q: Catalog shows “One Size” instead of XL?** Ensure `ProductionOrder.size_category` or `Inventory.size_category` is set to real size (not blank/One Size). Backend `get_available_sizes` prefers real size over generic (`ecommerce/api/serializers.py:207`). If you picked sizes in ProductEditor multi-select, verify product has variants with those sizes (`python manage.py shell` check).

**Q: Product card shows no image?** Check `Inventory.image_url` is set (from Production) or you pasted `image_url` in ProductEditor. Backend `_wire_product_image` only inherits if product currently has no images — if you previously saved with blank image and no inventory photo, add photo and click Save again, or manually `POST /images/`.

**Q: Price shows “Price on request” or wrong?** `WebProductSerializer.price` needs either variant price or inventory `selling_price`. If Inventory has no `selling_price` and you left ProductEditor price blank, no price exists — fill Price field explicitly (e.g. 45000) and Save → backend creates variant with that price.

**Q: Inventory category dropdown empty?** Ensure you have `InventoryCategory` rows created by your org (`create_by=org`). API `GET /ecommerce/inventory-categories/` is org-scoped; creating categories under different user won’t appear.

**Q: Payment webhook not marking PAID?** Verify `PAYSTACK_SECRET_KEY` matches `PaymentGatewayConfig.secret_key` (or `cfg.test_mode`), signature `sha512(body, secret)`, `gateway_ref` matches order.

**Q: Sync errors?** `/store/integrations` → DLQ → `error_message/stack_trace`; often rate limit — tasks auto-retry 5m×3.

**Q: Stock mismatch after webhook?** Check `WebVariant.inventory_item` FK vs `inventory_quantity` — `stock_available` prefers FK. Reconciliation logs at 02:00 WAT.

**Permissions:** Catalog public `AllowAny`; admin `IsAuthenticated + IsOrganizationOrStaffUser` + `store.organization==get_organization_user(user)`. Platform `HasPlatformAccess` unchanged.

---

### Reference

**Env:**
```
ALLOWED_HOSTS, ECOMMERCE_CNAME_TARGET, ECOMMERCE_SUBDOMAIN_ROOTS, PAYSTACK_SECRET_KEY, FLUTTERWAVE_WEBHOOK_SECRET, CELERY_BROKER_URL, CLOUD_NAME/API_KEY/API_SECRET, REDIS_URL
```

**Key URLs (updated):**
- Admin CRUD ` /api/v1/ecommerce/stores/` / `products/` / `variants/` / `images/` (`IsAuthenticated`) — `ecommerce/api/urls.py:43`
- Helpers `GET /api/v1/ecommerce/available-inventory/?category=&search=&in_stock=` + `GET /api/v1/ecommerce/inventory-categories/` (`IsAuthenticated`) — new in 2.2 (`ecommerce/api/views.py:121`)
- Public `GET /api/v1/ecommerce/storefront/catalog/?store=<slug|domain>&search=&is_featured=` (`AllowAny`) — includes `price/available_sizes/size_category/inventory_selling_price`
- Detail `GET /api/v1/ecommerce/storefront/products/<slug>/?store=<slug>` + `GET /ecommerce/storefront/stores/resolve/?host=<host>` (`AllowAny`)
- Checkout `POST /api/v1/ecommerce/storefront/orders/` / `.../orders/<id>/pay/`
- Webhooks `POST /api/v1/ecommerce/webhooks/{shopify,woocommerce,paystack,flutterwave}/`
- Domain `POST /api/v1/ecommerce/stores/<id>/domains/verify/` + store CRUD holds `verification_txt_name/cname_target/tagline`

**Models:** `ecommerce/models/store.py:18`, `catalog.py:8`, `orders.py:7`, `integrations.py:9` + `inventories/models.py:42` (+ `image_url:74` + `size_category:78`) + `production/models.py:10` (+ `image_url:115` + `size_category:98`).

**Frontend key files (updated):**
- `satorial/src/components/ecommerce/ProductEditor.jsx:1` (category + inventory Selects, price auto-fill, sizes multi-select, image_url preview)
- `satorial/src/components/ecommerce/StoreAppearanceEditor.jsx:1`, `StoreDomainSettings.jsx:1`
- `satorial/src/pages/storefront/StorefrontCatalog.jsx:20` (real sizes + price fallback), `ProductDetail.jsx:34` (price + sizes + gender_target)
- `satorial/src/pages/dashboard/store/StoreProducts.jsx:1`, `StoreSettings.jsx:1`, `StoreIntegrations.jsx:1`
- `satorial/src/services/EcommerceService.jsx:1` (`availableInventory`, `inventoryCategories`, `catalog`, `verifyDomain`), `satorial/src/services/InventoryService.jsx` (params)

**File creation date:** Generate `python manage.py makemigrations` then `migrate` after any model change; frontend `npm run build` for any `StoreAppearanceEditor` / `StorefrontCatalog` / `ProductEditor` change.

For help, follow this guide top-to-bottom; for new orgs, path-mode works without DevOps, custom domains only need the two DNS records above (TXT + CNAME) and one **Verify now** click.


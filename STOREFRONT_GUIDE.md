# Sartorial Smart — Self-Hosted Storefront Guide
## Complete Tutorial: Deploy, Customize, and Manage Your Organization Storefront (Shopify / WooCommerce Aware)

**Version:** 2.1 • **Stack:** `Django 6 + DRF + Celery + Postgres` (`sartorial-BE/ecommerce`) ↔ `Vite + React 19 + AntD` (`satorial`)
**Last verified:** `manage.py check` + `vite build` passing. Contents match `ecommerce-plan.txt:1` and `ecommerce/models/store.py:10`.

---

### Table of Contents
1. [What you are getting](#what-you-are-getting)
2. [Mental model (ERP → Storefront)](#mental-model)
3. [Prerequisites](#prerequisites)
4. [Backend deployment (one-time, DevOps)](#backend-deployment)
5. [Frontend deployment (one-time)](#frontend-deployment)
6. [Organization guide — Create your store](#create-your-store)
7. [Manage the store (settings, appearance, domain)](#manage-the-store)
8. [Sell finished inventory: products, variants, images](#sell-finished-inventory)
9. [Orders, checkout & payments (Paystack/Flutterwave)](#orders-checkout--payments)
10. [Shopify & WooCommerce sync (two-way)](#shopify--woocommerce-sync)
11. [Domain modes — path, subdomain, custom domain](#domain-modes)
12. [Day-to-day stewardship](#day-to-day-stewardship)
13. [Deployment for customizations (theme hot-reload)](#deployment-for-customizations)
14. [Troubleshooting & FAQ](#troubleshooting--faq)
15. [Reference — API & environment](#reference)

---

### What you are getting

A **single Django app** `ecommerce` (`sartorial-BE/ecommerce/apps.py:4`) adds:

- **Storefront identity** `Store` — one per `CustomUser.role==Organization` (`users/models.py:53`). Holds `store_name`, `store_slug` (unique), optional `custom_domain` (verified), `currency NGN`, `logo`, `theme JSON`, `is_active`. Powers three URL modes without code changes.
- **Catalog** `WebProduct` + `WebImage` + `WebVariant` (`ecommerce/models/catalog.py:8`) — self-hosted “Product/Variant” that links to finished `inventories.Inventory` (`inventories/models.py:42` + `sku:61` + `selling_price:71`) and optionally `production.ProductionOrder` for provenance. Only `status==published` + has-stock are public.
- **Orders** `CustomerOrder` + `OrderItem` (`ecommerce/models/orders.py:7`) with Paystack/Flutterwave `gateway_ref`, atomic `select_for_update()` decrements.
- **External sync** `ExternalStoreConfig` + `SyncErrorLog` (`ecommerce/models/integrations.py:9`) with encrypted credentials (`payments/encryption.py:47`), Celery `40/m` Shopify GraphQL + Woo ` /batch` adapters, `default_retry_delay 5m ×3`, DLQ, and `02:00 WAT` reconciliation.
- **Resolution** `ecommerce/middleware/store_resolution.py:14` `StoreResolutionMiddleware` — reads `HTTP_HOST` (not `get_host()` to allow custom domains before `ALLOWED_HOSTS` wildcard) and sets `request.store` for `custom_domain` → `subdomain` → `path` fallback.
- **Frontend** public `StorefrontCatalog`/`ProductDetail`/`Cart`/`Checkout` (themed) + admin `StoreProducts`/`StoreOrders`/`StoreIntegrations`/`StoreSettings` (tabs General/Appearance/Domain) inside `EcommerceSideBarLayout` (`satorial/src/components/navs/EcommerceSideBarLayout.jsx:1`) and alias `/settings/storefront` inside `SettingsSideBarLayout`.

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

Flow: `Inventory` (finished) → `WebProduct` (title/desc, publish) → `WebVariant` (price/stock per SKU) → public catalog `GET /api/v1/ecommerce/storefront/catalog/?store=<slug|domain]` → `Checkout` → `Paystack/Flutterwave webhook` → atomic decrement.

---

### Prerequisites

**Operator (deploy):** `Python 3.12+`, `Postgres 14+`, `Redis 7+`, `Node 20+`, `Cloudinary` account, `Paystack` + `Flutterwave` test keys, DNS access (for `*.sartorialsmart.com` + optional TXT), domain for custom domains, `SSL` (Cloudflare SaaS or `Let's Encrypt`).

**Organization (merchant):** `Organization` login, at least one finished `Inventory` item with `selling_price` and `quantity>0` (`/inventory/list/overview`).

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
python manage.py makemigrations ecommerce  # already: ecommerce/migrations/0001_initial.py
python manage.py migrate
python manage.py check  # should say "System check identified no issues (1 silenced)."
```

New tables: `ecommerce_store`, `ecommerce_webproduct`, `ecommerce_webimage`, `ecommerce_webvariant`, `ecommerce_customerorder`, `ecommerce_orderitem`, `ecommerce_externalstoreconfig`, `ecommerce_syncerrorlog`.

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
```

---

### Frontend deployment (one-time)

```bash
cd sartorial
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
3. **Create form** (`satorial/src/pages/dashboard/store/StoreSettings.jsx:36`): `Store name` (e.g. “Ada’s Atelier”), optional `Slug` (auto slugifies `store_name` if blank; `ecommerce/models/store.py:10` loop ensures uniqueness; reserved `api, admin, store, www, cname` blocked), `Currency` (NGN/USD/GHS), `Description`. Click **Create store**. One store per org initially (enforced `StoreAdminAPIView.post`).
4. You now have: Path `https://sartorialsmart.com/store/<slug>` and Subdomain `https://<slug>.sartorialsmart.com` active immediately — no DNS needed. Test: open `https://<slug>.sartorialsmart.com` — `StoreResolutionMiddleware` will resolve `sub` before hitting DB.

Manage later under **Dashboard → Ecommerce Storefront** card (`satorial/src/pages/dashboard/DashboardLayout.jsx:111`) or Settings.

---

### Manage the store

Tabs in `StoreSettings` (`Tabs` General/Appearance/Domain):

**General:** edit `store_name/slug/currency/description/is_active`. Saving does `PUT /ecommerce/stores/<id>/` (`satorial/src/services/EcommerceService.jsx:1` `updateStore`). `is_active=False` hides from all catalogs.

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

**Domain:** see next section.

---

### Sell finished inventory: products, variants, images

Prereq: Create finished goods via **Inventory → List → Add** (`/inventory/list/overview`) with `SKU`, `selling_price`, `quantity`, `category`. Or **Production → Orders** → `Completed` → `Add to Inventory` creates the same row.

**1. Products** (`/store/products` → `StoreProducts` + `ProductEditor` `satorial/src/components/ecommerce/ProductEditor.jsx:1`):
- Click **New product** → pick **Store**, `Title` (“Agbada 2.0”), `Description`, **Link finished Inventory** (searchable `Select` of `InventoryService.listInventory` filtered to org; only `selling_price` not null should appear), `Status` `draft/published/archived`, `Featured` switch.
- `POST /ecommerce/products/` (`WebProductAdminAPIView.post`) validates `store.organization==org` and auto-slugifies. Signal `ecommerce/signals.py:10` enqueues `sync_product_to_external.delay` if `published` and any `ExternalStoreConfig.sync_enabled`.
- Table shows `Title/Slug/Status/Featured/Stock` (`WebProductSerializer.current_stock` sums `variants` or `inventory.quantity`).

**2. Variants** (per SKU: `satorial/src/services/EcommerceService.jsx:1` `createVariant`):
- Inside product detail, add **Variant**: `sku_code` must match `Inventory.sku`, `color`, `size` (`ProductionOrder.size_category` values `S/M/L/One Size`), `price`, `compare_at_price`, `inventory_quantity` (if not linking `inventory_item`), `weight`, `is_active`. Unique per `(web_product, sku_code)`.
- `WebVariant.stock_available` (`ecommerce/models/catalog.py:8`) prefers `inventory_item.quantity` if FK set, else `inventory_quantity`. Public catalog skips variants with 0.

**3. Images:** `POST /ecommerce/products/<id>/images/` → `WebImage` (`cloudinary_url`, `display_order`). Ordered `display_order` (cover is `[0]`).

**Publish:** set product `status=published` → `is_published=True` (`WebProduct.save`). Only published + has-stock appear in `GET /ecommerce/storefront/catalog/?store=<slug>` (`storefrontCatalogListView:236`). Draft remains admin-only.

**Workflow tip:** After `Inventory` quantity changes (e.g. production completion), `WebVariant.post_save` fires `sync_inventory_to_external` per enabled platform.

---

### Orders, checkout & payments

**Catalog (public):** `StorefrontCatalog` fetches `EcommerceService.catalog({store, search})` (`AllowAny`). Response `{store:{...theme...}, products:[...variants...]}` — already filtered for stock (`storefrontCatalogListView` filters before `CustomPagination`). Paginated via `common/pagination.py:4`.

**Cart:** localStorage `ecom_cart` (`StorefrontCatalog → addToCart`, `Cart.jsx`, `Checkout.jsx`). No server reservation.

**Checkout** (`/store/<slug>/checkout` or `/checkout`):
- Form `name/email/phone/address/gateway` → `POST /ecommerce/storefront/orders/` (`CheckoutAPIView:330`) with `{store, items:[{variant_id|sku_code, quantity}], customer, shipping_address}`. Validates `select_for_update()` stock, creates `CustomerOrder` (`status=pending, payment_status=PENDING, gateway_ref=ref_...`, `total_amount` computed, `order_number ORD-<SLUG>-<hex>`), plus `OrderItem`(s) snapping `unit_price`.
- Next: `POST /ecommerce/storefront/orders/<id>/pay/` (`OrderPayInitAPIView`) with `gateway` fallback to `PaymentGatewayConfig.get_active()` (`payments/models.py:16`). Returns mock `authorization_url` `https://checkout.<gateway>.com/pay/<ref>` in dev; in prod, calls `requests.post https://api.paystack.co/transaction/initialize` with `cfg.secret_key`.

**Payment webhooks** (`AllowAny` + HMAC):
- Paystack `POST /ecommerce/webhooks/paystack/` (`PaystackWebhookView`) checks `HTTP_X_PAYSTACK_SIGNATURE` `hmac.sha512(body, secret)` where `secret = PaymentGatewayConfig.secret_key || settings.PAYSTACK_SECRET_KEY`. On `charge.success`, idempotent via `payments/models.py:84` `WebhookEvent (gateway+event_id)`, `select_for_update()` `CustomerOrder` → `PAID` → loop `OrderItem` → decrement `Inventory` or `WebVariant` atomically, mark `WebhookEvent.processed`.
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

**Outbound (ERP → remote):** `WebProduct.save → post_save` + `WebVariant.post_save` (`ecommerce/signals.py:10`) → `ecommerce/tasks/sync_tasks.py:9` `sync_product_to_external` / `sync_inventory_to_external` with `retry 5m×3`, `SyncErrorLog` on `MaxRetries`.

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

**A. Path (default):** `https://sartorialsmart.com/store/<store_slug>` — always works, no DNS.

**B. Subdomain:** `https://<store_slug>.sartorialsmart.com` — needs wildcard `*.sartorialsmart.com → <LB IP>` + `*.sartorialsmart.com` cert. No per-store config; create store and it works because `StoreResolutionMiddleware` checks `host.endswith("."+root)` for each `ECOMMERCE_SUBDOMAIN_ROOTS`.

**C. Custom domain:** e.g. `shop.merchant.com`

1. Admin → **Settings → Storefront → Domain** → input `shop.merchant.com` → **Save** → row saves `Store.custom_domain` lowercased, generates `domain_verification_token` (`sartorial-verify-<hex>`) if not exists (`ecommerce/models/store.py:22`).
2. DNS (merchant):
   - `TXT _sartorial-verify.shop.merchant.com = sartorial-verify-<hex>`
   - `CNAME shop.merchant.com → cname.sartorialsmart.com` (or `A` if apex — but CNAME preferred).
3. Click **Verify now** → `POST /ecommerce/stores/<id>/domains/verify/` → `domain_tasks.verify_store_domain_task.delay` → `store_service.verify_store_domain` does `dns.resolver.resolve TXT` (needs `dnspython`; if not installed, dev fallback returns False — install `pip install dnspython`). On match, sets `domain_verified=True`, `domain_verified_at=now`. Hourly beat `verify_pending_domains` retries.
4. Middleware `StoreResolutionMiddleware` now matches `Store.custom_domain==host AND domain_verified` first (before subdomain). Frontend `axiosConfig` still hits same API; `StorefrontCatalog` can also be called via `?store=shop.merchant.com` or via `Host: shop.merchant.com` (middleware path). For public visitors, `https://shop.merchant.com/store/<slug>` is not needed — `https://shop.merchant.com/` alone resolves.

**Deployed example** (`test-ecom-store`):
- Path `https://sartorialsmart.com/store/test-ecom-store` ✓
- Subdomain `https://test-ecom-store.sartorialsmart.com` ✓
- Custom `shop.example.com` → TXT `_sartorial-verify.shop.example.com=sartorial-verify-91e8dc...` + CNAME `shop.example.com→cname.sartorialsmart.com` → Verify ✓

Check: `python manage.py shell` → `Store.objects.get(slug='...').verification_txt_name / cname_target`.

---

### Day-to-day stewardship

| Task | Where | Notes |
|---|---|---|
| Add item for sale | Inventory → Products → New product → Publish | Link Inventory, variants, images |
| Price change | Products → Variant → price → Save | Triggers `sync_inventory_to_external` if sync enabled |
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
```

---

### Deployment for customizations

Theme is **hot-reload** — `Store.theme` JSON is returned on every `catalog` call; `StorefrontCatalog.jsx:20` applies `primary/background/font/banner/cardStyle/customCss` inline, no rebuild. Steps to deploy a new customization option:

1. **Backend model** (if new key needs validation): extend `Store.theme` handling in `ecommerce/models/store.py:10` / `ecommerce/api/serializers.py:1` `StoreSerializer.theme` (already `JSONField` — schemaless, no migration for new keys).
2. **Admin UI** `StoreAppearanceEditor.jsx:1` — add control (e.g. `borderRadius` slider) and include in `theme` payload.
3. **Public renderer** `StorefrontCatalog.jsx:20` — read `theme.newKey` and apply `<style>` or `style={{}}`.
4. **Build frontend** `npm run build` + deploy `satorial/dist`. Backend not needing deploy if only JSON key.

For a **new domain mode** (e.g. `store_slug.app.sartorialsmart.com`), add root to `ECOMMERCE_SUBDOMAIN_ROOTS` env and `core/settings.py`.

---

### Troubleshooting & FAQ

**Q: “I should create a store in settings, yet I couldn’t find anywhere”** → Settings → Storefront (`/settings/storefront`) — `SettingsSideBarLayout.jsx:19` now has Storefront. Also `/store/settings` works (`EcommerceSideBarLayout`).

**Q: `/store/products` has no sidebar/header?** Fixed via `EcommerceSideBarLayout` (`satorial/src/components/navs/EcommerceSideBarLayout.jsx:1`); all `/store/*` now have `Header`+`Sidebar`.

**Q: Custom domain `DisallowedHost`?** `ALLOWED_HOSTS` must contain `*` (or explicit domain) — `core/settings.py:37` now `*, .sartorialsmart.com`. Middleware uses `META` to avoid premature `get_host()` check.

**Q: Shopify HMAC 403?** Ensure `ExternalStoreConfig.webhook_secret` equals shop’s secret and payload is raw `request.body` base64 sha256.

**Q: Catalog empty?** Check `WebProduct.status=published`, at least one `WebVariant` with `stock_available>0`, `Store.is_active=True`, `?store=<correct slug>`.

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

**Key URLs:**
- Admin CRUD ` /api/v1/ecommerce/stores/` / `products/` / `variants/` / `images/` (`IsAuthenticated`)
- Public `GET /api/v1/ecommerce/storefront/catalog/?store=<slug|domain>&search=&is_featured=` (`AllowAny`)
- Checkout `POST /api/v1/ecommerce/storefront/orders/` / `.../orders/<id>/pay/`
- Webhooks `POST /api/v1/ecommerce/webhooks/{shopify,woocommerce,paystack,flutterwave}/`

**Models:** `ecommerce/models/store.py:10`, `catalog.py:8`, `orders.py:7`, `integrations.py:9`.

**File creation date:** Generate `python manage.py makemigrations` then `migrate` after any model change; frontend `npm run build` for any `StoreAppearanceEditor` / `StorefrontCatalog` change.

For help, follow this guide top-to-bottom; for new orgs, path-mode works without DevOps, custom domains only need the two DNS records above.


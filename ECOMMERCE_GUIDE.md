# Sartorial E-commerce Module — Simple English Guide

**For:** Organizations (store owners), Staff, Customers, and Developers who are new to the e-commerce module.
**Version:** 1.0 • **Last updated:** 2026-09-15 • **Companion:** `STOREFRONT_GUIDE.md` (technical tutorial, v2.2)

> This guide explains the **whole** e-commerce module in simple words. No hard jargon. If you can use Inventory and Production, you can use the Store.

---

### Table of Contents
1. [What is the e-commerce module?](#what-is-it)
2. [The pieces — plain English](#the-pieces)
3. [How it all works together](#how-it-works)
4. [For Organization: Start to finish](#for-organization)
   - [4.1 Create your store](#create-store)
   - [4.2 Make your store look nice (Appearance)](#appearance)
   - [4.3 Add products to sell (the new wiring)](#add-products)
   - [4.4 Publish and check your storefront](#publish)
   - [4.5 Take orders and get paid](#orders)
   - [4.6 Connect Shopify or WooCommerce (optional)](#connect-sync)
5. [For Customers: How to shop](#for-customers)
6. [Custom domain — connect your own website name](#custom-domain)
   - [6.1 What is a custom domain and why use it?](#what-is-custom)
   - [6.2 The three ways to open your store](#three-ways)
   - [6.3 Step-by-step: Set up your custom domain](#step-by-step)
   - [6.4 What happens after you click Verify?](#what-happens-verify)
   - [6.5 DNS examples for popular providers](#dns-examples)
   - [6.6 How long does it take?](#how-long)
   - [6.7 If verification fails — checklist](#verify-fails)
   - [6.8 Apex vs subdomain (which name to use?)](#apex-vs-subdomain)
   - [6.9 SSL / https (the lock icon)](#ssl)
   - [6.10 Operator curiosity — how verification really works](#how-verification-works)
7. [For Developers / DevOps — quick map](#for-developers)
8. [FAQ — quick answers](#faq)
9. [Reference — where to look in code](#reference)

---

### What is it? <a id="what-is-it"></a>

The **e-commerce module** lets an **Organization** (a fashion business on Sartorial ERP) sell its **finished goods** (ready-made inventory like “Agbada 2.0 — XL — Blue”) to the public on the internet.

Think of it like this:

- **Sartorial ERP** is your factory + warehouse. It knows what you made, how many you have, and where it is.
- The **e-commerce module** is your **shop window**. It shows only what you choose to sell, with price and photo, and lets customers pay.
- It has **one Django app** called `ecommerce` (`sartorial-BE/ecommerce`). Inside it has folders for `models`, `api`, `services`, `integrations`, `webhooks`, `tasks`, `middleware`. All share the same `Store` and `Product`.
- The **frontend** (`satorial/src`) has two parts: (a) **public storefront** (`/store/<slug>`, anyone can view) and (b) **admin area** (`/store/products`, `/store/orders` etc., only your org can manage).

You do **not** need Shopify or WooCommerce to use it. The self-hosted storefront works alone. Shopify/Woo sync is optional — for orgs that already have a shop there and want stock to stay in sync both ways.

---

### The pieces — plain English <a id="the-pieces"></a>

| Piece | What it is (simple) | Where you see it | Real file |
|---|---|---|---|
| **Store** | Your shop’s identity. Like a shop name + address on the street. One per Organization for now. Holds name, slug (URL part), currency, logo, colors, custom domain. | `Settings → Storefront` → General tab. Frontend: `satorial/src/pages/dashboard/store/StoreSettings.jsx` | `sartorial-BE/ecommerce/models/store.py:18` |
| **WebProduct** | One thing you sell, e.g. “Agbada 2.0”. It **links** to a finished `Inventory` item (your real stock). Without a link it’s just a manual listing. | `Store → Products` → Add product | `ecommerce/models/catalog.py:8` |
| **WebVariant** | The **size/color/price** of a product, e.g. `AGB-BLU-XL` → XL → ₦45,000 → 20 in stock. Old word for this is SKU. One product can have many variants (XL, XXL). | Inside Product detail → Variants table; on storefront as size tags | `ecommerce/models/catalog.py:105` |
| **WebImage** | The photo you show customers. It points to a Cloudinary URL. First image is the cover. | On storefront card + product detail | `ecommerce/models/catalog.py:91` |
| **CustomerOrder + OrderItem** | An order a customer placed + each line (which variant, how many, price). Has `order_number` like `ORD-ADAS-91E8DC`. | `/store/orders` for org; `/checkout` for customer | `ecommerce/models/orders.py:7` |
| **ExternalStoreConfig** | Connection to Shopify or WooCommerce (store URL + encrypted keys). | `/store/integrations` | `ecommerce/models/integrations.py:8` |
| **SyncErrorLog** | “Dead letter” box — when sync to Shopify/Woo fails after 3 retries, error goes here for you to fix. | `/store/integrations` → Sync errors table | `ecommerce/models/integrations.py:56` |
| **StoreResolutionMiddleware** | The traffic cop. Looks at the **website name** visitors typed and decides which Store to show. | Auto (you never click it) | `ecommerce/middleware/store_resolution.py:14` |

**Inventory glue (new wiring, Sep 2026):**

- `Inventory` (`inventories/models.py:42`) now has `image_url` (photo) and `size_category` (XL/XXL etc.) → copied from `ProductionOrder` when you click “Complete → Add to Inventory”.
- When you create a `WebProduct` from that inventory, the **photo and price and size flow automatically** — you don’t re-upload.

---

### How it all works together <a id="how-it-works"></a>

```
Production (make clothes) ──size + photo──▶ Inventory (finished stock)
                                                        │
                         Category + search + price ───────┤
                                                        ▼
                                              WebProduct (+ Variants + Image)
                                                   │ published?
                                   ┌───────────────┼────────────────┐
                                   ▼               ▼                ▼
                            Path mode       Subdomain      Custom domain
                     sartorialsmart.com/store/adas  adas.sartorialsmart.com  shop.adabyada.com
                                   │               │                │
                                   └───────┬───────┴────────────────┘
                                           ▼
                                    StorefrontCatalog (public, filtered to in-stock)
                                           │
                                    Cart (localStorage) → Checkout → Order (pending)
                                           │
                                    Paystack / Flutterwave webhook → PAID → stock decrements
                                           │
                                    Admin → Fulfilled
                                           │
                                    Optional → Sync → Shopify / WooCommerce
```

- Only `published` products with `stock > 0` appear in the catalog (`ecommerce/api/views.py:564`).
- Cart is in browser only until checkout; stock check happens atomically at checkout (`select_for_update`).
- Payments: two gateways, both supported from day one; webhooks are idempotent.

---

### For Organization: Start to finish <a id="for-organization"></a>

#### 4.1 Create your store <a id="create-store"></a>

1. Log in as **Organization**.
2. Go to **Settings → Storefront** (`/settings/storefront`). Alias `/store/settings` also works.
3. You will see **Create your storefront** card if you have no store yet.
   - `Store name` — e.g. “Ada’s Atelier” (required).
   - `Slug (URL)` — auto-filled from name as `adas-atelier` (lowercase + hyphens). You can edit. Reserved words like `api`, `admin`, `store`, `www` are blocked (`ecommerce/models/store.py:9`).
   - `Currency` — NGN / USD / GHS.
   - `Description` — short what you sell.
4. Click **Create store**. Done. You now have:
   - Path: `https://sartorialsmart.com/store/adas-atelier`
   - Subdomain: `https://adas-atelier.sartorialsmart.com` (works instantly, no DNS).
5. Later to edit: same page → tabs **General / Appearance / Domain** (`satorial/src/pages/dashboard/store/StoreSettings.jsx:378`). Deleting is allowed only if you have no products/orders yet.

If you see an error “Organization already has a store” — you are in single-store mode (1 per org) — update the existing one instead.

#### 4.2 Make your store look nice (Appearance) <a id="appearance"></a>

- Go to **Domain tab → Appearance** or `StoreAppearanceEditor` (`satorial/src/components/ecommerce/StoreAppearanceEditor.jsx`).
- Pick `Primary / Secondary / Accent` colors (ColorPicker), `Background`, `Font` (Inter/Poppins/Playfair etc.), `Logo URL` (Cloudinary), `Banner URL` (hero top), `Hero layout` (centered/split/full/minimal), `Card style` (rounded/sharp/elevated), `SEO title/description`, optional `Custom CSS`.
- Click **Save appearance** → `EcommerceService.updateStore` stores it as `Store.theme` JSON (`ecommerce/models/store.py:58`). Open `https://.../store/<slug>` in new tab — changes show **immediately**, no rebuild.
- Click **Preview storefront** any time.

#### 4.3 Add products to sell (the new wiring) <a id="add-products"></a>

This is where the Sep 2026 improvements live. **Watch for 4 fields:** **Category**, **Inventory**, **Price**, **Sizes**, **Image**.

**Before you start:** Ensure you have finished goods with stock.

- Option A: **Production → Orders → Completed → Add to Inventory** — this is best because it copies `size_category` (e.g. XL) and `image_url` (photo) automatically to `Inventory`.
- Option B: **Inventory → List → Add** → fill `item_name`, `sku`, `category`, `quantity (>0)`, `selling_price`, plus `image_url` and `size_category` if you have them.

**Now create the storefront listing:**

1. Go to **Ecommerce → Products** (`/store/products`, layout `EcommerceSideBarLayout` `satorial/src/components/navs/EcommerceSideBarLayout.jsx`).
2. Header shows “Adding products to **{store_name}** `/store/<slug>`” and Active tag.
3. Click **Add product** → modal `ProductEditor` (`satorial/src/components/ecommerce/ProductEditor.jsx`).
4. **Inventory category (filter)** dropdown — topmost. It loads from `GET /ecommerce/inventory-categories/` with counts (`InventoryCategory?with_counts`, `EcommerceService.inventoryCategories`). Pick e.g. “Agbada (12)”. Leave empty to see all.
5. **Link finished Inventory** dropdown — searchable, shows `Agbada 2.0 — AGB-BLU-XL (20 pcs) · Agbada · XL · ₦45000` (`satorial/src/components/ecommerce/ProductEditor.jsx:100`). It only shows ready-made with `quantity>0` (`in_stock=true` default, `ecommerce/api/views.py:159`). You can clear selection for a manual product.
6. **Title** — e.g. “Agbada 2.0” (required). Slug auto from title if blank.
7. **Description** — optional.
8. **Price (₦)** — **Watch this:** if you left it empty, it **auto-fills** from the selected inventory’s `selling_price` (`satorial/src/components/ecommerce/ProductEditor.jsx:115` watches `inventory`). You can type a custom storefront price to override (e.g. promo). On save, backend `_wire_product_pricing` (`ecommerce/api/views.py:283`) creates/updates `WebVariant(price=…)` so storefront shows correct `₦`.
9. **Available sizes** — multi-select for `XXXS … XXXXL, One Size, Custom` (`SIZE_CATEGORIES`). **Pick the real sizes you made** (e.g. `XL`, `XXL`). Leave empty and backend will use `ProductionOrder.size_category` / `Inventory.size_category` automatically. Each size becomes one `WebVariant` row (`ecommerce/api/views.py:409`). Storefront shows these as tags, not generic “One Size” (`satorial/src/pages/storefront/StorefrontCatalog.jsx:82`).
10. **Product image** — input + live preview. Three behaviors:
    - Paste a Cloudinary URL → that **replaces** the cover `WebImage`.
    - Leave blank and product has **no image yet** → **inherits** `Inventory.image_url` (which came from `ProductionOrder.image_url`) automatically (`ecommerce/api/views.py:229`).
    - Leave blank and product **already has** image → keeps existing.
    Preview tells you which source is shown: “Custom”, “Inherited from production / inventory”, or “Current storefront image”.
11. **Status** — `Draft` (hidden) / `Published` (visible if in stock) / `Archived`. `Featured` switch.
12. Click **Save**. Message “Product created/updated”. Table refreshes.

**What the backend did quietly:**
- `_wire_product_image` upserts `WebImage(cloudinary_url=…, display_order=0)`.
- `_wire_product_pricing` resolves `price = explicit > inventory.selling_price`, resolves `sizes = explicit list > production_order.size_category > One Size`, creates one `WebVariant` per size with `price`, `inventory_quantity = inventory.quantity`, `size`, and deduplicated `sku_code` (e.g. `AGB-BLU-XL`).

**Manual variant control (advanced):** If you need per-size color/price/bespoke SKU, use API directly or future VariantManager: `POST /ecommerce/products/<id>/variants/` with `sku_code, color, size, price, compare_at_price, inventory_quantity, weight`.

**Images separately:** `POST /ecommerce/products/<id>/images/` → `WebImage` ordered by `display_order` (cover = 0). Most stores never need this because of auto-wire.

#### 4.4 Publish and check your storefront <a id="publish"></a>

- Set product to **Published** and **Save**. Only `status==published` + any variant (or inventory) with `stock_available > 0` appears in `GET /ecommerce/storefront/catalog/?store=<slug>` (`ecommerce/api/views.py:600`).
- Visit `https://sartorialsmart.com/store/<your-slug>` or `https://<slug>.sartorialsmart.com`.
- `StorefrontCatalog` (`satorial/src/pages/storefront/StorefrontCatalog.jsx`) shows: hero (banner with gradient `primary`), logo, search box, card grid. Each card: cover photo, `title`, `description` slice, `Featured` tag, `₦price` (fallback `price → inventory_selling_price → variants[0].price`), size tags (`available_sizes` then `size_category` then variant sizes, filtering `One Size` when real size exists), variant-specific tags when multiple sizes, `gender_target` tag.
- Click product → `ProductDetail` (`satorial/src/pages/storefront/ProductDetail.jsx`) shows full `status`, `current_stock`, `price`, `sizes`, `gender`, `production_order_title`, variant picker (`sku/size/color/price/stock_available`), and **Add to cart**.

#### 4.5 Take orders and get paid — includes where Paystack goes + cart details <a id="orders"></a>

**Important first:** The person who **pays** is the shopper (customer). The person who **receives money and should set up Paystack** is the **Organization (you, the store owner)**, not the shopper. Shoppers never enter Paystack keys — they just type card details on Paystack’s page. Read next paragraphs if you expected a “Settings → Paystack” box and didn’t find it — you are not alone.

**Where Paystack is set up today (platform-level, gap):**
- The code has **one global** Paystack config `PaymentGatewayConfig` (`sartorial-BE/payments/models.py:16`) with `test_secret_key/live_secret_key/test_public_key/live_public_key/webhook_secret/is_active/test_mode`, unique per `gateway` (paystack or flutterwave), single-active invariant (`models.py:60`). Only **Platform Super Admin** can edit it (`payments/admin_views.py:1` `IsSuperAdmin`, URLs `platform_admin/urls.py:239` `payment-gateways/<gateway>/…`, `PaymentGatewayDetail/Activate/TestConnection/GenerateWebhookSecret`). Secrets are encrypted (`EncryptedTextField`), masked as `••••abcd` on read (`serializers.py:21`).
- There is **no per-organization UI** in `StoreSettings/StoreIntegrations` (`satorial/src/services/EcommerceService.jsx:1` `ECOMMERCE` endpoints `apiEndpoints.jsx:403` expose nothing for org Paystack). Ecommerce’s `OrderPayInitAPIView` (`ecommerce/api/views.py:800` line `PaymentGatewayConfig.get_active()`) falls back to that active platform gateway if `gateway` not passed — so **every store shares the same platform Paystack account**.
- **Result:** All shoppers pay into the **platform’s Paystack settlement account**. The operator must settle to each org manually (bank transfer). This is fine for pilot but not scale. Paystack’s `paystack.py:29` `initialize_transaction` payload currently sends only `email, amount*100, reference, callback_url, metadata, plan` — no `subaccount/split` field, and `ecommerce/api/views.py:830` comment acknowledges the real `requests.post https://api.paystack.co/transaction/initialize` would need a store-specific key. Webhooks at `POST /ecommerce/webhooks/paystack/` (`ecommerce/webhooks/payments.py:18`) also verify with `PaymentGatewayConfig.secret_key || settings.PAYSTACK_SECRET_KEY` only.
- **What you should expect next (recommended fix):** Add **per-store payout** fields — e.g. `Store.paystack_subaccount_code` + `paystack_split_code` or a new `StorePaymentConfig(organization FK, encrypted paystack_secret_key/paystack_public_key/webhook_secret)` allowing `get_active(org)` to return org’s config, then checkout does `subaccount = store.paystack_subaccount_code || org_config.subaccount` and sends `subaccount, bearer` to Paystack init (`payments/gateways/paystack.py:29` extended). New UI would be **Settings → Storefront → Payments tab**: paste `sk_live_…`, `pk_live_…`, generate webhook secret, show webhook URL `https://api.sartorialsmart.com/api/v1/ecommerce/webhooks/paystack/` to paste into `dashboard.paystack.com` → **Test connection**. Until that ships, ask your platform admin to activate the central gateway via `PATCH /api/v1/admin/payment-gateways/paystack/` then `POST .../activate/` and `POST .../test-connection/`, and settle manually.
- **If you are the platform admin today:** Get keys from `dashboard.paystack.com` (Settings → API Keys), copy webhook URL from `GET /api/v1/admin/payment-gateways/paystack/` (`webhook_url` field `serializers.py:53`), paste it in Paystack dashboard webhooks set `charge.success`, set Env `PAYSTACK_SECRET_KEY` as fallback, set `test_mode false` when ready.

**Public flow (including cart — you asked):**
1. **Catalog:** shopper opens `sartorialsmart.com/store/<slug>` (or `shop.yourdomain.com` or `<slug>.sartorialsmart.com` `StorefrontCatalog.jsx:9` resolves `storeParam = storeSlug || ?store || hostname.split(".")[0]`) → `EcommerceService.catalog({store: storeParam, search})` (`AllowAny`) → shows `StorefrontCatalog` grid (hero, search, cards with `₦price` + `available_sizes`).
2. **Add to cart:** on `ProductDetail.jsx:18` shopper sees variant Tag list (`sku/size/color/price/stock_available` `ProductDetail.jsx:57`), clicks one Tag to set `selected`, clicks **Add to cart** → check `if(!selected) message.warning`, then `cart=JSON.parse(localStorage.getItem("ecom_cart")||"[]"); cart.push({variant_id: selected.id, sku_code, title: product.title, price: selected.price, quantity:1, store: storeParam}); localStorage.setItem("ecom_cart", JSON.stringify(cart))` `message.success`. The cart is **localStorage key `ecom_cart`**, so no login, survives tab close, key is per browser. Adding same variant twice pushes a **second line** (not deduplicated) — qty 1+1 as two entries. First item’s `store` anchors whole cart to that store.
3. **Cart page:** `/cart` or link from catalog (`Cart.jsx:1`). On mount `useEffect(()=>setCart(JSON.parse(localStorage.getItem("ecom_cart")||"[]")))` (`Cart.jsx:8`). Shows AntD `List` with `InputNumber min=1` per line (`Cart.jsx:23`), `Remove` button (`Cart.jsx:14` filters index), `updateQty(idx,qty)` (`Cart.jsx:10` splices and re-persists). Total computed `cart.reduce((s,it)=>s+Number(it.price)*it.quantity,0)` (`Cart.jsx:16`). Empty shows `No items in cart. Browse store`. Checkout link goes to `/store/${cart[0]?.store || "store"}/checkout` (`Cart.jsx:31`) — so multi-store carts are assumed **single-store**; mixing stores gives 404 on second variant.
4. **Checkout:** `/store/<slug>/checkout` or `/checkout` (`Checkout.jsx:1`) — AntD Form `name/email/phone/address/gateway` (paystack/flutterwave `Select` default paystack `Checkout.jsx:45`). On submit → `cart=JSON.parse...` → guard empty → `store=cart[0].store` → `items=cart.map(c=>({variant_id, sku_code, quantity}))` → `EcommerceService.checkout({store, items, customer:{name,email,phone}, shipping_address:{address}, gateway})` → `POST /ecommerce/storefront/orders/` (`CheckoutAPIView:684` `select_for_update` stock check; insufficient → `400 Insufficient stock for ... (have N)`; otherwise creates `CustomerOrder` `status pending, payment_status PENDING, gateway_ref ref_<12hex>, total_amount, order_number ORD-<SLUG>-<hex>` + `OrderItem`s snapping `unit_price`) → on success `message.success Order <order_number> created` → `EcommerceService.payOrder(order.id, {gateway, email})` → `POST /ecommerce/storefront/orders/<id>/pay/` (`OrderPayInitAPIView:800` falls back to `PaymentGatewayConfig.get_active()`, needs email else `400 email required`, reuses `order.gateway_ref` or makes new, save) → returns `{authorization_url, reference, gateway, order_number}` (dev mock `https://checkout.<gateway>.com/pay/<ref>`, prod would `POST https://api.paystack.co/transaction/initialize` with `email, amount*100, reference, metadata, subaccount` via `payments/gateways/paystack.py:29`). If URL exists `window.location.href = authorization_url`; else clears `localStorage.removeItem("ecom_cart")` and shows `Order placed. Pay on delivery` (`Checkout.jsx:26`).
5. **Payment succeeds:** Paystack redirects to `callback_url` (configured when `get_gateway(config).initialize_transaction` is called with plan/metadata), then calls webhook `POST /ecommerce/webhooks/paystack/` (or Flutterwave `verif-hash`) → verify HMAC `x-paystack-signature=hmac.sha512(body, secret)` where `secret = PaymentGatewayConfig.secret_key || settings.PAYSTACK_SECRET_KEY` (`ecommerce/webhooks/payments.py:18`) / Flutterwave `verif-hash==webhook_secret` (`payments.py:106`), lookup `CustomerOrder` by `gateway_ref` with `select_for_update`, idempotent via `WebhookEvent(gateway, event_id).get_or_create` (`payments/models.py:84` `uniq_gateway_event`), set `payment_status=PAID, status=paid`, loop `OrderItems` decrement `Inventory.quantity` if `variant.inventory_item_id` else `WebVariant.inventory_quantity`, mark `processed=True`.
6. **You fulfill:** In `/store/orders` (`StoreOrders.jsx:1` → `GET /ecommerce/admin/orders/` with `IsAuthenticated + IsOrganizationOrStaffUser`, org scoped) see `Order # / Customer / Total / Payment / Status / Gateway / Date`. New `PAID` orders stand out green Tag. Update `PATCH /ecommerce/admin/orders/<id>/ {status: "fulfilled"}` when shipped. Status `pending/paid/fulfilled/cancelled/refunded`, payment `PENDING/PAID/FAILED`.
7. **Test locally:** see `STOREFRONT_GUIDE.md` snippet — forge `x-paystack-signature` with `PAYSTACK_SECRET_KEY` + body.

**If you expected a per-store Paystack box:** It doesn’t exist yet. Tell your developer to add `StorePaymentConfig` as described, or for now treat platform as paymaster and settle externally. Do **not** put shopper Paystack keys anywhere — shopper only enters card on Paystack checkout page.

#### 4.6 Connect Shopify or WooCommerce (optional) <a id="connect-sync"></a>

> **You can skip this whole section** if you only want to sell on your Sartorial storefront (`sartorialsmart.com/store/your-shop`). This is only for shops that **already have a Shopify or WooCommerce shop** and want the two shops to stay in sync so you do not type the same product twice.

**In plain English:** Think of Sartorial as your factory and warehouse. Shopify is another shop window on a different street. Connecting them means: when you publish a dress in Sartorial it **automatically appears** in Shopify, and when someone **buys** it on Shopify your Sartorial stock **goes down by itself**. You save time and you never oversell.

**For Shopify — 6 simple steps (no coding):**

**Step 1 — Copy your Shopify shop address**
Your Shopify address looks like `https://mymagicalshop.myshopify.com`. Log in to Shopify and copy it from the top bar. Keep it.

**Step 2 — Create a safe password so Sartorial can talk to Shopify**
In Shopify click: `Settings` (bottom left) → `Apps and sales channels` → `Develop apps` → `Create an app` → name it `Sartorial Sync` → click `Configure Admin API scopes` → turn ON `read and write` for `Products`, `Inventory` and `Orders` → `Save` → click `Install app`.
Shopify will show you a long secret called `Admin API access token` starting with `shpat_...`. **Copy it** — this is the password Sartorial will use. On the same page you may also see `API key` and `API secret` — copy them too if shown. For `Webhook secret` just pick a private word you will remember, e.g. `mysecret2026`.

**Step 3 — Paste that info into Sartorial**
In Sartorial log in as **Organization** → go to **Store → Integrations** (`/store/integrations`).
Fill the form in plain words:
- `Store` — pick your Sartorial store name (e.g. “Ada’s Atelier”) from the list.
- `Platform` — pick `shopify`.
- `Store URL` — paste your full Shopify address from Step 1, like `https://mymagicalshop.myshopify.com` (keep the `https://`, no `/` at the end).
- `Access token` — paste the long `shpat_...` token from Step 2.
- `API key / API secret` — paste if Shopify gave them, otherwise leave empty.
- `Webhook secret` — paste the same secret word you chose in Step 2 (e.g. `mysecret2026`).
- `Enabled` and `Sync enabled` — two on/off switches. Turn **both ON**.

Click **Save**. If you see “Saved”, you are connected. Sartorial hides your secrets after saving and shows only `****abcd` — that is normal and safe. If you see an error, check the URL and token are complete.

**Step 4 — Tell Shopify to send a message to Sartorial when someone pays (one time)**
In Shopify: `Settings` → `Notifications` → scroll to `Webhooks` → `Create webhook` → `Event` choose `Order payment` (sometimes called `orders/paid`) → `URL` paste exactly `https://api.sartorialsmart.com/api/v1/ecommerce/webhooks/shopify/` → `Secret` paste the same `webhook_secret` from Step 2 → `Save`.

**Step 5 — Publish one product and test**
In Sartorial: `Store → Products` → open a product → make sure `Status` is `Published` and quantity is more than `0` → `Save`. Wait 1–2 minutes → open Shopify `Products` → you should see the same product appear. Try a test purchase on Shopify → back in Sartorial check `Inventory` — the quantity should have gone down by 1, and the order shows in `Store → Orders`.

**Step 6 — If something does not appear**
In Sartorial go to `Store → Integrations` → scroll to `Sync errors` table at the bottom. If there is a red line it tells you the problem in simple words, e.g. “wrong token” or “shop not found”. Fix the token/URL and click Save again. Sartorial will try again automatically 3 times, waiting 5 minutes each time.

**What happens automatically after you connect (you do not need to click anything):**
- You publish or change a product in Sartorial → it copies to Shopify within a minute.
- A customer pays on Shopify → Sartorial lowers the stock right away so you do not sell what you do not have.
- Every night at 2am Sartorial double-checks that Shopify stock matches Sartorial stock and shows any mismatch in the `Sync errors` table for you to fix.

**For WooCommerce — same idea, different menu names:**
In your WordPress site: `WooCommerce` → `Settings` → `Advanced` → `REST API` → `Create an API key` → copy `Consumer Key` and `Consumer Secret` → paste them into Sartorial’s Integrations form as `API key` / `API secret`. `Store URL` is your website like `https://example.com`, `Platform` choose `woocommerce`, and use the secret word you chose for `Webhook secret`. Then tell Woo to send messages: `WooCommerce` → `Settings` → `Advanced` → `Webhooks` → `Add webhook` → `Topic: Order created` → `Delivery URL: https://api.sartorialsmart.com/api/v1/ecommerce/webhooks/woocommerce/` → paste the same `webhook secret` → `Save`.

**To disconnect:** In `Store → Integrations` click `Delete` on that connection. Your Sartorial products stay, they just stop copying to Shopify.

---

### For Customers: How to shop — cart deep-dive <a id="for-customers"></a>

This is **exactly how the shopping cart works** today — no account needed, no app needed.

1. **Open your store:** via path `sartorialsmart.com/store/<slug>` or subdomain `<slug>.sartorialsmart.com` or custom `shop.yourdomain.com`. The `StorefrontCatalog.jsx:9` line `storeParam = storeSlug || searchParams.get("store") || window.location.hostname.split(".")[0]` decides which store; then `EcommerceService.catalog({store: storeParam, search})` fetches public catalog (`AllowAny`).

2. **Browse + search:** Cards show cover photo (first `WebImage` or “No image”), `title`, `description` slice, `Featured` Tag, `₦price` (fallback `price || inventory_selling_price || variants[0].price` `StorefrontCatalog.jsx:82`), size Tags (first 3 of `available_sizes` etc.). Search bar calls `fetchCatalog(search)`; empty shows `Empty`.

3. **On detail — pick a variant:** `ProductDetail.jsx:1` fetches `EcommerceService.productDetail(productSlug, {store: storeParam})`. You see `Status/Stock/Price/Sizes/Gender/Production batch` (`ProductDetail.jsx:33`). Below, `Variants` Tags show each `sku_code — size/color — ₦price (stock_available in stock)` (`ProductDetail.jsx:57`). You **must click a Tag** to set `selected` (blue). **Add to cart** button (`ProductDetail.jsx:18`) does: check `if(!selected) message.warning("Select a variant")`; else `cart=JSON.parse(localStorage.getItem("ecom_cart")||"[]"); cart.push({variant_id: selected.id, sku_code, title: product.title, price: selected.price, quantity:1, store: storeParam}); localStorage.setItem("ecom_cart", JSON.stringify(cart)); message.success("Added to cart")`. First cart item’s `store` locks cart to that store; adding same variant twice creates **two lines** (no dedup, qty 1 + 1).

4. **Cart page — see/change what you picked:** Go to `/cart` (`Cart.jsx:1`, `App.jsx:228`). On mount (`Cart.jsx:8`) `setCart(JSON.parse(localStorage.getItem("ecom_cart")||"[]"))`. Render AntD `List` (`Cart.jsx:23`) with `List.Item.Meta title=title, description= sku_code — ₦price` plus `InputNumber min=1 value=quantity onChange→updateQty(idx, v)` (`Cart.jsx:10` splices and re-persists) and **Remove** (`Cart.jsx:14` filters that index). Footer computes `total=cart.reduce((s,it)=>s+Number(it.price)*it.quantity,0)` (`Cart.jsx:16`) and shows `Total: ₦{total.toFixed(2)}` plus link `<Link to=/store/${cart[0]?.store || "store"}/checkout>` (`Cart.jsx:31`). Empty cart shows `<Card>No items in cart. Browse store</Card>`. **Note:** cart survives page refresh and tab close because `localStorage`; it does **not** reserve stock — two shoppers can cart the last item, first to checkout wins (`select_for_update` check).

5. **Checkout — finish:** Open `/store/<slug>/checkout` or `/checkout` (`Checkout.jsx:1` AntD Form `name/email/phone/address/gateway` `Select` paystack/flutterwave). **Place order & Pay** (`Checkout.jsx:9` `handleCheckout`) does: guard `cart empty → warning`; `store=cart[0].store; items=cart.map(c=>({variant_id, sku_code, quantity}))`; `POST /ecommerce/storefront/orders/` → on `400 Insufficient stock` shows error; else `POST /storefront/orders/<id>/pay/` with `gateway,email`; if `authorization_url` returned → `window.location.href = authorization_url` (Paystack page); else clears `localStorage.removeItem("ecom_cart")` and says `Order placed. Pay on delivery` (`Checkout.jsx:26`). After payment webhook marks `PAID`, stock decrements atomically and order shows in `/store/orders`.

6. **Mixing stores:** The app assumes one store per cart (`store = cart[0].store`). Putting items from `adas-atelier` and `bobs-atelier` into same cart would send mixed `variant_id`s under first store’s `store` param; backend returns `Variant X not found (404)` for the foreign variants. For now shoppers should finish one store’s checkout before opening another’s storefront.

---

### Custom domain — connect your own website name <a id="custom-domain"></a>

> This is the **enhanced custom domain section**. Read entirely if you want your shop to appear as `shop.yourdomain.com` instead of `sartorialsmart.com/store/...`.

#### 6.1 What is a custom domain and why use it? <a id="what-is-custom"></a>

A **custom domain** is a website name you **buy** and **own**, like `adabyada.com`, `shop.adabyada.com`, `store.naijafashion.ng`. When you connect it, customers visit **your** name — not `sartorialsmart.com` — and see your storefront. Example: `https://shop.adabyada.com` shows the same products as `https://sartorialsmart.com/store/adas-atelier`, but URL says your brand.

**Benefits:** brand trust, easy to share, professional email `info@adabyada.com` can match, SEO control.

You need to **own** a domain. Buy one from any provider (Namecheap, GoDaddy, Cloudflare, Google Domains/Squarespace, Name.com, etc.). If you don’t want to, you can use path or subdomain — they work with zero extra DNS.

#### 6.2 The three ways to open your store <a id="three-ways"></a>

| Way | Example URL | Where customers type it | DNS work? | Extra cost? |
|---|---|---|---|---|
| **Path** (default, zero DNS) | `https://sartorialsmart.com/store/adas-atelier` | `sartorialsmart.com/store/<slug>` | None — always works | No |
| **Subdomain** (under our platform) | `https://adas-atelier.sartorialsmart.com` | `<slug>.sartorialsmart.com` | Done once by operator (wildcard `*.sartorialsmart.com`) | No |
| **Custom domain** (your name) | `https://shop.adabyada.com` | `shop.adabyada.com` (or `www.` / apex) | You add 2 records: **TXT** + **CNAME** | You pay provider for domain |

All three show the **same** store — switching does not recreate products. Path and subdomain go live **instantly** after you create a store. Custom needs the two DNS records + **Verify now** click.

#### 6.3 Step-by-step: Set up your custom domain <a id="step-by-step"></a>

> Follow in order. You only need access to where you bought your domain (your DNS dashboard). No server changes.

**A. In Sartorial — Save your domain**

1. Log in as **Organization**.
2. Go to **Settings → Storefront → Domain** (`StoreDomainSettings` `satorial/src/components/ecommerce/StoreDomainSettings.jsx`).
3. In the **Custom domain (merchant-owned)** box, type your full subdomain: e.g. `shop.adabyada.com`. Rules: **lowercase**, **no `https://`**, **no trailing slash**, **no spaces**. Example wrong: `HTTPS://Shop.Adabyada.com/` → right: `shop.adabyada.com`.
4. Click **Save** (`EcommerceService.updateStore(store.id, {custom_domain})`).  
   Backend (`ecommerce/models/store.py:90`) lowercases, validates it’s a real domain (`FQDN_RE`), generates token `sartorial-verify-<16 hex>` if none, and shows you the **two DNS instructions** with your real token (e.g. `sartorial-verify-91e8dc4a9b2c101a`).

   You will see:
   - `TXT record: _sartorial-verify.shop.adabyada.com = sartorial-verify-91e8dc4a9b2c101a`
   - `CNAME: shop.adabyada.com → cname.sartorialsmart.com`

   Keep this page open — you will copy those two values.

**B. In your DNS provider — Add the two records**

Log into where you bought `adabyada.com`. Find **DNS Management / DNS Settings / Advanced DNS / Custom Records**.

- **Record 1 — TXT (proof you own the domain):**
  - Type: `TXT`
  - Name / Host: `_sartorial-verify.shop` (some panels want full `_sartorial-verify.shop.adabyada.com.` — either works, trailing dot ok)
  - Value / Content / Points to: `sartorial-verify-91e8dc4a9b2c101a` (exact token, no quotes, no spaces)
  - TTL: Automatic or 3600.

- **Record 2 — CNAME (where shop visitors go):**
  - Type: `CNAME`
  - Name / Host: `shop` (some panels want `shop.adabyada.com.`)
  - Value / Target / Points to: `cname.sartorialsmart.com` (exact, some panels add trailing `.` → `cname.sartorialsmart.com.` is same)
  - TTL: Automatic or 3600.
  - **Proxy**: If you use Cloudflare, set proxy to **DNS only (grey cloud)** for now. Orange-cloud works too if using Cloudflare for SaaS (see [SSL](#ssl)).

  Save both records. The dashboard should list them.

**C. In Sartorial — Verify now**

1. Back in **Domain** tab, click **Verify now** (`StoreDomainSettings.jsx:21` → `EcommerceService.verifyDomain` → `POST /ecommerce/stores/<id>/domains/verify/`).
2. You will see “Verification queued. Polling…”. After ~2 seconds it refetches your store. If `Verified: ✅ Verified` green Tag, done. If `Pending` orange and message “Not verified yet. Check DNS propagation.” → wait and retry.

**D. Test it**

- `https://sartorialsmart.com/store/adas-atelier` — still works.
- `https://adas-atelier.sartorialsmart.com` — still works.
- `https://shop.adabyada.com` — **without** `/store/...` — should now show your storefront. Try API too: `https://api.sartorialsmart.com/api/v1/ecommerce/storefront/catalog/?store=shop.adabyada.com` should return `{store: {store_slug: "adas-atelier", …}, products: [...]}`.

**Check helper (operator):**

```bash
python manage.py shell
from ecommerce.models import Store
s = Store.objects.get(store_slug='adas-atelier')
print(s.verification_txt_name)        # _sartorial-verify.shop.adabyada.com
print(s.domain_verification_token)    # sartorial-verify-91e8dc...
print(s.cname_target)                 # cname.sartorialsmart.com
print(s.domain_verified, s.domain_verified_at)
```

DNS CLI check:

```bash
dig TXT _sartorial-verify.shop.adabyada.com +short
# → "sartorial-verify-91e8dc4a9b2c101a"

dig CNAME shop.adabyada.com +short
# → cname.sartorialsmart.com.
```

#### 6.4 What happens after you click Verify? <a id="what-happens-verify"></a>

1. Your browser calls `POST /ecommerce/stores/<id>/domains/verify/` (`ecommerce/api/views.py:86` `StoreDomainVerifyAPIView`). It queues `verify_store_domain_task.delay(store.id)` via Celery (`ecommerce/tasks/domain_tasks.py:10`).
2. Worker runs `verify_store_domain(store)` (`ecommerce/services/store_service.py:4`): it looks up **TXT** at `_sartorial-verify.<your-domain>` using `dns.resolver.resolve(TXT, lifetime=5)` (needs `dnspython` package). It reads every TXT value; if any equals your token, success.
3. On match: sets `domain_verified=True`, `domain_verified_at=now`, saves (`store.save(update_fields=[...])`). Every future request whose `Host: shop.adabyada.com` hits `StoreResolutionMiddleware` (`ecommerce/middleware/store_resolution.py:48` — custom domain checked **first**, only if verified + active) → `request.store` set to your store; `StorefrontCatalogListView` uses that store even without `?store=` param.
4. If TXT not found (yet), returns false — `domain_verified` stays false. The hourly task `verify_pending_domains` (`ecommerce/tasks/domain_tasks.py:24`) retries all unverified domains, so eventual propagation will auto-pass even if you don’t click again.

Frontend helpers `verification_txt_name` + `cname_target` (`ecommerce/api/serializers.py:15`, `ecommerce/models/store.py:113`) give exact copy buttons in `StoreDomainSettings`.

#### 6.5 DNS examples for popular providers <a id="dns-examples"></a>

> Panel names differ — look for **DNS**, **Advanced DNS**, **Custom Records**, **Manage Domains**.

- **Cloudflare** (recommended):  
  DNS → Add record → `Type TXT` → Name `_sartorial-verify.shop` → Content `sartorial-verify-…` → TTL Auto → Save.  
  Add record → `Type CNAME` → Name `shop` → Target `cname.sartorialsmart.com` → Proxy `DNS only` (grey) initially; set to `Proxied` (orange) only if operator uses Cloudflare for SaaS. Save.

- **Namecheap**:  
  Domain List → Manage → Advanced DNS → Add New Record → `TXT Record` Host `_sartorial-verify.shop` Value `sartorial-verify-…` TTL Automatic → Save.  
  Add New Record → `CNAME Record` Host `shop` Value `cname.sartorialsmart.com.` TTL Automatic → Save (checkmark).

- **GoDaddy**:  
  My Products → DNS → Add → `Type TXT` Name `_sartorial-verify.shop` Value `sartorial-verify-…` TTL 1 Hour → Save.  
  Add → `Type CNAME` Name `shop` Value `cname.sartorialsmart.com` TTL 1 Hour → Save.

- **Google Domains / Squarespace Domains**:  
  DNS → Default name servers → Custom records → `TXT` Host `_sartorial-verify.shop` Text `sartorial-verify-…` → Add.  
  `CNAME` Host `shop` Points to `cname.sartorialsmart.com` → Add.

- **Route 53 (AWS)**: Hosted zone `adabyada.com` → Create record → Record name `_sartorial-verify.shop` → Type `TXT` → Value `"sartorial-verify-…"` (quoted) → Routing simple → Create.  
  Create record → `shop` → `CNAME` → Value `cname.sartorialsmart.com`.

#### 6.6 How long does it take? <a id="how-long"></a>

- Adding records is instant on your provider, but world-wide **propagation** takes **5 minutes to 2 hours** (TTL caching). Verification may pass on first click, or may need to wait.
- Hourly Celery beat auto-retries, so you don’t have to stay on page. You may click **Verify now** again every 15–30 min.
- Use `dig TXT _sartorial-verify.… +short` from your laptop to see if TXT is visible yet; if not, still propagating.

#### 6.7 If verification fails — checklist <a id="verify-fails"></a>

| What you see | Why | Fix |
|---|---|---|
| “No custom domain set on this store.” on Verify | Clicked before Save | Save domain first |
| Verify returns `verified: false` forever | TXT not found | `dig TXT _sartorial-verify.…` — does it show token exactly? No extra spaces/quotes? Name must be `_sartorial-verify.shop` not `shop`. Wait 30 min, retry |
| Token mismatch | Copy typo | Copy again from Sartorial Domain tab (copy button) |
| `dnspython not installed` | Backend missing dep | Operator: `pip install dnspython` on `sartorial-BE` (already in requirements) |
| `DisallowedHost` error in browser | `ALLOWED_HOSTS` missing `*` | Operator: set `ALLOWED_HOSTS=…,*,.sartorialsmart.com` (`core/settings.py:37`) |
| Custom domain blocked error | Tried `foo.sartorialsmart.com` | Use subdomain mode, not custom, for that (`ecommerce/models/store.py:84` blocks) |
| Apex `CNAME` rejected by provider | DNS spec | See next section — use subdomain `shop.` or provider’s `ALIAS`/`ANAME` |
| Still pending after hours | Propagation or cache | Delete and re-add record, check trailing dot, TTL, verify at `https://dns.google/resolve?name=_sartorial-verify.…&type=TXT` |

#### 6.8 Apex vs subdomain (which name to use?) <a id="apex-vs-subdomain"></a>

- **Subdomain** like `shop.adabyada.com` → **use CNAME** → simplest, always allowed.
- **Apex** like `adabyada.com` (no `shop.`) → DNS does **not** allow `CNAME @` in standard DNS. Some providers offer `ALIAS`, `ANAME`, or “CNAME flattening” (Cloudflare, Route53 alias, Namecheap? no) that let you point apex to `cname.sartorialsmart.com`. Or ask operator for an **A** record IP and use `A @ → <IP>`. If your provider doesn’t support alias, just use `shop.adabyada.com` and optionally redirect apex to shop.
- **Blocked:** You cannot use `*.sartorialsmart.com` as custom domain — it’s reserved for subdomain mode.

**Recommendation:** Use `shop.<yourdomain>` with CNAME.

#### 6.9 SSL / https (the lock icon) <a id="ssl"></a>

- **Option A — Cloudflare for SaaS (recommended, zero per-store cert work):** Operator sets `cname.sartorialsmart.com` as SaaS origin (orange-cloud, “SSL → Full”). When you CNAME `shop.adabyada.com` → `cname.sartorialsmart.com`, Cloudflare **auto-provisions** a cert for `shop.adabyada.com` in minutes. Best for many stores.
- **Option B — Let’s Encrypt per domain:** Operator runs `certbot --nginx -d shop.adabyada.com` on server after you verified. Needs repeat per domain, renewal via cron. Works for few stores.
- Until cert is ready, `https://shop.adabyada.com` may show warning; verification still works on DNS alone. Operator can keep apex http redirect until cert.

Verify with `curl -I https://shop.adabyada.com` → `200`, cert valid.

#### 6.10 Operator curiosity — how verification really works (10 lines) <a id="how-verification-works"></a>

```python
# sartorial-BE/ecommerce/services/store_service.py:4
def verify_store_domain(store) -> bool:
    txt_name = store.verification_txt_name  # _sartorial-verify.shop.merchant.com
    expected = store.domain_verification_token  # sartorial-verify-91e8dc...
    answers = dns.resolver.resolve(txt_name, "TXT", lifetime=5)
    txt_values = ["".join(rdata.strings) for rdata in answers]
    found = any(expected in v for v in txt_values)
    if found:
        store.domain_verified = True
        store.domain_verified_at = timezone.now()
        store.save(update_fields=[...])
    return found
# celery beats: ecommerce/tasks/domain_tasks.py:24 verify_pending_domains hourly
# middleware: ecommerce/middleware/store_resolution.py:48 custom_domain exact match first
```

For fallback without `dnspython`, dev returns false (no crash).

---

### For Developers / DevOps — quick map <a id="for-developers"></a>

**Models** (single app `ecommerce`):

- `ecommerce/models/store.py:18` `Store` — fields `store_name, store_slug(unique), custom_domain(unique nullable, lowercased, FQDN), domain_verification_token, domain_verified, is_active, currency, description, tagline, logo, theme JSON, seo`, prop `verification_txt_name`, `cname_target`, method `save()` slug loop + token gen.
- `ecommerce/models/catalog.py:8` `WebProduct` — `store FK, inventory FK nullable, production_order FK nullable, slug, title, status draft/published/archived, is_published sync, is_featured, created_by`, prop `current_stock`, save loop. `WebImage` ordered `display_order`. `WebVariant` unique `(web_product, sku_code)` with `sku_code, color, size, price, inventory_quantity, inventory_item FK`, prop `stock_available`.
- `ecommerce/models/orders.py:7` `CustomerOrder` — `store FK, order_number unique ORD-SLUG-HEX, status pending/paid/fulfilled/cancelled/refunded, payment_status PENDING/PAID/FAILED, gateway paystack/flutterwave/shopify/woocommerce/manual, gateway_ref unique, total_amount, currency, customer_*`, `OrderItem` with `erp_sku_code, quantity, unit_price, web_variant/product nullable`.
- `ecommerce/models/integrations.py:9` `ExternalStoreConfig` — `store FK, platform shopify/woocommerce, store_url, is_enabled, sync_enabled, settings JSON, encrypted access_token/api_key/api_secret/webhook_secret`, constraint `store+platform+url`. `SyncErrorLog` DLQ.
- Added on `inventories.Inventory` — `image_url, size_category`; `production.ProductionOrder` — `image_url`.

**APIs** (`ecommerce/api`):

- `StoreAdminAPIView` (`ecommerce/api/views.py:41`) — `GET /stores/`, `POST`, `PUT /stores/<id>/`, `DELETE`; enforces 1-per-org; `StoreDomainVerifyAPIView` `POST /stores/<id>/domains/verify/`.
- `WebProductAdminAPIView` (`ecommerce/api/views.py:211`) — `GET/POST /products/`, `PUT/DELETE /products/<id>/` with `_wire_product_image` (`views.py:229`) + `_wire_product_pricing` (`views.py:283`) + trigger sync on publish.
- `AvailableInventoryAPIView` (`views.py:121`) — `GET /ecommerce/available-inventory/?category=&search=&in_stock=` org-scoped `Inventory`.
- `AvailableInventoryCategoriesAPIView` (`views.py:183`) — categories with `item_count`.
- `StorefrontCatalogListView` (`views.py:564`) — `AllowAny` `GET /storefront/catalog/?store=<slug|domain>&search=&is_featured=` with prefetch, has_stock filter, pagination, exposes `store + products` with `price/available_sizes`.
- `StorefrontProductDetailView` (`views.py:631`), `StoreResolveView` (`views.py:651` `?host=`), `CheckoutAPIView` (`views.py:684`), `OrderPayInitAPIView` (`views.py:800`), `AdminOrderListView/DetailView`, `ExternalConfigAPIView`, `SyncErrorLogAPIView`.
- Serializers (`ecommerce/api/serializers.py:15`): `StoreSerializer` with `verification_txt_name, cname_target`, `WebProductSerializer` with `price, inventory_selling_price, size_category, gender_target, available_sizes, current_stock, production_order_title`, masked external creds. `WebProductSerializer.get_validators` removes UniqueTogether to allow auto-slug.
- URLs (`ecommerce/api/urls.py:43`): mounts `stores, products, variants, images, storefront/catalog, storefront/products/<slug>, storefront/stores/resolve, available-inventory, inventory-categories, storefront/orders, storefront/orders/<id>/pay, admin/orders, external-configs, sync-errors, webhooks/{shopify,woocommerce,paystack,flutterwave}`.
- Permissions (`ecommerce/api/permissions.py:50`): public catalog `AllowAny`, admin `IsAuthenticated + IsOrganizationOrStaffUser + store.organization==get_organization_user(user)`.

**Middleware** (`ecommerce/middleware/store_resolution.py:14`): `__call__` reads `META['HTTP_HOST']` → if `host in platform_hosts/api.sartorialsmart.com/localhost` bypass; try `Store(custom_domain==host, verified)` → mode `custom_domain`; loop `ECOMMERCE_SUBDOMAIN_ROOTS` (`sartorialsmart.com` default) → if `host.endswith(.root)` + single label + not `www/api/admin/cname` → `Store(store_slug=sub)` → mode `subdomain`; else `None` (view resolves via `?store=`).

**Tasks** (`ecommerce/tasks`): `sync_tasks.py` `sync_product_to_external / sync_inventory_to_external` with `bind True, retry 5m×3, rate_limit 40/m, MaxRetries→SyncErrorLog`; `domain_tasks.py` `verify_store_domain_task + verify_pending_domains` (hourly beat `core/settings.py:309`); `reconciliation.py` `pull_remote_inventory` bulk GET at 02:00 WAT.

**Integrations** (`ecommerce/integrations`): `base.py` interface, `shopify_adapter.py` GraphQL `40/m`, `woocommerce_adapter.py` `/batch` low-spec, `transformers.py` `ShopifyPayloadTransformer.transform_style` (maps `title, body_html, vendor, status, variants[{sku, option1=color, option2=size, price, inventory_management, inventory_quantities}]` per `ecommerce-implementation.md:36`).

**Webhooks** (`ecommerce/webhooks`): `shopify.py` HMAC `base64(sha256(body, secret))` vs `X-Shopify-Hmac-Sha256`, `woocommerce.py` hmac sha256 vs `X-Wc-Webhook-Signature`, `payments.py` Paystack `hmac.sha512(body, secret)` vs `X-Paystack-Signature`, Flutterwave `verif-hash`.

**Frontend map** (`satorial/src`):

- `services/EcommerceService.jsx` — all ecommerce calls (stores, verify, resolve, products/variants/images, availableInventory/inventoryCategories, catalog, checkout, pay, adminOrders, externalConfigs, syncErrors).
- `api/apiEndpoints.jsx` — `ECOMMERCE.STORES/PRODUCTS/VARIANTS/IMAGES/AVAILABLE_INVENTORY/INVENTORY_CATEGORIES/STOREFRONT/ADMIN_ORDERS/EXTERNAL/SYNC_ERRORS/WEBHOOKS`.
- `utils/axiosConfig.jsx` — `PUBLIC_ENDPOINTS` includes `storefront + webhooks` (no bearer).
- `pages/dashboard/store/` — `StoreSettings.jsx` (General/Appearance/Domain tabs, single-store UX, unwrapStores, HTTP error debug Alert), `StoreSettingsEcommerceDisplay.jsx` wrapper, `StoreProducts.jsx` (unwrapStores, add to {store_name}, empty → Create), `StoreOrders.jsx`, `StoreIntegrations.jsx`.
- `components/ecommerce/` — `ProductEditor.jsx` (category dropdown, price auto-fill, sizes multi, image_url preview), `StoreAppearanceEditor.jsx` (ColorPicker + theme JSON), `StoreDomainSettings.jsx` (path + subdomain + custom domain with copyable TXT/CNAME + Verify now).
- `components/navs/EcommerceSideBarLayout.jsx` — sidebar Products/Orders/Integrations/Store Settings/Help.
- `pages/storefront/` — `StorefrontCatalog.jsx` (theme, banner, search, cards with price + real sizes), `ProductDetail.jsx` (variant picker + price fallback), `Cart.jsx`, `Checkout.jsx`.
- `App.jsx` — public `/store/:storeSlug`, `/store/:storeSlug/product/:productSlug`, `/cart`, `/checkout` + protected `/store/*` + `/settings/storefront`.

**Settings** (`core/settings.py`): added `ecommerce` to `INSTALLED_APPS`, middleware, beat `ecommerce-reconciliation` + `verify-pending-domains`, `ALLOWED_HOSTS` env wildcard, `ECOMMERCE_CNAME_TARGET` default `cname.sartorialsmart.com`, `ECOMMERCE_SUBDOMAIN_ROOTS`.

---

### FAQ — quick answers <a id="faq"></a>

**Can I use store without Shopify/Woo?** Yes — self-hosted storefront works alone. Those syncs are extra.

**Do I need to create variants manually?** Usually no. Pick inventory + sizes + price in `ProductEditor`; backend creates variants for you. Manual variants are for special color/price per size.

**Why does catalog show “One Size” instead of XL?** Means your linked `Inventory.size_category` or `ProductionOrder.size_category` is empty or `One Size`. Set a real size on Production (XL/XXL…), complete to Inventory, then re-save product. Backend `get_available_sizes` will then surface XL instead of One Size.

**Why no image on storefront card?** Either your `Inventory.image_url` is empty and you left `image_url` blank. Fix: paste a Cloudinary URL in ProductEditor, or set `ProductionOrder.image_url` → re-complete → re-save product.

**Why does `Price on request` show?** Product has neither variant price nor `inventory.selling_price`. Fill Price in ProductEditor (e.g. 45000) and Save.

**Why does catalog stay empty after I publish?** Check: (1) `status=Published`, (2) `Store.is_active=True`, (3) at least one variant/inventory has `quantity > 0` (quantity 0 is filtered). Check `?store=<correct slug>`.

**Can I change my store slug later?** Yes — General tab. It changes your path/subdomain URL. Old slug stops working (no auto 301 yet — inform customers).

**Can I have two stores?** Not yet — 1 per Organization enforced. Code supports multi later (extend check in `StoreAdminAPIView.post`).

**Custom domain without buying?** No — you must own the domain. Use path/subdomain free.

**Apex `adabyada.com` with no subdomain?** Possible via provider’s `ALIAS/ANAME` to `cname.sartorialsmart.com` or ask operator for `A` record. Otherwise use `shop.adabyada.com` (simpler).

**How do I move custom domain to another store?** Clear it from old store (save null), set on new store, re-verify (new token). Only one store may claim a domain (`unique`).

**Payments look fake?** Dev returns mock `https://checkout.paystack.com/pay/<ref>`. In prod it calls Paystack init with `secret_key` from `PaymentGatewayConfig`. Finish prod wiring per `OrderPayInitAPIView`.

**Where do failed syncs go?** Table `Sync errors (DLQ)` in Integrations → check `error_message/stack_trace` → fix creds/rate → `resolved` toggle.

**Still stuck?** Follow `STOREFRONT_GUIDE.md` top-to-bottom; for DNS, check `dig TXT _sartorial-verify.…` and DevTools Network `GET /ecommerce/stores/`.

---

### Reference — where to look in code <a id="reference"></a>

- Env: `ALLOWED_HOSTS, ECOMMERCE_CNAME_TARGET, ECOMMERCE_SUBDOMAIN_ROOTS, PAYSTACK_SECRET_KEY, FLUTTERWAVE_WEBHOOK_SECRET, CELERY_BROKER_URL, CLOUD_NAME/API_KEY/API_SECRET, REDIS_URL` — `core/settings.py:37`.
- Key URLs:  
  `GET /ecommerce/stores/` | `POST /ecommerce/stores/` | `PUT /ecommerce/stores/<id>/` | `POST /ecommerce/stores/<id>/domains/verify/`  
  `GET /ecommerce/available-inventory/?category=&search=&in_stock=` | `GET /ecommerce/inventory-categories/`  
  `GET /ecommerce/products/?store=<id>` | `POST /ecommerce/products/` | `POST /ecommerce/products/<id>/variants/` | `POST /ecommerce/products/<id>/images/`  
  `GET /ecommerce/storefront/catalog/?store=<slug|domain>&search=&is_featured=` (public) | `GET /ecommerce/storefront/products/<slug>/?store=` (public) | `GET /ecommerce/storefront/stores/resolve/?host=`  
  `POST /ecommerce/storefront/orders/` | `POST /ecommerce/storefront/orders/<id>/pay/` | `GET /ecommerce/admin/orders/` (org)  
  `POST /ecommerce/webhooks/{shopify,woocommerce,paystack,flutterwave}/` (public + HMAC)  
  See `ecommerce/api/urls.py:43`, `ecommerce/webhooks/urls.py`, `satorial/src/api/apiEndpoints.jsx:403`.
- Models: `ecommerce/models/store.py:18`, `catalog.py:8`, `orders.py:7`, `integrations.py:9` plus `inventories/models.py:42`, `production/models.py:10`.
- Frontend: `satorial/src/pages/dashboard/store/StoreSettings.jsx:1`, `StoreProducts.jsx:1`, `components/ecommerce/ProductEditor.jsx:1` (category/price/sizes/image), `StoreDomainSettings.jsx:1`, `StoreAppearanceEditor.jsx:1`, `pages/storefront/StorefrontCatalog.jsx:1`, `services/EcommerceService.jsx:1`, `utils/axiosConfig.jsx:7`.
- Companion depth: `STOREFRONT_GUIDE.md` v2.2 — complete deployment, `ecommerce-plan.txt:1` (7 phases), `ecommerce-implementation.md` (payload transformer spec).

> **One-line takeaway:** *Link finished Inventory (with real size + photo + price + category) → ProductEditor wires it to a storefront product (photo + variant sizes + price) → publish → customers can buy via Paystack/Flutterwave; add `shop.yourdomain.com` via two DNS records + Verify now to brand your shop, or use path/subdomain instantly with no DNS.*


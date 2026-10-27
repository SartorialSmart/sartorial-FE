import React, { useState } from "react";
import { Card, Input, Button, Tag, Alert, Typography, Space, message } from "antd";
import EcommerceService from "../../services/EcommerceService";

const { Text, Paragraph } = Typography;

const StoreDomainSettings = ({ store, onUpdated }) => {
  const [customDomain, setCustomDomain] = useState(store?.custom_domain || "");
  const [verifying, setVerifying] = useState(false);

  const handleSaveDomain = async () => {
    try {
      const updated = await EcommerceService.updateStore(store.id, { custom_domain: customDomain || null });
      message.success("Domain saved. Add the DNS records below, then verify.");
      onUpdated?.(updated);
    } catch (e) {
      message.error(e.response?.data?.custom_domain?.[0] || e.response?.data?.error || "Failed to save domain");
    }
  };

  const handleVerify = async () => {
    setVerifying(true);
    try {
      await EcommerceService.verifyDomain(store.id);
      message.info("Verification queued. Polling...");
      setTimeout(async () => {
        try {
          const fresh = await EcommerceService.getStore(store.id);
          onUpdated?.(fresh);
          if (fresh.domain_verified) message.success("Domain verified!");
          else message.warning("Not verified yet. Check DNS propagation.");
        } catch {}
        setVerifying(false);
      }, 2000);
    } catch (e) {
      message.error(e.response?.data?.error || "Verification failed");
      setVerifying(false);
    }
  };

  if (!store) return null;

  return (
    <Card title="Storefront URL & Domain" className="mb-4">
      <Space direction="vertical" className="w-full" size="middle">
        <div>
          <Text strong>Path mode (always works):</Text>
          <Paragraph copyable>https://sartorialsmart.com/store/{store.store_slug}</Paragraph>
        </div>
        <div>
          <Text strong>Subdomain mode (under platform domain):</Text>
          <Paragraph copyable>{`https://${store.store_slug}.sartorialsmart.com`}</Paragraph>
          <Text type="secondary">Requires wildcard DNS *.sartorialsmart.com → platform. No extra config needed.</Text>
        </div>
        <div className="border rounded p-4 bg-gray-50">
          <Text strong>Custom domain (merchant-owned):</Text>
          <div className="flex gap-2 mt-2">
            <Input
              placeholder="shop.yourdomain.com"
              value={customDomain}
              onChange={(e) => setCustomDomain(e.target.value.toLowerCase())}
            />
            <Button type="primary" onClick={handleSaveDomain}>Save</Button>
          </div>
          {store.custom_domain && (
            <div className="mt-4 space-y-2">
              <div>
                Verified: {store.domain_verified ? <Tag color="green">Verified</Tag> : <Tag color="orange">Pending</Tag>}
                {store.domain_verified_at && <Text type="secondary"> since {new Date(store.domain_verified_at).toLocaleString()}</Text>}
              </div>
              <Alert
                type="info"
                message="DNS setup required"
                description={
                  <div>
                    <div>TXT record: <Text code>{store.verification_txt_name}</Text> = <Text code>{store.domain_verification_token}</Text></div>
                    <div>CNAME: <Text code>{store.custom_domain}</Text> → <Text code>{store.cname_target}</Text></div>
                  </div>
                }
              />
              <Button loading={verifying} onClick={handleVerify} disabled={!store.custom_domain}>Verify now</Button>
            </div>
          )}
        </div>
      </Space>
    </Card>
  );
};

export default StoreDomainSettings;

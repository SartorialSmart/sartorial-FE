import React, { useEffect, useState } from "react";
import { Card, Table, Tag, Button, Space } from "antd";
import EcommerceService from "../../../services/EcommerceService";
import EcommerceSideBarLayout from "../../../components/navs/EcommerceSideBarLayout";

const StoreOrders = () => {
  const [orders, setOrders] = useState([]);

  const load = async () => {
    const data = await EcommerceService.listOrders().catch(() => []);
    setOrders(Array.isArray(data) ? data : data.results || []);
  };
  useEffect(() => { load(); }, []);

  return (
    <EcommerceSideBarLayout>
      <Card title="Store orders">
        <Table rowKey="id" dataSource={orders} columns={[
          { title: "Order #", dataIndex: "order_number" },
          { title: "Customer", dataIndex: "customer_email" },
          { title: "Total", dataIndex: "total_amount", render: (v) => `₦${v}` },
          { title: "Payment", dataIndex: "payment_status", render: (v) => <Tag color={v === "PAID" ? "green" : "orange"}>{v}</Tag> },
          { title: "Status", dataIndex: "status", render: (v) => <Tag>{v}</Tag> },
          { title: "Gateway", dataIndex: "gateway" },
          { title: "Date", dataIndex: "created_at", render: (v) => new Date(v).toLocaleDateString() },
        ]} />
      </Card>
    </EcommerceSideBarLayout>
  );
};

export default StoreOrders;

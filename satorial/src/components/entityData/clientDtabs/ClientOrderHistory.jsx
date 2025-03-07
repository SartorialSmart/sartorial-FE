export default function ClientOrderHistory() {
    const orders = [
      { email: 'tunde@gmail.com', phone: '0802236568/', role: 'Tailor', date: '12/05/2024' },
      { email: 'tunde@gmail.com', phone: '0802236568/', role: 'Tailor', date: '12/05/2024' },
      { email: 'tunde@gmail.com', phone: '0802236568/', role: 'Tailor', date: '12/05/2024' },
      { email: 'tunde@gmail.com', phone: '0802236568/', role: 'Tailor', date: '12/05/2024' },
      { email: 'tunde@gmail.com', phone: '08022335687', role: 'Tailor', date: '12/05/2024' },
    ];
  
    return (
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4">Order History</h2>
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full border-collapse">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="p-4"><input type="checkbox" /></th>
                <th className="p-4 text-left">Email</th>
                <th className="p-4 text-left">Phone Number</th>
                <th className="p-4 text-left">Role</th>
                <th className="p-4 text-left">Employment Date</th>
                <th className="p-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, index) => (
                <tr key={index} className="border-b">
                  <td className="p-4"><input type="checkbox" /></td>
                  <td className="p-4">{order.email}</td>
                  <td className="p-4">{order.phone}</td>
                  <td className="p-4">{order.role}</td>
                  <td className="p-4">{order.date}</td>
                  <td className="p-4">
                    <button className="p-2 bg-gray-200 rounded">
                      <span>&#8942;</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
  
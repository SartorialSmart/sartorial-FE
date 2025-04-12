export const API = {
    USER_MANAGEMENT: {
      AUTH: {
        LOGIN: '/users/login/',
        REGISTER_ORGANIZATION: '/users/register-organization/', 
        DETAIL: '/users/me/',
      },
      
    },

    CLIENT_MANAGEMENT: {
        CLIENTS: {
          CREATE: 'client/clients/',
          LIST: 'client/clients/',
          DETAIL: (clientId) => `client/clients/${clientId}/`,
          SEARCH: '/client/search/',
        },
        ADDRESSES: {
          CREATE: 'client/addresses/',
          LIST: 'client/addresses/',
          DETAIL: (addressId) => `/client/addresses/${addressId}/`,
        },
        MEASUREMENTS: {
          CREATE: 'client/measurements/',
          LIST: 'client/measurements/',
          DETAIL: (measurementId) => `client/measurements/${measurementId}/`,
        },
        STYLE_IMAGES: {
          CREATE: 'client/style-images/',
          LIST: 'client/style-images/',
          DETAIL: (imageId) => `client/style-images/${imageId}/`,
          DELETE: (imageId) => `client/style-images/${imageId}/`,
        },
        DASHBOARD: {
          OVERVIEW: 'client/client-dashboard/',
        },
      },


      ORDER_MANAGEMENT: {
        ORDER_CATEGORIES: {
          CREATE: '/orders/order-categories/',
          LIST: '/orders/order-categories/',
          DETAIL: (categoryId) => `/order-categories/${categoryId}/`,
        },
        ORDERS: {
          CREATE: '/orders/orders/',
          LIST: '/orders/orders/',
          DETAIL: (orderId) => `/orders/orders/${orderId}/`,
          UPDATE: (orderId) => `/orders/orders/${orderId}/`,
          ORDER_LIST: '/orders/orders/list/',
        },
        VENDORS: {
          CREATE: '/orders/vendors/',
          LIST: '/orders/vendors/',
          DETAIL: (vendorId) => `/orders/vendors/${vendorId}/`,
        },

        VENDOR_CATEGORIES: {
          CREATE: '/orders/vendors-category/',
          LIST: '/orders/vendors-category/',
          DETAIL: (categoryId) => `/vendors-category/${categoryId}/`,
          WITH_BILL_COUNT: '/orders/vendors-bills/',
        },

        BILLS: {
          CREATE: '/orders/bills/',
          LIST: '/orders/bills/',
          DETAIL: (billId) => `/orders/bills/${billId}/`,
          UPDATE: (billId) => `/orders/bills/${billId}/`,
          BILL_LIST: '/orders/bills/list/',

          BILL_PAYMENT: {
            CREATE: '/orders/bill-payments/',
            LIST: '/orders/bill-payments/',
            DETAIL: (paymentId) => `/orders/bill-payments/${paymentId}/`,
            UPDATE: (paymentId) => `/orders/bill-payments/${paymentId}/`,
          },
        },
        ORDER_PAYMENTS: {
          CREATE: '/orders/order-payments/',
          LIST: '/orders/order-payments/',
          DETAIL: (paymentId) => `/orders/order-payments/${paymentId}/`,
          PAYMENT_LIST: '/orders/order-payments/list/',
        },
        INVOICES: {
          CREATE: '/orders/Invoice/',
          DETAIL: '/orders/Invoice/',
          BY_ORDER_ID: (orderId) => `/orders/invoices/order/${orderId}/`,
        },
        DASHBOARD: {
          OVERVIEW: '/orders/order-dashboard/',
        },
      },

      EXPENSE_MANAGEMENT: {
        EXPENSE_CATEGORIES: {
          CREATE: '/expenses-category/',
          LIST: '/expenses-category/',
          DETAIL: (categoryId) => `/expenses-category/${categoryId}/`,
        },
        EXPENSES: {
          CREATE: '/expenses/',
          LIST: '/expenses/',
          DETAIL: (expenseId) => `/expenses/${expenseId}/`,
          EXPENSE_LIST: '/expenses/list/',
          SUMMARY: '/expenses/summary/',
        },
      },

      STAFF_MANAGEMENT: {
        STAFF: {
          LIST: '/users/staff-list/',
          DETAIL: (staffId) => `/users/staff/detail/${staffId}/`,
          ADD: '/users/add-staff/',
          UPDATE: '/users/staffs/',
          DELETE: (staffId) => `/staffs/${staffId}`,
        },
        SALARY: {
          UPDATE: '/users/update-salary/',
        },
        EXITED_STAFF: {
          LIST: '/users/exited-staff-list/',
          DETAIL: (staffId) => `/users/exited-staff/${staffId}/`,
          ADD: '/users/exited-staff/',
        },
        ATTENDANCE: {
          LIST: '/users/attendance/',
          DETAIL: (attendanceId) => `/attendance/${attendanceId}/`,
        },
        PAYROLL: {
          LIST: '/users/payroll/',
          DETAIL: (payrollId) => `/users/payroll/${payrollId}/`,
        },
      }

  };
  
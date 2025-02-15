export const API = {
    USER_MANAGEMENT: {
      AUTH: {
        LOGIN: '/users/login/',
        REGISTER_COMPANY: '/users/register-company/', 
      },
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
    },

    CLIENT_MANAGEMENT: {
        CLIENTS: {
          CREATE: '/clients/',
          LIST: '/clients/',
          DETAIL: (clientId) => `/clients/${clientId}/`,
          SEARCH: '/client/search/',
        },
        ADDRESSES: {
          CREATE: '/addresses/',
          LIST: '/addresses/',
          DETAIL: (addressId) => `/addresses/${addressId}/`,
        },
        MEASUREMENTS: {
          CREATE: '/measurements/',
          LIST: '/measurements/',
          DETAIL: (measurementId) => `/measurements/${measurementId}/`,
        },
        STYLE_IMAGES: {
          CREATE: '/style-images/',
          LIST: '/style-images/',
          DETAIL: (imageId) => `/style-images/${imageId}/`,
        },
        DASHBOARD: {
          OVERVIEW: '/client-dashboard/',
        },
      },


      ORDER_MANAGEMENT: {
        ORDER_CATEGORIES: {
          CREATE: '/order-categories/',
          LIST: '/order-categories/',
          DETAIL: (categoryId) => `/order-categories/${categoryId}/`,
        },
        ORDERS: {
          CREATE: '/orders/',
          LIST: '/orders/',
          DETAIL: (orderId) => `/orders/${orderId}/`,
          ORDER_LIST: '/orders/list/',
        },
        VENDORS: {
          CREATE: '/vendors/',
          LIST: '/vendors/',
          DETAIL: (vendorId) => `/vendors/${vendorId}/`,
        },

        VENDOR_CATEGORIES: {
          CREATE: '/vendors-category/',
          LIST: '/vendors-category/',
          DETAIL: (categoryId) => `/vendors-category/${categoryId}/`,
          WITH_BILL_COUNT: '/vendors-bills/',
        },

        BILLS: {
          CREATE: '/bills/',
          LIST: '/bills/',
          DETAIL: (billId) => `/bills/${billId}/`,
          BILL_LIST: '/bills/list/',
        },
        ORDER_PAYMENTS: {
          CREATE: '/order-payments/',
          LIST: '/order-payments/',
          DETAIL: (paymentId) => `/order-payments/${paymentId}/`,
          PAYMENT_LIST: '/order-payments/list/',
        },
        INVOICES: {
          CREATE: '/Invoice/',
          DETAIL: '/Invoice/',
          BY_ORDER_ID: (orderId) => `/invoices/order/${orderId}/`,
        },
        DASHBOARD: {
          OVERVIEW: '/order-dashboard/',
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
  };
  
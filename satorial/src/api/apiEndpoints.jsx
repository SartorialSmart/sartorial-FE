export const API = {
  USER_MANAGEMENT: {
    AUTH: {
      LOGIN: "/users/login/",
      REGISTER_ORGANIZATION: "/users/register-organization/",
      DETAIL: "/users/me/",
      FORGOT_PASSWORD: "/users/forgot-password/",
      RESET_PASSWORD: "/users/reset-password/",
    },
  },

  CLIENT_MANAGEMENT: {
    CLIENTS: {
      CREATE: "/client/clients/",
      LIST: "/client/clients/",
      DETAIL: (clientId) => `/client/clients/${clientId}/`,
      SEARCH: "/client/search/",
    },
    ADDRESSES: {
      CREATE: "/client/addresses/",
      LIST: "/client/addresses/",
      DETAIL: (addressId) => `/client/addresses/${addressId}/`,
    },
    MEASUREMENTS: {
      CREATE: "/client/measurements/",
      LIST: "/client/measurements/",
      DETAIL: (measurementId) => `/client/measurements/${measurementId}/`,
    },
    STYLE_IMAGES: {
      CREATE: "/client/style-images/",
      LIST: "/client/style-images/",
      DETAIL: (imageId) => `/client/style-images/${imageId}/`,
      DELETE: (imageId) => `/client/style-images/${imageId}/`,
    },
    DASHBOARD: {
      OVERVIEW: "/client/client-dashboard/",
    },
  },

  ORDER_MANAGEMENT: {
    ORDER_CATEGORIES: {
      CREATE: "/orders/order-categories/",
      LIST: "/orders/order-categories/",
      DETAIL: (categoryId) => `/orders/order-categories/${categoryId}/`,
    },

    ORDERS: {
      CREATE: "/orders/orders/",
      LIST: "/orders/orders/",
      DETAIL: (orderId) => `/orders/orders/${orderId}/`,
      UPDATE: (orderId) => `/orders/orders/${orderId}/`,
      ORDER_LIST: "/orders/orders/list/",
      ASSIGN: "/orders/orders/assign/",
      ALLOCATION: "/orders/my-allocations/",
    },

    CLIENT_ORDERS: {
      HISTORY: (clientId) => `/orders/orders/client/${clientId}`,
    },

    VENDORS: {
      CREATE: "/orders/vendors/",
      LIST: "/orders/vendors/",
      DETAIL: (vendorId) => `/orders/vendors/${vendorId}/`,
    },

    VENDOR_CATEGORIES: {
      CREATE: "/orders/vendors-category/",
      LIST: "/orders/vendors-category/",
      DETAIL: (categoryId) => `/orders/vendors-category/${categoryId}/`,
      WITH_BILL_COUNT: "/orders/vendors-bills/",
    },

    BILLS: {
      CREATE: "/orders/bills/",
      LIST: "/orders/bills/",
      DETAIL: (billId) => `/orders/bills/${billId}/`,
      UPDATE: (billId) => `/orders/bills/${billId}/`,
      BILL_LIST: "/orders/bills/list/",

      BILL_PAYMENT: {
        CREATE: "/orders/bill-payments/",
        LIST: "/orders/bill-payments/",
        DETAIL: (paymentId) => `/orders/bill-payments/${paymentId}/`,
        UPDATE: (paymentId) => `/orders/bill-payments/${paymentId}/`,
      },
    },

    ORDER_PAYMENTS: {
      CREATE: "/orders/order-payments/",
      LIST: "/orders/order-payments/",
      DETAIL: (paymentId) => `/orders/order-payments/${paymentId}/`,
      PAYMENT_LIST: "/orders/order-payments/list/",
    },

    INVOICES: {
      CREATE: "/orders/Invoice/",
      DETAIL: "/orders/Invoice/",
      BY_ORDER_ID: (orderId) => `/orders/invoices/order/${orderId}/`,
    },

    DASHBOARD: {
      OVERVIEW: "/orders/order-dashboard/",
    },
  },

  EXPENSE_MANAGEMENT: {
    EXPENSE_CATEGORIES: {
      CREATE: "/expenses/expenses-category/",
      LIST: "/expenses/expenses-category/with-count/",
      DETAIL: (categoryId) => `/expenses/expenses-category/${categoryId}/`,
      DELETE: (categoryId) => `/expenses/expenses-category/${categoryId}/`,
      UPDATE: (categoryId) => `/expenses/expenses-category/${categoryId}/`,
    },

    EXPENSES: {
      CREATE: "/expenses/expenses/",
      LIST: "/expenses/expenses/",
      DETAIL: (expenseId) => `/expenses/expenses/${expenseId}/`,
      DELETE: (expenseId) => `/expenses/expenses/${expenseId}/`,
      UPDATE: (expenseId) => `/expenses/expenses/${expenseId}/`,
      EXPENSE_LIST: "/expenses/expenses/list/",
      SUMMARY: "/expenses/expenses/summary/",
    },
  },

  STAFF_MANAGEMENT: {
    STAFF: {
      LIST: "/users/staff-list/",
      DETAIL: (slug) => `/users/staff/${slug}/`,
      ADD: "/users/add-staff/",
      UPDATE: (slug) => `/users/staff/${slug}/`,
      DELETE: (slug) => `/users/staff/${slug}/`,
    },

    PERFORMANCE: {
      LIST: "/orders/staff/performance/",

      DETAIL: (staffId) => `/orders/staff/performance/${staffId}/`,

      DEPARTMENT: "/orders/department/performance/",
    },

    SALARY: {
      UPDATE: "/users/update-salary/",
    },
    EXITED_STAFF: {
      LIST: "/users/exited-staff-list/",
      DETAIL: (staffId) => `/users/exited-staff/${staffId}/`,
      ADD: "/users/exited-staff/",
    },
    ATTENDANCE: {
      LIST: "/users/attendance/",
      DETAIL: (attendanceId) => `/users/attendance/${attendanceId}/`,
    },
    PAYROLL: {
      ADD: "/users/payroll/",
      LIST: "/users/payroll/",
      DETAIL: (payrollId) => `/users/payroll/${payrollId}/`,
    },
  },
  REPORT: {
    MONTHLY_STATISTICS: "/report/monthly-statistics/",
    REPORT_SUMMARY: "/report/report-summary/",
    ORDER_SUMMARY: "/report/order-summary/",
    PAYMENT_SUMMARY: "/report/payment-summary/",
    STAFF_PERFORMANCE: "/report/staff-performance/",
    SALES_BY_DURATION: "/report/total-sales-by-duration/",
  },
  INVENTORY_MANAGEMENT: {
    DISPENSE_INVENTORY: {
      LIST: "/inventories/dispense-inventory/",
      CREATE: "/inventories/dispense-inventory/",
      UPDATE: "/inventories/dispense-inventory/",
      DELETE: "/inventories/dispense-inventory/",
      DETAIL: (id) => `/inventories/dispense-inventory/${id}/`,
      CREATE_WITH_ID: (id) => `/inventories/dispense-inventory/${id}/`,
      UPDATE_WITH_ID: (id) => `/inventories/dispense-inventory/${id}/`,
      DELETE_WITH_ID: (id) => `/inventories/dispense-inventory/${id}/`,
    },
    INVENTORY_CATEGORY: {
      LIST: "/inventories/inventory-category/",
      CREATE: "/inventories/inventory-category/",
      UPDATE: "/inventories/inventory-category/",
      DELETE: "/inventories/inventory-category/",
      DETAIL: (id) => `/inventories/inventory-category/${id}/`,
      CREATE_WITH_ID: (id) => `/inventories/inventory-category/${id}/`,
      UPDATE_WITH_ID: (id) => `/inventories/inventory-category/${id}/`,
      DELETE_WITH_ID: (id) => `/inventories/inventory-category/${id}/`,
    },
    INVENTORY: {
      LIST: "/inventories/inventory/",
      CREATE: "/inventories/inventory/",
      UPDATE: "/inventories/inventory/",
      DELETE: "/inventories/inventory/",
      DETAIL: (id) => `/inventories/inventory/${id}/`,
      CREATE_WITH_ID: (id) => `/inventories/inventory/${id}/`,
      UPDATE_WITH_ID: (id) => `/inventories/inventory/${id}/`,
      DELETE_WITH_ID: (id) => `/inventories/inventory/${id}/`,
    },
  },

  SUBSCRIPTION_MANAGEMENT: {
    PLANS: {
      LIST: "/subscriptions/plans/",
    },
    SUBSCRIPTION: {
      DETAIL: "/subscriptions/subscription/",
      SUBSCRIBE: "/subscriptions/subscribe/",
      CANCEL: "/subscriptions/subscription/cancel/",
      REACTIVATE: "/subscriptions/subscription/reactivate/",
    },
    TRANSACTIONS: {
      LIST: "/subscriptions/transactions/",
      VERIFY: "/subscriptions/verify-transaction/",
    },
    USAGE: {
      STATS: "/subscriptions/usage/",
    },
  },

  SETTINGS: {
    // Organization Profile
    PROFILE: {
      GET: "/settings/profile/",
      UPDATE: "/settings/profile/",
    },

    // Departments
    DEPARTMENTS: {
      LIST: "/settings/departments/",
      CREATE: "/settings/departments/",
      DETAIL: (deptId) => `/settings/departments/${deptId}/`,
      UPDATE: (deptId) => `/settings/departments/${deptId}/`,
      DELETE: (deptId) => `/settings/departments/${deptId}/`,
      STATISTICS: "/settings/departments/statistics/",
    },

    // Roles
    ROLES: {
      LIST: "/settings/roles/",
      CREATE: "/settings/roles/",
      DETAIL: (roleId) => `/settings/roles/${roleId}/`,
      UPDATE: (roleId) => `/settings/roles/${roleId}/`,
      DELETE: (roleId) => `/settings/roles/${roleId}/`,
    },

    // Tasks
    TASKS: {
      LIST: "/settings/tasks/",
      CREATE: "/settings/tasks/",
      DETAIL: (taskId) => `/settings/tasks/${taskId}/`,
      UPDATE: (taskId) => `/settings/tasks/${taskId}/`,
      DELETE: (taskId) => `/settings/tasks/${taskId}/`,
      STATISTICS: "/settings/tasks/statistics/",
    },

    // Fabrics
    FABRICS: {
      LIST: "/settings/fabrics/",
      CREATE: "/settings/fabrics/",
      DETAIL: (fabricId) => `/settings/fabrics/${fabricId}/`,
      UPDATE: (fabricId) => `/settings/fabrics/${fabricId}/`,
      DELETE: (fabricId) => `/settings/fabrics/${fabricId}/`,
      STATISTICS: "/settings/fabrics/statistics/",
    },

    // Invoice Settings
    INVOICE: {
      GET: "/settings/invoice/",
      UPDATE: "/settings/invoice/",
    },
  },
};

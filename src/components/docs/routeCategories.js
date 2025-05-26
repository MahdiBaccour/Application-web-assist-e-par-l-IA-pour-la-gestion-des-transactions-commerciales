const  routeCategories = [
  {
    title: "Authentication",
    basePath: "/api/auth",
    routes: [
      {
        method: "POST",
        path: "/register",
        headers: ["Content-Type: application/json"],
        body: ["username", "email", "password", "role", "image?"],
        permissions: ["Public"]
      },
      {
        method: "POST",
        path: "/login",
        headers: ["Content-Type: application/json"],
        body: ["identifier", "password", "theme"],
        permissions: ["Public"]
      },
      {
        method: "GET",
        path: "/validate-token",
        headers: ["Authorization: Bearer <token>"],
        permissions: ["All authenticated roles"]
      }
    ]
  },
  {
    title: "Categories",
    basePath: "/api/categories",
    routes: [
      {
        method: "POST",
        path: "/",
        headers: ["Authorization: Bearer <token>", "Content-Type: application/json"],
        body: ["name", "status?"],
        permissions: ["Owner", "Employee"]
      },
      {
        method: "GET",
        path: "/",
        headers: ["Authorization: Bearer <token>"],
        queries: ["status"],
        permissions: ["Owner", "Employee"]
      },
      {
        method: "PUT",
        path: "/:id",
        headers: ["Authorization: Bearer <token>", "Content-Type: application/json"],
        body: ["name", "status"],
        permissions: ["Owner", "Employee"]
      },
      {
        method: "PATCH",
        path: "/:id/status",
        headers: ["Authorization: Bearer <token>", "Content-Type: application/json"],
        body: ["status"],
        permissions: ["Owner", "Employee"]
      },
      {
        method: "DELETE",
        path: "/:id",
        headers: ["Authorization: Bearer <token>"],
        permissions: ["Owner", "Employee"]
      }
    ]
  },
  {
    title: "Clients",
    basePath: "/api/clients",
    routes: [
      {
        method: "POST",
        path: "/",
        headers: ["Authorization: Bearer <token>", "Content-Type: application/json"],
        body: ["name", "email", "phone", "address", "note?"],
        permissions: ["Owner"]
      },
      {
        method: "GET",
        path: "/",
        headers: ["Authorization: Bearer <token>"],
        queries: ["status"],
        permissions: ["Owner", "Employee"]
      },
      {
        method: "GET",
        path: "/:id",
        headers: ["Authorization: Bearer <token>"],
        permissions: ["Owner", "Employee"]
      },
      {
        method: "POST",
        path: "/check-phone",
        headers: ["Authorization: Bearer <token>", "Content-Type: application/json"],
        body: ["phone"],
        permissions: ["Owner", "Employee"]
      },
      {
        method: "PUT",
        path: "/:id",
        headers: ["Authorization: Bearer <token>", "Content-Type: application/json"],
        body: ["name", "email", "phone", "address", "note"],
        permissions: ["Owner", "Employee"]
      },
      {
        method: "PATCH",
        path: "/:id/status",
        headers: ["Authorization: Bearer <token>", "Content-Type: application/json"],
        body: ["status"],
        permissions: ["Owner", "Employee"]
      },
      {
        method: "GET",
        path: "/due-dates",
        headers: ["Authorization: Bearer <token>"],
        permissions: ["Owner", "Employee"]
      },
      {
        method: "DELETE",
        path: "/due-dates/:id",
        headers: ["Authorization: Bearer <token>"],
        permissions: ["Owner", "Employee"]
      }
    ]
  },
  {
    title: "Logs",
    basePath: "/api/logs",
    routes: [
      {
        method: "GET",
        path: "/",
        headers: ["Authorization: Bearer <token>"],
        queries: ["role", "limit", "page"],
        permissions: ["Owner"]
      }
    ]
  },
  {
    title: "Payment Methods",
    basePath: "/api/payment-methods",
    routes: [
      {
        method: "POST",
        path: "/",
        headers: ["Authorization: Bearer <token>", "Content-Type: application/json"],
        body: ["name"],
        permissions: ["Owner"]
      },
      {
        method: "GET",
        path: "/",
        headers: ["Authorization: Bearer <token>"],
        permissions: ["Owner", "Employee"]
      }
    ]
  },
  {
    title: "Products",
    basePath: "/api/products",
    routes: [
      {
        method: "POST",
        path: "/",
        headers: ["Authorization: Bearer <token>", "Content-Type: application/json"],
        body: ["name", "description", "selling_price", "category_id", "supplier_id", "status", "stock_quantity"],
        permissions: ["Owner"]
      },
      {
        method: "GET",
        path: "/",
        headers: ["Authorization: Bearer <token>"],
        queries: ["category_id", "status"],
        permissions: ["Owner", "Employee"]
      },
      {
        method: "GET",
        path: "/:id",
        headers: ["Authorization: Bearer <token>"],
        permissions: ["Owner", "Employee"]
      },
      {
        method: "PUT",
        path: "/:id",
        headers: ["Authorization: Bearer <token>", "Content-Type: application/json"],
        permissions: ["Owner"]
      },
      {
        method: "PATCH",
        path: "/:id/status",
        headers: ["Authorization: Bearer <token>", "Content-Type: application/json"],
        body: ["status_product"],
        permissions: ["Owner"]
      }
    ]
  },
  {
    title: "Settings",
    basePath: "/api/settings",
    routes: [
      {
        method: "PUT",
        path: "/profile",
        headers: ["Authorization: Bearer <token>", "Content-Type: application/json"],
        body: ["email", "username", "image", "theme", "currentPassword", "newPassword", "confirmPassword"],
        permissions: ["All authenticated roles"]
      },
      {
        method: "GET",
        path: "/profile",
        headers: ["Authorization: Bearer <token>"],
        permissions: ["All authenticated roles"]
      },
      {
        method: "GET",
        path: "/theme/:userId",
        headers: ["Authorization: Bearer <token>"],
        permissions: ["Owner", "Self"]
      },
      {
        method: "PUT",
        path: "/theme/:userId",
        headers: ["Authorization: Bearer <token>", "Content-Type: application/json"],
        body: ["theme"],
        permissions: ["Owner", "Self"]
      },
      {
        method: "GET",
        path: "/notifications",
        headers: ["Authorization: Bearer <token>"],
        queries: ["page", "limit"],
        permissions: ["All roles"]
      }
    ]
  },
  {
    title: "Suppliers",
    basePath: "/api/suppliers",
    routes: [
      {
        method: "POST",
        path: "/",
        headers: ["Authorization: Bearer <token>", "Content-Type: application/json"],
        body: ["name", "email", "phone", "address", "note?"],
        permissions: ["Owner"]
      },
      {
        method: "GET",
        path: "/",
        headers: ["Authorization: Bearer <token>"],
        queries: ["status"],
        permissions: ["Owner", "Employee"]
      },
      {
        method: "GET",
        path: "/:id",
        headers: ["Authorization: Bearer <token>"],
        permissions: ["Owner", "Employee"]
      },
      {
        method: "POST",
        path: "/check-phone",
        headers: ["Authorization: Bearer <token>", "Content-Type: application/json"],
        body: ["phone"],
        permissions: ["Owner", "Employee"]
      },
      {
        method: "PUT",
        path: "/:id",
        headers: ["Authorization: Bearer <token>", "Content-Type: application/json"],
        body: ["name", "email", "phone", "address", "note"],
        permissions: ["Owner"]
      },
      {
        method: "PATCH",
        path: "/:id/status",
        headers: ["Authorization: Bearer <token>", "Content-Type: application/json"],
        body: ["status_supplier"],
        permissions: ["Owner"]
      }
    ]
  },
  {
    title: "Total Budget",
    basePath: "/api/total-budget",
    routes: [
      {
        method: "POST",
        path: "/",
        headers: ["Authorization: Bearer <token>", "Content-Type: application/json"],
        body: ["budget", "month_date"],
        permissions: ["Owner"]
      },
      {
        method: "GET",
        path: "/",
        headers: ["Authorization: Bearer <token>"],
        permissions: ["Owner"]
      },
      {
        method: "PUT",
        path: "/:id",
        headers: ["Authorization: Bearer <token>", "Content-Type: application/json"],
        body: ["budget", "month_date"],
        permissions: ["Owner"]
      }
    ]
  },
  {
    title: "Transaction Products",
    basePath: "/api/transaction-products",
    routes: [
      {
        method: "GET",
        path: "/products",
        headers: ["Authorization: Bearer <token>"],
        permissions: ["Owner", "Employee"]
      },
      {
        method: "GET",
        path: "/:id/products",
        headers: ["Authorization: Bearer <token>"],
        permissions: ["Owner", "Employee"]
      },
      {
        method: "GET",
        path: "/:product_id/historical-costs",
        headers: ["Authorization: Bearer <token>"],
        permissions: ["Owner"]
      }
    ]
  },
  {
    title: "Users",
    basePath: "/api/users",
    routes: [
      {
        method: "POST",
        path: "/",
        headers: ["Authorization: Bearer <token>", "Content-Type: application/json"],
        body: ["username", "email", "password", "role", "image", "verified_status?"],
        permissions: ["Owner"]
      },
      {
        method: "GET",
        path: "/",
        headers: ["Authorization: Bearer <token>"],
        permissions: ["Owner"]
      },
      {
        method: "GET",
        path: "/:id",
        headers: ["Authorization: Bearer <token>"],
        permissions: ["Owner", "Self"]
      },
      {
        method: "PUT",
        path: "/:id",
        headers: ["Authorization: Bearer <token>", "Content-Type: application/json"],
        body: ["username", "email", "password", "image", "verified_status"],
        permissions: ["Owner", "Self"]
      },
      {
        method: "DELETE",
        path: "/:id",
        headers: ["Authorization: Bearer <token>"],
        permissions: ["Owner"]
      }
    ]
  },

];
export default routeCategories;
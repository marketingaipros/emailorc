export const users = {
  superAdmin: {
    email: "admin@demo.com",
    password: "DemoAdmin123!",
    role: "SUPER_ADMIN",
    name: "Super Admin",
  },
  clientAdmin: {
    email: "client@demo.com",
    password: "DemoClient123!",
    role: "CLIENT_ADMIN",
    name: "Client Admin",
  },
} as const;


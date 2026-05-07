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
  editor: {
    email: "editor@demo.com",
    password: "DemoEditor123!",
    role: "EDITOR",
    name: "Demo Editor",
  },
  reviewer: {
    email: "reviewer@demo.com",
    password: "DemoReviewer123!",
    role: "REVIEWER",
    name: "Demo Reviewer",
  },
  viewer: {
    email: "viewer@demo.com",
    password: "DemoViewer123!",
    role: "VIEWER",
    name: "Demo Viewer",
  },
} as const;

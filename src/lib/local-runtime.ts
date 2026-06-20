const LOCAL_BOOTSTRAP_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]", "::1"]);

export function isLocalDemoRuntime(request: Request) {
  if (process.env.APP_ENV !== "demo") return false;
  const url = new URL(request.url);
  return LOCAL_BOOTSTRAP_HOSTS.has(url.hostname);
}

export async function shouldBootstrapDemoSuperAdmin(params: {
  request: Request;
  email: string;
  password: string;
  expectedEmail: string;
  comparePassword: (password: string) => Promise<boolean>;
}) {
  if (!isLocalDemoRuntime(params.request)) return false;
  if (String(params.email || "").trim().toLowerCase() !== params.expectedEmail) return false;
  return params.comparePassword(params.password);
}

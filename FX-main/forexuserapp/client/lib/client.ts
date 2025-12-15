export async function api<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem("token");
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`/api${path}`, { ...opts, headers: { ...headers, ...(opts.headers as any) } });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

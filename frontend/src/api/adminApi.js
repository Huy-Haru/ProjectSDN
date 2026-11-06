import { tokenStorage } from "./apiClient";
const base = (
  import.meta.env.VITE_API_URL || "http://localhost:5000/api"
).replace(/\/$/, "");
export async function adminRequest(path, method = "GET", body) {
  const token = tokenStorage.get();
  const response = await fetch(base + "/admin" + path, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: "Bearer " + token } : {}),
    },
    signal: AbortSignal.timeout(15000),
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  const result = await response.json();
  if (!response.ok || !result.success)
    throw new Error(result.message || "Không thể xử lý yêu cầu");
  return result.data;
}
export const queryString = (values) => {
  const query = new URLSearchParams(
    Object.entries(values).filter(([, v]) => v !== "" && v !== undefined),
  );
  return "?" + query.toString();
};

import { apiRequest } from "./apiClient";
export async function adminRequest(path, method = "GET", body) {
  const result = await apiRequest("/admin" + path, {
    method,
    body,
    timeoutMs: 15000,
  });
  return result.data;
}
export const queryString = (values) => {
  const query = new URLSearchParams(
    Object.entries(values).filter(([, v]) => v !== "" && v !== undefined),
  );
  return "?" + query.toString();
};

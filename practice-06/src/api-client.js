export class ApiError extends Error {
  constructor(message, { kind, status = null, code = null, details = null, url = null, cause } = {}) {
    super(message, cause === undefined ? undefined : { cause });
    this.name = "ApiError";
    Object.assign(this, { kind, status, code, details, url });
  }
}

export function buildUrl(baseUrl, path, query = {}) {
  const url = new URL(baseUrl);
  if (!["http:", "https:"].includes(url.protocol)) throw new TypeError("Неверный протокол API");
  url.pathname = url.pathname.replace(/\/$/, "") + "/" + path.replace(/^\//, "");
  for (const [key, value] of Object.entries(query)) {
    if (value != null && value !== "") url.searchParams.set(key, String(value));
  }
  return url;
}

export function createApiClient({ baseUrl, fetchFn = globalThis.fetch, timeoutMs = 3000 } = {}) {
  if (typeof baseUrl !== "string" || typeof fetchFn !== "function"
    || !Number.isInteger(timeoutMs) || timeoutMs <= 0) throw new TypeError("Некорректная настройка API");
  const base = new URL(baseUrl);
  if (base.search || base.hash || base.username || base.password) throw new TypeError("Некорректный адрес API");
  buildUrl(baseUrl, "");

  async function requestJson(path, { method = "GET", query, body, signal, timeoutMs: limit = timeoutMs } = {}) {
    method = typeof method === "string" ? method.toUpperCase() : method;
    if (!["GET", "POST", "PATCH", "DELETE"].includes(method)
      || (method === "GET" && body !== undefined) || !Number.isInteger(limit) || limit <= 0) {
      throw new TypeError("Некорректные параметры запроса");
    }
    const url = buildUrl(baseUrl, path, query).href;
    const timeout = AbortSignal.timeout(limit);
    const combined = signal ? AbortSignal.any([signal, timeout]) : timeout;
    const headers = { Accept: "application/json" };
    const options = { method, headers, signal: combined };
    if (body !== undefined) {
      headers["Content-Type"] = "application/json";
      options.body = JSON.stringify(body);
    }
    const abortedError = (cause) => new ApiError(
      combined.reason?.name === "TimeoutError" ? "Истекло время ожидания" : "Запрос отменён",
      { kind: combined.reason?.name === "TimeoutError" ? "timeout" : "aborted", url, cause },
    );

    try {
      combined.throwIfAborted();
      const response = await fetchFn(url, options);
      combined.throwIfAborted();

      if (!(response instanceof Response)) {
        throw new ApiError("Ожидался объект Response", { kind: "invalid-response", url });
      }
      if (!response.ok) {
        let failure;
        try {
          failure = (await response.json())?.error;
        } catch (error) {
          if (combined.aborted) throw error;
        }
        throw new ApiError(failure?.message || `HTTP ${response.status}`, {
          kind: "http", status: response.status, code: failure?.code, details: failure?.details, url,
        });
      }

      if (response.status === 204) return null;
      if (!/^application\/json(?:\s*;|$)/i.test(response.headers.get("content-type") ?? "")) {
        throw new ApiError("Ожидался ответ JSON", { kind: "invalid-response", url });
      }
      try {
        return await response.json();
      } catch (cause) {
        if (combined.aborted) throw cause;
        throw new ApiError("Некорректный JSON", { kind: "invalid-response", url, cause });
      }
    } catch (cause) {
      if (cause instanceof ApiError) throw cause;
      if (combined.aborted) throw abortedError(cause);
      throw new ApiError("Ошибка сети", { kind: "network", url, cause });
    }
  }

  return { requestJson };
}

class ApiClient {
  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const headers = new Headers(options.headers || {});
    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    if (typeof window !== "undefined") {
      const token = sessionStorage.getItem("tp_token");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
    }

    const response = await fetch(path, {
      ...options,
      headers,
    });

    let json;
    try {
      json = await response.json();
    } catch (err) {
      throw new Error(`Failed to parse response: ${err}`);
    }

    if (!response.ok || !json.success) {
      throw new Error(json.message || `API request failed with status ${response.status}`);
    }

    return json.data as T;
  }

  public get<T>(path: string, options?: RequestInit): Promise<T> {
    return this.request<T>(path, { ...options, method: "GET" });
  }

  public post<T>(path: string, body?: any, options?: RequestInit): Promise<T> {
    return this.request<T>(path, {
      ...options,
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  public patch<T>(path: string, body?: any, options?: RequestInit): Promise<T> {
    return this.request<T>(path, {
      ...options,
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  public delete<T>(path: string, options?: RequestInit): Promise<T> {
    return this.request<T>(path, { ...options, method: "DELETE" });
  }
}

export const api = new ApiClient();

// lib/SessionManagerWeb.ts
export const SessionManagerWeb = {
  getUser: (): any | null => {
    if (typeof window === "undefined") return null;
    try {
      const userStr = localStorage.getItem("user");
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  },

  setUser: async (user: any) => {
    if (typeof window === "undefined") return;
    localStorage.setItem("user", JSON.stringify(user));
  },

  clearUser: async () => {
    if (typeof window === "undefined") return;
    localStorage.removeItem("user");
  },
};

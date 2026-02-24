export const API_BASE_URL =
  import.meta.env.VITE_BASE_URL || "http://localhost:3000";
const BASE_URL = API_BASE_URL;

const TOKEN_STORAGE_KEY = "app-token";
const REFRESH_TOKEN_STORAGE_KEY = "app-refresh-token";

/** Mock calendar events when backend is not ready. */
function getMockCalendarEvents(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const systems = [
    { name: "HVAC", type: "maintenance" },
    { name: "Roof", type: "inspection" },
    { name: "Plumbing", type: "maintenance" },
    { name: "Electrical", type: "inspection" },
  ];
  const pros = ["ABC Services", "Smith & Co", null];
  const events = [];
  const d = new Date(start);
  while (d <= end) {
    const day = d.getDay();
    if (day !== 0 && day !== 6) {
      const sys = systems[events.length % systems.length];
      events.push({
        id: `mock-${d.toISOString().slice(0, 10)}-${events.length}`,
        systemName: sys.name,
        systemKey: sys.name.toLowerCase(),
        type: sys.type,
        scheduledDate: d.toISOString().slice(0, 10),
        scheduledTime: events.length % 3 === 0 ? "10:00" : null,
        contractorName: pros[events.length % pros.length],
        propertyName: "Sample Property",
        status: "scheduled",
      });
    }
    d.setDate(d.getDate() + 1);
  }
  return events.slice(0, 15);
}

export class ApiError extends Error {
  constructor(messages, status = 500) {
    const msg = Array.isArray(messages) ? messages[0] : messages;
    super(typeof msg === "string" ? msg : msg?.message ?? "Request failed");
    this.messages = Array.isArray(messages) ? messages : [messages];
    this.status = status;
  }
}

class AppApi {
  static token;
  static _refreshPromise = null;

  static async refreshAccessToken() {
    if (AppApi._refreshPromise) return AppApi._refreshPromise;

    AppApi._refreshPromise = (async () => {
      try {
        const refreshToken = localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);
        if (!refreshToken) throw new Error("No refresh token");

        const resp = await fetch(`${BASE_URL}/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        });

        if (!resp.ok) throw new Error("Refresh failed");

        const data = await resp.json();
        AppApi.token = data.accessToken;
        localStorage.setItem(TOKEN_STORAGE_KEY, data.accessToken);
        localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, data.refreshToken);
        return data.accessToken;
      } catch (err) {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
        AppApi.token = null;
        window.location.href = "/signin";
        throw err;
      } finally {
        AppApi._refreshPromise = null;
      }
    })();

    return AppApi._refreshPromise;
  }

  static async request(endpoint, data = {}, method = "GET", customHeaders = {}) {
    const url = new URL(`${BASE_URL}/${endpoint}`);
    const headers = {
      Authorization: `Bearer ${AppApi.token}`, "Content-Type": "application/json", ...customHeaders
    };
    url.search = (method === "GET") ? new URLSearchParams(data) : "";
    const body = (method !== "GET") ? JSON.stringify(data) : undefined;

    let resp = await fetch(url, { method, body, headers });

    if (resp.status === 401 && !endpoint.startsWith("auth/")) {
      try {
        await AppApi.refreshAccessToken();
        headers.Authorization = `Bearer ${AppApi.token}`;
        resp = await fetch(url, { method, body, headers });
      } catch {
        throw new ApiError(["Session expired. Please sign in again."], 401);
      }
    }

    if (!resp.ok) {
      console.error("API Error:", resp.statusText, resp.status);
      const errBody = await resp.json().catch(() => ({}));
      const message = errBody?.error?.message ?? resp.statusText;
      const messages = Array.isArray(message) ? message : [message];
      throw new ApiError(messages, resp.status);
    }
    return await resp.json();
  }

  static async requestFormData(endpoint, formData, method = "POST") {
    const url = new URL(`${BASE_URL}/${endpoint}`);
    const headers = { Authorization: `Bearer ${AppApi.token}` };

    let resp = await fetch(url, { method, body: formData, headers });

    if (resp.status === 401 && !endpoint.startsWith("auth/")) {
      try {
        await AppApi.refreshAccessToken();
        headers.Authorization = `Bearer ${AppApi.token}`;
        resp = await fetch(url, { method, body: formData, headers });
      } catch {
        throw new ApiError(["Session expired. Please sign in again."], 401);
      }
    }

    if (!resp.ok) {
      console.error("API Error:", resp.statusText, resp.status);
      const err = await resp.json().catch(() => ({}));
      const message = err?.error?.message || resp.statusText;
      const messages = Array.isArray(message) ? message : [message];
      throw new ApiError(messages, resp.status);
    }
    return await resp.json();
  }

  /* --------- Users --------- */

  static async getCurrentUser(username) {
    let res = await this.request(`users/${username}`);
    return res.user;
  }

  static async login(data) {
    const res = await this.request(`auth/token`, data, "POST");
    if (res.mfaRequired && (res.mfaTicket || res.mfaPendingToken)) {
      return {
        mfaRequired: true,
        mfaTicket: res.mfaTicket || res.mfaPendingToken,
      };
    }
    return { accessToken: res.accessToken, refreshToken: res.refreshToken };
  }

  static async verifyMfa(mfaTicket, codeOrBackupCode) {
    const res = await fetch(`${BASE_URL}/auth/mfa/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${mfaTicket}`,
      },
      body: JSON.stringify({ codeOrBackupCode, tokenOrBackupCode: codeOrBackupCode }),
    });
    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      const message = errBody?.error?.message ?? res.statusText;
      throw new ApiError(Array.isArray(message) ? message : [message], res.status);
    }
    return res.json();
  }

  static async signup(data) {
    let res = await this.request(`auth/register`, data, "POST");
    return res;
  }

  static async saveProfile(username, data) {
    let res = await this.request(`users/${username}`, data, "PATCH");
    return res.user;
  }

  static async getAllUsers() {
    let res = await this.request(`users`);
    return res.users;
  }

  static async getUsersByAccountId(accountId) {
    let res = await this.request(`users/account/${accountId}`);
    return res.users;
  }

  static async getUsersByAgentId(agentId) {
    let res = await this.request(`users/agent/${agentId}`);
    return res.users;
  }

  static async updateUser(id, data) {
    let res = await this.request(`users/${id}`, data, 'PATCH');
    return res.user;
  }

  static async adminCreateUser(data) {
    let res = await this.request(`users`, data, "POST");
    return res.user;
  }

  static async deleteUser(id) {
    let res = await this.request(`users/${id}`, {}, 'DELETE');
    return res;
  }

  static async activateUser(data) {
    let res = await this.request(`users/activate/${data.userId}`, data, 'POST');
    return res;
  }

  /* --------- Accounts --------- */

  static async createAccount(data) {
    let res = await this.request(`accounts`, data, "POST");
    return res.account;
  }

  static async addUserToAccount(data) {
    let res = await this.request(`accounts/account_users`, data, "POST");
    return res.accountUser;
  }

  static async getUserAccounts(userId) {
    let res = await this.request(`accounts/user/${userId}`);
    return res.accounts;
  }

  /* --------- Invitations --------- */

  static async createInvitation(data) {
    let res = await this.request(`invitations`, data, "POST");
    return res;
  }

  static async acceptInvitation(id, data) {
    let res = await this.request(`invitations/${id}/accept`, data, "POST");
    return res;
  }

  static async declineInvitation(id) {
    let res = await this.request(`invitations/${id}/decline`, {}, "POST");
    return res;
  }

  static async revokeInvitation(id) {
    let res = await this.request(`invitations/${id}/revoke`, {}, "POST");
    return res;
  }

  static async getSentInvitations() {
    let res = await this.request(`invitations/sent`);
    return res.invitations;
  }

  static async getPropertyInvitations(propertyId, params = {}) {
    let res = await this.request(`invitations/property/${propertyId}`, params);
    return res.invitations;
  }

  static async getAccountInvitations(accountId, params = {}) {
    let res = await this.request(`invitations/account/${accountId}`, params);
    return res.invitations;
  }

  static async confirmInvitation(data) {
    let res = await this.request(`auth/confirm`, data, 'POST');
    return res;
  }

  static async changePassword(currentPassword, newPassword) {
    return this.request(`auth/change-password`, { currentPassword, newPassword }, "POST");
  }

  static async completeOnboarding(data) {
    return this.request(`auth/complete-onboarding`, data, "POST");
  }

  /* --------- MFA --------- */

  static async getMfaStatus() {
    return this.request("mfa/status");
  }

  static async mfaSetup() {
    return this.request("mfa/setup", {}, "POST");
  }

  static async mfaConfirm(token) {
    return this.request("mfa/confirm", { token }, "POST");
  }

  static async mfaDisable({ codeOrBackupCode, password }) {
    return this.request("mfa/disable", { codeOrBackupCode, password }, "POST");
  }

  static async revokeRefreshToken(refreshToken) {
    try {
      await fetch(`${BASE_URL}/auth/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });
    } catch {
      // Don't block logout on backend failure
    }
  }

  /* --------- Contacts --------- */

  static async getAllContacts() {
    try {
      let res = await this.request(`contacts/`);
      return res.contacts;
    } catch (error) {
      console.error("API: Error in getAllContacts:", error);
      return [];
    }
  }

  static async getContactsByAccountId(accountId) {
    let res = await this.request(`contacts/account/${accountId}`);
    return res.contacts;
  }

  static async getContact(id) {
    let res = await this.request(`contacts/${id}`);
    return res.contact;
  }

  static async updateContact(id, data) {
    let res = await this.request(`contacts/${id}`, data, 'PATCH');
    return res.contact;
  }

  static async deleteContact(id) {
    let res = await this.request(`contacts/${id}`, {}, 'DELETE');
    return res;
  }

  static async createContact(data) {
    try {
      let res = await this.request(`contacts`, data, 'POST');
      if (!res || !res.contact) {
        throw new Error("Invalid response from server");
      }
      return res.contact;
    } catch (error) {
      console.error("Error in createContact:", error);
      throw error;
    }
  }

  /* --------- Properties --------- */

  static async createProperty(data) {
    let res = await this.request(`properties`, data, 'POST');
    return res.property;
  }

  static async getAllProperties() {
    let res = await this.request(`properties`);
    return res.properties;
  }

  static async getPropertyById(uid) {
    let res = await this.request(`properties/${uid}`);
    return res.property;
  }

  static async getPropertiesByUserId(userId) {
    let res = await this.request(`properties/user/${userId}`);
    return res.properties;
  }

  static async getPropertyTeam(uid) {
    let res = await this.request(`properties/team/${uid}`);
    return res;
  }

  static async getAgentByAccountId(accountId) {
    let res = await this.request(`properties/agent/account/${accountId}`);
    return res.users;
  }

  static async addUsersToProperty(propertyId, users) {
    let res = await this.request(`properties/${propertyId}/users`, users, 'POST');
    return res.property;
  }

  static async updateProperty(propertyId, data) {
    let res = await this.request(`properties/${propertyId}`, data, 'PATCH');
    return res.property;
  }

  static async updatePropertyTeam(propertyId, team) {
    let res = await this.request(`properties/${propertyId}/team`, team, 'PATCH');
    return res.property;
  }

  /* --------- Systems --------- */

  static async createSystem(data) {
    let res = await this.request(`systems/${data.property_id}`, data, 'POST');
    return res.system;
  }

  static async updateSystem(systemId, data) {
    let res = await this.request(`systems/${systemId}`, data, 'PATCH');
    return res.system;
  }

  static async getSystemsByPropertyId(propertyId) {
    let res = await this.request(`systems/${propertyId}`);
    return res.systems;
  }

  /* --------- Maintenance Records --------- */

  static async createMaintenanceRecords(propertyId, records) {
    const res = await this.request(`maintenance/${propertyId}`, { maintenanceRecords: records }, "POST");
    return res.maintenanceRecords;
  }

  static async createMaintenanceRecord(data) {
    let res = await this.request(`maintenance/record/${data.property_id}`, data, 'POST');
    return res.maintenance;
  }

  static async updateMaintenanceRecord(id, data) {
    const res = await this.request(`maintenance/${id}`, data, "PATCH");
    return res.maintenance;
  }

  static async deleteMaintenanceRecord(id) {
    await this.request(`maintenance/${id}`, {}, "DELETE");
  }

  static async getMaintenanceRecordsByPropertyId(propertyId) {
    let res = await this.request(`maintenance/${propertyId}`);
    return res.maintenanceRecords;
  }

  /* --------- Maintenance Events (Calendar) --------- */

  /**
   * Get inspection + maintenance events for the current user in a date range.
   * Falls back to mock data if the backend is not ready.
   * @param {string} startDate - YYYY-MM-DD
   * @param {string} endDate - YYYY-MM-DD
   * @returns {Promise<Array>} events
   */
  static async getCalendarEvents(startDate, endDate) {
    try {
      const res = await this.request("maintenance-events/calendar", {
        start: startDate,
        end: endDate,
      });
      return res.events ?? [];
    } catch (err) {
      console.warn("Calendar API not ready, using mock events:", err?.message);
      return getMockCalendarEvents(startDate, endDate);
    }
  }

  /**
   * Create a maintenance event for a property.
   * @param {string} propertyId - property UID
   * @param {Object} payload - event payload (system_key, scheduled_date, etc.)
   */
  static async createMaintenanceEvent(propertyId, payload) {
    const res = await this.request(`maintenance-events/${propertyId}`, payload, "POST");
    return res.event;
  }

  /* --------- Documents --------- */

  static async getPresignedPreviewUrl(key) {
    if (!key) throw ["Document key is required"];
    let res = await this.request("documents/presigned-preview", { key }, "GET");
    return res.url;
  }

  static async uploadDocument(file) {
    const formData = new FormData();
    formData.append("file", file);
    let res = await this.requestFormData("documents/upload", formData);
    return res.document;
  }

  /* --------- Property Documents --------- */

  static async createPropertyDocument(data) {
    const res = await this.request("propertyDocuments", data, "POST");
    return res.document;
  }

  static async getPropertyDocuments(propertyId) {
    const res = await this.request(`propertyDocuments/property/${propertyId}`);
    return res.documents ?? [];
  }

  static async getPropertyDocument(id) {
    const res = await this.request(`propertyDocuments/${id}`);
    return res.document;
  }

  static async deletePropertyDocument(id) {
    await this.request(`propertyDocuments/${id}`, {}, "DELETE");
  }

  /* --------- Subscriptions --------- */

  static async getAllSubscriptions(filters = {}) {
    let res = await this.request(`subscriptions`, filters);
    return res.subscriptions;
  }

  static async getSubscription(id) {
    let res = await this.request(`subscriptions/${id}`);
    return res.subscription;
  }

  static async getSubscriptionsByAccountId(accountId) {
    let res = await this.request(`subscriptions/account/${accountId}`);
    return res.subscriptions;
  }

  static async createSubscription(data) {
    let res = await this.request(`subscriptions`, data, "POST");
    return res.subscription;
  }

  /** Create subscription for own account (agents/homeowners) */
  static async createAccountSubscription(data) {
    let res = await this.request(`subscriptions/account`, data, "POST");
    return res.subscription;
  }

  static async updateSubscription(id, data) {
    let res = await this.request(`subscriptions/${id}`, data, "PATCH");
    return res.subscription;
  }

  static async deleteSubscription(id) {
    let res = await this.request(`subscriptions/${id}`, {}, "DELETE");
    return res;
  }

  /* --------- Subscription Products --------- */

  static async getAllSubscriptionProducts() {
    let res = await this.request(`subscription-products`);
    return res.products;
  }

  static async getSubscriptionProductsByRole(role) {
    let res = await this.request(`subscription-products/for-role/${role}`);
    return res.products || [];
  }

  static async getSubscriptionProduct(id) {
    let res = await this.request(`subscription-products/${id}`);
    return res.product;
  }

  static async createSubscriptionProduct(data) {
    let res = await this.request(`subscription-products`, data, "POST");
    return res.product;
  }

  static async updateSubscriptionProduct(id, data) {
    let res = await this.request(`subscription-products/${id}`, data, "PATCH");
    return res.product;
  }

  static async deleteSubscriptionProduct(id) {
    let res = await this.request(`subscription-products/${id}`, {}, "DELETE");
    return res;
  }

  /* --------- Property Data Lookup (ATTOM) --------- */

  static async lookupPropertyDetails(propertyInfo) {
    let res = await this.request("predict/property-details", propertyInfo, "POST");
    return res;
  }

  /* --------- Platform Analytics --------- */

  static async getAnalyticsSummary() {
    let res = await this.request("analytics/summary");
    return res.summary;
  }

  static async getAnalyticsDaily(params = {}) {
    let res = await this.request("analytics/daily", params);
    return res.metrics;
  }

  static async getAnalyticsGrowth(entity, months = 12) {
    let res = await this.request("analytics/growth/" + entity, { months });
    return res.growth;
  }

  static async getAnalyticsAccounts() {
    let res = await this.request("analytics/accounts");
    return res.analytics;
  }

  static async getAnalyticsAccountById(accountId) {
    let res = await this.request(`analytics/accounts/${accountId}`);
    return res.analytics;
  }

  /* --------- Cost Analytics (Dashboard) --------- */

  static async getCostSummary(params = {}) {
    let res = await this.request("analytics/costs/summary", params);
    return res.summary;
  }

  static async getCostPerAccount(params = {}) {
    let res = await this.request("analytics/costs/per-account", params);
    return res.accounts;
  }

  /* --------- Platform Engagement --------- */

  static async getEngagementCounts(params = {}) {
    let res = await this.request("engagement/counts", params);
    return res.counts;
  }

  static async getEngagementTrend(params = {}) {
    let res = await this.request("engagement/trend", params);
    return res.trend;
  }

  static async logEngagementEvent(eventType, eventData = {}) {
    await this.request("engagement", { eventType, eventData }, "POST");
  }

  /* --------- Professional Categories --------- */

  static async getAllProfessionalCategories() {
    let res = await this.request("professional-categories");
    return res.categories;
  }

  static async getProfessionalCategoryHierarchy() {
    let res = await this.request("professional-categories/hierarchy");
    return res.hierarchy;
  }

  static async getProfessionalCategory(id) {
    let res = await this.request(`professional-categories/${id}`);
    return res.category;
  }

  static async createProfessionalCategory(data) {
    let res = await this.request("professional-categories", data, "POST");
    return res.category;
  }

  static async updateProfessionalCategory(id, data) {
    let res = await this.request(`professional-categories/${id}`, data, "PATCH");
    return res.category;
  }

  static async deleteProfessionalCategory(id) {
    return this.request(`professional-categories/${id}`, {}, "DELETE");
  }

  static async seedProfessionalCategories() {
    let res = await this.request("professional-categories/seed", {}, "POST");
    return res;
  }

  /* --------- Professionals --------- */

  static async getAllProfessionals(filters = {}) {
    const params = {};
    if (filters.category_id != null) params.category_id = filters.category_id;
    if (filters.subcategory_id != null) params.subcategory_id = filters.subcategory_id;
    if (filters.city) params.city = filters.city;
    if (filters.state) params.state = filters.state;
    if (filters.search) params.search = filters.search;
    if (filters.min_rating != null) params.min_rating = filters.min_rating;
    if (filters.budget_level) params.budget_level = filters.budget_level;
    if (filters.language) params.language = filters.language;
    if (filters.is_verified) params.is_verified = "true";
    const res = await this.request("professionals", params);
    return res.professionals;
  }

  static async getProfessional(id) {
    let res = await this.request(`professionals/${id}`);
    return res.professional;
  }

  static async createProfessional(data) {
    let res = await this.request("professionals", data, "POST");
    return res.professional;
  }

  static async updateProfessional(id, data) {
    let res = await this.request(`professionals/${id}`, data, "PATCH");
    return res.professional;
  }

  static async deleteProfessional(id) {
    return this.request(`professionals/${id}`, {}, "DELETE");
  }

  static async addProfessionalPhoto(professionalId, data) {
    let res = await this.request(`professionals/${professionalId}/photos`, data, "POST");
    return res.photo;
  }

  static async removeProfessionalPhoto(professionalId, photoId) {
    return this.request(`professionals/${professionalId}/photos/${photoId}`, {}, "DELETE");
  }

  /* --------- Saved Professionals --------- */

  static async getSavedProfessionals() {
    const res = await this.request("saved-professionals");
    return res.professionals ?? [];
  }

  static async saveProfessional(professionalId) {
    await this.request(`saved-professionals/${professionalId}`, {}, "POST");
  }

  static async unsaveProfessional(professionalId) {
    await this.request(`saved-professionals/${professionalId}`, {}, "DELETE");
  }

  /* --------- Support Tickets --------- */

  static async createSupportTicket(data) {
    const res = await this.request("support-tickets", data, "POST");
    return res.ticket;
  }

  static async getMySupportTickets() {
    const res = await this.request("support-tickets/my");
    return res.tickets ?? [];
  }

  static async getAllSupportTickets() {
    const res = await this.request("support-tickets");
    return res.tickets ?? [];
  }

  static async getSupportTicket(id) {
    const res = await this.request(`support-tickets/${id}`);
    return res.ticket;
  }

  static async updateSupportTicket(id, data) {
    const res = await this.request(`support-tickets/${id}`, data, "PATCH");
    return res.ticket;
  }

  static async getSupportAssignmentAdmins() {
    const res = await this.request("support-tickets/assignment-admins");
    return res.admins ?? [];
  }
}

export default AppApi;

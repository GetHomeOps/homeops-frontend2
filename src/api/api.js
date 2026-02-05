/* const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:3000"; */
const BASE_URL = "http://localhost:3000";

/** API Class.
 *
 * Static class tying together methods used to get/send to the API.
 * There shouldn't be any frontend-specific stuff here, and there shouldn't
 * be any API-aware stuff elsewhere in the frontend.
 *
 *
 */
class AppApi {
  // the token for interactive with the API will be stored here.
  static token;

  static async request(endpoint, data = {}, method = "GET", customHeaders = {}) {
    const url = new URL(`${BASE_URL}/${endpoint}`);
    const headers = {
      Authorization: `Bearer ${AppApi.token}`, "Content-Type": "application/json", ...customHeaders
    };

    url.search = (method === "GET") ? new URLSearchParams(data) : "";

    // set to undefined since the body property cannot exist on a GET method
    const body = (method !== "GET") ? JSON.stringify(data) : undefined;

    const resp = await fetch(url, { method, body, headers });

    if (!resp.ok) {
      console.error("API Error:", resp.statusText, resp.status);
      const message = (await resp.json()).error.message;
      throw Array.isArray(message) ? message : [message];
    }

    return await resp.json();

  };

  // Individual API routes

  /* --------- Users --------- */

  /** Get the current user. */
  static async getCurrentUser(username) {
    let res = await this.request(`users/${username}`);
    return res.user;
  }

  /** Get token for login from username, password. */
  static async login(data) {
    let res = await this.request(`auth/token`, data, "POST");
    return res.token;
  }

  /** Signup for site. */
  static async signup(data) {
    let res = await this.request(`auth/register`, data, "POST");
    return res;
  }

  /** Save user profile page. */
  static async saveProfile(username, data) {
    let res = await this.request(`users/${username}`, data, "PATCH");
    return res.user;
  }

  /** Get all users */
  static async getAllUsers() {
    let res = await this.request(`users`);
    return res.users;
  }

  /** Get users by database ID */
  static async getUsersByDatabaseId(databaseId) {
    let res = await this.request(`users/db/${databaseId}`);
    return res.users;
  }

  /* Get by Agent Id */
  static async getUsersByAgentId(agentId) {
    console.log("Agent ID: ", agentId);
    let res = await this.request(`users/agent/${agentId}`);
    return res.users;
  }

  /* Update a user */
  static async updateUser(id, data) {
    let res = await this.request(`users/${id}`, data, 'PATCH');
    return res.user;
  }

  /** Delete a user */
  static async deleteUser(id) {
    let res = await this.request(`users/${id}`, {}, 'DELETE');
    return res;
  }

  /** Add user to database */
  static async addUserToDatabase(data) {
    let res = await this.request(`user_databases`, data, "POST");
    return res.userDatabase || res.user_database;
  }

  /* Activate a user */
  static async activateUser(data) {
    let res = await this.request(`users/activate/${data.userId}`, data, 'POST');
    return res;
  }


  /* --- User Invitation --- */

  /* New User Confirmation */
  static async createUserConfirmationToken(data) {
    let res = await this.request(`users/invite`, data, 'POST');
    return res;
  }

  /* Find a valid user invitation token by user ID */
  static async findInvitationToken(userId) {
    let res = await this.request(`users/invite/${userId}`);
    return res.result;
  }

  /* Confirm a user invitation */
  static async confirmInvitation(data) {
    let res = await this.request(`auth/confirm`, data, 'POST');
    return res;
  }

  /* --------- Databases --------- */

  /** Create a new database */
  static async createDatabase(data) {
    let res = await this.request(`databases`, data, "POST");
    return res.database;
  }

  /** Create a user_database record (link user to database) */
  static async addUserToDatabase(data) {
    let res = await this.request(`databases/user_databases`, data, "POST");
    return res.user_database;
  }

  /** Get all databases associated with a user ID. */
  static async getUserDatabases(userId) {
    let res = await this.request(`databases/user/${userId}`);
    return res.databases;
  }

  /* --------- Contacts --------- */

  /* Get all contacts */
  static async getAllContacts() {
    try {
      let res = await this.request(`contacts/`);
      return res.contacts;
    } catch (error) {
      console.error("API: Error in getAllContacts:", error);
      return [];
    }
  }

  /* Get all contacts by database ID */
  static async getContactsByDbId(dbId) {
    let res = await this.request(`contacts/db/${dbId}`);
    return res.contacts;
  }

  /* Get a contact by ID */
  static async getContact(id) {
    let res = await this.request(`contacts/${id}`);
    return res.contact;
  }

  /* Update an existing contact */
  static async updateContact(id, data) {
    let res = await this.request(`contacts/${id}`, data, 'PATCH');
    return res.contact;
  }

  /* Delete a contact */
  static async deleteContact(id) {
    let res = await this.request(`contacts/${id}`, {}, 'DELETE');
    return res;
  }

  /* Create a new contact */
  static async createContact(data) {
    try {
      console.log("Creating contact with data:", data);
      let res = await this.request(`contacts`, data, 'POST');
      console.log("Create contact response:", res);

      if (!res || !res.contact) {
        console.error("Invalid response format:", res);
        throw new Error("Invalid response from server");
      }
      return res.contact;
    } catch (error) {
      console.error("Error in createContact:", error);
      throw error;
    }
  }

  /* --------- Properties --------- */

  /* Create a new property */
  static async createProperty(data) {
    let res = await this.request(`properties`, data, 'POST');
    return res.property;
  }

  /*  Get all properties */
  static async getAllProperties() {
    let res = await this.request(`properties`);
    return res.properties;
  }

  /* Get a property by the property_uid ID */
  static async getPropertyById(uid) {
    let res = await this.request(`properties/${uid}`);
    return res.property;
  }

  /* Get all properties by user ID */
  static async getPropertiesByUserId(userId) {
    let res = await this.request(`properties/user/${userId}`);
    return res.properties;
  }

  /* Get property team */
  static async getPropertyTeam(uid) {
    let res = await this.request(`properties/team/${uid}`);
    console.log("res: ", res);
    return res;
  }

  /* Get Property agent by database ID */
  static async getAgentByDbId(dbId) {
    let res = await this.request(`properties/agent/db/${dbId}`);
    return res.agent;
  }

  /* Add user to property */
  static async addUsersToProperty(propertyId, users) {
    let res = await this.request(`properties/${propertyId}/users`,
      users, 'POST');
    return res.property;
  }

  /* Update a property */
  static async updateProperty(propertyId, data) {
    console.log("Updating property with data:", data);
    let res = await this.request(`properties/${propertyId}`, data, 'PATCH');
    return res.property;
  }

  /* Update a property team */
  static async updatePropertyTeam(propertyId, team) {
    let res = await this.request(`properties/${propertyId}/team`, team, 'PATCH');
    return res.property;
  }

  /* --------- Systems --------- */
  /* Create a new system */
  static async createSystem(data) {
    let res = await this.request(`systems/${data.property_id}`, data, 'POST');
    return res.system;
  }

  /* Update a system */
  static async updateSystem(systemId, data) {
    let res = await this.request(`systems/${systemId}`, data, 'PATCH');
    return res.system;
  }

  /* Get all systems by property ID */
  static async getSystemsByPropertyId(propertyId) {
    let res = await this.request(`systems/${propertyId}`);
    return res.systems;
  }

}

export default AppApi;
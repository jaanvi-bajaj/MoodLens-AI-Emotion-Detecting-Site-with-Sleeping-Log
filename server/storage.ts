import { 
  users, type User, type InsertUser,
  contactSubmissions, type ContactSubmission, type InsertContactSubmission,
  newsletter, type Newsletter, type InsertNewsletter
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Contact form methods
  createContactSubmission(submission: InsertContactSubmission): Promise<ContactSubmission>;
  getContactSubmissions(): Promise<ContactSubmission[]>;
  
  // Newsletter methods
  subscribeToNewsletter(email: InsertNewsletter): Promise<Newsletter>;
  getNewsletterSubscribers(): Promise<Newsletter[]>;
  isEmailSubscribed(email: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private contactSubmissions: Map<number, ContactSubmission>;
  private newsletter: Map<number, Newsletter>;
  
  private userCurrentId: number;
  private contactCurrentId: number;
  private newsletterCurrentId: number;

  constructor() {
    this.users = new Map();
    this.contactSubmissions = new Map();
    this.newsletter = new Map();
    
    this.userCurrentId = 1;
    this.contactCurrentId = 1;
    this.newsletterCurrentId = 1;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Contact form methods
  async createContactSubmission(submission: InsertContactSubmission): Promise<ContactSubmission> {
    const id = this.contactCurrentId++;
    const newSubmission: ContactSubmission = { 
      ...submission, 
      id, 
      created_at: new Date() 
    };
    this.contactSubmissions.set(id, newSubmission);
    return newSubmission;
  }
  
  async getContactSubmissions(): Promise<ContactSubmission[]> {
    return Array.from(this.contactSubmissions.values());
  }
  
  // Newsletter methods
  async subscribeToNewsletter(data: InsertNewsletter): Promise<Newsletter> {
    // Check if already subscribed
    const exists = await this.isEmailSubscribed(data.email);
    if (exists) {
      throw new Error("Email already subscribed");
    }
    
    const id = this.newsletterCurrentId++;
    const subscription: Newsletter = { 
      ...data, 
      id, 
      created_at: new Date() 
    };
    
    this.newsletter.set(id, subscription);
    return subscription;
  }
  
  async getNewsletterSubscribers(): Promise<Newsletter[]> {
    return Array.from(this.newsletter.values());
  }
  
  async isEmailSubscribed(email: string): Promise<boolean> {
    return Array.from(this.newsletter.values()).some(
      (subscription) => subscription.email === email
    );
  }
}

export const storage = new MemStorage();

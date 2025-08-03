import { users, clients, events, payments, documents, type User, type InsertUser, type Client, type InsertClient, type Event, type InsertEvent, type Payment, type InsertPayment, type Document, type InsertDocument } from "@shared/schema";
import { db } from "./db";
import { eq, desc, gte, and, sql } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Client methods
  getClients(): Promise<Client[]>;
  getClient(id: string): Promise<Client | undefined>;
  createClient(client: InsertClient): Promise<Client>;
  updateClient(id: string, client: Partial<InsertClient>): Promise<Client | undefined>;
  deleteClient(id: string): Promise<boolean>;
  
  // Event methods
  getEvents(): Promise<(Event & { client: Client })[]>;
  getEvent(id: string): Promise<(Event & { client: Client }) | undefined>;
  createEvent(event: InsertEvent): Promise<Event>;
  updateEvent(id: string, event: Partial<InsertEvent>): Promise<Event | undefined>;
  deleteEvent(id: string): Promise<boolean>;
  getUpcomingEvents(limit?: number): Promise<(Event & { client: Client })[]>;
  
  // Payment methods
  getPayments(): Promise<(Payment & { event: Event & { client: Client } })[]>;
  getPayment(id: string): Promise<Payment | undefined>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  getPaymentsByEvent(eventId: string): Promise<Payment[]>;
  getRecentPayments(limit?: number): Promise<(Payment & { event: Event & { client: Client } })[]>;
  
  // Document methods
  getDocuments(): Promise<Document[]>;
  createDocument(document: InsertDocument): Promise<Document>;
  deleteDocument(id: string): Promise<boolean>;
  
  // Statistics methods
  getMonthlyStats(): Promise<{
    monthlyRevenue: number;
    eventsCount: number;
    activeClients: number;
    pendingPayments: number;
  }>;
  
  sessionStore: any;
}

export class DatabaseStorage implements IStorage {
  sessionStore: any;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Client methods
  async getClients(): Promise<Client[]> {
    return await db.select().from(clients).orderBy(desc(clients.createdAt));
  }

  async getClient(id: string): Promise<Client | undefined> {
    const [client] = await db.select().from(clients).where(eq(clients.id, id));
    return client || undefined;
  }

  async createClient(insertClient: InsertClient): Promise<Client> {
    const [client] = await db
      .insert(clients)
      .values(insertClient)
      .returning();
    return client;
  }

  async updateClient(id: string, updateClient: Partial<InsertClient>): Promise<Client | undefined> {
    const [client] = await db
      .update(clients)
      .set(updateClient)
      .where(eq(clients.id, id))
      .returning();
    return client || undefined;
  }

  async deleteClient(id: string): Promise<boolean> {
    const result = await db.delete(clients).where(eq(clients.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Event methods
  async getEvents(): Promise<(Event & { client: Client })[]> {
    return await db
      .select()
      .from(events)
      .leftJoin(clients, eq(events.clientId, clients.id))
      .orderBy(desc(events.eventDate))
      .then(results => 
        results.map(row => ({
          ...row.events,
          client: row.clients!
        }))
      );
  }

  async getEvent(id: string): Promise<(Event & { client: Client }) | undefined> {
    const [result] = await db
      .select()
      .from(events)
      .leftJoin(clients, eq(events.clientId, clients.id))
      .where(eq(events.id, id));
    
    if (!result || !result.clients) return undefined;
    
    return {
      ...result.events,
      client: result.clients
    };
  }

  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const [event] = await db
      .insert(events)
      .values(insertEvent)
      .returning();
    return event;
  }

  async updateEvent(id: string, updateEvent: Partial<InsertEvent>): Promise<Event | undefined> {
    const [event] = await db
      .update(events)
      .set(updateEvent)
      .where(eq(events.id, id))
      .returning();
    return event || undefined;
  }

  async deleteEvent(id: string): Promise<boolean> {
    const result = await db.delete(events).where(eq(events.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async getUpcomingEvents(limit = 10): Promise<(Event & { client: Client })[]> {
    const today = new Date().toISOString().split('T')[0];
    
    return await db
      .select()
      .from(events)
      .leftJoin(clients, eq(events.clientId, clients.id))
      .where(gte(events.eventDate, today))
      .orderBy(events.eventDate)
      .limit(limit)
      .then(results => 
        results.map(row => ({
          ...row.events,
          client: row.clients!
        }))
      );
  }

  // Payment methods
  async getPayments(): Promise<(Payment & { event: Event & { client: Client } })[]> {
    return await db
      .select()
      .from(payments)
      .leftJoin(events, eq(payments.eventId, events.id))
      .leftJoin(clients, eq(events.clientId, clients.id))
      .orderBy(desc(payments.paymentDate))
      .then(results => 
        results.map(row => ({
          ...row.payments,
          event: {
            ...row.events!,
            client: row.clients!
          }
        }))
      );
  }

  async getPayment(id: string): Promise<Payment | undefined> {
    const [payment] = await db.select().from(payments).where(eq(payments.id, id));
    return payment || undefined;
  }

  async createPayment(insertPayment: InsertPayment): Promise<Payment> {
    const [payment] = await db
      .insert(payments)
      .values(insertPayment)
      .returning();
    return payment;
  }

  async getPaymentsByEvent(eventId: string): Promise<Payment[]> {
    return await db.select().from(payments).where(eq(payments.eventId, eventId));
  }

  async getRecentPayments(limit = 10): Promise<(Payment & { event: Event & { client: Client } })[]> {
    return await db
      .select()
      .from(payments)
      .leftJoin(events, eq(payments.eventId, events.id))
      .leftJoin(clients, eq(events.clientId, clients.id))
      .orderBy(desc(payments.paymentDate))
      .limit(limit)
      .then(results => 
        results.map(row => ({
          ...row.payments,
          event: {
            ...row.events!,
            client: row.clients!
          }
        }))
      );
  }

  // Document methods
  async getDocuments(): Promise<Document[]> {
    return await db.select().from(documents).orderBy(desc(documents.uploadedAt));
  }

  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const [document] = await db
      .insert(documents)
      .values(insertDocument)
      .returning();
    return document;
  }

  async deleteDocument(id: string): Promise<boolean> {
    const result = await db.delete(documents).where(eq(documents.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Statistics methods
  async getMonthlyStats(): Promise<{
    monthlyRevenue: number;
    eventsCount: number;
    activeClients: number;
    pendingPayments: number;
  }> {
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
    
    // Monthly revenue from completed payments
    const revenueResult = await db
      .select({ 
        total: sql<number>`COALESCE(SUM(${payments.amount}), 0)` 
      })
      .from(payments)
      .where(
        and(
          sql`DATE_TRUNC('month', ${payments.paymentDate}) = ${currentMonth}-01`,
          eq(payments.status, 'completed')
        )
      );

    // Events this month
    const eventsResult = await db
      .select({ 
        count: sql<number>`COUNT(*)` 
      })
      .from(events)
      .where(sql`DATE_TRUNC('month', ${events.eventDate}) = ${currentMonth}-01`);

    // Active clients (clients with events this year)
    const currentYear = new Date().getFullYear();
    const clientsResult = await db
      .select({ 
        count: sql<number>`COUNT(DISTINCT ${events.clientId})` 
      })
      .from(events)
      .where(sql`EXTRACT(YEAR FROM ${events.eventDate}) = ${currentYear}`);

    // Pending payments amount
    const pendingResult = await db
      .select({ 
        total: sql<number>`COALESCE(SUM(${payments.amount}), 0)` 
      })
      .from(payments)
      .where(eq(payments.status, 'pending'));

    return {
      monthlyRevenue: Number(revenueResult[0]?.total || 0),
      eventsCount: Number(eventsResult[0]?.count || 0),
      activeClients: Number(clientsResult[0]?.count || 0),
      pendingPayments: Number(pendingResult[0]?.total || 0),
    };
  }
}

export const storage = new DatabaseStorage();

import { users, clients, events, payments, documents, expenses, cashFlow, type User, type InsertUser, type Client, type InsertClient, type Event, type InsertEvent, type Payment, type InsertPayment, type Document, type InsertDocument, type Expense, type InsertExpense, type CashFlow, type InsertCashFlow } from "@shared/schema";
import { db } from "./db";
import { eq, desc, gte, and, sql, lt } from "drizzle-orm";
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
  
  // Expense methods
  getExpenses(): Promise<(Expense & { event?: Event & { client: Client } })[]>;
  getExpense(id: string): Promise<Expense | undefined>;
  createExpense(expense: InsertExpense): Promise<Expense>;
  updateExpense(id: string, expense: Partial<InsertExpense>): Promise<Expense | undefined>;
  deleteExpense(id: string): Promise<boolean>;
  getExpensesByCategory(): Promise<{ category: string; total: number }[]>;
  
  
  // Cash flow methods
  getCashFlow(startDate?: Date, endDate?: Date): Promise<CashFlow[]>;
  createCashFlowEntry(entry: InsertCashFlow): Promise<CashFlow>;
  
  // Enhanced statistics methods
  getMonthlyStats(): Promise<{
    monthlyRevenue: number;
    monthlyExpenses: number;
    monthlyProfit: number;
    eventsCount: number;
    activeClients: number;
    pendingPayments: number;
  }>;
  
  getFinancialSummary(startDate: Date, endDate: Date): Promise<{
    totalRevenue: number;
    totalExpenses: number;
    netProfit: number;
    profitMargin: number;
    expensesByCategory: { category: string; total: number }[];
    revenueByMonth: { month: string; revenue: number }[];
  }>;
  
  sessionStore: any;
}

export class DatabaseStorage implements IStorage {
  sessionStore: any;

  constructor() {
    // Basic runtime assert to catch missing DATABASE_URL early for session store path
    const hasUrl = !!process.env.DATABASE_URL;
    if (!hasUrl) {
      // eslint-disable-next-line no-console
      console.warn("[session] DATABASE_URL missing in process.env at storage init");
    } else {
      const prev = process.env.DATABASE_URL!.slice(0, 20);
      // eslint-disable-next-line no-console
      console.log(`[session] DATABASE_URL detected: ${prev}...`);
    }

    this.sessionStore = new PostgresSessionStore({
      pool, // reuse shared Pool configured with connectionString
      createTableIfMissing: true,
      tableName: 'session',
      schemaName: 'app'
    });
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    // Ensure fully-qualified reference in case session store resets search_path
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username));
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
    const today = new Date().toISOString().split('T')[0]; // Corrigido: usar string de data
    
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

  // Expense methods
  async getExpenses(): Promise<(Expense & { event?: Event & { client: Client } })[]> {
    return await db
      .select()
      .from(expenses)
      .leftJoin(events, eq(expenses.eventId, events.id))
      .leftJoin(clients, eq(events.clientId, clients.id))
      .orderBy(desc(expenses.expenseDate))
      .then(results => 
        results.map(row => ({
          ...row.expenses,
          event: row.events ? {
            ...row.events,
            client: row.clients!
          } : undefined
        }))
      );
  }

  async getExpense(id: string): Promise<Expense | undefined> {
    const [expense] = await db.select().from(expenses).where(eq(expenses.id, id));
    return expense || undefined;
  }

  async createExpense(insertExpense: InsertExpense): Promise<Expense> {
    const [expense] = await db
      .insert(expenses)
      .values(insertExpense)
      .returning();
    return expense;
  }

  async updateExpense(id: string, updateData: Partial<InsertExpense>): Promise<Expense | undefined> {
    const [expense] = await db
      .update(expenses)
      .set(updateData)
      .where(eq(expenses.id, id))
      .returning();
    return expense || undefined;
  }

  async deleteExpense(id: string): Promise<boolean> {
    const result = await db.delete(expenses).where(eq(expenses.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async getExpensesByCategory(): Promise<{ category: string; total: number }[]> {
    return await db
      .select({
        category: expenses.category,
        total: sql<number>`COALESCE(SUM(${expenses.amount}), 0)`
      })
      .from(expenses)
      .where(eq(expenses.status, 'paid'))
      .groupBy(expenses.category)
      .orderBy(desc(sql`SUM(${expenses.amount})`));
  }


  // Cash flow methods
  async getCashFlow(startDate?: Date, endDate?: Date): Promise<CashFlow[]> {
    if (startDate && endDate) {
      return await db
        .select()
        .from(cashFlow)
        .where(
          and(
            gte(cashFlow.transactionDate, startDate),
            sql`${cashFlow.transactionDate} <= ${endDate}`
          )
        )
        .orderBy(desc(cashFlow.transactionDate));
    }

    return await db.select().from(cashFlow).orderBy(desc(cashFlow.transactionDate));
  }

  async createCashFlowEntry(insertEntry: InsertCashFlow): Promise<CashFlow> {
    const [entry] = await db
      .insert(cashFlow)
      .values(insertEntry)
      .returning();
    return entry;
  }

  // Enhanced statistics methods
  async getMonthlyStats(): Promise<{
    monthlyRevenue: number;
    monthlyExpenses: number;
    monthlyProfit: number;
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
          sql`DATE_TRUNC('month', ${payments.paymentDate}) = DATE_TRUNC('month', CURRENT_DATE)`,
          eq(payments.status, 'completed')
        )
      );

    // Monthly expenses
    const expensesResult = await db
      .select({ 
        total: sql<number>`COALESCE(SUM(${expenses.amount}), 0)` 
      })
      .from(expenses)
      .where(
        and(
          sql`DATE_TRUNC('month', ${expenses.expenseDate}) = DATE_TRUNC('month', CURRENT_DATE)`,
          eq(expenses.status, 'paid')
        )
      );

    // Events this month
    const eventsResult = await db
      .select({ 
        count: sql<number>`COUNT(*)` 
      })
      .from(events)
      .where(sql`DATE_TRUNC('month', ${events.eventDate}) = DATE_TRUNC('month', CURRENT_DATE)`);

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

    const monthlyRevenue = Number(revenueResult[0]?.total || 0);
    const monthlyExpenses = Number(expensesResult[0]?.total || 0);

    return {
      monthlyRevenue,
      monthlyExpenses,
      monthlyProfit: monthlyRevenue - monthlyExpenses,
      eventsCount: Number(eventsResult[0]?.count || 0),
      activeClients: Number(clientsResult[0]?.count || 0),
      pendingPayments: Number(pendingResult[0]?.total || 0),
    };
  }

  async getFinancialSummary(startDate: Date, endDate: Date): Promise<{
    totalRevenue: number;
    totalExpenses: number;
    netProfit: number;
    profitMargin: number;
    expensesByCategory: { category: string; total: number }[];
    revenueByMonth: { month: string; revenue: number }[];
  }> {
    // Total revenue in period
    const revenueResult = await db
      .select({ 
        total: sql<number>`COALESCE(SUM(${payments.amount}), 0)` 
      })
      .from(payments)
      .where(
        and(
          gte(payments.paymentDate, startDate),
          sql`${payments.paymentDate} <= ${endDate}`,
          eq(payments.status, 'completed')
        )
      );

    // Total expenses in period
    const expensesResult = await db
      .select({ 
        total: sql<number>`COALESCE(SUM(${expenses.amount}), 0)` 
      })
      .from(expenses)
      .where(
        and(
          gte(expenses.expenseDate, startDate),
          sql`${expenses.expenseDate} <= ${endDate}`,
          eq(expenses.status, 'paid')
        )
      );

    // Expenses by category
    const expensesByCategoryResult = await db
      .select({
        category: expenses.category,
        total: sql<number>`COALESCE(SUM(${expenses.amount}), 0)`
      })
      .from(expenses)
      .where(
        and(
          gte(expenses.expenseDate, startDate),
          sql`${expenses.expenseDate} <= ${endDate}`,
          eq(expenses.status, 'paid')
        )
      )
      .groupBy(expenses.category)
      .orderBy(desc(sql`SUM(${expenses.amount})`));

    // Revenue by month
    const revenueByMonthResult = await db
      .select({
        month: sql<string>`TO_CHAR(${payments.paymentDate}, 'YYYY-MM')`,
        revenue: sql<number>`COALESCE(SUM(${payments.amount}), 0)`
      })
      .from(payments)
      .where(
        and(
          gte(payments.paymentDate, startDate),
          sql`${payments.paymentDate} <= ${endDate}`,
          eq(payments.status, 'completed')
        )
      )
      .groupBy(sql`TO_CHAR(${payments.paymentDate}, 'YYYY-MM')`)
      .orderBy(sql`TO_CHAR(${payments.paymentDate}, 'YYYY-MM')`);

    const totalRevenue = Number(revenueResult[0]?.total || 0);
    const totalExpenses = Number(expensesResult[0]?.total || 0);
    const netProfit = totalRevenue - totalExpenses;
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    return {
      totalRevenue,
      totalExpenses,
      netProfit,
      profitMargin,
      expensesByCategory: expensesByCategoryResult,
      revenueByMonth: revenueByMonthResult,
    };
  }
}

export const storage = new DatabaseStorage();

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Sale, Book } from '../types';

class DataStore {
  private sales: Sale[] = [];
  private books: Book[] = [];
  private listeners: (() => void)[] = [];

  constructor() {
    this.loadFromStorage();
  }

  // Subscription methods
  subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener());
  }

  // Sales methods
  async addSale(sale: Sale): Promise<boolean> {
    try {
      this.sales.push(sale);
      await this.saveToStorage();
      await this.sendToGoogleSheets('sales', sale);
      this.notifyListeners();
      return true;
    } catch (error) {
      console.error('Error adding sale:', error);
      return false;
    }
  }

  getSales(): Sale[] {
    return this.sales;
  }

  getPendingSales(): Sale[] {
    return this.sales.filter(sale => !sale.completed);
  }

  getCompletedSales(): Sale[] {
    return this.sales.filter(sale => sale.completed);
  }

  async setSales(sales: Sale[]): Promise<boolean> {
    try {
      this.sales = sales;
      await this.saveToStorage();
      this.notifyListeners();
      return true;
    } catch (error) {
      console.error('Error setting sales:', error);
      return false;
    }
  }

  // Books methods
  async addBook(book: Book): Promise<boolean> {
    try {
      const existingBookIndex = this.books.findIndex(b => b.name === book.name);
      if (existingBookIndex !== -1) {
        this.books[existingBookIndex] = book;
      } else {
        this.books.push(book);
      }
      await this.saveToStorage();
      await this.sendToGoogleSheets('books', book);
      this.notifyListeners();
      return true;
    } catch (error) {
      console.error('Error adding book:', error);
      return false;
    }
  }

  async deleteBook(id: string): Promise<boolean> {
    try {
      this.books = this.books.filter(book => book.id !== id);
      await this.saveToStorage();
      this.notifyListeners();
      return true;
    } catch (error) {
      console.error('Error deleting book:', error);
      return false;
    }
  }

  getBooks(): Book[] {
    return this.books;
  }

  async updateBookQuantity(bookId: string, soldQuantity: number): Promise<boolean> {
    try {
      const bookIndex = this.books.findIndex(b => b.id === bookId);
      if (bookIndex !== -1) {
        this.books[bookIndex].quantity = Math.max(0, this.books[bookIndex].quantity - soldQuantity);
        await this.saveToStorage();
        this.notifyListeners();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating book quantity:', error);
      return false;
    }
  }

  // Storage methods
  private async saveToStorage(): Promise<boolean> {
    try {
      const data = JSON.stringify({
        sales: this.sales,
        books: this.books
      });
      await AsyncStorage.setItem('bookSalesData', data);
      return true;
    } catch (error) {
      console.error('Error saving data:', error);
      return false;
    }
  }

  private async loadFromStorage(): Promise<void> {
    try {
      const data = await AsyncStorage.getItem('bookSalesData');
      if (data) {
        const parsed = JSON.parse(data);
        this.sales = parsed.sales || [];
        this.books = parsed.books || [];
      }
      this.notifyListeners();
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }

  // Google Sheets integration
  private async sendToGoogleSheets(type: 'sales' | 'books', data: Sale | Book): Promise<boolean> {
    try {
      console.log(`Sending ${type} data to Google Sheets:`, data);
      // Implement actual Google Sheets API integration here
      return true;
    } catch (error) {
      console.error('Error sending data to Google Sheets:', error);
      return false;
    }
  }

  // Report generation
  generateReport() {
    const totalProfit = this.sales.reduce((sum, sale) => sum + (sale.profit || 0), 0);
    const totalBooksSold = this.sales.reduce((sum, sale) => sum + (sale.quantity || 0), 0);
    const totalBooksRemaining = this.books.reduce((sum, book) => sum + (book.quantity || 0), 0);
    const totalRevenue = this.sales.reduce((sum, sale) => sum + ((sale.sellingPrice || 0) * (sale.quantity || 0)), 0);
    const totalCost = this.sales.reduce((sum, sale) => sum + ((sale.wholesalePrice || 0) * (sale.quantity || 0)), 0);

    return {
      totalProfit,
      totalBooksSold,
      totalBooksRemaining,
      totalRevenue,
      totalCost
    };
  }

  // Helper methods
  formatNumber(num: number): string {
    return num.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  public async saveData(): Promise<boolean> {
    return this.saveToStorage();
  }

  public getSalesData(): Sale[] {
    return this.sales;
  }
}

export const dataStore = new DataStore();
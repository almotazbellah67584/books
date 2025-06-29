export interface Sale {
  id: string;
  bookId: string; 
  customerName: string;
  bookName: string;
  quantity: number;
  wholesalePrice: number;
  sellingPrice: number;
  totalCost: number;
  profit: number;
  completed: boolean; 
  date: string;
}

export interface Book {
  id: string;
  name: string;
  pricePerUnit: number;
  quantity: number;
  totalCost: number;
}

export interface Report {
  totalProfit: number;
  totalBooksSold: number;
  totalBooksRemaining: number;
  totalRevenue: number;
  totalCost: number;
}
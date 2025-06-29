import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { Text, Card, Button, DataTable } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { StatCard } from '../components/StatCard';
import { dataStore } from '../store/dataStore';

export default function ReportsScreen() {
  const [report, setReport] = useState(dataStore.generateReport());
  const sales = dataStore.getSales();
  const books = dataStore.getBooks();

  const formatNumber = (num: number) => {
    return num.toLocaleString('en-US', {
      minimumFractionDigits: 1,
      maximumFractionDigits: 2
    });
  };

  const refreshReport = () => {
    setReport(dataStore.generateReport());
  };

  const generateDetailedReport = () => {
    const reportData = {
      generatedAt: new Date().toLocaleString('ar-SA'),
      summary: {
        totalProfit: report.totalProfit,
        totalRevenue: report.totalRevenue,
        totalCost: report.totalCost,
        totalBooksSold: report.totalBooksSold,
        totalBooksRemaining: report.totalBooksRemaining,
        profitMargin: report.totalRevenue > 0 ? ((report.totalProfit / report.totalRevenue) * 100).toFixed(2) : 0
      },
      salesHistory: sales,
      inventoryStatus: books
    };

    Alert.alert(
      'تقرير شامل',
      `تاريخ التقرير: ${reportData.generatedAt}\n\nالملخص المالي:\nإجمالي الأرباح: ${formatNumber(reportData.summary.totalProfit)}₪\nإجمالي المبيعات: ${formatNumber(reportData.summary.totalRevenue)}₪\nهامش الربح: ${reportData.summary.profitMargin}%\n\nإحصائيات المخزون:\nالكتب المباعة: ${formatNumber(reportData.summary.totalBooksSold)}\nالكتب المتبقية: ${formatNumber(reportData.summary.totalBooksRemaining)}\nأنواع الكتب: ${books.length}`,
      [{ text: 'موافق' }]
    );
  };

  const profitMargin = report.totalRevenue > 0 ? ((report.totalProfit / report.totalRevenue) * 100) : 0;

  const reportCards = [
    {
      title: 'صافي الأرباح',
      value: `${formatNumber(report.totalProfit)}₪`,
      icon: 'trending-up' as const,
      colors: ['#10b981', '#059669'],
    },
    {
      title: 'إجمالي المبيعات',
      value: `${formatNumber(report.totalRevenue)}₪`,
      icon: 'cash' as const,
      colors: ['#2563eb', '#1d4ed8'],
    },
    {
      title: 'الكتب المباعة',
      value: formatNumber(report.totalBooksSold),
      icon: 'cart' as const,
      colors: ['#3b82f6', '#2563eb'],
    },
    {
      title: 'الكتب المتبقية',
      value: formatNumber(report.totalBooksRemaining),
      icon: 'library' as const,
      colors: ['#f59e0b', '#d97706'],
    },
  ];

  // Top selling books
  const bookSales = sales.reduce((acc, sale) => {
    acc[sale.bookName] = (acc[sale.bookName] || 0) + sale.quantity;
    return acc;
  }, {} as Record<string, number>);

  const topBooks = Object.entries(bookSales)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  // Recent sales
  const recentSales = sales.slice(-5).reverse();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Button
          mode="contained"
          onPress={generateDetailedReport}
          style={styles.reportButton}
          icon="download"
        >
          تحميل التقرير الشامل
        </Button>
        <Button
          mode="outlined"
          onPress={refreshReport}
          style={styles.refreshButton}
          icon="refresh"
        >
          تحديث
        </Button>
      </View>

      {/* Key Metrics */}
      <View style={styles.statsContainer}>
        {reportCards.map((card, index) => (
          <View key={index} style={styles.statCard}>
            <StatCard {...card} />
          </View>
        ))}
      </View>

      {/* Financial Overview */}
      <Card style={styles.overviewCard} elevation={3}>
        <LinearGradient colors={['#2563eb', '#1d4ed8']} style={styles.overviewGradient}>
          <Text style={styles.overviewTitle}>الملخص المالي</Text>
          <View style={styles.overviewStats}>
            <View style={styles.overviewStat}>
              <Text style={styles.overviewValue}>{formatNumber(report.totalProfit)}₪</Text>
              <Text style={styles.overviewLabel}>صافي الأرباح</Text>
            </View>
            <View style={styles.overviewStat}>
              <Text style={styles.overviewValue}>{profitMargin.toFixed(1)}%</Text>
              <Text style={styles.overviewLabel}>هامش الربح</Text>
            </View>
            <View style={styles.overviewStat}>
              <Text style={styles.overviewValue}>{formatNumber(report.totalCost)}₪</Text>
              <Text style={styles.overviewLabel}>إجمالي التكلفة</Text>
            </View>
          </View>
        </LinearGradient>
      </Card>

      {/* Top Selling Books */}
      <Card style={styles.card} elevation={3}>
        <Card.Title title="الكتب الأكثر مبيعاً" />
        <Card.Content>
          {topBooks.length === 0 ? (
            <Text style={styles.emptyText}>لا توجد مبيعات بعد</Text>
          ) : (
            topBooks.map(([bookName, quantity], index) => (
              <View key={bookName} style={styles.topBookItem}>
                <View style={styles.topBookRank}>
                  <Text style={styles.topBookRankText}>{index + 1}</Text>
                </View>
                <View style={styles.topBookInfo}>
                  <Text style={styles.topBookName}>{bookName}</Text>
                  <Text style={styles.topBookQuantity}>{formatNumber(quantity)} نسخة</Text>
                </View>
              </View>
            ))
          )}
        </Card.Content>
      </Card>

      {/* Recent Sales */}
      <Card style={styles.card} elevation={3}>
        <Card.Title title="المبيعات الأخيرة" />
        <Card.Content>
          {recentSales.length === 0 ? (
            <Text style={styles.emptyText}>لا توجد مبيعات بعد</Text>
          ) : (
            recentSales.map((sale) => (
              <View key={sale.id} style={styles.recentSaleItem}>
                <View style={styles.recentSaleInfo}>
                  <Text style={styles.recentSaleBook}>{sale.bookName}</Text>
                  <Text style={styles.recentSaleCustomer}>{sale.customerName}</Text>
                </View>
                <View style={styles.recentSaleProfit}>
                  <Text style={[styles.recentSaleProfitText, { color: sale.profit >= 0 ? '#10b981' : '#dc2626' }]}>
                    +{formatNumber(sale.profit)}₪
                  </Text>
                  <Text style={styles.recentSaleDate}>
                    {new Date(sale.date).toLocaleDateString('ar-SA')}
                  </Text>
                </View>
              </View>
            ))
          )}
        </Card.Content>
      </Card>

      {/* Inventory Status */}
      <Card style={styles.card} elevation={3}>
        <Card.Title title="حالة المخزون" />
        <Card.Content>
          {books.length === 0 ? (
            <Text style={styles.emptyText}>لا توجد كتب في المخزون</Text>
          ) : (
            <DataTable>
              <DataTable.Header>
                <DataTable.Title>اسم الكتاب</DataTable.Title>
                <DataTable.Title numeric>الكمية</DataTable.Title>
                <DataTable.Title numeric>القيمة</DataTable.Title>
              </DataTable.Header>

              {books.map((book) => (
                <DataTable.Row key={book.id}>
                  <DataTable.Cell>{book.name}</DataTable.Cell>
                  <DataTable.Cell numeric>{formatNumber(book.quantity)}</DataTable.Cell>
                  <DataTable.Cell numeric>
                    {formatNumber(book.pricePerUnit * book.quantity)}₪
                  </DataTable.Cell>
                </DataTable.Row>
              ))}
            </DataTable>
          )}
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },
  reportButton: {
    flex: 1,
  },
  refreshButton: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
  },
  statCard: {
    width: '50%',
  },
  overviewCard: {
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  overviewGradient: {
    padding: 20,
  },
  overviewTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  overviewStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  overviewStat: {
    alignItems: 'center',
  },
  overviewValue: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  overviewLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
  },
  card: {
    margin: 16,
    marginTop: 0,
  },
  emptyText: {
    textAlign: 'center',
    color: '#64748b',
    fontStyle: 'italic',
    padding: 20,
  },
  topBookItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  topBookRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  topBookRankText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  topBookInfo: {
    flex: 1,
  },
  topBookName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1e293b',
  },
  topBookQuantity: {
    fontSize: 14,
    color: '#64748b',
  },
  recentSaleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    marginBottom: 8,
  },
  recentSaleInfo: {
    flex: 1,
  },
  recentSaleBook: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1e293b',
  },
  recentSaleCustomer: {
    fontSize: 12,
    color: '#64748b',
  },
  recentSaleProfit: {
    alignItems: 'flex-end',
  },
  recentSaleProfitText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  recentSaleDate: {
    fontSize: 12,
    color: '#64748b',
  },
});
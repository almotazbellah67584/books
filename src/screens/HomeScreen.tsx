import React, { useState, useCallback } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl , ColorValue } from 'react-native';
import { Text, Card, Button } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { StatCard } from '../components/StatCard';
import { dataStore } from '../store/dataStore';

type GradientColors = [ColorValue, ColorValue];

export default function HomeScreen({ navigation }: any) {
  const [refreshing, setRefreshing] = useState(false);
  const [report, setReport] = useState(dataStore.generateReport());

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setReport(dataStore.generateReport());
    setRefreshing(false);
  }, []);

  const formatNumber = (num: number) => {
    return num.toLocaleString('en-US', {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    });
  };

  const stats = [
    {
      title: 'إجمالي الأرباح',
      value: formatNumber(report.totalProfit),
      icon: 'trending-up' as const,
      colors: ['#10b981', '#059669'],
    },
    {
      title: 'الكتب المباعة',
      value: formatNumber(report.totalBooksSold),
      icon: 'cart' as const,
      colors: ['#2563eb', '#1d4ed8'],
    },
    {
      title: 'الكتب المتبقية',
      value: formatNumber(report.totalBooksRemaining),
      icon: 'library' as const,
      colors: ['#f59e0b', '#d97706'],
    },
    {
      title: 'إجمالي المبيعات',
      value: formatNumber(report.totalRevenue),
      icon: 'bar-chart' as const,
      colors: ['#8b5cf6', '#7c3aed'],
    },
  ];

  const quickActions = [
    {
      title: 'إضافة مبيعة جديدة',
      description: 'تسجيل عملية بيع جديدة للعملاء',
      screen: 'Sales',
      icon: 'add-circle',
      colors: ['#2563eb', '#1d4ed8'],
    },
    {
      title: 'إدارة المخزون',
      description: 'إضافة وتعديل معلومات الكتب',
      screen: 'Inventory',
      icon: 'library',
      colors: ['#10b981', '#059669'],
    },
    {
      title: 'عرض التقارير',
      description: 'تقارير شاملة عن الأرباح والمبيعات',
      screen: 'Reports',
      icon: 'analytics',
      colors: ['#f59e0b', '#d97706'],
    },
  ];

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      

      <View style={styles.statsContainer}>
        {stats.map((stat, index) => (
          <View key={index} style={styles.statCard}>
            <StatCard {...stat} />
          </View>
        ))}
      </View>

      <View style={styles.actionsContainer}>
        <Text style={styles.sectionTitle}>الإجراءات السريعة</Text>
        {quickActions.map((action, index) => (
          <Card key={index} style={styles.actionCard} elevation={2}>
            
            <LinearGradient colors={action.colors as [string, string]} style={styles.actionGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>{action.title}</Text>
                <Text style={styles.actionDescription}>{action.description}</Text>
                <Button
                  mode="contained"
                  onPress={() => navigation.navigate(action.screen)}
                  style={styles.actionButton}
                  buttonColor="rgba(255, 255, 255, 0.2)"
                  textColor="#ffffff"
                >
                  انتقال
                </Button>
              </View>
            </LinearGradient>
          </Card>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    padding: 24,
    paddingTop: 40,
    alignItems: 'center',
  },
  welcomeText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  titleText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitleText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
    marginTop: 20,
  },
  statCard: {
    width: '100%',
    padding: 4,
  },
  actionsContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
    textAlign: 'center',
  },
  actionCard: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  actionGradient: {
    padding: 20,
  },
  actionContent: {
    alignItems: 'center',
  },
  actionTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  actionDescription: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  actionButton: {
    borderRadius: 8,
    width:'45%',
  },
});
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface StatCardProps {
  title: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  colors: string[];
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, icon, colors }) => {
  return (
    <Card style={styles.card} elevation={3}>
      <LinearGradient colors={colors} style={styles.gradient}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Ionicons name={icon} size={24} color="#ffffff" />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.value}>{value}</Text>
          </View>
        </View>
      </LinearGradient>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    margin: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  gradient: {
    padding: 16,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  value: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
});
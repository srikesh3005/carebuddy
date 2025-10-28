import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Calendar, TrendingUp, CheckCircle, XCircle, Pill } from 'lucide-react-native';
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';
// import { HistoryService } from '@/services/firebaseService';
import { MockHistoryService as HistoryService } from '@/services/mockDataService';
import { History } from '@/types/database';
import { HistoryItem } from '@/components/HistoryItem';
import { StatCard } from '@/components/ui/StatCard';
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import { Spacing } from '@/constants/Spacing';

export default function HistoryScreen() {
  const { user } = useFirebaseAuth();
  const [history, setHistory] = useState<History[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'taken' | 'missed'>('all');

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [user])
  );

  const loadHistory = async () => {
    // Use mock user ID if no user is logged in
    const userId = user?.uid || 'mock_user';

    try {
      const data = await HistoryService.getHistory(userId, 100);
      setHistory(data);
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadHistory();
  };

  const filteredHistory = history.filter(item => {
    if (filter === 'all') return true;
    return item.status === filter;
  });

  const stats = {
    total: history.length,
    taken: history.filter(h => h.status === 'taken').length,
    missed: history.filter(h => h.status === 'missed').length,
    adherenceRate: history.length > 0
      ? Math.round((history.filter(h => h.status === 'taken').length / history.length) * 100)
      : 0,
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>History</Text>
        <Text style={styles.headerSubtitle}>Track your medication adherence</Text>
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor="#14B8A6"
          />
        }
        contentContainerStyle={styles.scrollContent}
      >
        {/* Stats Cards */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={styles.statIconBox}>
              <TrendingUp size={20} color="#14B8A6" strokeWidth={2.5} />
            </View>
            <Text style={styles.statValue}>{stats.adherenceRate}%</Text>
            <Text style={styles.statLabel}>Adherence</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIconBox, { backgroundColor: '#F0FDFA' }]}>
              <CheckCircle size={20} color="#14B8A6" strokeWidth={2.5} />
            </View>
            <Text style={styles.statValue}>{stats.taken}</Text>
            <Text style={styles.statLabel}>Taken</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIconBox, { backgroundColor: '#FEF2F2' }]}>
              <XCircle size={20} color="#EF4444" strokeWidth={2.5} />
            </View>
            <Text style={styles.statValue}>{stats.missed}</Text>
            <Text style={styles.statLabel}>Missed</Text>
          </View>
        </View>

        {/* Filters */}
        <View style={styles.filters}>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
            onPress={() => setFilter('all')}
          >
            <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
              All ({history.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'taken' && styles.filterButtonActive]}
            onPress={() => setFilter('taken')}
          >
            <Text style={[styles.filterText, filter === 'taken' && styles.filterTextActive]}>
              Taken ({stats.taken})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'missed' && styles.filterButtonActive]}
            onPress={() => setFilter('missed')}
          >
            <Text style={[styles.filterText, filter === 'missed' && styles.filterTextActive]}>
              Missed ({stats.missed})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Empty State */}
        {filteredHistory.length === 0 && !loading && (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconBox}>
              <Calendar size={48} color="#CBD5E1" strokeWidth={2} />
            </View>
            <Text style={styles.emptyTitle}>No History</Text>
            <Text style={styles.emptyText}>
              {filter === 'all' 
                ? 'Your medication history will appear here'
                : `No ${filter} medications found`
              }
            </Text>
          </View>
        )}

        {/* History List */}
        <View style={styles.historyList}>
          {filteredHistory.map((item) => (
            <HistoryItem key={item.id} item={item} />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1E293B',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 15,
    color: '#64748B',
  },
  scrollContent: {
    paddingBottom: 100,
  },

  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  statIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0FDFA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },

  // Filters
  filters: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 8,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#14B8A6',
    borderColor: '#14B8A6',
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyIconBox: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
  },

  // History List
  historyList: {
    paddingHorizontal: 20,
  },
});

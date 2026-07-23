import React, { useEffect, useState, useCallback, memo, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, RefreshControl, StatusBar, ScrollView } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import NetInfo from '@react-native-community/netinfo';
import { RootState } from '../../store';
import { useTasks } from '../../hooks/useTasks';
import { debounce } from '../../utils/debounce';
import { loadInitialCache } from '../../store/cacheMiddleware';
import { LocalTask } from '../../types';
import { Header } from '../../components/common/Header';
import { Colors, Spacing, BorderRadius, Typography } from '../../constants';

const TaskItem = memo(({ item, onPress }: { item: LocalTask; onPress: () => void }) => (
  <TouchableOpacity style={styles.taskCard} onPress={onPress} activeOpacity={0.7}>
    <View style={styles.taskHeader}>
      <Text style={[styles.taskTitle, item.status === 'done' && styles.doneText]} numberOfLines={1}>
        {item.title}
      </Text>
      {item.starred && <Icon name="star" size={20} color={Colors.warning} />}
    </View>
    <View style={styles.taskFooter}>
      <Text style={[styles.taskStatus, item.status === 'done' ? styles.statusDone : styles.statusOpen]}>
        {item.status.toUpperCase()}
      </Text>
      {item.due_date && (
        <Text style={styles.dateText}>
          {new Date(item.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
        </Text>
      )}
    </View>
  </TouchableOpacity>
));

export const TaskListScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation<any>();
  const [isOffline, setIsOffline] = useState(false);
  const { items: categories } = useSelector((state: RootState) => state.categories);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOffline(state.isConnected === false);
    });
    return unsubscribe;
  }, []);
  
  const {
    tasks,
    loading,
    lastRefreshed,
    refreshTasks,
    setSearchQuery,
    filterCategory,
    setFilterCategory,
    filterStatus,
    setFilterStatus,
    sortBy,
    setSortBy
  } = useTasks();

  const handleSearch = useMemo(
    () => debounce((text: string) => {
      setSearchQuery(text);
    }, 300),
    [setSearchQuery]
  );

  useEffect(() => {
    const init = async () => {
      await loadInitialCache(dispatch);
      refreshTasks();
    };
    init();
  }, [dispatch, refreshTasks]);

  const renderItem = useCallback(({ item }: { item: LocalTask }) => (
    <TaskItem item={item} onPress={() => navigation.navigate('TaskDetail', { taskId: item.id })} />
  ), [navigation]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      
      <Header title="My Tasks" showBack={false} />
      
      <View style={styles.header}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search tasks..."
          placeholderTextColor={Colors.textMuted}
          onChangeText={handleSearch}
        />
        <View style={styles.filters}>
          <View style={styles.filterGroup}>
            <TouchableOpacity 
              style={[styles.filterBtn, filterStatus === 'open' && styles.activeBtn]}
              onPress={() => setFilterStatus(filterStatus === 'open' ? null : 'open')}
            >
              <Text style={[styles.filterBtnText, filterStatus === 'open' && styles.activeBtnText]}>Open</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.filterBtn, filterStatus === 'done' && styles.activeBtn]}
              onPress={() => setFilterStatus(filterStatus === 'done' ? null : 'done')}
            >
              <Text style={[styles.filterBtnText, filterStatus === 'done' && styles.activeBtnText]}>Done</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity 
            style={styles.sortBtn}
            onPress={() => setSortBy(sortBy === 'due_date' ? 'created_at' : 'due_date')}
          >
            <Text style={styles.sortBtnText}>Sort: {sortBy === 'due_date' ? 'Due' : 'Created'}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.categoryFilters}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity 
              style={[styles.catFilterBtn, filterCategory === null && styles.catFilterBtnActive]}
              onPress={() => setFilterCategory(null)}
            >
              <Text style={[styles.catFilterBtnText, filterCategory === null && styles.catFilterBtnTextActive]}>All</Text>
            </TouchableOpacity>
            {categories.map(cat => (
              <TouchableOpacity 
                key={cat.id}
                style={[styles.catFilterBtn, filterCategory === cat.id && styles.catFilterBtnActive]}
                onPress={() => setFilterCategory(cat.id)}
              >
                <Text style={[styles.catFilterBtnText, filterCategory === cat.id && styles.catFilterBtnTextActive]}>{cat.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>

      <View style={styles.statusContainer}>
        {isOffline && <Text style={styles.offlineText}>Offline Mode</Text>}
        {lastRefreshed && (
          <Text style={styles.refreshText}>Synced: {new Date(lastRefreshed).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
        )}
      </View>

      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refreshTasks} tintColor={Colors.primary} />}
        ListEmptyComponent={!loading ? (
          <View style={styles.emptyContainer}>
            <Icon name="check-circle-outline" size={48} color={Colors.border} style={{ marginBottom: Spacing.sm }} />
            <Text style={styles.emptyTitle}>All caught up!</Text>
            <Text style={styles.emptySubtitle}>You have no tasks matching this criteria.</Text>
          </View>
        ) : null}
      />
      
      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('TaskDetail')} activeOpacity={0.8}>
        <Icon name="plus" size={32} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.md, backgroundColor: Colors.background },
  searchInput: { 
    ...Typography.body,
    backgroundColor: Colors.card, paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, 
    borderRadius: BorderRadius.md, marginBottom: Spacing.md, color: Colors.textMain,
    borderWidth: 1, borderColor: Colors.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 3, elevation: 1
  },
  filters: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  filterGroup: { flexDirection: 'row', gap: Spacing.sm },
  filterBtn: { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md, backgroundColor: Colors.border, borderRadius: BorderRadius.sm },
  activeBtn: { backgroundColor: Colors.primary },
  filterBtnText: { ...Typography.labelBold, color: Colors.textMain },
  activeBtnText: { color: '#fff' },
  sortBtn: { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.gutter },
  sortBtnText: { ...Typography.labelBold, color: Colors.textMuted },
  
  categoryFilters: { marginTop: Spacing.md, paddingBottom: Spacing.xs },
  catFilterBtn: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, backgroundColor: Colors.card, borderRadius: BorderRadius.full, marginRight: Spacing.sm, borderWidth: 1, borderColor: Colors.border },
  catFilterBtnActive: { backgroundColor: Colors.primaryLight, borderColor: Colors.primary },
  catFilterBtnText: { ...Typography.caption, color: Colors.textMuted, fontWeight: '600' },
  catFilterBtnTextActive: { color: Colors.primary },
  
  statusContainer: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingBottom: Spacing.sm },
  offlineText: { ...Typography.caption, color: Colors.error, fontWeight: '700' },
  refreshText: { ...Typography.caption, color: Colors.textMuted, fontWeight: '500' },
  
  list: { padding: Spacing.lg, paddingTop: Spacing.sm, paddingBottom: 100 },
  taskCard: { 
    backgroundColor: Colors.card, padding: Spacing.lg, borderRadius: BorderRadius.lg, marginBottom: Spacing.md,
    borderWidth: 1, borderColor: '#F4F4F5',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 12, elevation: 2
  },
  taskHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.gutter },
  taskTitle: { ...Typography.sectionTitle, color: Colors.textMain, flex: 1, marginRight: Spacing.gutter },
  doneText: { textDecorationLine: 'line-through', color: '#A1A1AA' },
  
  taskFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  taskStatus: { ...Typography.caption, fontWeight: '700', paddingVertical: Spacing.xs, paddingHorizontal: Spacing.sm, borderRadius: BorderRadius.sm, overflow: 'hidden' },
  statusOpen: { backgroundColor: Colors.primaryLight, color: Colors.primary },
  statusDone: { backgroundColor: '#F4F4F5', color: Colors.textMuted },
  dateText: { ...Typography.caption, color: Colors.textMuted, fontWeight: '600' },
  
  emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 60 },
  emptyTitle: { ...Typography.sectionTitle, color: Colors.textMain, marginBottom: Spacing.xs },
  emptySubtitle: { ...Typography.body, color: Colors.textMuted, textAlign: 'center' },
  
  fab: { 
    position: 'absolute', bottom: Spacing.lg, right: Spacing.lg, backgroundColor: Colors.primary, 
    width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', 
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8 
  },
});

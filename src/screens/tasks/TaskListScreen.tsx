import React, { useEffect, useState, useCallback, memo, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, RefreshControl, StatusBar, ScrollView, Modal, Pressable, ActivityIndicator } from 'react-native';
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
        {item.status.replace('_', ' ').toUpperCase()}
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
  const [showStatusFilterModal, setShowStatusFilterModal] = useState(false);
  const [showSortModal, setShowSortModal] = useState(false);
  const [showCategoryFilterModal, setShowCategoryFilterModal] = useState(false);
  const { items: categories } = useSelector((state: RootState) => state.categories);

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

  useEffect(() => {
    let wasOffline = false;
    const unsubscribe = NetInfo.addEventListener(state => {
      const currentlyOffline = state.isConnected === false;
      setIsOffline(currentlyOffline);
      
      if (wasOffline && !currentlyOffline) {
        refreshTasks();
      }
      wasOffline = currentlyOffline;
    });
    return unsubscribe;
  }, [refreshTasks]);

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
          <TouchableOpacity style={styles.dropdownBtn} onPress={() => setShowStatusFilterModal(true)}>
            <Icon name="filter-variant" size={16} color={Colors.textMuted} style={{ marginRight: Spacing.xs }} />
            <Text style={styles.dropdownText} numberOfLines={1}>
              {filterStatus ? filterStatus.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Status'}
            </Text>
            <Icon name="chevron-down" size={16} color={Colors.textMuted} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.dropdownBtn} onPress={() => setShowCategoryFilterModal(true)}>
            <Icon name="tag" size={16} color={Colors.textMuted} style={{ marginRight: Spacing.xs }} />
            <Text style={styles.dropdownText} numberOfLines={1}>
              {filterCategory ? categories.find(c => c.id === filterCategory)?.name || 'Category' : 'Category'}
            </Text>
            <Icon name="chevron-down" size={16} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>
        <View style={styles.subFiltersContainer}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
            {loading ? (
              <>
                <ActivityIndicator size="small" color={Colors.primary} />
                <Text style={[styles.refreshText, { color: Colors.primary, fontWeight: '600' }]}>Syncing...</Text>
              </>
            ) : isOffline ? (
              <Text style={styles.offlineText}>Offline</Text>
            ) : (
              lastRefreshed && (
                <Text style={styles.refreshText}>Synced: {new Date(lastRefreshed).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
              )
            )}
          </View>
          <TouchableOpacity style={styles.iconBtn} onPress={() => setShowSortModal(true)}>
            <Icon name="sort-variant" size={20} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>
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
      
      <Modal visible={showStatusFilterModal} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setShowStatusFilterModal(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Filter by Status</Text>
            <ScrollView style={styles.modalScroll}>
              <TouchableOpacity 
                style={styles.modalItem} 
                onPress={() => { setFilterStatus(null); setShowStatusFilterModal(false); }}
              >
                <Text style={[styles.modalItemText, filterStatus === null && styles.modalItemTextActive]}>All Statuses</Text>
                {filterStatus === null && <Icon name="check" size={20} color={Colors.primary} />}
              </TouchableOpacity>
              {[
                { label: 'Open', value: 'open' },
                { label: 'In Progress', value: 'in_progress' },
                { label: 'In Review', value: 'in_review' },
                { label: 'Done', value: 'done' },
              ].map(s => (
                <TouchableOpacity 
                  key={s.value} 
                  style={styles.modalItem} 
                  onPress={() => { setFilterStatus(s.value as any); setShowStatusFilterModal(false); }}
                >
                  <Text style={[styles.modalItemText, filterStatus === s.value && styles.modalItemTextActive]}>{s.label}</Text>
                  {filterStatus === s.value && <Icon name="check" size={20} color={Colors.primary} />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>

      <Modal visible={showSortModal} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setShowSortModal(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Sort By</Text>
            <ScrollView style={styles.modalScroll}>
              <TouchableOpacity 
                style={styles.modalItem} 
                onPress={() => { setSortBy('created_at'); setShowSortModal(false); }}
              >
                <Text style={[styles.modalItemText, sortBy === 'created_at' && styles.modalItemTextActive]}>Created Date</Text>
                {sortBy === 'created_at' && <Icon name="check" size={20} color={Colors.primary} />}
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.modalItem} 
                onPress={() => { setSortBy('due_date'); setShowSortModal(false); }}
              >
                <Text style={[styles.modalItemText, sortBy === 'due_date' && styles.modalItemTextActive]}>Due Date</Text>
                {sortBy === 'due_date' && <Icon name="check" size={20} color={Colors.primary} />}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
      
      <Modal visible={showCategoryFilterModal} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setShowCategoryFilterModal(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Filter by Category</Text>
            <ScrollView style={styles.modalScroll}>
              <TouchableOpacity 
                style={styles.modalItem} 
                onPress={() => { setFilterCategory(null); setShowCategoryFilterModal(false); }}
              >
                <Text style={[styles.modalItemText, filterCategory === null && styles.modalItemTextActive]}>All Categories</Text>
                {filterCategory === null && <Icon name="check" size={20} color={Colors.primary} />}
              </TouchableOpacity>
              {categories.map(cat => (
                <TouchableOpacity 
                  key={cat.id} 
                  style={styles.modalItem} 
                  onPress={() => { setFilterCategory(cat.id); setShowCategoryFilterModal(false); }}
                >
                  <Text style={[styles.modalItemText, filterCategory === cat.id && styles.modalItemTextActive]}>{cat.name}</Text>
                  {filterCategory === cat.id && <Icon name="check" size={20} color={Colors.primary} />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>

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
  filters: { flexDirection: 'row', gap: Spacing.sm },
  dropdownBtn: { flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: Colors.card, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: BorderRadius.md, borderWidth: 1, borderColor: Colors.border },
  dropdownText: { ...Typography.body, color: Colors.textMain, flex: 1, marginHorizontal: Spacing.xs },
  
  subFiltersContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: Spacing.sm },
  iconBtn: { padding: Spacing.sm, backgroundColor: Colors.card, borderRadius: BorderRadius.md, borderWidth: 1, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  offlineText: { ...Typography.caption, color: Colors.error, fontWeight: '700' },
  refreshText: { ...Typography.caption, color: Colors.textMuted, fontWeight: '500' },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: Colors.card, borderTopLeftRadius: BorderRadius.xl, borderTopRightRadius: BorderRadius.xl, padding: Spacing.lg, maxHeight: '60%' },
  modalTitle: { ...Typography.sectionTitle, color: Colors.textMain, marginBottom: Spacing.lg, textAlign: 'center' },
  modalScroll: { marginBottom: Spacing.lg },
  modalItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: '#F4F4F5' },
  modalItemText: { ...Typography.body, color: Colors.textMain },
  modalItemTextActive: { color: Colors.primary, fontWeight: '600' },
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

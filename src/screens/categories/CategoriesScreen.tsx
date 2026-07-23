import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, Alert, ActivityIndicator, StatusBar } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { RootState } from '../../store';
import { supabase } from '../../lib/supabase';
import { fetchCategoriesStart, fetchCategoriesSuccess, fetchCategoriesFailure, addCategory } from '../../store/categoriesSlice';
import { Header } from '../../components/common/Header';
import { Colors, Spacing, BorderRadius, Typography } from '../../constants';

export const CategoriesScreen = () => {
  const dispatch = useDispatch();
  const { items, loading } = useSelector((state: RootState) => state.categories);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchCategories = async () => {
    dispatch(fetchCategoriesStart());
    try {
      const { data, error } = await supabase.from('categories').select('*').order('created_at', { ascending: true });
      if (error) throw error;
      dispatch(fetchCategoriesSuccess(data || []));
    } catch (e: any) {
      dispatch(fetchCategoriesFailure(e.message));
    }
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    setIsAdding(true);
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert([{ name: newCategoryName }])
        .select()
        .single();
        
      if (error) throw error;
      dispatch(addCategory(data));
      setNewCategoryName('');
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      
      <Header title="Categories" subtitle="Manage your task spaces" showBack={false} />

      <View style={styles.addCategoryContainer}>
        <TextInput
          style={styles.input}
          value={newCategoryName}
          onChangeText={setNewCategoryName}
          placeholder="New category name..."
          placeholderTextColor={Colors.textMuted}
        />
        <TouchableOpacity style={styles.addBtn} onPress={handleAddCategory} disabled={isAdding || !newCategoryName.trim()} activeOpacity={0.8}>
          {isAdding ? <ActivityIndicator color="#fff" size="small" /> : <Icon name="plus" size={24} color="#fff" />}
        </TouchableOpacity>
      </View>

      {loading && !items.length ? (
        <ActivityIndicator style={styles.loader} color={Colors.primary} size="large" />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.categoryCard}>
              <View style={styles.categoryIconWrap}>
                <Icon name="folder-outline" size={20} color={Colors.primary} />
              </View>
              <Text style={styles.categoryName}>{item.name}</Text>
            </View>
          )}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="folder-open-outline" size={48} color={Colors.border} style={{ marginBottom: Spacing.sm }} />
              <Text style={styles.emptyText}>No categories found.</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  loader: { marginTop: 40 },
  
  addCategoryContainer: { flexDirection: 'row', paddingHorizontal: Spacing.lg, marginBottom: Spacing.md },
  input: { 
    ...Typography.body,
    flex: 1, backgroundColor: Colors.card, paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, 
    borderRadius: BorderRadius.md, marginRight: Spacing.gutter, color: Colors.textMain,
    borderWidth: 1, borderColor: Colors.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 3, elevation: 1
  },
  addBtn: { backgroundColor: Colors.primary, width: 52, height: 52, justifyContent: 'center', alignItems: 'center', borderRadius: BorderRadius.md, shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 6, elevation: 3 },
  
  list: { padding: Spacing.lg, paddingTop: Spacing.sm },
  categoryCard: { 
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.card, 
    padding: Spacing.md, borderRadius: BorderRadius.lg, marginBottom: Spacing.gutter,
    borderWidth: 1, borderColor: '#F4F4F5',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 1
  },
  categoryIconWrap: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primaryLight, justifyContent: 'center', alignItems: 'center', marginRight: Spacing.md },
  categoryName: { ...Typography.body, fontWeight: '600', color: Colors.textMain },
  
  emptyContainer: { alignItems: 'center', marginTop: 40 },
  emptyText: { ...Typography.body, textAlign: 'center', color: Colors.textMuted },
});

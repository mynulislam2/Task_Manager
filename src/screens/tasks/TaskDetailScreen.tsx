import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView, Modal, Pressable } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTasks } from '../../hooks/useTasks';
import { RootState } from '../../store';
import { Header } from '../../components/common/Header';
import { Colors, Spacing, BorderRadius, Typography } from '../../constants';

export const TaskDetailScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const taskId = route.params?.taskId;
  
  const { tasks, createNewTask, editTask, removeTask, toggleTaskStar } = useTasks();
  const { items: categories } = useSelector((state: RootState) => state.categories);
  
  const task = tasks.find(t => t.id === taskId);
  
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [status, setStatus] = useState<'open' | 'done'>(task?.status || 'open');
  const [dueDate, setDueDate] = useState<Date | null>(task?.due_date ? new Date(task.due_date) : null);
  const [categoryId, setCategoryId] = useState<string | null>(task?.category_id || null);
  
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setStatus(task.status);
    }
  }, [task]);

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Hold on', 'A task title is required.');
      return;
    }

    try {
      if (taskId) {
        await editTask(taskId, { title, description, status, due_date: dueDate?.toISOString() || null, category_id: categoryId });
      } else {
        await createNewTask({ title, description, status, due_date: dueDate?.toISOString() || null, category_id: categoryId });
      }
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  const handleDelete = () => {
    Alert.alert('Delete Task', 'Are you sure you want to delete this task? This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          await removeTask(taskId);
          navigation.goBack();
        } catch (e: any) {
          Alert.alert('Error', e.message);
        }
      }}
    ]);
  };

  const selectedCategory = categories.find(c => c.id === categoryId);

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <Header 
        title={taskId ? 'Edit Task' : 'New Task'} 
        rightElement={
          <TouchableOpacity onPress={handleSave} style={styles.headerSaveBtn} activeOpacity={0.7}>
            <Text style={styles.headerSaveText}>Save</Text>
          </TouchableOpacity>
        }
      />
      
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        
        {/* Title & Status Row */}
        <View style={styles.titleRow}>
          <TouchableOpacity 
            style={styles.checkboxWrap} 
            onPress={() => setStatus(status === 'open' ? 'done' : 'open')}
            activeOpacity={0.7}
          >
            <Icon 
              name={status === 'done' ? "check-circle" : "checkbox-blank-circle-outline"} 
              size={32} 
              color={status === 'done' ? Colors.primary : '#D4D4D8'} 
            />
          </TouchableOpacity>
          
          <TextInput
            style={[styles.titleInput, status === 'done' && styles.titleInputDone]}
            value={title}
            onChangeText={setTitle}
            placeholder="What needs to be done?"
            placeholderTextColor="#A1A1AA"
            autoFocus={!taskId}
            multiline
          />

          {taskId && (
            <TouchableOpacity onPress={() => toggleTaskStar(taskId)} style={styles.starBtn} activeOpacity={0.7}>
              <Icon 
                name={task?.starred ? "star" : "star-outline"} 
                size={26} 
                color={task?.starred ? Colors.warning : '#D4D4D8'} 
              />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.divider} />

        {/* Properties Section */}
        <View style={styles.propertiesSection}>
          
          <TouchableOpacity style={styles.propertyRow} onPress={() => setShowCategoryModal(true)} activeOpacity={0.7}>
            <Icon name="folder-outline" size={22} color={Colors.textMuted} style={styles.propertyIcon} />
            <Text style={styles.propertyLabel}>Category</Text>
            <Text style={styles.propertyValue}>{selectedCategory ? selectedCategory.name : 'None'}</Text>
            <Icon name="chevron-right" size={20} color={Colors.border} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.propertyRow} onPress={() => setShowDatePicker(true)} activeOpacity={0.7}>
            <Icon name="calendar-outline" size={22} color={Colors.textMuted} style={styles.propertyIcon} />
            <Text style={styles.propertyLabel}>Due Date</Text>
            <Text style={styles.propertyValue}>{dueDate ? dueDate.toLocaleDateString() : 'None'}</Text>
            {dueDate ? (
              <TouchableOpacity onPress={() => setDueDate(null)} style={styles.clearDateBtn}>
                <Icon name="close-circle" size={20} color={Colors.border} />
              </TouchableOpacity>
            ) : (
              <Icon name="chevron-right" size={20} color={Colors.border} />
            )}
          </TouchableOpacity>
          
        </View>

        <View style={styles.divider} />

        {/* Description */}
        <TextInput
          style={styles.descriptionInput}
          value={description}
          onChangeText={setDescription}
          placeholder="Add a description..."
          placeholderTextColor="#A1A1AA"
          multiline
          textAlignVertical="top"
        />

        {/* Delete Button (Only for existing tasks) */}
        {taskId && (
          <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete} activeOpacity={0.7}>
            <Icon name="trash-can-outline" size={20} color={Colors.error} style={{ marginRight: Spacing.sm }} />
            <Text style={styles.deleteBtnText}>Delete Task</Text>
          </TouchableOpacity>
        )}

      </ScrollView>

      {/* Date Picker Modal / Overlay */}
      {showDatePicker && (
        <DateTimePicker
          value={dueDate || new Date()}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (event.type === 'set' && selectedDate) {
              setDueDate(selectedDate);
            }
          }}
        />
      )}

      {/* Category Picker Modal */}
      <Modal visible={showCategoryModal} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setShowCategoryModal(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Category</Text>
            <ScrollView style={styles.modalScroll}>
              <TouchableOpacity 
                style={styles.modalItem} 
                onPress={() => { setCategoryId(null); setShowCategoryModal(false); }}
              >
                <Text style={[styles.modalItemText, categoryId === null && styles.modalItemTextActive]}>None</Text>
                {categoryId === null && <Icon name="check" size={20} color={Colors.primary} />}
              </TouchableOpacity>
              
              {categories.map(cat => (
                <TouchableOpacity 
                  key={cat.id} 
                  style={styles.modalItem} 
                  onPress={() => { setCategoryId(cat.id); setShowCategoryModal(false); }}
                >
                  <Text style={[styles.modalItemText, categoryId === cat.id && styles.modalItemTextActive]}>{cat.name}</Text>
                  {categoryId === cat.id && <Icon name="check" size={20} color={Colors.primary} />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>

    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { padding: Spacing.lg, paddingBottom: 100 },
  
  headerSaveBtn: { padding: Spacing.xs },
  headerSaveText: { ...Typography.sectionTitle, color: Colors.primary },
  
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: Spacing.md },
  checkboxWrap: { marginRight: Spacing.md, marginTop: 4 },
  titleInput: { 
    flex: 1, 
    ...Typography.h1, 
    color: Colors.textMain, 
    padding: 0,
    margin: 0,
    minHeight: 40,
  },
  titleInputDone: {
    textDecorationLine: 'line-through',
    color: '#A1A1AA',
  },
  starBtn: { marginLeft: Spacing.md, marginTop: 4 },
  
  divider: { height: 1, backgroundColor: '#F4F4F5', marginVertical: Spacing.md },
  
  propertiesSection: { marginVertical: Spacing.sm },
  propertyRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.md },
  propertyIcon: { marginRight: Spacing.md, width: 24, textAlign: 'center' },
  propertyLabel: { ...Typography.body, color: Colors.textMain, flex: 1 },
  propertyValue: { ...Typography.body, color: Colors.textMuted, marginRight: Spacing.sm },
  clearDateBtn: { padding: 2 },
  
  descriptionInput: {
    ...Typography.body,
    color: Colors.textMain,
    minHeight: 150,
    marginTop: Spacing.sm,
    padding: 0,
  },
  
  deleteBtn: { 
    flexDirection: 'row',
    justifyContent: 'center', 
    alignItems: 'center', 
    marginTop: 40, 
    padding: Spacing.md,
  },
  deleteBtnText: { ...Typography.body, color: Colors.error, fontWeight: '600' },
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.lg,
    maxHeight: '60%',
  },
  modalTitle: {
    ...Typography.sectionTitle,
    color: Colors.textMain,
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  modalScroll: {
    marginBottom: Spacing.lg,
  },
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F4F4F5',
  },
  modalItemText: {
    ...Typography.body,
    color: Colors.textMain,
  },
  modalItemTextActive: {
    color: Colors.primary,
    fontWeight: '600',
  },
});

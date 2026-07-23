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
import { TaskStatus } from '../../types';
export const TaskDetailScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const taskId = route.params?.taskId;
  
  const { tasks, createNewTask, editTask, removeTask, toggleTaskStar } = useTasks();
  const { items: categories } = useSelector((state: RootState) => state.categories);
  
  const task = tasks.find(t => t.id === taskId);
  
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [status, setStatus] = useState<TaskStatus>(task?.status || 'open');
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [dueDate, setDueDate] = useState<Date | null>(task?.due_date ? new Date(task.due_date) : null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [categoryId, setCategoryId] = useState<string | null>(task?.category_id || null);
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

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <Header 
        title={taskId ? 'Edit Task' : 'New Task'} 
        rightElement={
          taskId ? (
            <TouchableOpacity onPress={() => toggleTaskStar(taskId)} style={styles.starBtn} activeOpacity={0.7}>
              <Icon 
                name={task?.starred ? "star" : "star-outline"} 
                size={24} 
                color={task?.starred ? Colors.warning : '#D4D4D8'} 
              />
            </TouchableOpacity>
          ) : undefined
        }
      />
      <ScrollView contentContainerStyle={styles.scrollContent}>

        <View style={styles.card}>
          <Text style={styles.label}>Task Name</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. Finish the quarterly report"
            placeholderTextColor="#A1A1AA"
          />

          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Add details..."
            placeholderTextColor="#A1A1AA"
            multiline
            textAlignVertical="top"
          />

          <View style={styles.statusSection}>
            <Text style={styles.label}>Due Date</Text>
            <TouchableOpacity style={styles.dateBtn} onPress={() => setShowDatePicker(true)}>
              <View style={styles.dateBtnInner}>
                <Icon name="calendar" size={20} color={Colors.textMuted} style={{ marginRight: Spacing.sm }} />
                <Text style={styles.dateBtnText}>{dueDate ? dueDate.toLocaleDateString() : 'Set Due Date'}</Text>
              </View>
              {dueDate && (
                 <TouchableOpacity onPress={() => setDueDate(null)} style={styles.clearDateBtn}>
                   <Icon name="close" size={20} color={Colors.textMuted} />
                 </TouchableOpacity>
              )}
            </TouchableOpacity>
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
          </View>

          <View style={styles.statusSection}>
            <Text style={styles.label}>Category</Text>
            <TouchableOpacity style={styles.dropdownBtn} onPress={() => setShowCategoryModal(true)}>
              <View style={styles.dateBtnInner}>
                <Icon name="folder-outline" size={20} color={Colors.textMuted} style={{ marginRight: Spacing.sm }} />
                <Text style={styles.dateBtnText}>
                  {categories.find(c => c.id === categoryId)?.name || 'None'}
                </Text>
              </View>
              <Icon name="chevron-down" size={20} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>

          <View style={styles.statusSection}>
            <Text style={styles.label}>Status</Text>
            <TouchableOpacity style={styles.dropdownBtn} onPress={() => setShowStatusModal(true)}>
              <View style={styles.dateBtnInner}>
                <Icon name="list-status" size={20} color={Colors.textMuted} style={{ marginRight: Spacing.sm }} />
                <Text style={styles.dateBtnText}>
                  {status === 'open' ? 'Open' : status === 'in_progress' ? 'In Progress' : status === 'in_review' ? 'In Review' : 'Completed'}
                </Text>
              </View>
              <Icon name="chevron-down" size={20} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>

      <View style={styles.stickyFooter}>
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.8}>
          <Text style={styles.saveBtnText}>{taskId ? 'Save Changes' : 'Create Task'}</Text>
        </TouchableOpacity>

        {taskId && (
          <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete} activeOpacity={0.7}>
            <Text style={styles.deleteBtnText}>Delete Task</Text>
          </TouchableOpacity>
        )}
      </View>

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
              <TouchableOpacity 
                style={[styles.modalItem, { borderBottomWidth: 0, marginTop: Spacing.sm }]} 
                onPress={() => { 
                  setShowCategoryModal(false); 
                  setTimeout(() => navigation.navigate('CategoriesTab'), 100);
                }}
              >
                <Text style={[styles.modalItemText, { color: Colors.primary }]}>+ Create new category</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </Pressable>
      </Modal>

      <Modal visible={showStatusModal} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setShowStatusModal(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Status</Text>
            <ScrollView style={styles.modalScroll}>
              {[
                { label: 'Open', value: 'open' },
                { label: 'In Progress', value: 'in_progress' },
                { label: 'In Review', value: 'in_review' },
                { label: 'Completed', value: 'done' }
              ].map(s => (
                <TouchableOpacity 
                  key={s.value} 
                  style={styles.modalItem} 
                  onPress={() => { setStatus(s.value as TaskStatus); setShowStatusModal(false); }}
                >
                  <Text style={[styles.modalItemText, status === s.value && styles.modalItemTextActive]}>{s.label}</Text>
                  {status === s.value && <Icon name="check" size={20} color={Colors.primary} />}
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
  scrollContent: { padding: Spacing.lg, paddingBottom: 60 },
  starBtn: { padding: Spacing.sm, backgroundColor: Colors.card, borderRadius: BorderRadius.md, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  
  card: { backgroundColor: Colors.card, padding: Spacing.lg, borderRadius: BorderRadius.lg, marginBottom: Spacing.lg, borderWidth: 1, borderColor: Colors.border },
  label: { ...Typography.labelBold, color: Colors.textMuted, marginBottom: Spacing.sm, textTransform: 'uppercase' },
  input: { 
    ...Typography.body,
    backgroundColor: '#F4F4F5', paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, 
    borderRadius: BorderRadius.md, marginBottom: Spacing.lg, color: Colors.textMain,
    borderWidth: 1, borderColor: Colors.border
  },
  textArea: { height: 120, paddingTop: Spacing.md },
  
  statusSection: { marginBottom: Spacing.lg },
  statusToggle: { flexDirection: 'row', backgroundColor: '#F4F4F5', borderRadius: BorderRadius.md, padding: Spacing.xs },
  statusOption: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: BorderRadius.sm },
  statusOptionActive: { backgroundColor: Colors.card, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 1 },
  statusOptionText: { ...Typography.body, fontWeight: '600', color: Colors.textMuted },
  statusOptionTextActive: { color: Colors.textMain },
  
  dateBtn: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F4F4F5', paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, borderRadius: BorderRadius.md, borderWidth: 1, borderColor: Colors.border },
  dropdownBtn: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F4F4F5', paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, borderRadius: BorderRadius.md, borderWidth: 1, borderColor: Colors.border },
  dateBtnInner: { flexDirection: 'row', alignItems: 'center' },
  dateBtnText: { ...Typography.body, color: Colors.textMain },
  clearDateBtn: { padding: 4 },
  
  checkboxBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.sm },
  checkboxText: { ...Typography.body, color: Colors.textMuted, marginLeft: Spacing.sm },
  checkboxTextActive: { color: Colors.primary, fontWeight: '600' },
  
  stickyFooter: {
    padding: Spacing.lg,
    paddingTop: Spacing.md,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: '#F4F4F5',
  },
  saveBtn: { backgroundColor: Colors.primary, paddingVertical: 14, borderRadius: BorderRadius.md, alignItems: 'center', shadowColor: Colors.primary, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4, elevation: 2 },
  saveBtnText: { ...Typography.body, fontWeight: '700', color: '#fff' },
  
  deleteBtn: { marginTop: Spacing.sm, padding: 8, alignItems: 'center' },
  deleteBtnText: { ...Typography.body, color: Colors.error, fontWeight: '600' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: Colors.card, borderTopLeftRadius: BorderRadius.xl, borderTopRightRadius: BorderRadius.xl, padding: Spacing.lg, maxHeight: '60%' },
  modalTitle: { ...Typography.sectionTitle, color: Colors.textMain, marginBottom: Spacing.lg, textAlign: 'center' },
  modalScroll: { marginBottom: Spacing.lg },
  modalItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: '#F4F4F5' },
  modalItemText: { ...Typography.body, color: Colors.textMain },
  modalItemTextActive: { color: Colors.primary, fontWeight: '600' },
});

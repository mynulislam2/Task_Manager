import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
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
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [categoryId, setCategoryId] = useState<string | null>(task?.category_id || null);

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
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
              <TouchableOpacity 
                style={[styles.categoryOption, categoryId === null && styles.categoryOptionActive]}
                onPress={() => setCategoryId(null)}
              >
                <Text style={[styles.categoryOptionText, categoryId === null && styles.categoryOptionTextActive]}>None</Text>
              </TouchableOpacity>
              {categories.map(cat => (
                <TouchableOpacity 
                  key={cat.id}
                  style={[styles.categoryOption, categoryId === cat.id && styles.categoryOptionActive]}
                  onPress={() => setCategoryId(cat.id)}
                >
                  <Text style={[styles.categoryOptionText, categoryId === cat.id && styles.categoryOptionTextActive]}>{cat.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.statusSection}>
            <Text style={styles.label}>Status</Text>
            <View style={styles.statusToggle}>
              <TouchableOpacity 
                style={[styles.statusOption, status === 'open' && styles.statusOptionActive]}
                onPress={() => setStatus('open')}
                activeOpacity={0.8}
              >
                <Text style={[styles.statusOptionText, status === 'open' && styles.statusOptionTextActive]}>Open</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.statusOption, status === 'done' && styles.statusOptionActive]}
                onPress={() => setStatus('done')}
                activeOpacity={0.8}
              >
                <Text style={[styles.statusOptionText, status === 'done' && styles.statusOptionTextActive]}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.8}>
          <Text style={styles.saveBtnText}>{taskId ? 'Save Changes' : 'Create Task'}</Text>
        </TouchableOpacity>

        {taskId && (
          <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete} activeOpacity={0.7}>
            <Text style={styles.deleteBtnText}>Delete Task</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { padding: Spacing.lg, paddingBottom: 60 },
  starBtn: { padding: Spacing.sm, backgroundColor: Colors.card, borderRadius: BorderRadius.md, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  
  card: { backgroundColor: Colors.card, padding: Spacing.lg, borderRadius: BorderRadius.lg, marginBottom: Spacing.lg, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 12, elevation: 2 },
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
  dateBtnInner: { flexDirection: 'row', alignItems: 'center' },
  dateBtnText: { ...Typography.body, color: Colors.textMain },
  clearDateBtn: { padding: 4 },
  
  categoryScroll: { flexDirection: 'row' },
  categoryOption: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, backgroundColor: '#F4F4F5', borderRadius: BorderRadius.full, marginRight: Spacing.sm, borderWidth: 1, borderColor: Colors.border },
  categoryOptionActive: { backgroundColor: Colors.primaryLight, borderColor: Colors.primary },
  categoryOptionText: { ...Typography.body, color: Colors.textMuted },
  categoryOptionTextActive: { color: Colors.primary, fontWeight: '600' },
  
  saveBtn: { backgroundColor: Colors.primary, padding: Spacing.lg, borderRadius: BorderRadius.md, alignItems: 'center', shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  saveBtnText: { ...Typography.sectionTitle, color: '#fff' },
  
  deleteBtn: { marginTop: Spacing.lg, padding: Spacing.md, alignItems: 'center' },
  deleteBtnText: { ...Typography.body, color: Colors.error, fontWeight: '600' },
});

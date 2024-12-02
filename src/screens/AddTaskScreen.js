import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons'; // Importando os ícones corretamente
import DateTimePicker from '@react-native-community/datetimepicker';
import { db } from '../services/firebase';
import { addDoc, collection } from 'firebase/firestore';

export default function AddTaskScreen({ navigation }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [priority, setPriority] = useState('low');
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  // Função para salvar a tarefa no Firestore
  const handleSaveTask = async () => {
    try {
      await addDoc(collection(db, 'tasks'), {
        title,
        description,
        startDate,
        endDate,
        priority,
        status: 'pending',
      });
      navigation.goBack();
    } catch (error) {
      console.error('Error adding document: ', error);
    }
  };

  // Função para exibir o DatePicker de início
  const showStartDatePickerHandler = () => {
    setShowStartDatePicker(true);
  };

  // Função para exibir o DatePicker de fim
  const showEndDatePickerHandler = () => {
    setShowEndDatePicker(true);
  };

  // Função para atualizar a data inicial
  const onChangeStartDate = (event, selectedDate) => {
    setShowStartDatePicker(false);
    const currentDate = selectedDate || startDate;
    setStartDate(currentDate);
  };

  // Função para atualizar a data final
  const onChangeEndDate = (event, selectedDate) => {
    setShowEndDatePicker(false);
    const currentDate = selectedDate || endDate;
    setEndDate(currentDate);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.header}>Adicionar Tarefa</Text>

        {/* Título da tarefa */}
        <TextInput
          style={styles.input}
          placeholder="Título"
          value={title}
          onChangeText={setTitle}
        />

        {/* Descrição da tarefa */}
        <TextInput
          style={styles.input}
          placeholder="Descrição"
          value={description}
          onChangeText={setDescription}
        />

        {/* Contêiner para as Data Inicial e Final, com alinhamento central */}
        <View style={styles.dateRow}>
          {/* Campo de Data Inicial */}
          <View style={styles.dateContainer}>
            <Text style={styles.label}>Data Inicial</Text>
            <TextInput
              style={styles.dateInput}
              placeholder="Selecione Data Início"
              value={startDate ? startDate.toLocaleDateString() : ''}
              onFocus={showStartDatePickerHandler}
            />
            {showStartDatePicker && (
              <DateTimePicker
                value={startDate}
                mode="date"
                display="default"
                onChange={onChangeStartDate}
              />
            )}
          </View>

          {/* Campo de Data Final */}
          <View style={styles.dateContainer}>
            <Text style={styles.label}>Data Final</Text>
            <TextInput
              style={styles.dateInput}
              placeholder="Selecione Data Fim"
              value={endDate ? endDate.toLocaleDateString() : ''}
              onFocus={showEndDatePickerHandler}
            />
            {showEndDatePicker && (
              <DateTimePicker
                value={endDate}
                mode="date"
                display="default"
                onChange={onChangeEndDate}
              />
            )}
          </View>
        </View>

        {/* Flags de Prioridade */}
        <View style={styles.priorityRow}>
          {['low', 'medium', 'high', 'urgent'].map((level) => (
            <TouchableOpacity
              key={level}
              style={[
                styles.priorityButton,
                { backgroundColor: priority === level ? getSelectedPriorityColor(level) : getPriorityColor(level) }
              ]}
              onPress={() => setPriority(level)}
            >
              <Text style={styles.priorityText}>{getPriorityLabel(level)}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Botão de Salvar */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSaveTask}>
          <Text style={styles.saveButtonText}>Salvar Tarefa</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Footer com ícones de navegação */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.footerButton}
          onPress={() => navigation.navigate("TaskList")}
        >
          <MaterialIcons name="list" size={30} color="#007bff" />
          <Text style={styles.footerText}>Tarefas</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.footerButton}
          onPress={() => navigation.navigate("AddTask")}
        >
          <MaterialIcons name="add-circle" size={30} color="#007bff" />
          <Text style={styles.footerText}>Adicionar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.footerButton}
          onPress={() => navigation.navigate("History")}
        >
          <MaterialIcons name="history" size={30} color="#007bff" />
          <Text style={styles.footerText}>Histórico</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Função para retornar a cor da prioridade (tons pastéis)
const getPriorityColor = (priority) => {
  switch (priority) {
    case 'low':
      return '#a5d6a7'; // Verde claro (pastel)
    case 'medium':
      return '#fff176'; // Amarelo claro (pastel)
    case 'high':
      return '#ffcc80'; // Laranja claro (pastel)
    case 'urgent':
      return '#ff8a80'; // Vermelho claro (pastel)
    default:
      return '#a5d6a7';
  }
};

// Função para retornar a cor da prioridade quando selecionada (cores quentes)
const getSelectedPriorityColor = (priority) => {
  switch (priority) {
    case 'low':
      return '#388e3c'; // Verde escuro (quente)
    case 'medium':
      return '#fbc02d'; // Amarelo escuro (quente)
    case 'high':
      return '#f57c00'; // Laranja escuro (quente)
    case 'urgent':
      return '#d32f2f'; // Vermelho escuro (quente)
    default:
      return '#388e3c';
  }
};

// Função para retornar o label da prioridade
const getPriorityLabel = (priority) => {
  switch (priority) {
    case 'low':
      return 'Baixa';
    case 'medium':
      return 'Média';
    case 'high':
      return 'Alta';
    case 'urgent':
      return 'Urgente';
    default:
      return 'Baixa';
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: "#8f9fa",
    width: "100%",
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20, // Garante que o conteúdo não sobreponha o footer
  },
  header: {
    paddingTop:60,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 25,
  },
  input: {
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  dateContainer: {
    flex: 1,
    marginHorizontal: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
  },
  dateInput: {
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    marginBottom: 10,
    textAlign: 'center',
  },
  priorityRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  priorityButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginHorizontal: 5,
  },
  priorityText: {
    color: 'black',
    fontWeight: 'bold',
  },
  footer: {
    position: 'absolute',  // Coloca o footer fixo no final da tela
    bottom: 0, // Alinha o footer à parte inferior da tela
    left: 10,   // Garante que ele comece no lado esquerdo
    width: '100%', // Faz o footer ocupar a largura inteira
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "white",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  footerButton: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#007bff',
  },
  saveButton: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});


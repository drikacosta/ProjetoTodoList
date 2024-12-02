import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import { collection, onSnapshot, doc, updateDoc, getDoc, addDoc, deleteDoc } from "firebase/firestore";
import { db } from "../services/firebase";
import { MaterialIcons } from "@expo/vector-icons";

export default function TaskListScreen({ navigation }) {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('');

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "tasks"), (snapshot) => {
      const tasksArray = [];
      snapshot.forEach((doc) => tasksArray.push({ id: doc.id, ...doc.data() }));
      setTasks(tasksArray);
      setFilteredTasks(tasksArray); // Inicializa as tarefas filtradas com todas as tarefas
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const moveToHistory = async (taskId) => {
    try {
      const taskRef = doc(db, "tasks", taskId);
      const taskSnapshot = await getDoc(taskRef);

      if (taskSnapshot.exists()) {
        const taskData = taskSnapshot.data();
        await addDoc(collection(db, "taskHistory"), {
          ...taskData,
          completedAt: new Date(),
        });
        await deleteDoc(taskRef);
      }
    } catch (error) {
      console.error("Erro ao mover tarefa para histórico:", error);
    }
  };

  const toggleTaskStatus = (taskId, currentStatus) => {
    Alert.alert(
      "Alterar Status",
      `Tem certeza que deseja ${currentStatus === 'completed' ? 'marcar como Pendente' : 'marcar como Concluída'}?`,
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Sim",
          onPress: async () => {
            const taskRef = doc(db, "tasks", taskId);
            await updateDoc(taskRef, { status: currentStatus === "completed" ? "pending" : "completed" });
            if (currentStatus !== "completed") moveToHistory(taskId);
          },
        },
      ]
    );
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'low': return '#388e3c';
      case 'medium': return '#fbc02d';
      case 'high': return '#f57c00';
      case 'urgent': return '#d32f2f';
      default: return '#388e3c';
    }
  };

  const getPriorityLabel = (priority) => {
    switch (priority) {
      case 'low': return 'Baixa';
      case 'medium': return 'Média';
      case 'high': return 'Alta';
      case 'urgent': return 'Urgente';
      default: return 'Baixa';
    }
  };

  // Função de filtragem com base no filtro selecionado
  const filterTasks = (filter) => {
    setSelectedFilter(filter);
    let filteredData = [...tasks]; // Faz uma cópia das tarefas

    if (filter === 'name') {
      filteredData = filteredData.sort((a, b) => a.title.localeCompare(b.title));
    } else if (filter === 'priority') {
      filteredData = filteredData.sort((a, b) => {
        const priorityOrder = ['urgent', 'high', 'medium', 'low']; // Urgente vem primeiro
        return priorityOrder.indexOf(a.priority) - priorityOrder.indexOf(b.priority);
      });
    }

    setFilteredTasks(filteredData);
    setFilterModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Lista de Tarefas</Text>
        <TouchableOpacity onPress={() => setFilterModalVisible(true)}>
          <MaterialIcons name="filter-list" size={30} color="#007bff" />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <FlatList
          data={filteredTasks} // Usando as tarefas filtradas
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <TouchableOpacity
                style={styles.radioButton}
                onPress={() => toggleTaskStatus(item.id, item.status)}
              >
                {item.status === "completed" ? (
                  <View style={styles.radioSelected} />
                ) : null}
              </TouchableOpacity>
              <View style={styles.taskContent}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.status}>
                  Status: {item.status === "completed" ? "Concluída" : "Pendente"}
                </Text>
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate("TaskDetails", { taskId: item.id })
                  }
                >
                  <Text style={styles.detailsButton}>Ver detalhes</Text>
                </TouchableOpacity>
              </View>

              <View
                style={[
                  styles.priorityFlag,
                  { backgroundColor: getPriorityColor(item.priority) },
                ]}
              >
                <Text style={styles.priorityText}>{getPriorityLabel(item.priority)}</Text>
              </View>
            </View>
          )}
        />
      )}

      {/* Modal para seleção de filtro */}
      <Modal
        visible={filterModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setFilterModalVisible(false)}>
          <View style={styles.modalOverlay}></View>
        </TouchableWithoutFeedback>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Escolha o critério de filtro:</Text>

          {/* Lista de filtros */}
          <TouchableOpacity
            style={styles.filterOption}
            onPress={() => filterTasks("name")}
          >
            <Text style={styles.filterText}>Nome</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.filterOption}
            onPress={() => filterTasks("priority")}
          >
            <Text style={styles.filterText}>Prioridade</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.modalButton}
            onPress={() => setFilterModalVisible(false)}
          >
            <Text style={styles.modalButtonText}>Aplicar Filtro</Text>
          </TouchableOpacity>
        </View>
      </Modal>

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: "#f8f9fa",
  },
  header: {
    paddingTop: 60,
    marginBottom: 25,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    color: "#000",
    fontWeight: "bold",
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 15,
    marginBottom: 15,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    alignItems: "center",
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#007bff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  radioSelected: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#007bff",
  },
  taskContent: {
    flex: 1,
    justifyContent: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  status: {
    fontSize: 14,
    color: "#555",
    marginTop: 5,
  },
  detailsButton: {
    fontSize: 14,
    color: "#007bff",
    marginTop: 10,
  },
  priorityFlag: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  priorityText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#fff",
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    marginTop: "20%",
    marginHorizontal: 20,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
  },
  filterOption: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  filterText: {
    fontSize: 16,
    color: "#007bff",
  },
  modalButton: {
    marginTop: 20,
    backgroundColor: "#007bff",
    paddingVertical: 12,
    borderRadius: 5,
    alignItems: "center",
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 20,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderColor: "#eee",
  },
  footerButton: {
    alignItems: "center",
  },
  footerText: {
    fontSize: 12,
    color: "#007bff",
  },
});

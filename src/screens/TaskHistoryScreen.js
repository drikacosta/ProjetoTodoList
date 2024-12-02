import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import { collection, onSnapshot, doc, deleteDoc } from "firebase/firestore";
import { db } from "../services/firebase";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

export default function TaskHistoryScreen() {
  const [taskHistory, setTaskHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "taskHistory"), (snapshot) => {
      const tasksArray = [];
      snapshot.forEach((doc) => tasksArray.push({ id: doc.id, ...doc.data() }));
      setTaskHistory(tasksArray);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const deleteTask = async (taskId) => {
    try {
      const taskRef = doc(db, "taskHistory", taskId);
      await deleteDoc(taskRef);
      console.log("Tarefa deletada com sucesso!");
    } catch (error) {
      console.error("Erro ao deletar a tarefa:", error);
    }
  };

  const confirmDeleteTask = (taskId) => {
    Alert.alert(
      "Confirmar exclusão",
      "Você tem certeza que deseja excluir esta tarefa?",
      [
        {
          text: "Cancelar",
          onPress: () => console.log("Exclusão cancelada"),
          style: "cancel",
        },
        {
          text: "Excluir",
          onPress: () => deleteTask(taskId),
          style: "destructive",
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Histórico de Tarefas</Text>
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <FlatList
          data={taskHistory}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.taskContent}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.status}>
                  Concluída em: {item.completedAt?.toDate().toLocaleDateString()}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => confirmDeleteTask(item.id)}
              >
                <MaterialIcons name="delete" size={24} color="#d32f2f" />
              </TouchableOpacity>
            </View>
          )}
        />
      )}

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
    backgroundColor: "#f8f9fa",
    padding: 10,
 },
  header: {
    paddingTop:30,
    marginBottom: 25,
  },
  headerTitle: {
    fontSize: 24,
    color: "#000",
    fontWeight: "bold",
    },

  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    marginBottom: 10,
    backgroundColor: "#ffffff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 5,
    elevation: 3,
    justifyContent: "space-between",
  },
  taskContent: { flex: 1 },
  title: { fontSize: 16, fontWeight: "bold", color: "#333" },
  status: { fontSize: 14, color: "#666", marginTop: 5 },
  deleteButton: { marginLeft: 10 },
  footer: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 10,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderColor: "#ddd",
  },
  footerButton: { alignItems: "center" },
  footerText: { fontSize: 12, color: "#007bff" },
});

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../services/firebase";

export default function TaskDetailsScreen({ route, navigation }) {
  const { taskId } = route.params;
  const [task, setTask] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const taskDoc = await getDoc(doc(db, "tasks", taskId));
        if (taskDoc.exists()) {
          setTask({ id: taskDoc.id, ...taskDoc.data() });
        } else {
          Alert.alert("Erro", "Tarefa não encontrada.");
        }
        setIsLoading(false);
      } catch (error) {
        console.error("Erro ao buscar tarefa:", error);
        Alert.alert("Erro", "Não foi possível carregar a tarefa.");
        setIsLoading(false);
      }
    };

    fetchTask();
  }, [taskId]);

  const handleAddComment = async () => {
    if (newComment.trim() === "") {
      Alert.alert("Erro", "O comentário não pode estar vazio.");
      return;
    }

    try {
      const updatedComments = task.comments ? [...task.comments, newComment] : [newComment];
      await updateDoc(doc(db, "tasks", taskId), { comments: updatedComments });
      setTask((prev) => ({ ...prev, comments: updatedComments }));
      setNewComment("");
      Alert.alert("Sucesso", "Comentário adicionado com sucesso!");
    } catch (error) {
      console.error("Erro ao adicionar comentário:", error);
      Alert.alert("Erro", "Não foi possível adicionar o comentário.");
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  if (!task) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Tarefa não encontrada.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{task.title}</Text>
        <Text style={styles.description}>{task.description}</Text>
        <Text style={styles.status}>Status: {task.status}</Text>
      </View>

      <FlatList
        data={task.comments || []}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.commentItem}>
            <Text style={styles.commentText}>{item}</Text>
          </View>
        )}
        ListHeaderComponent={<Text style={styles.commentHeader}>Comentários:</Text>}
        ListEmptyComponent={<Text style={styles.noComments}>Nenhum comentário ainda.</Text>}
      />

      <View style={styles.commentInputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Adicionar comentário"
          value={newComment}
          onChangeText={setNewComment}
          multiline
        />
        <TouchableOpacity style={styles.button} onPress={handleAddComment}>
          <Text style={styles.buttonText}>Adicionar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },
  content: { padding: 15 },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: "#666",
    marginBottom: 15,
    fontStyle: "italic",
  },
  status: {
    fontSize: 16,
    color: "#555",
    marginBottom: 15,
  },
  commentHeader: {
    fontSize: 18,
    fontWeight: "bold",
    marginHorizontal: 15,
    marginBottom: 10,
    color: "#333",
  },
  noComments: {
    fontSize: 16,
    color: "#777",
    textAlign: "center",
    marginTop: 10,
  },
  commentItem: {
    backgroundColor: "#fff",
    padding: 10,
    marginHorizontal: 15,
    marginBottom: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  commentText: {
    fontSize: 14,
    color: "#333",
  },
  commentInputContainer: {
    padding: 15,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderColor: "#ddd",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    backgroundColor: "#fff",
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#007bff",
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  errorText: {
    fontSize: 18,
    color: "#d32f2f",
    textAlign: "center",
    paddingHorizontal: 20,
  },
});

import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

import LoginScreen from "./src/screens/LoginScreen";
import TaskListScreen from "./src/screens/TaskListScreen";
import TaskDetailsScreen from "./src/screens/TaskDetailsScreen";
import AddTaskScreen from "./src/screens/AddTaskScreen";
import TaskHistoryScreen from "./src/screens/TaskHistoryScreen";

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} options={{headerShown:false,}}/>
        <Stack.Screen name="TaskList" component={TaskListScreen} options={{headerShown:false,}}/>
        <Stack.Screen name="History" component={TaskHistoryScreen} options={{headerShown:false,}}/>
        <Stack.Screen name="AddTask" component={AddTaskScreen}options={{headerShown: false,}}/>        
          <Stack.Screen name="TaskDetails" component={TaskDetailsScreen} options={{headerTitle: 'Voltar'}} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
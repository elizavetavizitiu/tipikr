import { demoTasks, variantNumber, variantTasks } from "./data.js";
import {
  getPendingTasks,
  getTaskTitles,
  getTaskStats,
  addTask,
  setTaskCompleted,
  renameTask,
  removeTask,
} from "./task-service.js";

function printStats(tasks) {
  const { total, completed, pending, progress } = getTaskStats(tasks);
  console.log(`Всего: ${total}, выполнено: ${completed}, осталось: ${pending}`);
  console.log(total === 0 ? "Задач пока нет" : `Прогресс: ${progress.toFixed(1)}%`);
}

function runScenario(heading, initialTasks, steps, showTitles = false) {
  const initialSnapshot = JSON.stringify(initialTasks);
  let currentTasks = initialTasks;

  console.log(`\n${heading}`);
  console.table(currentTasks);
  if (showTitles) {
    console.log("Названия:", getTaskTitles(currentTasks));
    console.log("Невыполненные задачи:");
    console.table(getPendingTasks(currentTasks));
  }
  printStats(currentTasks);

  for (const [label, operation] of steps) {
    console.log(`\n${label}`);
    const result = operation(currentTasks);
    if (result.ok) {
      currentTasks = result.tasks;
    } else {
      console.log(`Ошибка: ${result.error}`);
    }
    printStats(currentTasks);
  }

  console.log("\nИтоговые задачи:");
  console.table(currentTasks);
  console.log("Исходный список сохранился:", JSON.stringify(initialTasks) === initialSnapshot);
}

runScenario("Общий сценарий", demoTasks, [
  ["Добавление задачи 20", (tasks) => addTask(tasks, 20, "Добавить проверку", "high")],
  ["Выполнение задачи 4", (tasks) => setTaskCompleted(tasks, 4, true)],
  ["Переименование задачи 10", (tasks) => renameTask(tasks, 10, "Подготовить инструкцию запуска")],
  ["Удаление задачи 7", (tasks) => removeTask(tasks, 7)],
  ["Повторное добавление задачи 20", (tasks) => addTask(tasks, 20, "Добавить проверку", "high")],
], true);

runScenario(`Вариант ${variantNumber}. Подготовка семинара`, variantTasks, [
  ["Добавление задачи 80", (tasks) => addTask(tasks, 80, "Проверить проектор", "high")],
  ["Повторная отметка о выполнении задачи 11", (tasks) => setTaskCompleted(tasks, 11, true)],
  ["Переименование задачи 23", (tasks) => renameTask(tasks, 23, "Уточнить список участников")],
  ["Удаление задачи 37", (tasks) => removeTask(tasks, 37)],
  ["Повторное добавление задачи 80", (tasks) => addTask(tasks, 80, "Проверить проектор", "high")],
]);

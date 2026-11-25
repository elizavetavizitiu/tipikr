"use strict";

const totalTasks = 20;
const completedTasks = 11;

if (!Number.isInteger(totalTasks) || totalTasks < 0 || totalTasks > 1000) {
  console.log("Ошибка: общее число задач должно быть целым числом от 0 до 1000.");
} else if (!Number.isInteger(completedTasks) || completedTasks < 0 || completedTasks > totalTasks) {
  console.log("Ошибка: число выполненных задач должно быть целым числом от 0 до общего числа задач.");
} else if (totalTasks === 0) {
  console.log("Задач пока нет");
} else {
  const remainingTasks = totalTasks - completedTasks;
  const percentage = completedTasks / totalTasks * 100;

  let status = "В работе";
  if (completedTasks === 0) {
    status = "Не начато";
  } else if (completedTasks === totalTasks) {
    status = "Завершено";
  }

  console.log(`Всего задач: ${totalTasks}`);
  console.log(`Выполнено: ${completedTasks}`);
  console.log(`Осталось: ${remainingTasks}`);
  console.log(`Прогресс: ${percentage.toFixed(1)}%`);
  console.log(`Статус: ${status}`);
}

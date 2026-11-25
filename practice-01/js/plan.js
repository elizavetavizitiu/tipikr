"use strict";

const totalTasks = 20;
const completedTasks = 11;
const dailyLimit = 6;

if (!Number.isInteger(totalTasks) || totalTasks < 0 || totalTasks > 1000) {
  console.log("Ошибка: общее число задач должно быть целым числом от 0 до 1000.");
} else if (!Number.isInteger(completedTasks) || completedTasks < 0 || completedTasks > totalTasks) {
  console.log("Ошибка: число выполненных задач должно быть целым числом от 0 до общего числа задач.");
} else if (!Number.isInteger(dailyLimit) || dailyLimit < 1 || dailyLimit > 1000) {
  console.log("Ошибка: дневная норма должна быть целым числом от 1 до 1000.");
} else {
  let remainingTasks = totalTasks - completedTasks;
  let day = 0;

  if (remainingTasks === 0) {
    console.log("Все задачи уже выполнены");
  } else {
    console.log(`Осталось задач: ${remainingTasks}`);
  }

  while (remainingTasks > 0) {
    day += 1;
    const tasksToday = Math.min(remainingTasks, dailyLimit);
    remainingTasks -= tasksToday;
    console.log(`День ${day}: выполнено ${tasksToday}, осталось ${remainingTasks}`);
  }

  console.log(`Потребуется дней: ${day}`);
}

let reminders = [];

// Функция для запроса разрешения на уведомления
async function requestNotificationPermission() {
    if (Notification.permission === "default") {
        await Notification.requestPermission();
    }
    if (Notification.permission === "granted") {
        console.log("Разрешение на уведомления получено.");
    } else {
        console.warn("Уведомления отключены пользователем.");
    }
}

// Запрашиваем разрешение на уведомления при загрузке страницы
requestNotificationPermission();

// Функция добавления нового напоминания
function addReminder(event) {
    event.preventDefault();

    const comment = document.getElementById("comment").value;
    const timeInput = document.getElementById("time").value;
    const intervalValue = parseInt(document.getElementById("interval-value").value);
    const intervalUnit = document.getElementById("interval-unit").value;
    const repeatsCount = parseInt(document.getElementById("repeats-count").value);
    const isPermanent = document.getElementById("permanent").checked;

    // Рассчитываем интервал в миллисекундах в зависимости от выбранной единицы
    const intervalMs = convertIntervalToMs(intervalValue, intervalUnit);

    // Проверка корректности введённых данных
    if (!timeInput || !comment || (isNaN(repeatsCount) && !isPermanent)) {
        alert("Заполните все поля.");
        return;
    }

    // Преобразуем время из input в Date
    const [hours, minutes] = timeInput.split(":").map(Number);
    const now = new Date();
    const reminderTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);

    if (reminderTime < now) {
        reminderTime.setDate(reminderTime.getDate() + 1); // Если время уже прошло, установить на следующий день
    }

    // Создаем объект напоминания
    const reminder = {
        comment,
        time: reminderTime,
        interval: intervalMs,
        remainingRepeats: isPermanent ? Infinity : repeatsCount,
        timerIds: []
    };

    // Добавляем напоминание в массив и планируем его срабатывание
    reminders.push(reminder);
    displayReminders();
    scheduleReminder(reminder);

    // Очищаем форму
    document.getElementById("reminder-form").reset();
}

// Функция для конвертации интервала в миллисекунды
function convertIntervalToMs(value, unit) {
    switch (unit) {
        case "minutes":
            return value * 60 * 1000;
        case "hours":
            return value * 60 * 60 * 1000;
        case "days":
            return value * 24 * 60 * 60 * 1000;
        case "weeks":
            return value * 7 * 24 * 60 * 60 * 1000;
        default:
            return value * 60 * 1000;
    }
}

// Планирование напоминания
function scheduleReminder(reminder) {
    const now = new Date();
    const delay = reminder.time - now;

    if (delay >= 0) {
        const timerId = setTimeout(() => triggerReminder(reminder), delay);
        if (!reminder.timerIds) reminder.timerIds = [];
        reminder.timerIds.push(timerId);
    }
}

// Срабатывание напоминания
function triggerReminder(reminder) {
    const sound = document.getElementById("notification-sound");
    sound.play();

    if (Notification.permission === "granted") {
        new Notification("Напоминание", { body: reminder.comment });
    }

    // Проверяем количество повторов
    if (reminder.remainingRepeats > 1) {
        reminder.remainingRepeats--;
        reminder.time = new Date(reminder.time.getTime() + reminder.interval);
        scheduleReminder(reminder);
    } else if (reminder.remainingRepeats === Infinity) {
        reminder.time = new Date(reminder.time.getTime() + reminder.interval);
        scheduleReminder(reminder);
    } else {
        deleteReminder(reminders.indexOf(reminder));
    }
}

// Удаление напоминания
function deleteReminder(index) {
    const reminder = reminders[index];

    // Очищаем все таймеры, связанные с этим напоминанием
    if (reminder.timerIds) {
        reminder.timerIds.forEach(timerId => clearTimeout(timerId));
    }

    reminders.splice(index, 1);
    displayReminders();
}

// Отображение всех напоминаний на странице
function displayReminders() {
    const remindersList = document.getElementById("reminders-list");
    remindersList.innerHTML = "";

    reminders.forEach((reminder, index) => {
        const listItem = document.createElement("li");
        listItem.textContent = `${reminder.comment} - срабатывает в ${reminder.time.toLocaleTimeString()} (повторы: ${reminder.remainingRepeats === Infinity ? "постоянно" : reminder.remainingRepeats})`;

        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Удалить";
        deleteBtn.onclick = () => deleteReminder(index);

        listItem.appendChild(deleteBtn);
        remindersList.appendChild(listItem);
    });
}

// Обработчик для формы
document.getElementById("reminder-form").addEventListener("submit", addReminder);

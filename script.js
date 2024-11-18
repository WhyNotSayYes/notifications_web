const form = document.getElementById('reminder-form');
const remindersList = document.getElementById('reminders-list');
const notificationSound = document.getElementById('notification-sound');

let reminders = [];

// Проверяем, поддерживает ли браузер уведомления
if ('Notification' in window && Notification.permission !== 'granted') {
    Notification.requestPermission();
}

// Функция для добавления напоминания
form.addEventListener('submit', function(event) {
    event.preventDefault();

    const comment = document.getElementById('comment').value;
    const interval = parseInt(document.getElementById('interval').value);
    const reminderId = Date.now();

    const reminder = {
        id: reminderId,
        comment: comment,
        interval: interval,
        timerId: null
    };

    reminders.push(reminder);
    addReminderToList(reminder);

    // Устанавливаем напоминание и сохраняем его идентификатор
    reminder.timerId = setReminder(reminder);

    // Очищаем форму
    form.reset();
});

// Функция для добавления напоминания в список на странице
function addReminderToList(reminder) {
    const listItem = document.createElement('li');
    listItem.dataset.id = reminder.id;

    const text = document.createElement('span');
    text.textContent = `${reminder.comment} - каждые ${reminder.interval / 3600000} ч.`;

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Удалить';
    deleteBtn.classList.add('delete-btn');
    deleteBtn.addEventListener('click', function() {
        deleteReminder(reminder.id);
    });

    listItem.appendChild(text);
    listItem.appendChild(deleteBtn);
    remindersList.appendChild(listItem);
}

// Функция для установки напоминания
function setReminder(reminder) {
    return setInterval(() => {
        // Воспроизводим звук
        notificationSound.play();

        // Отправляем уведомление
        if (Notification.permission === 'granted') {
            new Notification('Напоминание', {
                body: reminder.comment,
                icon: 'notification-icon.png' // Можно добавить иконку, если нужно
            });
        }
    }, reminder.interval);
}

// Функция для удаления напоминания
function deleteReminder(id) {
    const reminderIndex = reminders.findIndex(reminder => reminder.id === id);
    if (reminderIndex !== -1) {
        clearInterval(reminders[reminderIndex].timerId);
        reminders.splice(reminderIndex, 1);
    }

    const listItem = document.querySelector(`li[data-id="${id}"]`);
    if (listItem) {
        listItem.remove();
    }
}

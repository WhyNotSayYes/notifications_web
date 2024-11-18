document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('reminder-form');
    const commentInput = document.getElementById('comment');
    const intervalInput = document.getElementById('interval');
    const remindersList = document.getElementById('reminders-list');
    const audio = document.getElementById('notification-sound');

    let reminders = [];

    // Запрос разрешения на отправку уведомлений
    if (Notification.permission !== "granted") {
        Notification.requestPermission();
    }

    // Добавление нового напоминания
    form.addEventListener('submit', (event) => {
        event.preventDefault();

        const comment = commentInput.value;
        const interval = parseInt(intervalInput.value);

        const reminder = {
            id: Date.now(),
            comment,
            interval,
            nextTrigger: Date.now() + interval
        };

        reminders.push(reminder);
        addReminderToList(reminder);
        scheduleReminder(reminder);

        commentInput.value = '';
    });

    // Добавить напоминание в список
    function addReminderToList(reminder) {
        const li = document.createElement('li');
        li.dataset.id = reminder.id;
        li.innerHTML = `
            <span>${reminder.comment} (каждые ${reminder.interval / 1000} сек)</span>
            <button class="delete-btn">Удалить</button>
        `;

        const deleteBtn = li.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', () => {
            deleteReminder(reminder.id);
        });

        remindersList.appendChild(li);
    }

    // Удаление напоминания
    function deleteReminder(id) {
        reminders = reminders.filter(r => r.id !== id);
        const li = document.querySelector(`li[data-id="${id}"]`);
        if (li) li.remove();
    }

    // Запланировать напоминание
    function scheduleReminder(reminder) {
        function triggerReminder() {
            const currentTime = Date.now();
            
            if (currentTime >= reminder.nextTrigger) {
                showNotification(reminder.comment);
                audio.play();
                reminder.nextTrigger = currentTime + reminder.interval;
            }

            // Проверка, если напоминание все еще существует в списке
            if (reminders.some(r => r.id === reminder.id)) {
                setTimeout(triggerReminder, 1000);
            }
        }
        triggerReminder();
    }

    // Показать уведомление
    function showNotification(comment) {
        if (Notification.permission === "granted") {
            new Notification("Напоминание", {
                body: comment,
                icon: 'icon.png' // укажите путь к иконке, если она есть
            });
        }
    }
});

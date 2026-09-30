// Находим часть таблицы для результатов.
const resultsBody = document.getElementById('results-body');

// Имя записи в LocalStorage.
const STORAGE_KEY = 'point-checker-results';

// Массив всех проверок.
let results = [];

// Проверяем, что запись корректна и её можно показать в таблице.
function isValidRecord(record) {
    return (
        typeof record === 'object' &&
        record !== null &&
        Number.isFinite(record.x) &&
        Number.isFinite(record.y) &&
        Number.isFinite(record.r) &&
        typeof record.hit === 'boolean' &&
        Number.isFinite(record.timestamp)
    );
}

// Добавляем новую проверку.
function addResult(x, y, r, hit) {
    const record = {
        x: x,
        y: y,
        r: r,
        hit: hit,
        timestamp: Date.now()
    };

    // Новые результаты добавляем в начало.
    results.unshift(record);

    // Сохраняем историю и обновляем таблицу.
    saveResults();
    renderResults();
}

// Строим таблицу из массива результатов.
function renderResults() {
    // Очищаем старые строки.
    resultsBody.textContent = '';

    for (const record of results) {
        // Создаём строку таблицы.
        const row = document.createElement('tr');

        // Русская локализация и текущий часовой пояс устройства.
        const dateText = new Date(record.timestamp)
            .toLocaleString('ru-RU');

        // Данные для пяти ячеек.
        const values = [
            record.x,
            record.y,
            record.r,
            record.hit ? 'Попадание' : 'Промах',
            dateText
        ];

        // Создаём ячейки строки.
        for (const value of values) {
            const cell = document.createElement('td');
            cell.textContent = value;
            row.append(cell);
        }

        // Добавляем строку в таблицу.
        resultsBody.append(row);
    }
}

// Сохраняем историю в браузере.
function saveResults() {
    try {
        // Превращаем массив в строку.
        const json = JSON.stringify(results);

        // Записываем строку в LocalStorage.
        localStorage.setItem(STORAGE_KEY, json);
    } catch (error) {
        console.error('Ошибка сохранения истории:', error);

        alert(
            'Не удалось сохранить историю. ' +
            'После перезагрузки новые результаты могут исчезнуть.'
        );
    }
}

// Загружаем сохранённую историю.
function loadResults() {
    try {
        const json = localStorage.getItem(STORAGE_KEY);

        // Если истории ещё нет, оставляем массив пустым.
        if (json === null) {
            return;
        }

        // Превращаем строку обратно в данные.
        const savedResults = JSON.parse(json);

        // Проверяем, что загрузился массив.
        if (!Array.isArray(savedResults)) {
            throw new Error('История должна быть массивом.');
        }

        // Битые записи отбрасываем, чтобы в таблице
        // не появлялись строки с "Invalid Date".
        results = savedResults.filter(isValidRecord);
    } catch (error) {
        console.error('Ошибка загрузки истории:', error);
        alert('Не удалось загрузить сохранённую историю.');
    }
}

// При открытии страницы загружаем и показываем историю.
loadResults();
renderResults();

// Обновляем отображение времени при возвращении в окно.
window.addEventListener('focus', renderResults);

// Запоминаем текущий часовой пояс.
let currentTimeZone =
    Intl.DateTimeFormat().resolvedOptions().timeZone;

// Раз в секунду проверяем, изменился ли часовой пояс.
setInterval(function () {
    const newTimeZone =
        Intl.DateTimeFormat().resolvedOptions().timeZone;

    if (newTimeZone !== currentTimeZone) {
        currentTimeZone = newTimeZone;

        // Пересчитываем отображаемое время, сохраняя исходный timestamp.
        renderResults();
    }
}, 1000);

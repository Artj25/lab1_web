const form = document.getElementById('point-form');
// форма с id="point-form"
const yInput = document.getElementById('y');
// текстовое поле для координаты Y
const result = document.getElementById('result');
// абзац, куда выводятся сообщения о результате

// Допустимые значения X (совпадают с чекбоксами в HTML).
const ALLOWED_X = [-2, -1.5, -1, -0.5, 0, 0.5, 1, 1.5, 2];

// Строгий формат числа для Y:
//   - необязательный знак "+" или "-";
//   - целая часть — одна или больше цифр;
//   - необязательная дробная часть: ровно один разделитель
//     (точка ИЛИ запятая) и от 1 до 5 цифр после него.
//
// Почему не более 5 знаков: числа в JavaScript хранятся в формате
// IEEE-754 (64 бита) и различают лишь ~15-17 значащих цифр.
// Ввод вроде "2.000000000000000000000001" Number() молча превращает
// в 2, то есть значение искажается ещё ДО всех проверок. Ограничив
// точность, мы гарантируем: всё прошедшее валидацию хранится без
// потерь, а слишком точные значения честно отклоняются.
const NUMBER_PATTERN = /^[+-]?\d+([.,]\d{1,5})?$/;

// функция обработки отправки формы
function handleSubmit(event) {
    // отменяем стандартную отправку, страница не перезагружается
    event.preventDefault();

    // --- Валидация Y ---
    const yText = yInput.value.trim();

    if (yText === '') {
        result.textContent = 'Введите координату Y.';
        return;
    }

    // Отбрасываем незначащие нули в дробной части: "2.500000"
    // превращается в "2.5", поэтому лимит "5 знаков" считается
    // по значащим цифрам, а не по длине строки.
    const yNormalized = yText
        .replace(/([.,]\d+?)0+$/, '$1')
        .replace(/[.,]$/, '');

    if (!NUMBER_PATTERN.test(yNormalized)) {
        result.textContent =
            'Ошибка: Y должен быть числом. Дробную часть отделяйте ' +
            'точкой или запятой, не более 5 знаков после разделителя.';
        return;
    }

    // Number() понимает только точку, поэтому запятую меняем на точку.
    // Регулярка гарантирует, что разделитель в строке максимум один.
    const y = Number(yNormalized.replace(',', '.'));

    // Строгие границы: -5 < Y < 5.
    if (y <= -5 || y >= 5) {
        result.textContent = 'Ошибка: Y должен быть больше -5 и меньше 5.';
        return;
    }

    // --- Валидация X ---
    const selectedX = form.querySelectorAll('input[name="x"]:checked');

    if (selectedX.length === 0) {
        result.textContent = 'Выберите хотя бы одно значение X.';
        return;
    }

    const xValues = [];
    for (const checkbox of selectedX) {
        const x = Number(checkbox.value);
        if (!ALLOWED_X.includes(x)) {
            result.textContent = 'Ошибка: недопустимое значение X.';
            return;
        }
        xValues.push(x);
    }

    // --- Валидация R ---
    const rInput = form.querySelector('input[name="r"]:checked');

    if (!rInput) {
        result.textContent = 'Выберите радиус R.';
        return;
    }

    const r = Number(rInput.value);

    if (![1, 2, 3, 4, 5].includes(r)) {
        result.textContent = 'Радиус должен быть равен 1, 2, 3, 4 или 5.';
        return;
    }

    // --- Проверка всех выбранных точек ---
    // Сначала рисуем область и оси.
    drawGraph(r);

    let hits = 0;
    for (const x of xValues) {
        // Каждая выбранная координата X — отдельная точка.
        const hit = isHit(x, y, r);
        drawPoint(x, y, hit);
        addResult(x, y, r, hit);
        if (hit) {
            hits++;
        }
    }

    result.textContent = 'Попало точек: ' + hits + ' из ' + xValues.length + '.';
}

form.addEventListener('submit', handleSubmit);

// Перерисовываем график при смене R,
// чтобы картинка всегда соответствовала выбранному радиусу.
form.querySelectorAll('input[name="r"]').forEach(function (radio) {
    radio.addEventListener('change', function () {
        drawGraph(Number(radio.value));
    });
});

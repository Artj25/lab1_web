// Получаем координаты точки и радиус.
// Возвращаем true, если точка попадает, и false, если нет.
function isHit(x, y, r) {
    // Треугольник слева сверху.
    const inTriangle =
        x <= 0 &&
        y >= 0 &&
        y <= x + r;

    // Четверть круга слева снизу.
    const inCircle =
        x <= 0 &&
        y <= 0 &&
        x * x + y * y <= r * r;

    // Квадрат справа снизу.
    const inSquare =
        x >= 0 &&
        x <= r &&
        y <= 0 &&
        y >= -r;

    // Достаточно попасть хотя бы в одну часть.
    return inTriangle || inCircle || inSquare;
}

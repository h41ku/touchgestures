# touchgestures

Микро-библиотека, реализующая диспетчеризацию набора событий для жестов касания,
перемещения и масштабирования. Библиотека отслеживает события `MouseEvent` и `TouchEvent`
переводя их в частный набор абстрактных событий `CustomEvent`:
- `POINTER_DOWN` - указатель опущен
- `POINTER_MOVE` - указатель перемещен
- `POINTER_UP` - указатель поднят
- `POINTER_ZOOM` - произведено масштабирование

Отслеживая эти события вам не прийдется заботиться о различиях между `MouseEvent` и `TouchEvent`,
рассчитывать коэффициенты масштабирования и вектор перемещения. `TouchGestures` берет на себя
сглаживание этих различий и выполнение расчетов.

## Установка и подключение

NPM:

```sh
npm install touchgestures
```

## Использование
-------------

```js
import TouchGestures, * as events from 'touchgestures'

// создание экземпляра класса
const touchGestures = new TouchGestures(element)
    // element - элемент в DOM, события которого будут прослушиваться

//
// методы класса
//

// отключить распознавание родных жестов
touchGestures.disableNativeGestures()

// включить распознавание родных жестов
touchGestures.enableNativeGestures()

// включить прослушивание событий касаний
touchGestures.enableTouchGestures()

// отключить прослушивание событий касаний
touchGestures.disableTouchGestures()

// включить прослушивание событий мыши
touchGestures.enableMouseGestures()

// отключить прослушивание событий мыши
touchGestures.disableMouseGestures()

//
// прослушивание событий
//

// указатель опущен
element.addEventListener(events.POINTER_DOWN, evt => {

    // позиция указателя
    const x = evt.detail.clientX
    const y = evt.detail.clientY

    // ссылка на оригинальное событие
    const ev = evt.detail.originalEvent

    // ...
})

// указатель поднят
element.addEventListener(events.POINTER_UP, evt => {

    // позиция указателя
    const x = evt.detail.clientX
    const y = evt.detail.clientY

    // ссылка на оригинальное событие
    const ev = evt.detail.originalEvent

    // ...
})

// указатель перемещен
element.addEventListener(events.POINTER_MOVE, evt => {

    // позиция указателя
    const x = evt.detail.clientX
    const y = evt.detail.clientY

    // вектор перемещения
    const dx = evt.detail.movementX
    const dy = evt.detail.movementY

    // ссылка на оригинальное событие
    const ev = evt.detail.originalEvent

    // ...
})

// произведено масштабирование
element.addEventListener(events.POINTER_ZOOM, evt => {

    // позиция указателя
    const x = evt.detail.clientX
    const y = evt.detail.clientY

    // коэффициент изменения масштаба
    const deltaScale = evt.detail.deltaScale

    // ссылка на оригинальное событие
    const ev = evt.detail.originalEvent

    // ...
})
```

## Лицензия

MIT

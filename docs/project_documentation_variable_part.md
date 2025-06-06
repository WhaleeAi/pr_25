# ОТЧЁТ О ПРОЕКТЕ: Разработка Telegram-бота на Node.js

## Введение

Современные мессенджеры давно перестали быть просто средством общения. Они стали полноценными платформами, на базе которых создаются умные ассистенты, игровые механики, системы опросов, интеграции с бизнесом и даже целые образовательные сервисы. Одним из самых популярных инструментов для этих целей является Telegram, благодаря открытому API и поддержке ботов.

В рамках данного проекта мы поставили перед собой задачу — создать Telegram-бота на языке JavaScript (Node.js) с использованием таких инструментов, как Express, Axios и body-parser. При этом цель была не просто сделать «бота, который отвечает», а реализовать интерактивную, расширяемую архитектуру, способную запоминать состояние пользователя, работать с командами и кнопками.

Проект развивался поэтапно: сначала — базовая реализация, затем — постепенное добавление функций, инлайн-кнопок, логики обработки состояний и взаимодействия с пользователем.

---

## Технологический стек

В разработке использовались следующие технологии и инструменты:

| Технология           | Назначение                              |
| -------------------- | --------------------------------------- |
| Node.js          | Среда выполнения JavaScript             |
| Express          | Веб-фреймворк для создания REST-сервера |
| Axios            | Библиотека для HTTP-запросов            |
| body-parser      | Парсинг тела POST-запросов              |
| Telegram Bot API | Взаимодействие с Telegram-ботом         |

---


## Документация и сопровождение проекта

Разработка Telegram-бота — это не только код, но и его понятное описание, чтобы другие участники команды (или даже будущие мы сами) могли быстро вникнуть, поддерживать и дорабатывать систему. Поэтому параллельно с работой над функционалом, мы уделили особое внимание созданию документации.

---

## Руководство по созданию бота для начинающих
Мы прекрасно понимали, что Telegram-боты — это отличная точка входа в мир веб-разработки. Именно поэтому мы составили отдельное, максимально дружественное для новичков руководство, которое пошагово объясняет, как:

- Зарегистрировать бота через BotFather

- Получить и использовать токен

- Настроить Node.js и Express

- Написать базовый обработчик сообщений

- Отправлять простые ответы пользователям

- Обрабатывать команды и кнопки

Это руководство было создано с расчётом на тех, кто никогда не писал ботов и даже, возможно, только начинает свой путь в программировании. Мы включили в него примеры кода, визуальные пояснения, разбор ошибок и советы по отладке. Все шаги были проверены на практике, чтобы читатель не остался наедине с "падает, не знаю почему".

Цель: сделать процесс создания первого бота лёгким, понятным и вдохновляющим.

---

## Руководство по проекту и модификациям
Помимо общего гида, мы также разработали отдельную инструкцию по текущему проекту, в которой описываются:

- Архитектура и структура проекта

- Зачем и как мы разделили логику на блоки (обработка сообщений, кнопок, состояний)

- Какие команды реализованы и почему

- Что делает каждая функция

- Идеи для расширения (бот для викторин, справочник, чат-игра и т.д.)

Мы стремились сделать так, чтобы любой разработчик, открывший проект, мог разобраться в нём за 15 минут и сразу начать работу. Это особенно важно в командной разработке, при передаче проекта или при доработке через месяцы.

---

## Подробная модификация: не просто улучшения, а переход на новый уровень

Мы также пошли дальше и добавили в проект расширенную модификацию, о которой говорилось выше. В основном руководстве (для новичков) мы сознательно не вдавались в детали:

- не описывали работу callback_query

- не касались хранения состояния пользователя

- не объясняли, как делать пошаговые сценарии

Это было сделано осознанно — чтобы не перегружать начинающего разработчика. Однако в рамках данного отчёта и модификации проекта мы решили:

Разобрать всё детально, шаг за шагом — как создаётся логика бота, как работает инлайн-клавиатура, что такое userStates, как обрабатываются различные команды и почему это важно для UX.

Мы не просто улучшили проект — мы перевели его на новый уровень: теперь бот умеет вести диалог, обрабатывать нажатия кнопок, задавать вопросы, запоминать, что делает пользователь, и действовать исходя из контекста.

---

## Архитектура проекта

### Структура

Проект построен на простом и понятном сервере Express, который обрабатывает POST-запросы от Telegram, присылаемые при каждом новом сообщении или взаимодействии пользователя с ботом. Ниже показано, как устроена базовая архитектура:

```
Telegram (user) -> POST /new-message -> Обработка сообщения -> Ответ через Telegram Bot API
```
---

## Реализация

### Шаг 1: Базовый сервер

Проект начинается с создания Express-сервера и настройки базового маршрута для приёма сообщений от Telegram.

```
const express = require("express")
const app = express()
const bodyParser = require("body-parser")
const axios = require("axios")

const TOKEN = "ВАШ_ТОКЕН_ТУТ"
const TELEGRAM_API = `https://api.telegram.org/bot${TOKEN}`

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
```
### Шаг 2: Обработка входящих сообщений

Мы проверяем, содержит ли входящее сообщение необходимые данные. Если да — анализируем текст и отправляем соответствующий ответ. На первом этапе бот просто реагирует на слово "привет".

```
app.post("/new-message", (req, res) => {
  const { message } = req.body

  if (!message || !message.text || !message.chat) {
    return res.end()
  }

  const text = message.text.toLowerCase()

  if (text.includes("привет")) {
    axios.post(`${TELEGRAM_API}/sendMessage`, {
      chat_id: message.chat.id,
      text: "вечер в хату!!",
    })
    .then(() => res.end("ok"))
    .catch((err) => {
      console.error("Ошибка отправки:", err)
      res.end("Ошибка: " + err)
    })
  } else {
    res.end("ok")
  }
})
```

Бот запускается на порту 3000:

```
app.listen(3000, () => {
  console.log("Сервер запущен на порту 3000")
})

```

---

## Расширенные функции

После успешного запуска базовой версии мы начали поэтапное расширение:

---

### Команда /start и справка

```
if (message.text.toLowerCase() === "/start") {
  axios.post(`${TELEGRAM_API}/sendMessage`, {
    chat_id: message.chat.id,
    text: "Добро пожаловать! Доступные команды:\n/help - помощь\n/joke - случайный анекдот",
    parse_mode: "Markdown"
  })
  return res.end()
}

```

- Цель: дать пользователю понимание, что бот умеет делать.
- Особенность: используется Markdown-разметка для форматирования текста.

---

### Обработка состояния пользователя

Важным шагом стало внедрение механизма запоминания, что делает пользователь:

```
const userStates = {}

if (message.text === "/quiz") {
  userStates[message.chat.id] = "waiting_for_answer"
  axios.post(`${TELEGRAM_API}/sendMessage`, {
    chat_id: message.chat.id,
    text: "Сколько будет 2+2?"
  })
}

```

Если пользователь отвечает:

```
if (userStates[message.chat.id] === "waiting_for_answer") {
  if (message.text === "4") {
    axios.post(`${TELEGRAM_API}/sendMessage`, {
      chat_id: message.chat.id,
      text: "Правильно!"
    })
  } else {
    axios.post(`${TELEGRAM_API}/sendMessage`, {
      chat_id: message.chat.id,
      text: "Неправильно. Попробуйте ещё раз."
    })
  }

  delete userStates[message.chat.id]
}

```

- Особенность: реализация простой логики «пошагового сценария», где бот ожидает конкретный ответ и проверяет его.

---

### Инлайн-клавиатура и взаимодействие с кнопками

```
if (message.text === "/menu") {
  axios.post(`${TELEGRAM_API}/sendMessage`, {
    chat_id: message.chat.id,
    text: "Выберите действие:",
    reply_markup: {
      inline_keyboard: [
        [{ text: "Кнопка 1", callback_data: "btn1" }],
        [{ text: "Кнопка 2", callback_data: "btn2" }]
      ]
    }
  })
}

```

А обработка кнопок — через callback_query:

if (req.body.callback_query) {
const data = req.body.callback_query.data
const chatId = req.body.callback_query.message.chat.id

if (data === "btn1") {
axios.post(`${TELEGRAM_API}/sendMessage`, {
chat_id: chatId,
text: "Вы нажали кнопку 1!"
})
}
}

-mИнлайн-клавиши делают бота более удобным и "приложением-подобным".

---

## Результат и возможности развития

На текущем этапе проект реализует следующие функции:

- Приём сообщений и ответ на ключевые слова
- Обработка команд (/start, /menu, /quiz)
- Работа с инлайн-кнопками
- Реализация логики с запоминанием состояния
- Асинхронные запросы и отправка ответов с помощью Axios

---

## Идеи для будущего расширения

1. Интеграция с внешними API (анекдоты, погода, курсы валют)
2. Работа с базой данных — для хранения очков пользователей или истории общения
3. Многошаговые квизы
4. Локализация — поддержка нескольких языков
5. Интерфейс администратора для управления ботом

---

## Вывод

Этот проект продемонстрировал, как из простого Telegram-бота можно постепенно вырастить функциональный, интерактивный и отзывчивый инструмент. Несмотря на кажущуюся простоту архитектуры, за ботом стоит гибкая система обработки сообщений, состояний и событий.

В ходе разработки Telegram-бота на Node.js мы не только построили полноценное, расширяемое приложение, но и оформили весь процесс в виде доступных и понятных материалов:

- для начинающих — пошаговое руководство

- для разработчиков — техническое описание архитектуры и логики

- для развития проекта — глубокая модификация и идеи по расширению.

Проект теперь является не просто ботом, а шаблоном, платформой, на основе которой можно строить любые телеграм-сервисы — от образовательных до развлекательных, от бизнес-инструментов до игровых приложений.

Благодаря чёткому подходу к разработке, вниманию к деталям, продуманной архитектуре и качественной документации, проект может легко масштабироваться и передаваться другим участникам команды.
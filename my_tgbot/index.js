const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express();
const TOKEN = "8165226154:AAHTXkc29ddUXUuWt2G4CX-oe4COsxRMGOA"; // Ваш токен
const API = `https://api.telegram.org/bot${TOKEN}`;

// Для хранения состояний пользователей (в памяти)
const userStates = {};

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post("/new-message", async (req, res) => {
  try {
    // Обработка нажатий инлайн-кнопок
    if (req.body.callback_query) {
      const { data, message: callbackMessage } = req.body.callback_query;
      const chatId = callbackMessage.chat.id;

      if (data === "btn1") {
        await axios.post(`${API}/sendMessage`, {
          chat_id: chatId,
          text: "Вы нажали кнопку 1!"
        });
      } else if (data === "btn2") {
        await axios.post(`${API}/sendMessage`, {
          chat_id: chatId,
          text: "Вы нажали кнопку 2!"
        });
      }

      return res.end();
    }

    const { message } = req.body;
    if (!message || !message.text) return res.end();

    const text = message.text.trim();
    const chatId = message.chat.id;

    // Команды /start, /help, /menu, /joke, /quiz
    switch (text.toLowerCase()) {
      case "/start":
        await axios.post(`${API}/sendMessage`, {
          chat_id: chatId,
          text: "Добро пожаловать! Доступные команды:\n/help - помощь\n/joke - случайный анекдот\n/menu - открыть меню\n/quiz - викторина",
          parse_mode: "Markdown"
        });
        return res.end();

      case "/help":
        await axios.post(`${API}/sendMessage`, {
          chat_id: chatId,
          text: "*Помощь по боту:*\n/start - запустить бота\n/help - помощь\n/joke - анекдот\n/menu - меню с кнопками\n/quiz - викторина",
          parse_mode: "Markdown"
        });
        return res.end();

      case "/menu":
        await axios.post(`${API}/sendMessage`, {
          chat_id: chatId,
          text: "Выберите действие:",
          reply_markup: {
            inline_keyboard: [
              [{ text: "Кнопка 1", callback_data: "btn1" }],
              [{ text: "Кнопка 2", callback_data: "btn2" }]
            ]
          }
        });
        return res.end();

      case "/joke":
        try {
          const jokeRes = await axios.get("https://official-joke-api.appspot.com/random_joke");
          const joke = `${jokeRes.data.setup}\n${jokeRes.data.punchline}`;
          await axios.post(`${API}/sendMessage`, {
            chat_id: chatId,
            text: joke
          });
        } catch (err) {
          await axios.post(`${API}/sendMessage`, {
            chat_id: chatId,
            text: "Не удалось получить анекдот. Попробуйте позже."
          });
        }
        return res.end();

      case "/quiz":
        userStates[chatId] = "waiting_for_answer";
        await axios.post(`${API}/sendMessage`, {
          chat_id: chatId,
          text: "Сколько будет 2+2?"
        });
        return res.end();
    }

    // Обработка состояния викторины
    if (userStates[chatId] === "waiting_for_answer") {
      if (text === "4") {
        await axios.post(`${API}/sendMessage`, {
          chat_id: chatId,
          text: "Правильно! 🎉"
        });
      } else {
        await axios.post(`${API}/sendMessage`, {
          chat_id: chatId,
          text: "Неправильно. Попробуйте снова командой /quiz."
        });
      }
      delete userStates[chatId];
      return res.end();
    }

    // Простая проверка приветствия
    if (text.toLowerCase().includes("привет")) {
      await axios.post(`${API}/sendMessage`, {
        chat_id: chatId,
        text: "вечер в хату!!"
      });
      return res.end();
    }

    // По умолчанию: ничего не делать
    return res.end();

  } catch (error) {
    console.error("Ошибка обработки обновления:", error);
    return res.end();
  }
});

app.listen(3000, () => console.log("Telegram bot listening on port 3000!"));

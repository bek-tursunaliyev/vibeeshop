import { validateTelegramInitData } from './src/api/middleware.js';
const botToken = "8500297928:AAHhWD_xnrzuSXykUrfOCbjUE4wDgMKzgJU";
const initData = "query_id=AAF_...&user=%7B%22id%22%3A123%2C%22first_name%22%3A%22Test%22%7D&hash=123";
console.log(validateTelegramInitData(initData, botToken));

import { Telegraf } from 'telegraf';
// Importa el módulo 'config'
import * as config from './config/config.json';

// Utiliza las constantes en tu código
const telegramToken = config.BOT_TOKEN;

// Importa el módulo 'config'
const bot = new Telegraf(telegramToken); // Reemplaza 'TU_TOKEN_AQUI' con tu token de Telegram

// Maneja el comando /start
bot.start((ctx) => {
    ctx.reply('¡Hola! Soy tu bot de Telegram. ¿En qué puedo ayudarte?');
});

// Maneja mensajes de texto
bot.on('text', (ctx) => {
    ctx.reply('Recibí tu mensaje: ' + ctx.message.text);
});

// Inicia el bot
bot.launch();

console.log('El bot está listo.');


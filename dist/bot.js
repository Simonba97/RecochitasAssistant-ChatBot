"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const telegraf_1 = require("telegraf");
// Importa el módulo 'config'
const config = __importStar(require("./config/config.json"));
// Utiliza las constantes en tu código
const telegramToken = config.BOT_TOKEN;
// Importa el módulo 'config'
const bot = new telegraf_1.Telegraf(telegramToken); // Reemplaza 'TU_TOKEN_AQUI' con tu token de Telegram
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

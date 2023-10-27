"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MatchQuotasService = void 0;
const Global_1 = require("../utils/Global");
const date_fns_1 = require("date-fns");
/**
 * Servicio que contiene los metodos necesarios para gestionar un Match Quotas
 * @copyright 2023 - El uso de esta libreria esta reservador para este sitio y cualquier cambio o reutilización debe ser autorizado por el autor.
 * @author Simón Bustamante Alzate <simonba97@hotmail.com> / Fecha: 26.10.2023 - Creado
 *
 * @export
 * @class MatchQuotasService
 */
class MatchQuotasService {
    /**
    * Crear una instancia de MatchQuotasService
    * @param {string}
    * @memberof MatchQuotasService
    */
    constructor(fileService) {
        /* Instancia de servicios */
        this._fileService = fileService;
        this._filePathInformation = Global_1.Global.FILEPATH_MATCHQUOTAS;
    } // end constructor
    getAllMatchQuotas() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const matchQuotas = yield this._fileService.readFile(this._filePathInformation);
                return matchQuotas;
            }
            catch (error) {
                // Manejar errores si la lectura del archivo falla
                console.error('Error al obtener la de las cuotas del partido:', error);
                throw new Error('No se pudo obtener la información del partido.');
            }
        });
    } // end getAllMatchQuotas
    /**
     * Busca una reserva por su chatId en las listas de jugadores de un partido.
     * @param {number} chatId - El chatId del jugador que se desea encontrar.
     * @returns {IPlayerInformationItem | undefined} - La información del jugador encontrado o undefined si no se encuentra.
     */
    getReservationByChatId(chatId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const matchQuotas = yield this.getAllMatchQuotas();
                const goalkeeper = matchQuotas.goalkeepers.find((player) => Number(player.chatId) === chatId);
                const player = matchQuotas.players.find((player) => Number(player.chatId) === chatId);
                const substitute = matchQuotas.substitutes.find((player) => Number(player.chatId) === chatId);
                return goalkeeper || player || substitute;
            }
            catch (error) {
                // Manejar errores si la lectura del archivo falla
                console.error('Error al obtener la reserva por ChatId:', error);
                throw new Error('No se pudo obtener la reserva por ChatId.');
            }
        });
    } // end getReservationByChatId
    addReserve(messageData, positionPlayer) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const matchQuotas = yield this.getAllMatchQuotas();
                // Control para determinar si la reserva se realiza en la titular o suplencia
                const reservationAvailable = positionPlayer === Global_1.Global.TYPE_GOALKEEPER
                    ? matchQuotas.goalkeepers.length < 2
                    : matchQuotas.players.length < 16;
                // Información del usuario para la reserva ya bien sea en la titular o suplencia
                const playerInformation = {
                    dateTimeReservation: (0, date_fns_1.format)(new Date(), "dd/MM/yyyy HH:mm:ss"),
                    fullName: `${messageData.chat.first_name} ${messageData.chat.last_name}`.replace(/[^\w\sáéíóúÁÉÍÓÚ]/gi, ''),
                    pay: false,
                    postion: positionPlayer.replace('typePlayer', '').toLowerCase(),
                    chatId: messageData.chat.id
                };
                // Almacenamos la reserva en la titular o la suplencia
                if (reservationAvailable) {
                    const targetArray = positionPlayer === Global_1.Global.TYPE_GOALKEEPER
                        ? matchQuotas.goalkeepers
                        : matchQuotas.players;
                    targetArray.push(playerInformation);
                }
                else {
                    matchQuotas.substitutes.push(playerInformation);
                }
                // Guarda los datos en el archivo JSON
                yield this._fileService.writeFile(this._filePathInformation, matchQuotas);
            }
            catch (error) {
                console.error('Error al obtener intentar agregar una reserva:', error);
                throw new Error('No se pudo obtener intentar agregar una reserva.');
            }
        });
    } // end addReserve
    removeReserve(chatId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                /* Consulta de datos necesarios */
                const matchQuotas = yield this.getAllMatchQuotas();
                let reservationPlayer = yield this.getReservationByChatId(chatId);
                if (reservationPlayer) {
                    reservationPlayer.dateTimeCancellation = (0, date_fns_1.format)(new Date(), "dd/MM/yyyy HH:mm:ss");
                }
                /* Eliminamos la reserva de las Cuotas del Partido */
                matchQuotas.goalkeepers = matchQuotas.goalkeepers.filter((player) => player.chatId !== chatId);
                matchQuotas.players = matchQuotas.players.filter((player) => player.chatId !== chatId);
                matchQuotas.substitutes = matchQuotas.goalkeepers.filter((player) => player.chatId !== chatId);
                // Guarda los datos en el archivo JSON
                yield this._fileService.writeFile(this._filePathInformation, matchQuotas);
                return reservationPlayer;
            }
            catch (error) {
            }
        });
    } // end removeReserve
}
exports.MatchQuotasService = MatchQuotasService;

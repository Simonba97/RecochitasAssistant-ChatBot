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
exports.ReservationCancellationHistoryService = void 0;
const Global_1 = require("../utils/Global");
const InfoMatchService_1 = require("./InfoMatchService");
const date_fns_1 = require("date-fns");
/**
 * Servicio que contiene los metodos necesarios para gestionar un ReservationCancellationHistory
 * @copyright 2023 - El uso de esta libreria esta reservador para este sitio y cualquier cambio o reutilización debe ser autorizado por el autor.
 * @author Simón Bustamante Alzate <simonba97@hotmail.com> / Fecha: 26.10.2023 - Creado
 *
 * @export
 * @class ReservationCancellationHistoryService
 */
class ReservationCancellationHistoryService {
    /**
    * Crear una instancia de ReservationCancellationHistoryService
    * @param {string}
    * @memberof ReservationCancellationHistoryService
    */
    constructor(fileService) {
        /* Instancia de servicios */
        this._fileService = fileService;
        this._filePathInformation = Global_1.Global.FILEPATH_CANCELLATIONHISTORY;
    } // end constructor
    /**
     * Obtiene la información de un partido desde un archivo.
     * @returns {Promise<IInfoMatchItem>} - Una promesa que se resuelve con la información del partido.
     */
    getReservationCancellationHistory() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Leemos la información del partido y esperamos la respuesta
                return yield this._fileService.readFile(this._filePathInformation);
            }
            catch (error) {
                // Manejar errores si la lectura del archivo falla
                console.error('Error al obtener la información del historial de cancelaciones de reservas:', error);
                throw new Error('No se pudo obtener la información del historial de cancelaciones de reservas.');
            }
        });
    } // end getReservationCancellationHistory
    addCancellation(reservationPlayer) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                /* Instancia de services */
                const infoMatchService = new InfoMatchService_1.InfoMatchService(this._fileService);
                /* Consulta de datos necesarios */
                const infoMatchData = yield infoMatchService.getMatch();
                let cancellationHistory = yield this.getReservationCancellationHistory();
                /* Calculamos el código del partido */
                let codeMatch = `match-${(0, date_fns_1.format)((0, date_fns_1.parse)(infoMatchData.fullDate, 'dd/MM/yyyy HH:mm', new Date()), 'dd_MM_yyyy')}`;
                if (cancellationHistory[codeMatch]) {
                    cancellationHistory[codeMatch].push(reservationPlayer);
                }
                else {
                    cancellationHistory[codeMatch] = [reservationPlayer];
                }
                // Guarda los datos en el archivo JSON
                yield this._fileService.writeFile(Global_1.Global.FILEPATH_CANCELLATIONHISTORY, cancellationHistory);
            }
            catch (error) {
            }
        });
    } // end addCancellation
}
exports.ReservationCancellationHistoryService = ReservationCancellationHistoryService;

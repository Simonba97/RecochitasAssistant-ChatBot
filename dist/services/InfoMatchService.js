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
exports.InfoMatchService = void 0;
const Global_1 = require("../utils/Global");
/**
 * Servicio que contiene los metodos necesarios para gestionar un Match
 * @copyright 2023 - El uso de esta libreria esta reservador para este sitio y cualquier cambio o reutilización debe ser autorizado por el autor.
 * @author Simón Bustamante Alzate <simonba97@hotmail.com> / Fecha: 26.10.2023 - Creado
 *
 * @export
 * @class InfoMatchService
 */
class InfoMatchService {
    /**
    * Crear una instancia de InfoMatchService
    * @param {string}
    * @memberof InfoMatchService
    */
    constructor(fileService) {
        /* Instancia de servicios */
        this._fileService = fileService;
        this._filePathInformation = Global_1.Global.FILEPATH_INFOMATCH;
    } // end constructor
    /**
     * Obtiene la información de un partido desde un archivo.
     * @returns {Promise<IInfoMatchItem>} - Una promesa que se resuelve con la información del partido.
     */
    getMatch() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Leemos la información del partido y esperamos la respuesta
                return yield this._fileService.readFile(this._filePathInformation);
            }
            catch (error) {
                // Manejar errores si la lectura del archivo falla
                console.error('Error al obtener la información del partido:', error);
                throw new Error('No se pudo obtener la información del partido.');
            }
        });
    } // end getMatch
}
exports.InfoMatchService = InfoMatchService;

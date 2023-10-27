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
exports.FileService = void 0;
const fs_1 = require("fs");
/**
 * Servicio que contiene los metodos necesarios para gestionar archivos
 * @copyright 2023 - El uso de esta libreria esta reservador para este sitio y cualquier cambio o reutilización debe ser autorizado por el autor.
 * @author Simón Bustamante Alzate <simonba97@hotmail.com> / Fecha: 26.10.2023 - Creado
 *
 * @export
 * @class FileService
 */
class FileService {
    /**
    * Crear una instancia de FileService
    * @param {string}
    * @memberof FileService
    */
    /* public constructor() {

    } */ // end constructor
    /**
     * Escribe un objeto como contenido JSON en un archivo.
     * @param {string} filePath - La ruta del archivo donde se escribirá el contenido.
     * @param {IMatchQuotasItem} infoMatchQuotas - Los datos que se escribirán en el archivo.
     * @returns {Promise<void>} - Una promesa que se resuelve cuando la escritura se completa con éxito.
     * @memberof FileService
    */
    writeFile(filePath, infoMatchQuotas) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const data = JSON.stringify(infoMatchQuotas, null, 2);
                yield fs_1.promises.writeFile(filePath, data);
            }
            catch (error) {
                // Manejar errores, como archivo no encontrado o problemas de escritura
                throw new Error(`Error al escribir en el archivo en ${filePath}: ${error}`);
            }
        });
    } // end writeFile
    /**
     * Lee un archivo y devuelve su contenido como un objeto JSON.
     * @param {string} filePath - La ruta del archivo a leer.
     * @returns {Promise<any>} - Una promesa que se resuelve con el contenido del archivo como un objeto JSON.
     * @memberof FileService
     */
    readFile(filePath) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const data = yield fs_1.promises.readFile(filePath, 'utf8');
                return JSON.parse(data);
            }
            catch (error) {
                // Manejar errores, como archivo no encontrado o JSON inválido
                throw new Error(`Error al leer el archivo en ${filePath}: ${error}`);
            }
        });
    } // end readFile
} // end FileService
exports.FileService = FileService;

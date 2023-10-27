import { IInfoMatchItem } from "../models/IInfoMatchItem";
import { Global } from "../utils/Global";
import { FileService } from "./FileService";

/**
 * Servicio que contiene los metodos necesarios para gestionar un Match
 * @copyright 2023 - El uso de esta libreria esta reservador para este sitio y cualquier cambio o reutilización debe ser autorizado por el autor.
 * @author Simón Bustamante Alzate <simonba97@hotmail.com> / Fecha: 26.10.2023 - Creado
 *
 * @export
 * @class InfoMatchService
 */
export class InfoMatchService {

    private _fileService: FileService;
    private _filePathInformation;
    /**
    * Crear una instancia de InfoMatchService
    * @param {string} 
    * @memberof InfoMatchService
    */
    public constructor(fileService: FileService) {
        /* Instancia de servicios */
        this._fileService = fileService;
        this._filePathInformation = Global.FILEPATH_INFOMATCH;
    } // end constructor


    /**
     * Obtiene la información de un partido desde un archivo.
     * @returns {Promise<IInfoMatchItem>} - Una promesa que se resuelve con la información del partido.
     */
    public async getMatch(): Promise<IInfoMatchItem> {
        try {
            // Leemos la información del partido y esperamos la respuesta
            return await this._fileService.readFile(this._filePathInformation);
        } catch (error) {
            // Manejar errores si la lectura del archivo falla
            console.error('Error al obtener la información del partido:', error);
            throw new Error('No se pudo obtener la información del partido.');
        }
    } // end getMatch
}
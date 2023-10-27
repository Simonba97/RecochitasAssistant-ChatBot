import { promises as fsPromises } from 'fs';
import { IMatchQuotasItem } from '../models/IMatchQuotasItem';

/**
 * Servicio que contiene los metodos necesarios para gestionar archivos
 * @copyright 2023 - El uso de esta libreria esta reservador para este sitio y cualquier cambio o reutilización debe ser autorizado por el autor.
 * @author Simón Bustamante Alzate <simonba97@hotmail.com> / Fecha: 26.10.2023 - Creado
 *
 * @export
 * @class FileService
 */
export class FileService {

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
    public async writeFile(filePath: string, infoMatchQuotas: IMatchQuotasItem): Promise<void> {
        try {
            const data = JSON.stringify(infoMatchQuotas, null, 2);
            await fsPromises.writeFile(filePath, data);
        } catch (error) {
            // Manejar errores, como archivo no encontrado o problemas de escritura
            throw new Error(`Error al escribir en el archivo en ${filePath}: ${error}`);
        }
    } // end writeFile

    /**
     * Lee un archivo y devuelve su contenido como un objeto JSON.
     * @param {string} filePath - La ruta del archivo a leer.
     * @returns {Promise<any>} - Una promesa que se resuelve con el contenido del archivo como un objeto JSON.
     * @memberof FileService
     */
    public async readFile(filePath: string): Promise<any> {
        try {
            const data = await fsPromises.readFile(filePath, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            // Manejar errores, como archivo no encontrado o JSON inválido
            throw new Error(`Error al leer el archivo en ${filePath}: ${error}`);
        }
    } // end readFile
} // end FileService
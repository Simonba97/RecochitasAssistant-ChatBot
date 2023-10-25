import { IPlayerInformationItem } from "./IPlayerInformationItem";

/**
 * Representa una estructura de:
 *
 * @export
 * @interface IMatchQuotasItem
 */
export interface IMatchQuotasItem {
    goalkeepers: IPlayerInformationItem[];
    players: IPlayerInformationItem[];
    substitutes: IPlayerInformationItem[];
} // end IMatchQuotasItem
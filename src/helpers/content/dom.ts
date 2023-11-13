import { Nullable } from "../types";
import { DATA_PROCESSED_ATTR } from "./constants";

export const getSingleDomElement = (selector:string)=>document.querySelector(selector);
export const getMultipleDomElements = (selector:string)=>document.querySelectorAll(selector);
export const filterProcessedNodes = function(node:Nullable<Element>) {
    return node?.getAttribute(DATA_PROCESSED_ATTR) !== "true";
}

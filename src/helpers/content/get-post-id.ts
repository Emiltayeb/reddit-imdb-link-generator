import { Nullable } from "../types";
import { SupportedSites } from "./constants";

export const getPagePostAndSite=  () => {
    let postId = "",site:Nullable<SupportedSites> ;
    switch (window.location.hostname) {
        case SupportedSites.REDDIT:
         postId = window.location.href.split("/")[6]
            site = SupportedSites.REDDIT
                break;
        default:
            break;
    }
    return {postId,site};
}
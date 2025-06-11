import { OpenGraphData as ProtoOpenGraphData } from "@shared/proto/web";
/**
 * Converts domain OpenGraphData objects to proto OpenGraphData objects
 * @param ogData Domain OpenGraphData object
 * @returns Proto OpenGraphData object
 */
export function convertDomainOpenGraphDataToProto(ogData) {
    return ProtoOpenGraphData.create({
        title: ogData.title || "",
        description: ogData.description || "",
        image: ogData.image || "",
        url: ogData.url || "",
        siteName: ogData.siteName || "",
        type: ogData.type || "",
    });
}
//# sourceMappingURL=open-graph-conversion.js.map
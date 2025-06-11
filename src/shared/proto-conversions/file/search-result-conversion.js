/**
 * Converts domain search result objects to proto FileInfo objects
 */
export function convertSearchResultsToProtoFileInfos(results) {
    return results.map((result) => ({
        path: result.path,
        type: result.type,
        label: result.label,
    }));
}
/**
 * Converts proto FileInfo objects to domain search result objects
 */
export function convertProtoFileInfosToSearchResults(protoResults) {
    return protoResults.map((protoResult) => ({
        path: protoResult.path,
        type: protoResult.type,
        label: protoResult.label,
    }));
}
//# sourceMappingURL=search-result-conversion.js.map
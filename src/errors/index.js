export const rowIdentifierNotFound = (rowObj) => {
    return 'Provided rowIdentifier cannot be found as a property in the row data. The following keys are available: ' + JSON.stringify(Object.keys(rowObj))
}
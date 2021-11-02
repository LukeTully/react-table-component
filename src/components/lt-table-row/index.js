import { rowIdentifierNotFound } from "../../errors";
import PropTypes from "prop-types";


const LTTableRow = ({ rowIdentifier, row }) => {
    if (!row.hasOwnProperty(rowIdentifier)) throw new Error(rowIdentifierNotFound(row));
    return (
        <tr key={row[rowIdentifier]}>
            {Object.keys(row).map(colKey => (
                <td key={colKey} id={`row-${row[rowIdentifier]}-${colKey}`}>
                    <p>{row[colKey]}</p>
                </td>
            ))}
        </tr>
    )
}

LTTableRow.propTypes = {
    rowIdentifier: PropTypes.string.isRequired,
    row: PropTypes.object.isRequired
}

export default LTTableRow;
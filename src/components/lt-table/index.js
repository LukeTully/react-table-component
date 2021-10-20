import { useState, useEffect } from 'react'
import testData from '../../test-data';

const fetchData = (page = 1, apiUrl) => {
    const resultsPerPage = 10;
    const max = page * resultsPerPage;
    const min = max - resultsPerPage;
    
    return Promise.resolve(testData.slice(min, max));
}


const LTTable = ({ title, apiUrl, columns, searchable, paginatable }) => {


    const [page, setPage] = useState(1);
    const [rows, setRows] = useState([]);
    
    const [pageChangeCount, setPageChangeCount] = useState(0);

    const pageUp = () => {
        setPage(page + 1);
    }

    const pageDown = () => {
        if (page > 0) {
            setPage(page - 1);
        }
    }
    

    // Query the api on startup and when Page changes
    useEffect(() => {
        
        fetchData(page).then(rows => {
            console.log(rows[0].name);
            return setRows(rows);
        });
    }, [page]);
    

    return (
        <div className="lt-table"> 
            <h2>Current Page: {page}</h2>
            <h3>{pageChangeCount}</h3>
            <div id="controls">
                <button onClick={pageUp}>Page Up</button>
                <button onClick={pageDown}>Page Down</button>
            </div>
            <table>
            <thead>
                <tr>
                    {columns.map(colName => (
                        <th>
                            {colName}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {rows.map(col => (
                    <tr>
                        {Object.values(col).map(colVal => (
                            <td>
                                {colVal}
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
        </div>
    )
}


export default LTTable;
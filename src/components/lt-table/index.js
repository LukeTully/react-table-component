import { useState, useEffect } from 'react'
import LTColumnFilter from '../lt-column-filter';
import PropTypes from 'prop-types'
import { fetchData } from "../../services";
import { rowIdentifierNotFound } from "../../errors";
import FilterIcon from "../../assets/filter-funnel.svg";
import LTPaginator from '../lt-paginator';
import LTSpinner from '../lt-spinner';
import LTTableRow from '../lt-table-row';
import LTSearchBox from '../lt-search-box';

const DEFAULT_SORT_DIRECTION = 'desc';

export function LTTable({ title, apiUrl = "https://jsonplaceholder.typicode.com/comments", columns, searchable, paginatable, rowIdentifier }) {


    const [page, setPage] = useState(1);
    const [rows, setRows] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");

    const [filtering, setFiltering] = useState("");
    const [activeFilters, setActiveFilters] = useState({});

    const [sortBy, setSortBy] = useState("");
    const [sortDirection, setSortDirection] = useState(DEFAULT_SORT_DIRECTION);
    const [lastSorted, setLastSorted] = useState("");

    const [loading, setLoadingState] = useState(false);

    const downArrow = '\u25b2';
    const upArrow = '\u25bc';

    const handleSearchQueryChange = (query) => {
        setSearchQuery(query);
    }

    const changeSortDirection = () => {
        if (sortDirection === 'asc') {
            setSortDirection('desc');
        } else {
            setSortDirection('asc');
        }
    }

    const handleColumnSort = (e, col) => {
        if (lastSorted !== col.dataPath) {
            setLastSorted(col.dataPath);
            setSortDirection(DEFAULT_SORT_DIRECTION);
            setSortBy(col.dataPath);
        } else {
            changeSortDirection();
        }
    }

    const toggleFiltering = (e, col) => {
        e.stopPropagation();
        if (filtering === col.dataPath) {
            setFiltering(""); // Toggle the filter box off
        } else {
            setFiltering(col.dataPath);
        }
    }

    const setFiltersForColumn = (col, filters) => {

        // Top level state contains a two-level mapping of dataPaths to their respective active filters
        // The format in which this is sent to the server would depend on how the server handles complex request parameters
        const selectedFilters = []

        // The resulting array that's passed on to our datastore will be a child of the property named according to it's colunn's dataPath
        Object.keys(filters).forEach((filterKey) => {
            if (filters[filterKey] === true) {
                selectedFilters.push(filterKey);
            }
        })

        // We only care about the active filters, and throw out the rest by doing a new assignment
        activeFilters[col] = selectedFilters;

        // Commit our state changes with a new object so our component knows about it
        setActiveFilters({ ...activeFilters });
    }

    const handlePageChanged = (nextPage) => {
        setPage(nextPage);
    }

    // Query the api on startup and when any api param changes
    useEffect(() => {
        setLoadingState(true);
        fetchData(page, apiUrl, searchQuery, activeFilters, sortBy, sortDirection).then(rows => {
            setRows(rows);
            setLoadingState(false);
        });
       
    }, [page, apiUrl, activeFilters, searchQuery, sortBy, sortDirection]);


    return (
        <div className="lt-table-container">
            <h2>{title} Page: {page}</h2>
            <div className="lt-table-controls">
                <LTSearchBox commitSearch={handleSearchQueryChange} />
                <LTSpinner loading={loading} />
            </div>
            <table className="lt-table">
                <thead>
                    <tr className="lt-table-row">
                        {columns.map(col => {
                            let filterable = col.filterable;
                            let hasFilters = col.filters?.length > 0;
                            let filters = col.filters;


                            if (filterable && hasFilters) {
                                return (
                                    <th key={col.id} id={`lt-table-header-${col.dataPath}`} className="lt-table-col-th" onClick={(e) => handleColumnSort(e, col)}>
                                        {`${col.title} ${sortDirection === 'asc' ? downArrow : upArrow}`}
                                        <button className="col-filter-button" onClick={(e) => toggleFiltering(e, col)}><img src={FilterIcon} alt="Filter this column" width="15" height="15" /><span className="col-filter-button-text">Filter</span></button>
                                        {(filtering === col.dataPath) &&
                                            <LTColumnFilter
                                                className={"filter-menu" + (filtering === col.dataPath ? " active" : "")}
                                                filters={filters}
                                                dataPath={col.dataPath}
                                                saveFilterSelection={(filters) => setFiltersForColumn(col.dataPath, filters)}
                                            />
                                        }
                                    </th>
                                )
                            } else {
                                return (
                                    <th key={col.id} id={`lt-table-header-${col.dataPath}`} className="lt-table-col-th" onClick={(e) => handleColumnSort(e, col)}>                                        
                                        {`${col.title} ${sortDirection === 'asc' ? downArrow : upArrow}`}
                                    </th>
                                )
                            }
                        })}
                    </tr>
                </thead>
                <tbody>
                    {rows.map(row => (
                        <LTTableRow key={row[rowIdentifier]} row={row} rowIdentifier={rowIdentifier} />
                    ))}
                </tbody>
            </table>
            <div className="lt-table-paginator-container">
                <LTPaginator maxPagesToRender={10} pageNumber={parseInt(page, 10)} pageCount={15} pageChange={handlePageChanged}></LTPaginator>
            </div>
        </div>
    )
}

LTTable.propTypes = {
    rowIdentifier: PropTypes.string.isRequired,
    apiUrl: PropTypes.string.isRequired,
    columns: PropTypes.array.isRequired,
}
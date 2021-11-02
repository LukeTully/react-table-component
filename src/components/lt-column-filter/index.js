import { useState, useMemo } from "react";


const LTColumnFilter = ({ filters = [], dataPath, saveFilterSelection, className}) => {

    // Prepare local state for filters
    let filtersAsMap = {};
    for (let i = 0; i < filters.length; i++) {
        filtersAsMap[filters[i]] = false;
    }

    const [filterState, setFilterState] = useState(filtersAsMap);

    const handleFilterChange = (e, filter) => {
        setFilterState({
            ...filterState,
            [filter]: !filterState[filter],
        });
    }

    const commitFilterSelections = (e) => {
        e.preventDefault();
        saveFilterSelection(filterState);
    }


    return (
        <div className={className}>
            Filter By:
            <form id={'filter-form-' + dataPath} onSubmit={(e) => commitFilterSelections(e)}>
                {filters.map((filter, index) => {
                    let checkBoxInputName = `filter-input-${dataPath}-${index}`
                    return (
                        <div className="filter-wrapper" key={filter}>
                            <label>
                                {filter}
                                <input type="checkbox" name={checkBoxInputName} id={checkBoxInputName} onChange={(e) => handleFilterChange(e, filter)} />
                            </label>
                        </div>
                    );
                })}
                <input type="submit" value="Save" />
            </form>
        </div>
    );
}

export default LTColumnFilter;
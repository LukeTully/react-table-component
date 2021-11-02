import PropTypes from 'prop-types';
import { useState } from "react";

const LTSearchBox = ({searchString = "", commitSearch}) => {

    const [searchQuery, setSearchQuery] = useState(searchString);

    const handleSearchQuerySubmit = (e) => {
        e.preventDefault();
        commitSearch(searchQuery);
    }


    return (
        <div className="search-input-field">
            <form onSubmit={(e) => handleSearchQuerySubmit(e)}>
                <label htmlFor="search-input">Search: </label>
                <input className="lt-table-search-input" type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.currentTarget.value)} />
                <button type="submit">Submit</button>
            </form>
        </div>
    )
}

LTSearchBox.propTypes = {
    searchString: PropTypes.string,
    commitSearch: PropTypes.func.isRequired
}


export default LTSearchBox;



import PropTypes from 'prop-types'
import { useMemo } from 'react'


const LTPaginator = ({ pageCount, pageNumber, maxPagesToRender, pageChange }) => {

    const pageUp = () => {
        pageChange(pageNumber + 1);
    }

    const pageDown = () => {
        if (pageNumber > 1) {
            pageChange(pageNumber - 1);
        }
    }

    const pageSelected = (e) => {
        pageChange(parseInt(e.currentTarget.value, 10));
    }

    const renderPageIndicies = () => {
        const numbers = [];
        let index = 1;
        while (index <= maxPagesToRender) {
            if (index === pageNumber) {
                numbers.push(<li key={index}><button className="numeric-paginator-button active" value={index} onClick={(e) => pageSelected(e)}>{index}</button></li>)    
            } else {
                numbers.push(<li key={index}><button className="numeric-paginator-button" value={index} onClick={(e) => pageSelected(e)}>{index}</button></li>)
            }
            index++;
        }
        return <ul className="lt-paginator-buttons-list">{numbers}</ul>;
    }

    return (
        <div className="lt-table-paginator">
            <button onClick={pageDown} className="prev-button paginator-button">Previous Page</button>
                {renderPageIndicies()}
            <button onClick={pageUp} className="next-button paginator-button">Next Page</button>
        </div>
    )
}


LTPaginator.propTypes = {
    pageCount: PropTypes.number.isRequired,
    pageNumber: PropTypes.number.isRequired,
    maxPagesToRender: PropTypes.number.isRequired,
    pageCount: PropTypes.number.isRequired
}


export default LTPaginator;
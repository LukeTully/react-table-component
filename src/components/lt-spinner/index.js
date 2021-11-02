


const LTSpinner = ({ loading }) => {
    return (
        <div className="lt-table-spinner-container">
            {loading &&
                <p className="lt-spinner-loading-text">Loading...</p>
            }
        </div>
    );
}


export default LTSpinner;
import testData from '../store/test-data.js';


// Mock API calls that return test data
export const fetchData = (page = 1, apiUrl, searchQuery = null, filters, sortBy, sortDirection) => {
    const resultsPerPage = 10;
    const max = page * resultsPerPage;
    const min = max - resultsPerPage;
    const results = testData;

   return Promise.resolve(results.slice(min, max));
}
import { render, screen, waitFor, waitForElementToBeRemoved, fireEvent, within, act } from '@testing-library/react';
import LTTableRow from '../lt-table-row';
import { LTTable } from '.';
import { rowIdentifierNotFound } from '../../errors';
import * as Services from "../../services";
import testData from '../../store/test-data';

const columns = [
    {
        id: 0,
        title: 'Post ID',
        dataPath: 'postId',
        width: 100,
        sortable: true,
        filterable: true,
        filters: [
            1,
            2,
            3
        ]
    },
    {
        id: 1,
        title: 'Comment ID',
        dataPath: 'id',
        width: 100,
        sortable: true,
        filterable: true,
    },
    {
        id: 2,
        title: 'Comment Name',
        dataPath: 'name',
        width: 100,
        sortable: true,
        filterable: true
    },
    {
        id: 3,
        title: 'Email',
        dataPath: 'email',
        width: 100,
        sortable: true,
        filterable: true,
        filters: [
            "Presley.Mueller@myrl.com",
            "Dallas@ole.me",
            "Mallory_Kunze@marie.org"
        ]
    },
    {
        id: 4,
        title: 'Body',
        dataPath: 'body',
        width: 100,
        sortable: true,
        filterable: true,
    }
];

const exampleRow = {
    "postId": 1,
    "id": 1,
    "name": "id labore ex et quam laborum",
    "email": "Eliseo@gardner.biz",
    "body": "laudantium enim quasi est quidem magnam voluptate ipsam eos\ntempora quo necessitatibus\ndolor quam autem quasi\nreiciendis et nam sapiente accusantium"
};

beforeEach(() => {
    jest.useFakeTimers();
});

afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
});

test('Renders Table Titles', async () => {

    const titleToTest = 'Experiment 1';

    render(<LTTable title={titleToTest} columns={columns} rowIdentifier="id" apiUrl="/comments" />)

    // Wait for the title of the table component to render
    await waitFor(() => { screen.getByRole('heading') })

    // Check that the title that we've passed in as a prop is rendered correctly
    expect(screen.getByRole('heading')).toHaveTextContent(titleToTest);

});

test('LTTableRow handles incorrect rowIdentifier by throwing error', async () => {
    jest.spyOn(console, 'error');

    const expectedErrorMsg = rowIdentifierNotFound(exampleRow);
    expectToSilentryThrowError(() => render(<LTTableRow row={exampleRow} rowIdentifier="wrong" />), expectedErrorMsg)


})

function stripNewlinesFromString(s) {
    if (typeof s !== 'string') throw new Error(`Input ${s} was not a string and could not have newlines stripped from it.`)
    return s.replace(/(\r\n|\n|\r)/gm, " ").trim();
}

test('LTTableRow renders row contents when given valid rowIdentifier', async () => {
    render(
        <table>
            <tbody>
                <LTTableRow row={exampleRow} rowIdentifier="id" />
            </tbody>
        </table>
    );

    let rowKeyPairs = Object.entries(exampleRow);
    let bodyNode = await waitFor(() => screen.findAllByRole('cell'));

    for (let i = 0; i < bodyNode.length; i++) {
        let expectedCellBody = rowKeyPairs[i][1];
        if (typeof rowKeyPairs[i][1] === 'string') {
            expectedCellBody = stripNewlinesFromString(expectedCellBody);
        }
        expect(bodyNode[i]).toHaveTextContent(expectedCellBody);
    }


});


function expectToSilentryThrowError(fn, message) {
    jest.spyOn(console, "error")
    console.error.mockImplementation(() => { })
    expect(fn).toThrowError(message);
    console.error.mockRestore()
}

function mockFetchData() {
    return jest.spyOn(Services, 'fetchData').mockImplementation(async () => {
        let timer = null;
        return new Promise(resolve => {
            if (timer) clearTimeout(timer);
            timer = setTimeout(() => resolve(testData), 2000);
        });
    })
}


test("Filter box correctly toggles", async () => {

    const columnToTest = columns[3];
    render(<LTTable title={columnToTest.title} columns={columns} rowIdentifier="id" apiUrl="/comments" />)

    await waitFor(() => { screen.getByRole('heading') })

    // The email column in our example data is filterable and has filters defined for it, so let's make sure that pressing the filter button actually shows the filter box
    const tableHeader = document.getElementById('lt-table-header-email');
    const filterButton = tableHeader.querySelector('.col-filter-button');

    expect(within(tableHeader).queryByText(columnToTest.filters[0])).not.toBeInTheDocument();

    fireEvent.click(filterButton);
    const firstFilterOptionElement = await within(tableHeader).findByText(columnToTest.filters[0])
    expect(firstFilterOptionElement).toBeInTheDocument();
    expect(firstFilterOptionElement).toBeVisible();

    fireEvent.click(filterButton);
    expect(firstFilterOptionElement).not.toBeInTheDocument();

});


test('Triggering a network call correctly shows loading indicator', async () => {
    const api = mockFetchData();

    const app = render(<LTTable title={"example"} columns={columns} rowIdentifier="id" apiUrl="/comments" />);

    /* Initial render should trigger an api call which displays the loading indicator */
    expect(api).toHaveBeenCalledTimes(1);
    jest.advanceTimersByTime(500);
    expect(app.queryByText(/Loading/i)).toBeInTheDocument();

    /* Confirm that loading indicator is removed after initial load */
    jest.advanceTimersByTime(2500);
    await waitForElementToBeRemoved(app.queryByText(/Loading/i));
    expect(app.queryByText(/Loading/i)).not.toBeInTheDocument();

    const tableHeader = document.getElementById('lt-table-header-email');

    /* Trigger a sortDirection change, and wait a bit */
    fireEvent.click(tableHeader);
    jest.advanceTimersByTime(500);
    expect(api).toHaveBeenCalledTimes(2);

    /* Check that loading has appeared, then shift the clock to complete the promise */
    expect(app.queryByText(/Loading/i)).toBeInTheDocument();
    jest.advanceTimersByTime(2500);

    /* Confirm that the loading indicator has been removed */
    await waitForElementToBeRemoved(app.queryByText(/Loading/i));
    expect(app.queryByText(/Loading/i)).not.toBeInTheDocument();

});


test('Commiting a new filter selection makes an api call with correct params', async () => {

    const api = mockFetchData();
 
    const columnToTest = columns[3];

    // Example props needed for rendering LTTable
    const currentPage = 1;
    const apiUrl = '/comments';
    const title = columnToTest.title;

    // Setup the table and wait for it to finish rendering the initial document
    render(<LTTable title={title} columns={columns} rowIdentifier="id" apiUrl={apiUrl} />)
    await waitFor(() => { screen.getByRole('heading') })


    const tableHeader = document.getElementById('lt-table-header-email');
    const filterButton = tableHeader.querySelector('.col-filter-button');

    expect(within(tableHeader).queryByText(columnToTest.filters[0])).not.toBeInTheDocument();

    jest.advanceTimersByTime(2500);
    fireEvent.click(filterButton);
    const firstFilterOptionElement = await within(tableHeader).findByText(columnToTest.filters[0])
    const filterFormContainer = document.getElementById('filter-form-email');
    const filterSaveButton = filterFormContainer.querySelector('input[type=submit');

    // Trigger a save for the new filter selections
    fireEvent.click(firstFilterOptionElement);
    fireEvent.click(filterSaveButton);

    // Check that the api was called
    expect(api).toHaveBeenCalledWith(currentPage, apiUrl, "", { email: [columnToTest.filters[0]] }, "", "desc");
});


test('Submitting a search triggers api call with correct params', async () => {

    // Get and type into the search box after render
    const api = mockFetchData();
 
    const columnToTest = columns[3];

    // Example props needed for rendering LTTable
    const currentPage = 1;
    const apiUrl = '/comments';
    const title = columnToTest.title;

    // Setup the table and wait for it to finish rendering the initial document
    render(<LTTable title={title} columns={columns} rowIdentifier="id" apiUrl={apiUrl} />)


    // Get and click the search submit button to trigger an api call
    const searchInput = document.querySelector('.lt-table-search-input');


    const s = 'example search';
    // Confirm that the fetchData function was called with the correct params
    fireEvent.change(searchInput, { target: { value: s } })
    expect(searchInput).toHaveValue(s);

    fireEvent.submit(searchInput);
    expect(api).toHaveBeenCalledTimes(2);
    expect(api).toHaveBeenLastCalledWith(currentPage, apiUrl, s, {}, "", "desc");

});


test('Selecting a new page triggers a api call with correct params', async () => {
    const columnToTest = columns[3];

// Example props needed for rendering LTTable
    const currentPage = 1;
    const apiUrl = '/comments';
    const title = columnToTest.title;

    const api = mockFetchData();
    const app = render(<LTTable title={"example"} columns={columns} rowIdentifier="id" apiUrl="/comments" />);

    /* Initial render should trigger an api call which displays the loading indicator */
    expect(api).toHaveBeenCalledTimes(1);
    jest.advanceTimersByTime(500);
    expect(app.queryByText(/Loading/i)).toBeInTheDocument();

    await waitForElementToBeRemoved(() =>
        screen.queryByText(/Loading/i)
    );
    
    /* Confirm that loading indicator is removed after initial load */
    jest.advanceTimersByTime(2500);
    expect(app.queryByText(/Loading/i)).not.toBeInTheDocument();
    
    const paginatorNumberedButtonsContainer = document.querySelector('.lt-paginator-buttons-list');

    // Wait for the numeric buttons to render
    const buttons = within(paginatorNumberedButtonsContainer).getAllByRole('button');

    let callCount = 1; // The api should be called once on render
    
    /* Click the first numeric page button to trigger the second api call */
    fireEvent.click(buttons[1]);
    callCount++;
    
    expect(api).toHaveBeenCalledTimes(callCount);
    expect(api).toHaveBeenLastCalledWith(parseInt(2, 10), apiUrl, "", {}, "", "desc")

    await waitForElementToBeRemoved(app.queryByText(/Loading/i));

    /* Test the previous and next buttons */
    const prevButton = document.querySelector('.paginator-button.prev-button');
    const nextButton = document.querySelector('.paginator-button.next-button');

    /* Check that the previous button correctly triggers an api call */
    fireEvent.click(prevButton);
    callCount++
    expect(api).toHaveBeenCalledTimes(callCount);
    expect(api).toHaveBeenLastCalledWith(parseInt(1, 10), apiUrl, "", {}, "", "desc")


    /* Check that the next button correctly triggers an api call */
    fireEvent.click(nextButton);
    callCount++;
    expect(api).toHaveBeenCalledTimes(callCount);
    expect(api).toHaveBeenLastCalledWith(parseInt(2, 10), apiUrl, "", {}, "", "desc")


    
});

test('Changing column sort direction triggers api call with correct params', async () => {


    const api = mockFetchData();
    const app = render(<LTTable title={"example"} columns={columns} rowIdentifier="id" apiUrl="/comments" />);

    /* Initial render should trigger an api call which displays the loading indicator */
    expect(api).toHaveBeenCalledTimes(1);
    jest.advanceTimersByTime(500);
    expect(app.queryByText(/Loading/i)).toBeInTheDocument();

    await waitForElementToBeRemoved(() =>
        screen.queryByText(/Loading/i)
    );
    
    /* Confirm that loading indicator is removed after initial load */
    jest.advanceTimersByTime(2500);
    expect(app.queryByText(/Loading/i)).not.toBeInTheDocument();
    
    // The email column in our example data is filterable and has filters defined for it, so let's make sure that pressing the filter button actually shows the filter box
    const tableHeader = document.getElementById('lt-table-header-email');
    

    fireEvent.click(tableHeader);

    await waitFor(() => {
        return screen.queryByText(/Loading/i);
    });

    expect(screen.queryByText(/Loading/i)).toBeInTheDocument();


    expect(api).toHaveBeenCalledTimes(2);

});
test('Sorting by a new column triggers api call with correct params', async () => {


const api = mockFetchData();

const columnToTest = columns[3];

// Example props needed for rendering LTTable
    const currentPage = 1;
    const apiUrl = '/comments';
    const title = columnToTest.title;


    const app = render(<LTTable title={"example"} columns={columns} rowIdentifier="id" apiUrl="/comments" />);

    /* Initial render should trigger an api call which displays the loading indicator */
    expect(api).toHaveBeenCalledTimes(1);
    jest.advanceTimersByTime(500);
    expect(app.queryByText(/Loading/i)).toBeInTheDocument();

    await waitForElementToBeRemoved(() =>
        screen.queryByText(/Loading/i)
    );
    
    /* Confirm that loading indicator is removed after initial load */
    jest.advanceTimersByTime(2500);
    expect(app.queryByText(/Loading/i)).not.toBeInTheDocument();
    
    // The email column in our example data is filterable and has filters defined for it, so let's make sure that pressing the filter button actually shows the filter box
    const tableHeader = document.getElementById('lt-table-header-email');
    const secondTableHeader = document.getElementById('lt-table-header-name');

    fireEvent.click(tableHeader);

    await waitFor(() => {
        return screen.queryByText(/Loading/i);
    });


    const loadingIndicator = screen.queryByText(/Loading/i);
    expect(loadingIndicator).toBeInTheDocument();

    expect(api).toHaveBeenCalledTimes(2);
    expect(api).toHaveBeenLastCalledWith(currentPage, apiUrl, "", {}, "email", "desc")

    await waitForElementToBeRemoved(loadingIndicator);
    expect(loadingIndicator).not.toBeInTheDocument();

    fireEvent.click(secondTableHeader);
    expect(api).toHaveBeenCalledTimes(3);
    expect(api).toHaveBeenLastCalledWith(currentPage, apiUrl, "", {}, "name", "desc")


});
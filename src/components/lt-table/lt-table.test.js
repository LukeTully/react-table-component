import { render, screen, waitFor, waitForElementToBeRemoved, fireEvent, within } from '@testing-library/react';
import { LTTable } from '.';
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

function mockFetchData() {
    return jest.spyOn(Services, 'fetchData').mockImplementation(async () => {
        let timer = null;
        return new Promise(resolve => {
            if (timer) clearTimeout(timer);
            timer = setTimeout(() => resolve(testData), 2000);
        });
    })
}

test('Renders LTTable title', async () => {

    const title = 'Experiment 1';

    render(<LTTable title={title} columns={columns} rowIdentifier="id" apiUrl="/comments" />)

    /* Wait for the title of the table component to render */
    await waitFor(() => { screen.getByRole('heading') })

    /* Check that the title that we've passed in as a prop is rendered correctly */
    expect(screen.getByRole('heading')).toHaveTextContent(title);

});

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

    /* Example props needed for rendering LTTable */
    const currentPage = 1;
    const apiUrl = '/comments';
    const title = columnToTest.title;

    /* Setup the table and wait for it to finish rendering the initial document */
    render(<LTTable title={title} columns={columns} rowIdentifier="id" apiUrl={apiUrl} />)
    await waitFor(() => { screen.getByRole('heading') })
    await waitForElementToBeRemoved(screen.queryByText(/Loading/i));

    /* Get the specific nodes to work with in this test */
    const tableHeader = document.getElementById('lt-table-header-email');
    const filterButton = tableHeader.querySelector('.col-filter-button');

    /* Make the filter box appear */
    fireEvent.click(filterButton);
    const firstFilterOptionElement = await within(tableHeader).findByText(columnToTest.filters[0])
    const filterFormContainer = document.getElementById('filter-form-email');
    const filterSaveButton = filterFormContainer.querySelector('input[type=submit');

    /* Confirm that the first filter for this column has been rendered correctly */
    expect(within(tableHeader).queryByText(columnToTest.filters[0])).toBeInTheDocument();

    /* Trigger a save for the new filter selections */
    fireEvent.click(firstFilterOptionElement);
    fireEvent.click(filterSaveButton);

    /* Check that the api was called */
    expect(api).toHaveBeenCalledWith(currentPage, apiUrl, "", { email: [columnToTest.filters[0]] }, "", "desc");
});


test('Submitting a search triggers api call with correct params', async () => {

    /* Get and type into the search box after render */
    const api = mockFetchData();
    const columnToTest = columns[3];

    /* Example props needed for rendering LTTable */
    const currentPage = 1;
    const apiUrl = '/comments';
    const title = columnToTest.title;

    /* Setup the table and wait for it to finish rendering the initial document */
    render(<LTTable title={title} columns={columns} rowIdentifier="id" apiUrl={apiUrl} />)

    /* Get and click the search submit button to trigger an api call */
    const searchInput = document.querySelector('.lt-table-search-input');
    
    /* Confirm that the fetchData function was called with the correct params */
    const searchTerm = 'example search';
    fireEvent.change(searchInput, { target: { value: searchTerm } })
    expect(searchInput).toHaveValue(searchTerm);

    /* Submit the new search query */
    fireEvent.submit(searchInput);
    expect(api).toHaveBeenCalledTimes(2);
    expect(api).toHaveBeenLastCalledWith(currentPage, apiUrl, searchTerm, {}, "", "desc");

});


test('Selecting a new page triggers a api call with correct params', async () => {
    const columnToTest = columns[3];

    /* Example props needed for rendering LTTable */
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

    /* Wait for the numeric buttons to render */
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

    /* The email column in our example data is filterable and has filters defined for it, so let's make sure that pressing the filter button actually shows the filter box */
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

    /* Example props needed for rendering LTTable */
    const currentPage = 1;
    const apiUrl = '/comments';
    const title = columnToTest.title;

    const app = render(<LTTable title={title} columns={columns} rowIdentifier="id" apiUrl="/comments" />);

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

    /* The email column in our example data is filterable and has filters defined for it, so let's make sure that pressing the filter button actually shows the filter box */
    const tableHeader = document.getElementById('lt-table-header-email');
    const secondTableHeader = document.getElementById('lt-table-header-name');

    /* Establish the first sorting column */    
    fireEvent.click(tableHeader);

    await waitFor(() => {
        return screen.queryByText(/Loading/i);
    });

    /* Wait for the api call to return */
    const loadingIndicator = screen.queryByText(/Loading/i);
    expect(loadingIndicator).toBeInTheDocument();

    /* Verify that the api was called the correct amount of times and with the expected params */
    expect(api).toHaveBeenCalledTimes(2);
    expect(api).toHaveBeenLastCalledWith(currentPage, apiUrl, "", {}, "email", "desc")

    /* Wait for the loading indicator to dissappear */
    await waitForElementToBeRemoved(loadingIndicator);
    expect(loadingIndicator).not.toBeInTheDocument();

    /* Establish the next api call by switch which column is being sorted by */
    fireEvent.click(secondTableHeader);
    expect(api).toHaveBeenCalledTimes(3);
    expect(api).toHaveBeenLastCalledWith(currentPage, apiUrl, "", {}, "name", "desc")
});
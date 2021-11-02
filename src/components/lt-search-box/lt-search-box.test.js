import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import LTSearchBox from '.';

it('Should call provided search commit function with new search input', () => {
    const initialSearchQuery = "Example Search"; // Expect this to be rendered as input value initially
    const newSearchQuery = "Different Search"; // Expect this to be set after typing it into the search input box

    const mockSearchQueryHandler = jest.fn();

    render(<LTSearchBox searchString={initialSearchQuery} commitSearch={mockSearchQueryHandler} />);

    // Find the input element
    // Query for the initialSearchQuery text to make sure it's rendered as the input value
    // Type into the input element
    // Expect that the mockSearchQueryHandler is called with the expected arguments

});
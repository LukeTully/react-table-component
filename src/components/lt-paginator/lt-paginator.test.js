import { render, fireEvent, within } from '@testing-library/react';
import LTPaginator from '.';


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


test('Ensure that all pagination buttons correctly change the page number through the provided callback', async () => {
    
    const maxNumbersToRenderBeforeEllipsis = 10;
    const totalPages = 15;
    const currentPage = 2;

    const handlePageChange = jest.fn((nextPage) => {
       // Do Nothing
    })

    render(<LTPaginator maxPagesToRender={maxNumbersToRenderBeforeEllipsis} pages={totalPages} pageNumber={2} pageChange={handlePageChange}></LTPaginator>)
    
    const pageNumberContainer = document.querySelector('.lt-paginator-buttons-list');


    // Wait for the numeric buttons to render
    const buttons = within(pageNumberContainer).getAllByRole('button');

    for(let i = 1; i < maxNumbersToRenderBeforeEllipsis; i++) {
      expect(parseInt(buttons[i - 1].value, 10)).toBe(i);
    }
    

    // Expect that the current index is active according to it's class
    expect(buttons[1]).toHaveClass('active');
    
    // Click another numeric index
    fireEvent.click(buttons[4]);
    
    // Expect that the handlePageChange method is called with the expected parameter
    expect(handlePageChange).toBeCalledWith(5)

    // Test the previous and next buttons
    const prevButton = document.querySelector('.paginator-button.prev-button');
    const nextButton = document.querySelector('.paginator-button.next-button');

    // Check that the previous button correctly asks the handler to decrement the current page
    fireEvent.click(prevButton);
    expect(handlePageChange).toBeCalledWith(1)

    fireEvent.click(nextButton);
    expect(handlePageChange).toBeCalledWith(3)


}); 
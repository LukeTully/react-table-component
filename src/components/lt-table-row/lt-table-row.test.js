import { render, screen, waitFor } from '@testing-library/react';
import LTTableRow from ".";
import { rowIdentifierNotFound } from "../../errors";

const exampleRow = {
    "postId": 1,
    "id": 1,
    "name": "id labore ex et quam laborum",
    "email": "Eliseo@gardner.biz",
    "body": "laudantium enim quasi est quidem magnam voluptate ipsam eos\ntempora quo necessitatibus\ndolor quam autem quasi\nreiciendis et nam sapiente accusantium"
};

function expectToSilentryThrowError(fn, message) {
    jest.spyOn(console, "error")
    console.error.mockImplementation(() => { })
    expect(fn).toThrowError(message);
    console.error.mockRestore()
}

function stripNewlinesFromString(s) {
    if (typeof s !== 'string') throw new Error(`Input ${s} was not a string and could not have newlines stripped from it.`)
    return s.replace(/(\r\n|\n|\r)/gm, " ").trim();
}

beforeEach(() => {
    jest.useFakeTimers();
});

afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
});

test('LTTableRow handles incorrect rowIdentifier by throwing error', async () => {
    const expectedErrorMsg = rowIdentifierNotFound(exampleRow);
    expectToSilentryThrowError(() => render(<LTTableRow row={exampleRow} rowIdentifier="wrong" />), expectedErrorMsg)
})

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

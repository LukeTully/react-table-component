import logo from './logo.svg';
import './App.css';
import './components/lt-table'
import {LTTable} from './components/lt-table';
import testData from './store/test-data';

function App() {
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
  ]
  return (
    <div className="App">
      <LTTable title="Experiment 1" rowIdentifier="id" columns={columns}></LTTable>
    </div>
  );
}

export default App;

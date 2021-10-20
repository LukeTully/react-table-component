import logo from './logo.svg';
import './App.css';
import './components/lt-table'
import LTTable from './components/lt-table';
import testData from './test-data';

function App() {
  return (
    <div className="App">
      <LTTable title="Experiement 1" columns={["postId", "id", "name", "email", "body"]}></LTTable>
    </div>
  );
}

export default App;

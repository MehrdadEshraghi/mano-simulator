import React from 'react';
import CodeForm from '../CodeForm';
import ComputerState from '../ComputerState';
import RAMTable from '../RAMTable';
import './styles.css';

function App() {
	return (
		<div className="App">
			<CodeForm />
			<ComputerState />
			<RAMTable />
		</div>
	);
}

export default App;

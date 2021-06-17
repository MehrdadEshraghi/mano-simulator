import React, { useState } from 'react';
import CodeForm from '../CodeForm';
import ComputerState from '../ComputerState';
import RAMTable from '../RAMTable';
import './styles.css';

const errorsText = {
	syntax: 'Compiler: Syntax error in line ',
	expectedEND: 'Compiler: Expected END pseudo instruction',
	invalidInstruction: 'Compiler: Invalid instruction in line ',
	noAddress: 'Compiler: No address was given in line ',
	invalidLabel: 'Compiler: Invalid label in line '
};

const instructions = {
	memory: {
		AND: {
			direct: '0',
			indirect: '8'
		},
		ADD: {
			direct: '1',
			indirect: '9'
		},
		LDA: {
			direct: '2',
			indirect: 'A'
		},
		STA: {
			direct: '3',
			indirect: 'B'
		},
		BUN: {
			direct: '4',
			indirect: 'C'
		},
		BSA: {
			direct: '5',
			indirect: 'D'
		},
		ISZ: {
			direct: '6',
			indirect: 'E'
		}
	},
	register: {
		CLA: '7800',
		CLE: '7400',
		CMA: '7200',
		CME: '7100',
		CIR: '7080',
		CIL: '7040',
		INC: '7020',
		SPA: '7010',
		SNA: '7008',
		SZA: '7004',
		SZE: '7002',
		HLT: '7001'
	},
	IO: {
		INP: 'F800',
		OUT: 'F400',
		SKI: 'F200',
		SKO: 'F100',
		ION: 'F080',
		IOF: 'F040'
	}
};

function App() {
	const [ error, setError ] = useState('');
	const [ code, setCode ] = useState([]);
	const [ infoTable, setInfoTable ] = useState([]);

	const handleError = (type, line) => {
		setCode([]);
		if (type === 'syntax' || type === 'invalidInstruction' || type === 'noAddress' || type === 'invalidLabel') {
			setError(errorsText[type] + line);
		} else {
			setError(errorsText[type]);
		}
		return false;
	};

	const onSubmit = (values) => {
		if (!values.code) return;
		setError('');
		const { code } = values;
		const lines = code.split('\n');
		const isErrorFree = compiler(lines);
		if (!isErrorFree) return;
		setCode(lines);
	};

	const compiler = (lines) => {
		//First compile phase
		let lineCounter = '0';
		const labels = {};
		const infoTableTemp = [];
		let label;
		if (lines[lines.length - 1] !== 'END') return handleError('expectedEND');
		for (let i = 0; i < lines.length; i++) {
			const words = lines[i].split(' ');
			const is_label = words[0][words[0].length - 1];
			if (words[0] === 'ORG') {
				if (!words[1]) return handleError('syntax', i + 1);
				lineCounter = words[1];
				lineCounter = (parseInt(lineCounter, 16) - 1).toString(16).toUpperCase();
			} else if (is_label === ',') {
				label = words[0].slice(0, -1);
				labels[label] = {};
				labels[label].address = lineCounter;
				if (words[1] === 'HEX') {
					if (!words[2]) return handleError('syntax', i + 1);
					labels[label].value = parseInt(words[2], 16);
				} else if (words[1] === 'DEC') {
					if (!words[2]) return handleError('syntax', i + 1);
					labels[label].value = parseInt(words[2]);
				}
			}
			// console.log(labels);
			infoTableTemp.push({
				label: words[0][words[0].length - 1] === ',' ? label : null,
				address: lineCounter,
				instruction: words[0][words[0].length - 1] === ',' ? words.slice(1).join(' ') : lines[i],
				HEX: null
			});
			// console.log(infoTable);
			lineCounter = (parseInt(lineCounter, 16) + 1).toString(16).toUpperCase();
		}

		//Second compile phase
		for (let i = 0; i < infoTableTemp.length; i++) {
			if (
				infoTableTemp[i].instruction === 'END' ||
				infoTableTemp[i].instruction.split(' ')[0] === 'ORG' ||
				infoTableTemp[i].label
			)
				continue;
			const ins = infoTableTemp[i].instruction.split(' ')[0];
			// console.log(ins);
			if (
				!instructions['memory'][ins] &&
				!instructions['register'][ins] &&
				!instructions['IO'][ins] &&
				!infoTableTemp[i].label
			)
				return handleError('invalidInstruction', i + 1);

			if (instructions['register'][ins]) infoTableTemp[i].HEX = instructions['register'][ins];
			else if (instructions['IO'][ins]) infoTableTemp[i].HEX = instructions['IO'][ins];
			else {
				const words = infoTableTemp[i].instruction.split(' ');
				if (!words[1]) return handleError('noAddress', i + 1);
				else if (!labels[words[1]]) return handleError('invalidLabel', i + 1);

				if ([ words[words.length - 1] ] === 'I')
					infoTableTemp[i].HEX = instructions['memory'][words[0]]['indirect'] + labels[words[1]].address;
				else infoTableTemp[i].HEX = instructions['memory'][words[0]]['direct'] + labels[words[1]].address;
			}
		}
		setInfoTable([ ...infoTableTemp ]);
		console.log(infoTable);
		console.log(infoTable);
		console.log(infoTable);
		return true;
		// console.log(infoTable);
	};

	return (
		<div className="App">
			<CodeForm onSubmit={onSubmit} />
			<ComputerState error={error} onSubmit={onSubmit} />
			<RAMTable infoTable={infoTable} code={code} />
		</div>
	);
}

export default App;

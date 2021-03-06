import React, { useState } from 'react';
import CodeForm from '../CodeForm';
import ComputerState from '../ComputerState';
import RAMTable from '../RAMTable';
import './styles.css';
import {
	errorsText,
	instructions,
	createToInt,
	initialRegistersAndFlags,
	normalizeString,
	complement,
	circulate,
	calculateValue,
	and
} from '../../utils';

let haltFlag = false;

const App = () => {
	const toInt16 = createToInt(16);
	let [ registersAndFlags, setRegistersAndFlags ] = useState(initialRegistersAndFlags);
	const [ error, setError ] = useState('');
	const [ infoTable, setInfoTable ] = useState([]);
	const [ showStep, setShowStep ] = useState(false);
	let [ lineNumber, setLineNumber ] = useState(0); //The line number which is getting executed by computer

	const findRow = (ins, indirect) => {
		if (indirect) {
			const first = infoTable.filter((row) => row.address === ins)[0];
			const result = infoTable.filter((row) => row.address === first.HEX.slice(1))[0];
			if (!result) {
				if (first) {
					return { label: null, address: first.address, instruction: '', HEX: '0000' };
				}
				return { label: null, address: ins.toString(16).toUpperCase(), instruction: '', HEX: '0000' };
			}
			return result;
		}
		return infoTable.filter((row) => row.address === ins)[0];
	};

	const updateActiveRow = (rowNum) => {
		let infoTableTemp = infoTable;
		for (let row of infoTableTemp) {
			row.active = false;
		}
		infoTableTemp[rowNum].active = true;
		setInfoTable([ ...infoTableTemp ]);
	};

	const handleStep = () => {
		if (
			lineNumber + 1 > infoTable.length ||
			(infoTable[lineNumber].instruction === null && infoTable[lineNumber].label)
		) {
			setLineNumber(lineNumber + 1);
			setRegistersAndFlags({
				...registersAndFlags,
				PC: normalizeString((parseInt(registersAndFlags.PC, 16) + 1).toString(16), 3)
			});
			return;
		}
		try {
			if (
				infoTable[lineNumber].instruction.split(' ')[0] === 'HEX' ||
				infoTable[lineNumber].instruction.split(' ')[0] === 'DEC'
			) {
				setLineNumber(lineNumber + 1);
				return;
			}
		} catch (error) {}

		const ins = infoTable[lineNumber].HEX;
		//Check Memory instructions
		let num1, num2, row, infoTableTemp;
		switch (ins[0]) {
			case '8':
			case '0':
				num1 = normalizeString(parseInt(registersAndFlags.AC, 16).toString(2), 16);
				num2 = normalizeString(parseInt(findRow(ins.slice(1), ins[0] === '0' ? false : true).HEX, 16).toString(2), 16);
				setRegistersAndFlags({
					...registersAndFlags,
					AC: and(num1, num2),
					PC: normalizeString((parseInt(registersAndFlags.PC, 16) + 1).toString(16), 3),
					DR: findRow(ins.slice(1), ins[0] === '0' ? false : true).HEX,
					I: ins[0] === '0' ? '0' : '1',
					IR: infoTable[lineNumber].HEX,
					AR:
						ins[0] === '0'
							? infoTable[lineNumber].HEX.slice(1)
							: findRow(ins.slice(1), ins[0] === '0' ? false : true).HEX.slice(1)
				});
				break;
			case '9':
			case '1':
				let newE = '0';
				num1 = calculateValue(findRow(ins.slice(1), ins[0] === '1' ? false : true).HEX, 4);
				num2 = calculateValue(registersAndFlags.AC, 4);
				let result = num1 + num2;
				result = result.toString(2);
				if (result.length > 16 && result[16] !== '-') {
					newE = result[16];
					result = result.slice(0, 15);
				}
				result = parseInt(result, 2);
				setRegistersAndFlags({
					...registersAndFlags,
					AC: normalizeString(toInt16(result).toString(16), 4),
					PC: normalizeString((parseInt(registersAndFlags.PC, 16) + 1).toString(16), 3),
					DR: findRow(ins.slice(1), ins[0] === '1' ? false : true).HEX,
					I: ins[0] === '1' ? '0' : '1',
					E: newE,
					AR:
						ins[0] === '1'
							? infoTable[lineNumber].HEX.slice(1)
							: findRow(ins.slice(1), ins[0] === '1' ? false : true).HEX.slice(1),
					IR: infoTable[lineNumber].HEX
				});
				break;
			case 'A':
			case '2':
				setRegistersAndFlags({
					...registersAndFlags,
					AC: findRow(ins.slice(1), ins[0] === '2' ? false : true).HEX,
					PC: normalizeString((parseInt(registersAndFlags.PC, 16) + 1).toString(16), 3),
					DR: findRow(ins.slice(1), ins[0] === '2' ? false : true).HEX,
					I: ins[0] === '2' ? '0' : '1',
					AR:
						ins[0] === '2'
							? infoTable[lineNumber].HEX.slice(1)
							: findRow(ins.slice(1), ins[0] === '2' ? false : true).HEX.slice(1),
					IR: infoTable[lineNumber].HEX
				});
				break;
			case 'B':
			case '3':
				row = findRow(ins.slice(1), ins[0] === '3' ? false : true);
				row.HEX = registersAndFlags.AC;
				row.instruction = null;
				infoTableTemp = infoTable;
				for (let i = 0; i < infoTableTemp.length; i++)
					if (infoTableTemp[i].address === row.address) infoTableTemp[i] = row;
				setInfoTable([ ...infoTableTemp ]);
				setRegistersAndFlags({
					...registersAndFlags,
					PC: normalizeString((parseInt(registersAndFlags.PC, 16) + 1).toString(16), 3),
					I: ins[0] === '3' ? '0' : '1',
					AR:
						ins[0] === '3'
							? infoTable[lineNumber].HEX.slice(1)
							: findRow(ins.slice(1), ins[0] === '3' ? false : true).HEX.slice(1),
					IR: infoTable[lineNumber].HEX
				});
				break;
			case 'C':
			case '4':
				infoTableTemp = infoTable;
				row = findRow(ins.slice(1), ins[0] === '4' ? false : true);
				let index = infoTableTemp.findIndex((r) => r.address === row.address);
				setRegistersAndFlags({
					...registersAndFlags,
					PC: infoTableTemp[index].address,
					// DR: findRow(ins.slice(1), ins[0] === '4' ? false : true).HEX,
					I: ins[0] === '4' ? '0' : '1',
					AR:
						ins[0] === '4'
							? infoTable[lineNumber].HEX.slice(1)
							: findRow(ins.slice(1), ins[0] === '4' ? false : true).HEX.slice(1),
					IR: infoTable[lineNumber].HEX
				});
				setLineNumber(ins[0] === '4' ? index : index + 1);
				return;
			case 'D':
			case '5':
				row = findRow(ins.slice(1), ins[0] === '5' ? false : true);
				infoTableTemp = infoTable;
				let index1 = infoTableTemp.findIndex((r) => r.address === row.address);
				infoTableTemp[index1].HEX = normalizeString(infoTableTemp[lineNumber].address, 4);
				infoTableTemp[index1].instruction = null;
				setInfoTable([ ...infoTableTemp ]);
				setLineNumber(index1 + 1);
				setRegistersAndFlags({
					...registersAndFlags,
					PC: normalizeString((parseInt(infoTableTemp[index1].address, 16) + 1).toString(16), 3),
					DR: findRow(ins.slice(1), ins[0] === '5' ? false : true).HEX,
					I: ins[0] === '5' ? '0' : '1',
					AR:
						ins[0] === '5'
							? normalizeString((parseInt(infoTable[lineNumber].HEX.slice(1), 16) + 1).toString(16), 3)
							: normalizeString(
									(parseInt(findRow(ins.slice(1), ins[0] === '5' ? false : true).HEX.slice(1), 16) + 1).toString(16),
									3
								),
					IR: infoTable[lineNumber].HEX
				});
				return;
			case 'E':
			case '6':
				row = findRow(ins.slice(1), ins[0] === '6' ? false : true);
				infoTableTemp = infoTable;
				let index3 = infoTableTemp.findIndex((r) => r.address === row.address);
				row.instruction = null;
				const decimalNum = calculateValue(row.HEX, 4) + 1;
				row.HEX = normalizeString(toInt16(calculateValue(row.HEX, 4) + 1).toString(16), 4);
				infoTableTemp[index3] = row;
				setInfoTable([ ...infoTableTemp ]);
				if (decimalNum === 0) {
					setLineNumber(lineNumber + 2);
					setRegistersAndFlags({
						...registersAndFlags,
						PC: normalizeString((parseInt(registersAndFlags.PC, 16) + 2).toString(16), 3),
						DR: findRow(ins.slice(1), ins[0] === '6' ? false : true).HEX,
						I: ins[0] === '6' ? '0' : '1',
						AR:
							ins[0] === '6'
								? infoTable[lineNumber].HEX.slice(1)
								: findRow(ins.slice(1), ins[0] === '6' ? false : true).HEX.slice(1),
						IR: infoTable[lineNumber].HEX
					});
					return;
				} else {
					setRegistersAndFlags({
						...registersAndFlags,
						PC: normalizeString((parseInt(registersAndFlags.PC, 16) + 1).toString(16), 3),
						DR: findRow(ins.slice(1), ins[0] === '6' ? false : true).HEX,
						I: ins[0] === '6' ? '0' : '1',
						AR:
							ins[0] === '6'
								? infoTable[lineNumber].HEX.slice(1)
								: findRow(ins.slice(1), ins[0] === '6' ? false : true).HEX.slice(1),
						IR: infoTable[lineNumber].HEX
					});
				}
				break;
			default:
				break;
		}

		//Check Register and I/O instructions
		switch (ins) {
			case '7800':
				setRegistersAndFlags({
					...registersAndFlags,
					AC: '0000',
					PC: normalizeString((parseInt(registersAndFlags.PC, 16) + 1).toString(16), 3),
					AR: '800',
					IR: infoTable[lineNumber].HEX
				});
				break;
			case '7400':
				setRegistersAndFlags({
					...registersAndFlags,
					E: '0',
					PC: normalizeString((parseInt(registersAndFlags.PC, 16) + 1).toString(16), 3),
					AR: '400',
					IR: infoTable[lineNumber].HEX
				});
				break;
			case '7200':
				setRegistersAndFlags({
					...registersAndFlags,
					AC: complement(registersAndFlags.AC, 4),
					PC: normalizeString((parseInt(registersAndFlags.PC, 16) + 1).toString(16), 3),
					AR: '200',
					IR: infoTable[lineNumber].HEX
				});
				break;
			case '7100':
				setRegistersAndFlags({
					...registersAndFlags,
					E: registersAndFlags.E === '1' ? '0' : '1',
					PC: normalizeString((parseInt(registersAndFlags.PC, 16) + 1).toString(16), 3),
					AR: '100',
					IR: infoTable[lineNumber].HEX
				});
				break;
			case '7080':
				const [ newAC, newE ] = circulate(registersAndFlags.AC, registersAndFlags.E, 'right');
				setRegistersAndFlags({
					...registersAndFlags,
					AC: newAC,
					E: newE,
					PC: normalizeString((parseInt(registersAndFlags.PC, 16) + 1).toString(16), 3),
					AR: '080',
					IR: infoTable[lineNumber].HEX
				});
				break;
			case '7040':
				const [ newAC1, newE1 ] = circulate(registersAndFlags.AC, registersAndFlags.E, 'left');
				setRegistersAndFlags({
					...registersAndFlags,
					AC: newAC1,
					E: newE1,
					PC: normalizeString((parseInt(registersAndFlags.PC, 16) + 1).toString(16), 3),
					AR: '040',
					IR: infoTable[lineNumber].HEX
				});
				break;
			case '7020':
				setRegistersAndFlags({
					...registersAndFlags,
					PC: normalizeString((parseInt(registersAndFlags.PC, 16) + 1).toString(16), 3),
					AC: normalizeString(toInt16(calculateValue(registersAndFlags.AC, 4) + 1).toString(16), 4),
					AR: '020',
					IR: infoTable[lineNumber].HEX
				});
				break;
			case '7010':
				if (calculateValue(registersAndFlags.AC, 4) > 0) {
					setLineNumber(lineNumber + 2);
					setRegistersAndFlags({
						...registersAndFlags,
						PC: normalizeString((parseInt(registersAndFlags.PC, 16) + 2).toString(16), 3),
						AR: '010',
						IR: infoTable[lineNumber].HEX
					});
					return;
				}
				break;
			case '7008':
				if (calculateValue(registersAndFlags.AC, 4) < 0) {
					setLineNumber(lineNumber + 2);
					setRegistersAndFlags({
						...registersAndFlags,
						PC: normalizeString((parseInt(registersAndFlags.PC, 16) + 2).toString(16), 3),
						AR: '008',
						IR: infoTable[lineNumber].HEX
					});
					return;
				}
				break;
			case '7004':
				if (calculateValue(registersAndFlags.AC, 4) === 0) {
					setLineNumber(lineNumber + 2);
					setRegistersAndFlags({
						...registersAndFlags,
						PC: normalizeString((parseInt(registersAndFlags.PC, 16) + 2).toString(16), 3),
						AR: '008',
						IR: infoTable[lineNumber].HEX
					});
					return;
				}
				break;
			case '7002':
				if (parseInt(registersAndFlags.E, 2) === 0) {
					setLineNumber(lineNumber + 2);
					setRegistersAndFlags({
						...registersAndFlags,
						PC: normalizeString((parseInt(registersAndFlags.PC, 16) + 2).toString(16), 3),
						AR: '002',
						IR: infoTable[lineNumber].HEX
					});
					return;
				}
				break;
			case '7001':
				setRegistersAndFlags({
					...registersAndFlags,
					S: '0',
					IR: infoTable[lineNumber].HEX,
					AR: '001',
					PC: !haltFlag
						? normalizeString((parseInt(registersAndFlags.PC, 16) + 1).toString(16), 3)
						: registersAndFlags.PC
				});
				setError('The program has ended');
				haltFlag = true;
				return;
			case 'F400':
				setRegistersAndFlags({
					...registersAndFlags,
					OUTR: registersAndFlags.AC.slice(2),
					PC: normalizeString((parseInt(registersAndFlags.PC, 16) + 1).toString(16), 3),
					AR: '400',
					IR: infoTable[lineNumber].HEX
				});
				break;
			default:
				break;
		}
		try {
			updateActiveRow(lineNumber + 1);
		} catch (error) {}

		setLineNumber(lineNumber + 1);
	};

	const handleError = (type, line) => {
		if (type === 'syntax' || type === 'invalidInstruction' || type === 'noAddress' || type === 'invalidLabel')
			setError(errorsText[type] + line);
		else setError(errorsText[type]);
		return false;
	};

	const onSubmit = (values) => {
		setLineNumber(0);
		setRegistersAndFlags({ ...initialRegistersAndFlags });
		setInfoTable([]);
		if (!values.code) return;
		setError('');
		const { code } = values;
		const lines = code.split('\n');
		compiler(lines) ? setShowStep(true) : setShowStep(false);
	};

	const compiler = (lines) => {
		haltFlag = false;
		setLineNumber(0);
		//First compile phase
		let lineCounter = '0';
		const labels = {};
		const infoTableTemp = [];
		let label;
		if (lines[lines.length - 1] !== 'END') return handleError('expectedEND');
		for (let i = 0; i < lines.length; i++) {
			let directNumber = '';
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
			} else if (words[0] === 'DEC') directNumber = normalizeString(toInt16(parseInt(words[0])).toString(16), 4);
			else if (words[0] === 'HEX') directNumber = normalizeString(toInt16(parseInt(words[0], 16)).toString(16), 4);

			try {
				let result = directNumber ? directNumber : normalizeString(toInt16(labels[label].value).toString(16), 4);
				infoTableTemp.push({
					label: words[0][words[0].length - 1] === ',' ? label : null,
					address: lineCounter.toUpperCase(),
					instruction: words[0][words[0].length - 1] === ',' ? words.slice(1).join(' ') : lines[i],
					HEX: result
				});
			} catch (error) {
				infoTableTemp.push({
					label: words[0][words[0].length - 1] === ',' ? label : null,
					address: lineCounter.toUpperCase(),
					instruction: words[0][words[0].length - 1] === ',' ? words.slice(1).join(' ') : lines[i],
					HEX: null
				});
			}

			lineCounter = (parseInt(lineCounter, 16) + 1).toString(16).toUpperCase();
		}

		//Second compile phase
		for (let i = 0; i < infoTableTemp.length; i++) {
			if (infoTableTemp[i].instruction === 'END' || infoTableTemp[i].instruction.split(' ')[0] === 'ORG') continue;
			const fullInstruction = infoTableTemp[i].instruction.split(' ');
			const ins = infoTableTemp[i].instruction.split(' ')[0];
			if (
				!instructions['memory'][ins] &&
				!instructions['register'][ins] &&
				!instructions['IO'][ins] &&
				!infoTableTemp[i].label &&
				ins !== 'HEX' &&
				ins !== 'DEC'
			)
				return handleError('invalidInstruction', i + 1);

			if (instructions['register'][ins]) {
				if (fullInstruction[1]) return handleError('syntax', i + 1);
				infoTableTemp[i].HEX = instructions['register'][ins];
			} else if (instructions['IO'][ins]) {
				if (fullInstruction[1]) return handleError('syntax', i + 1);
				infoTableTemp[i].HEX = instructions['IO'][ins];
			} else if (ins === 'DEC')
				infoTableTemp[i].HEX = normalizeString(
					toInt16(parseInt(infoTableTemp[i].instruction.split(' ')[1])).toString(16),
					4
				);
			else if (ins === 'HEX') infoTableTemp[i].HEX = normalizeString(infoTableTemp[i].instruction.split(' ')[1], 4);
			else {
				if ((fullInstruction[2] === 'I' && fullInstruction[3]) || (fullInstruction[2] && fullInstruction[2] !== 'I')) {
					return handleError('syntax', i + 1);
				}
				const words = infoTableTemp[i].instruction.split(' ');
				if (!words[1]) return handleError('noAddress', i + 1);
				else if (!labels[words[1]]) return handleError('invalidLabel', i + 1);
				if (words[words.length - 1] === 'I')
					infoTableTemp[i].HEX = instructions['memory'][words[0]]['indirect'] + labels[words[1]].address;
				else infoTableTemp[i].HEX = instructions['memory'][words[0]]['direct'] + labels[words[1]].address;
			}
		}

		for (let i = 0; i < infoTableTemp.length; i++)
			if (!infoTableTemp[i].HEX)
				if (infoTableTemp[i].label) {
					const labelInstruntion = infoTableTemp[i].instruction.split(' ')[0];
					if (instructions['register'][labelInstruntion]) {
						infoTableTemp[i].HEX = instructions['register'][labelInstruntion];
					} else if (instructions['memory'][labelInstruntion]) {
						const temp = infoTableTemp[i].instruction.split(' ');
						if (!temp[1]) return handleError('noAddress', i + 1);
						else if (!labels[temp[1]]) return handleError('invalidLabel', i + 1);

						if (temp[temp.length - 1] === 'I')
							infoTableTemp[i].HEX = instructions['memory'][temp[0]]['indirect'] + labels[temp[1]].address;
						else infoTableTemp[i].HEX = instructions['memory'][temp[0]]['direct'] + labels[temp[1]].address;
					} else if (instructions['IO'][labelInstruntion]) infoTableTemp[i].HEX = instructions['IO'][labelInstruntion];
					else {
						for (let j = 0; j < infoTableTemp.length; j++)
							if (labelInstruntion === infoTableTemp[j].label && i !== j)
								infoTableTemp[i].HEX = normalizeString(infoTableTemp[j].address, 4);

						if (!infoTableTemp[i].HEX) {
							return handleError('invalidInstruction', i + 1);
						}
					}
				}

		for (let i = 0; i < infoTableTemp.length; i++)
			if (infoTableTemp[i].instruction === 'END' || infoTableTemp[i].instruction.split(' ')[0] === 'ORG') {
				infoTableTemp.splice(i, 1);
				i--;
			}

		for (let i = 0; i < infoTableTemp.length; i++) infoTableTemp[i].active = i === 0 ? true : false;

		setInfoTable([ ...infoTableTemp ]);
		setRegistersAndFlags({ ...registersAndFlags, PC: infoTableTemp[0].address });
		return true;
	};

	return (
		<div className="App">
			<CodeForm onSubmit={onSubmit} />
			<ComputerState
				handleStep={handleStep}
				registersAndFlags={registersAndFlags}
				showStep={showStep}
				error={error}
				onSubmit={onSubmit}
			/>
			<RAMTable infoTable={infoTable} />
		</div>
	);
};

export default App;

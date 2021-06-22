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

const createToInt = (size) => {
	if (size < 2) throw new Error('Minimum size is 2');
	else if (size > 64) throw new Error('Maximum size is 64');

	const maxValue = (1 << (size - 1)) - 1;
	const minValue = -maxValue - 1;
	return (value) => {
		if (value > maxValue || value < minValue) throw new Error(`Int${size} overflow`);

		if (value < 0) return (1 << size) + value;
		else return value;
	};
};

const initialRegistersAndFlags = {
	SC: '0',
	PC: '000',
	AR: '000',
	IR: '0000',
	DR: '0000',
	AC: '0000',
	TR: '0000',
	INPR: '00',
	I: '0',
	S: '1',
	E: '0',
	R: '0',
	IEN: '0',
	FGI: '0',
	FGO: '0'
};

const normalizeString = (str, num) => {
	while (str.length < num) str = '0' + str;
	return str.toUpperCase();
};

const baseChanger = (numStr, numberOfbits, currentBase, newBase) => {
	numStr = parseInt(numStr, currentBase);
	numStr = numStr.toString(newBase);
	numStr = normalizeString(numStr, numberOfbits);
	return numStr;
};

const complement = (num, normalNum) => {
	const temp = parseInt(num, 16);
	let b = temp.toString(2);
	b = normalizeString(b, 16);
	let result = '';
	for (let i = 0; i < b.length; i++) b[i] === '1' ? (result += '0') : (result += '1');
	result = parseInt(result, 2).toString(16).toUpperCase();
	result = normalizeString(result, normalNum);
	return result;
};

const circulate = (num1, num2, direction) => {
	const newNum = baseChanger(num1, 16, 16, 2);
	if (direction === 'right') {
		const result = num2 + newNum;
		return [ parseInt(result.slice(0, result.length - 1), 2).toString(16).toUpperCase(), result[result.length - 1] ];
	} else if (direction === 'left') {
		const result = newNum + num2;
		return [ parseInt(result.slice(1, result.length), 2).toString(16).toUpperCase(), result[0] ];
	}
};

const calculateValue = (str, normalNum) => {
	let result;
	if (
		str[0] === '8' ||
		str[0] === '9' ||
		str[0] === 'A' ||
		str[0] === 'B' ||
		str[0] === 'C' ||
		str[0] === 'D' ||
		str[0] === 'E' ||
		str[0] === 'F'
	) {
		str = parseInt(complement(str, normalNum), 16);
		str++;
		result = parseInt('-' + str.toString());
	} else {
		result = parseInt(str, 16);
	}
	return result;
};

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
			return infoTable.filter((row) => row.address === first.HEX.slice(1))[0];
		}
		return infoTable.filter((row) => row.address === ins)[0];
	};

	const and = (num1, num2) => {
		let result = '';
		for (let i = 0; i < 16; i++) result += num1[i] !== num2[i] ? '0' : num1[i] === '1' ? '1' : '0';

		return normalizeString(parseInt(result, 2).toString(16), 4);
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
		let num1, num2, row, infoTableTemp, newAR;
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
				newAR = registersAndFlags.PC;
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
				setLineNumber(index);
				setRegistersAndFlags({
					...registersAndFlags,
					PC: infoTableTemp[index].address,
					DR: findRow(ins.slice(1), ins[0] === '4' ? false : true).HEX,
					I: ins[0] === '4' ? '0' : '1',
					AR:
						ins[0] === '4'
							? infoTable[lineNumber].HEX.slice(1)
							: findRow(ins.slice(1), ins[0] === '4' ? false : true).HEX.slice(1),
					IR: infoTable[lineNumber].HEX
				});
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
				setRegistersAndFlags({ ...registersAndFlags, S: '0', IR: infoTable[lineNumber].HEX, AR: '001' });
				setError('The program has ended');
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
		setLineNumber(0);
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
			try {
				let number = toInt16(labels[label].value).toString(16).toUpperCase();
				while (number.length < 4) {
					number = '0' + number;
				}

				infoTableTemp.push({
					label: words[0][words[0].length - 1] === ',' ? label : null,
					address: lineCounter.toUpperCase(),
					instruction: words[0][words[0].length - 1] === ',' ? words.slice(1).join(' ') : lines[i],
					HEX: number
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
			if (
				infoTableTemp[i].instruction === 'END' ||
				infoTableTemp[i].instruction.split(' ')[0] === 'ORG' ||
				infoTableTemp[i].label
			)
				continue;
			const ins = infoTableTemp[i].instruction.split(' ')[0];
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
						if (infoTableTemp[i].instruction.split(' ')[1] === 'I')
							infoTableTemp[i].HEX = instructions['memory'][labelInstruntion].indirect;
						else {
							infoTableTemp[i].HEX = instructions['memory'][labelInstruntion].dorect;
						}
					} else if (instructions['IO'][labelInstruntion]) {
						infoTableTemp[i].HEX = instructions['IO'][labelInstruntion];
					} else {
						for (let j = 0; j < infoTableTemp.length; j++)
							if (labelInstruntion === infoTableTemp[j].label && i !== j)
								infoTableTemp[i].HEX = normalizeString(infoTableTemp[j].address, 4);
						if (!infoTableTemp[i].HEX) return handleError('invalidInstruction', i + 1);
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

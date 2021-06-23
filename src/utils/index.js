export const errorsText = {
	syntax: 'Compiler: Syntax error in line ',
	expectedEND: 'Compiler: Expected END pseudo instruction',
	invalidInstruction: 'Compiler: Invalid instruction in line ',
	noAddress: 'Compiler: No address was given in line ',
	invalidLabel: 'Compiler: Invalid label in line '
};

export const instructions = {
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

export const createToInt = (size) => {
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

export const initialRegistersAndFlags = {
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

export const normalizeString = (str, num) => {
	while (str.length < num) str = '0' + str;
	return str.toUpperCase();
};

export const baseChanger = (numStr, numberOfbits, currentBase, newBase) => {
	numStr = parseInt(numStr, currentBase);
	numStr = numStr.toString(newBase);
	numStr = normalizeString(numStr, numberOfbits);
	return numStr;
};

export const complement = (num, normalNum) => {
	const temp = parseInt(num, 16);
	let b = temp.toString(2);
	b = normalizeString(b, 16);
	let result = '';
	for (let i = 0; i < b.length; i++) b[i] === '1' ? (result += '0') : (result += '1');
	result = parseInt(result, 2).toString(16).toUpperCase();
	result = normalizeString(result, normalNum);
	return result;
};

export const circulate = (num1, num2, direction) => {
	const newNum = baseChanger(num1, 16, 16, 2);
	if (direction === 'right') {
		const result = num2 + newNum;
		return [ parseInt(result.slice(0, result.length - 1), 2).toString(16).toUpperCase(), result[result.length - 1] ];
	} else if (direction === 'left') {
		const result = newNum + num2;
		return [ parseInt(result.slice(1, result.length), 2).toString(16).toUpperCase(), result[0] ];
	}
};

export const calculateValue = (str, normalNum) => {
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

export const and = (num1, num2) => {
	let result = '';
	for (let i = 0; i < 16; i++) result += num1[i] !== num2[i] ? '0' : num1[i] === '1' ? '1' : '0';
	return normalizeString(parseInt(result, 2).toString(16), 4);
};

import { render } from '@testing-library/react';
import React from 'react';
import { Table } from 'reactstrap';

const RAMTable = ({ code, infoTable }) => {
	const renderTable = () => {
		if (code.length) {
			return (
				<div style={{ overflowY: 'scroll', width: '30%', alignSelf: 'flex-start', marginTop: '50px', height: '90vh' }}>
					<Table dark>
						<thead>
							<tr>
								<th>Label</th>
								<th>Address</th>
								<th>Instruction</th>
								<th>Hex</th>
							</tr>
						</thead>
						<tbody>
							{infoTable.map((t, index) => {
								if (t.instruction !== 'END' && t.instruction.split(' ')[0] !== 'ORG')
									return (
										<tr key={index}>
											<td>{t.label}</td>
											<td>{t.address}</td>
											<td>{t.instruction}</td>
											<td>{t.HEX}</td>
										</tr>
									);
							})}
						</tbody>
					</Table>
				</div>
			);
		} else {
			return null;
		}
	};
	return <React.Fragment>{renderTable()}</React.Fragment>;
};

export default RAMTable;

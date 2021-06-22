import React, { useEffect } from 'react';
import { Table } from 'reactstrap';
import { Link, Element } from 'react-scroll';

const RAMTable = ({ infoTable }) => {
	useEffect(() => {
		try {
			document.querySelector('#link-scroll').click();
		} catch (error) {}
	});

	const getCodeRow = (address) => {
		for (let i = 0; i < infoTable.length; i++) if (infoTable[i].address === address) return infoTable[i];
	};

	const renderTable = () => {
		if (infoTable.length) {
			const rows = [];
			for (let i = 0; i < 4096; i++) {
				const codeRow = getCodeRow(i.toString(16).toUpperCase());
				if (codeRow) rows.push(codeRow);
				else rows.push({ label: null, address: i.toString(16).toUpperCase(), instruction: '', HEX: '0000' });
			}
			let flag = true;
			return (
				<React.Fragment>
					<div>
						<Link
							style={{ display: 'none' }}
							id="link-scroll"
							containerId="my-container"
							to="my-scroll"
							smooth={true}
							duration={500}
						/>
					</div>
					<Element
						id="my-container"
						style={{
							overflowY: 'scroll',
							width: '30%',
							alignSelf: 'flex-start',
							marginTop: '50px',
							height: '90vh'
						}}
					>
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
								{rows.map((t, index) => {
									if (t.instruction && flag) {
										flag = false;
										return (
											<tr className={t.active ? 'table-info' : null} name="my-scroll" key={index}>
												<td>{t.label}</td>
												<td>{t.address}</td>
												<td>{t.instruction}</td>
												<td>{t.HEX}</td>
											</tr>
										);
									}
									return (
										<tr className={t.active ? 'table-info' : null} key={index}>
											<td>{t.label}</td>
											<td>{t.address}</td>
											<td>{t.instruction}</td>
											<td>{t.HEX}</td>
										</tr>
									);
								})}
							</tbody>
						</Table>
					</Element>
				</React.Fragment>
			);
		} else {
			return null;
		}
	};
	return <React.Fragment>{renderTable()}</React.Fragment>;
};

export default RAMTable;

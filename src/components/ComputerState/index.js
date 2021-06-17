import React from 'react';
import { Form, FormGroup, Label, Input } from 'reactstrap';
import Button from '@material-ui/core/Button';

const ComputerState = ({ onSubmit, error, showStep, registersAndFlags, handleStep }) => {
	const { SC, AR, IR, DR, AC, TR, INPR, OUTR, I, S, E, R, IEN, FGI, FGO } = registersAndFlags;
	return (
		<div className="p-4" style={{ width: '30%', backgroundColor: '#b3e5fc', borderRadius: '10%' }}>
			<Form>
				<div className="row">
					<div className="col col-lg-2 mt-4">
						<FormGroup>
							<Label>SC:</Label>
							<Input defaultValue={SC} defaultValue="0" disabled />
						</FormGroup>
					</div>
					<div className="col col-lg-4 mt-4">
						<FormGroup>
							<Label>AR:</Label>
							<Input defaultValue={AR} disabled />
						</FormGroup>
					</div>
					<div className="col col-lg-4 mt-4">
						<FormGroup>
							<Label>IR:</Label>
							<Input defaultValue={IR} disabled />
						</FormGroup>
					</div>
					<div className="col col-lg-4 mt-4">
						<FormGroup>
							<Label>DR:</Label>
							<Input defaultValue={DR} disabled />
						</FormGroup>
					</div>
					<div className="col  col-lg-4 mt-4">
						<FormGroup>
							<Label>AC:</Label>
							<Input defaultValue={AC} disabled />
						</FormGroup>
					</div>
					<div className="col col-lg-4 mt-4">
						<FormGroup>
							<Label>TR:</Label>
							<Input defaultValue={TR} disabled />
						</FormGroup>
					</div>
					<div className="col col-lg-3 mt-4">
						<FormGroup>
							<Label>INPR:</Label>
							<Input defaultValue={INPR} disabled />
						</FormGroup>
					</div>
					<div className="col col-lg-3 mt-4">
						<FormGroup>
							<Label>OUTR:</Label>
							<Input defaultValue={OUTR} disabled />
						</FormGroup>
					</div>
					<div className="col col-lg-5" />
					<div className="col col-lg-2 mt-4">
						<FormGroup>
							<Label>I:</Label>
							<Input defaultValue={I} disabled />
						</FormGroup>
					</div>
					<div className="col col-lg-2 mt-4">
						<FormGroup>
							<Label>S:</Label>
							<Input defaultValue={S} disabled />
						</FormGroup>
					</div>
					<div className="col col-lg-2 mt-4">
						<FormGroup>
							<Label>E:</Label>
							<Input defaultValue={E} disabled />
						</FormGroup>
					</div>
					<div className="col col-lg-2 mt-4">
						<FormGroup>
							<Label>R:</Label>
							<Input defaultValue={R} disabled />
						</FormGroup>
					</div>
					<div className="col col-lg-4" />
					<div className="col col-lg-2 mt-4">
						<FormGroup>
							<Label>IEN:</Label>
							<Input defaultValue={IEN} disabled />
						</FormGroup>
					</div>
					<div className="col col-lg-2 mt-4">
						<FormGroup>
							<Label>FGI:</Label>
							<Input defaultValue={FGI} disabled />
						</FormGroup>
					</div>
					<div className="col col-lg-2 my-4">
						<FormGroup>
							<Label>FGO:</Label>
							<Input defaultValue={FGO} defaultValue="0" disabled />
						</FormGroup>
					</div>
				</div>
				<Button form="my-form" type="submit" onClick={onSubmit} className="mt-3" variant="contained" color="secondary">
					Compile & Run
				</Button>
				{showStep && (
					<Button
						onClick={handleStep}
						form="my-form"
						style={{ marginLeft: '5%' }}
						className="mt-3"
						variant="contained"
						color="primary"
					>
						Step
					</Button>
				)}
				{error ? <p className="text-danger mt-3">{error}</p> : null}
			</Form>
		</div>
	);
};

export default ComputerState;

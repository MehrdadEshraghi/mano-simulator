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
							<Input value={SC} disabled />
						</FormGroup>
					</div>
					<div className="col col-lg-4 mt-4">
						<FormGroup>
							<Label>AR:</Label>
							<Input value={AR} disabled />
						</FormGroup>
					</div>
					<div className="col col-lg-4 mt-4">
						<FormGroup>
							<Label>IR:</Label>
							<Input value={IR} disabled />
						</FormGroup>
					</div>
					<div className="col col-lg-4 mt-4">
						<FormGroup>
							<Label>DR:</Label>
							<Input value={DR} disabled />
						</FormGroup>
					</div>
					<div className="col  col-lg-4 mt-4">
						<FormGroup>
							<Label>AC:</Label>
							<Input value={AC} disabled />
						</FormGroup>
					</div>
					<div className="col col-lg-4 mt-4">
						<FormGroup>
							<Label>TR:</Label>
							<Input value={TR} disabled />
						</FormGroup>
					</div>
					<div className="col col-lg-3 mt-4">
						<FormGroup>
							<Label>INPR:</Label>
							<Input value={INPR} disabled />
						</FormGroup>
					</div>
					<div className="col col-lg-3 mt-4">
						<FormGroup>
							<Label>OUTR:</Label>
							<Input value={OUTR} disabled />
						</FormGroup>
					</div>
					<div className="col col-lg-5" />
					<div className="col col-lg-2 mt-4">
						<FormGroup>
							<Label>I:</Label>
							<Input value={I} disabled />
						</FormGroup>
					</div>
					<div className="col col-lg-2 mt-4">
						<FormGroup>
							<Label>S:</Label>
							<Input value={S} disabled />
						</FormGroup>
					</div>
					<div className="col col-lg-2 mt-4">
						<FormGroup>
							<Label>E:</Label>
							<Input value={E} disabled />
						</FormGroup>
					</div>
					<div className="col col-lg-2 mt-4">
						<FormGroup>
							<Label>R:</Label>
							<Input value={R} disabled />
						</FormGroup>
					</div>
					<div className="col col-lg-4" />
					<div className="col col-lg-2 mt-4">
						<FormGroup>
							<Label>IEN:</Label>
							<Input value={IEN} disabled />
						</FormGroup>
					</div>
					<div className="col col-lg-2 mt-4">
						<FormGroup>
							<Label>FGI:</Label>
							<Input value={FGI} disabled />
						</FormGroup>
					</div>
					<div className="col col-lg-2 my-4">
						<FormGroup>
							<Label>FGO:</Label>
							<Input value={FGO} disabled />
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

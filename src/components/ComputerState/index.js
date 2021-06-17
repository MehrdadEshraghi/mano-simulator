import React from 'react';
import { Form, FormGroup, Label, Input } from 'reactstrap';
import Button from '@material-ui/core/Button';

const ComputerState = ({ onSubmit, error }) => {
	return (
		<div className="p-4" style={{ width: '30%', backgroundColor: '#b3e5fc', borderRadius: '10%' }}>
			<Form>
				<div className="row">
					<div className="col col-3" />
					<div className="col col-2 mt-4">
						<FormGroup>
							<Label>SC:</Label>
							<Input disabled />
						</FormGroup>
					</div>
					<div className="col col-2 mt-4">
						<FormGroup>
							<Label>AR:</Label>
							<Input disabled />
						</FormGroup>
					</div>
					<div className="col col-2 mt-4">
						<FormGroup>
							<Label>IR:</Label>
							<Input disabled />
						</FormGroup>
					</div>
					<div className="col col-3" />
					<div className="col col-3" />
					<div className="col col-2 mt-4">
						<FormGroup>
							<Label>DR:</Label>
							<Input disabled />
						</FormGroup>
					</div>
					<div className="col col-2 mt-4">
						<FormGroup>
							<Label>AC:</Label>
							<Input disabled />
						</FormGroup>
					</div>
					<div className="col col-2 mt-4">
						<FormGroup>
							<Label>TR:</Label>
							<Input disabled />
						</FormGroup>
					</div>
					<div className="col col-3" />
					<div className="col col-4" />
					<div className="col col-2 mt-4">
						<FormGroup>
							<Label>INPR:</Label>
							<Input disabled />
						</FormGroup>
					</div>
					<div className="col col-2 mt-4">
						<FormGroup>
							<Label>OUTR:</Label>
							<Input disabled />
						</FormGroup>
					</div>
					<div className="col col-4" />
					<div className="col col-4" />
					<div className="col col-1 mt-4">
						<FormGroup>
							<Label>I:</Label>
							<Input disabled />
						</FormGroup>
					</div>
					<div className="col col-1 mt-4">
						<FormGroup>
							<Label>S:</Label>
							<Input disabled />
						</FormGroup>
					</div>
					<div className="col col-1 mt-4">
						<FormGroup>
							<Label>E:</Label>
							<Input disabled />
						</FormGroup>
					</div>
					<div className="col col-1 mt-4">
						<FormGroup>
							<Label>R:</Label>
							<Input disabled />
						</FormGroup>
					</div>
					<div className="col col-4" />
					<div className="col col-4" />
					<div className="col col-1 mt-4">
						<FormGroup>
							<Label>IEN:</Label>
							<Input disabled />
						</FormGroup>
					</div>
					<div className="col col-1 mt-4">
						<FormGroup>
							<Label>FGI:</Label>
							<Input disabled />
						</FormGroup>
					</div>
					<div className="col col-1 my-4">
						<FormGroup>
							<Label>FGO:</Label>
							<Input disabled />
						</FormGroup>
					</div>
				</div>
				<Button form="my-form" type="submit" onClick={onSubmit} className="mt-3" variant="contained" color="secondary">
					Run
				</Button>
				{error ? <p className="text-danger mt-3">{error}</p> : null}
			</Form>
		</div>
	);
};

export default ComputerState;

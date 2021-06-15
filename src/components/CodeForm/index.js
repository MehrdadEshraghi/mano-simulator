import React from 'react';
import { Form, Field } from 'react-final-form';
import { Form as BootstrapForm, FormGroup, Input } from 'reactstrap';
import Button from '@material-ui/core/Button';

const onSubmit = (values) => {
	console.log(values);
};

function CodeForm() {
	return (
		<div style={{ width: '15%' }}>
			<Form
				onSubmit={onSubmit}
				render={({ handleSubmit }) => (
					<BootstrapForm onSubmit={handleSubmit}>
						<Field
							name="code"
							render={({ input, meta }) => {
								return (
									<FormGroup>
										<Input style={{ height: '90vh' }} {...input} type="textarea" placeholder="Your Code Here!" />
										{meta.touched && meta.error && <span>{meta.error}</span>}
									</FormGroup>
								);
							}}
						/>
						<Button onClick={handleSubmit} className="mt-3" variant="contained" color="secondary">
							Run
						</Button>
					</BootstrapForm>
				)}
			/>
		</div>
	);
}

export default CodeForm;

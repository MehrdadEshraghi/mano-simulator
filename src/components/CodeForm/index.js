import React from 'react';
import { Form, Field } from 'react-final-form';
import { Form as BootstrapForm, FormGroup, Input } from 'reactstrap';

const onSubmit = (values) => {
	console.log(values);
};

function CodeForm() {
	return (
		<div>
			<Form
				onSubmit={onSubmit}
				render={({ handleSubmit }) => (
					<BootstrapForm onSubmit={handleSubmit}>
						<Field
							name="code"
							render={({ input, meta }) => {
								return (
									<FormGroup>
										<Input {...input} type="textarea" />
										{meta.touched && meta.error && <span>{meta.error}</span>}
									</FormGroup>
								);
							}}
						/>
						<button type="submit">Submit</button>
					</BootstrapForm>
				)}
			/>
		</div>
	);
}

export default CodeForm;

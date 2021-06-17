import React from 'react';
import { Form, Field } from 'react-final-form';
import { Form as BootstrapForm, FormGroup, Input } from 'reactstrap';

function CodeForm({ onSubmit }) {
	return (
		<div style={{ width: '15%' }}>
			<Form
				onSubmit={onSubmit}
				render={({ handleSubmit }) => (
					<BootstrapForm id="my-form" onSubmit={handleSubmit}>
						<Field
							name="code"
							render={({ input }) => {
								return (
									<FormGroup>
										<Input
											autoFocus
											style={{ height: '90vh' }}
											{...input}
											type="textarea"
											placeholder="Your Code Here!"
										/>
									</FormGroup>
								);
							}}
						/>
					</BootstrapForm>
				)}
			/>
		</div>
	);
}

export default CodeForm;

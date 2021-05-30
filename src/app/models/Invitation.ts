export interface Invitation {
	id: number;
	name: string;
	surname: string;
	description: string;
	email: string;
	password: string;
	photo_path: string;
	photo_name: string;
	id_sender: number;
	id_receiver: number;
	unreaded: number;
}
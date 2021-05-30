export interface Activity {
	id: number;
	book_id: number;
	book_title: string;
	book_author: string;
	book_photo_path: string;
	book_photo_name: string;
	owner_id: number;
	owner_name: string;
	owner_surname: string;
	owner_photo_path: string;
	owner_photo_name: string;
	type_of_activity_id: number;
	type_of_activity_label: string;
	type_of_activity_icon_path: string;
	type_of_activity_icon_name: string;
	description: string;
	date;
	visibility: string;
	grade: number;
}
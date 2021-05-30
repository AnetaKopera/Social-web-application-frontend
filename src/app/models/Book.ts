export interface Book {
	id: number;
	title: string;
	author_name: string;
	author_surname: string;
	description: string;
	publication_date: Date;
	photo_path: string;
	photo_name: string;
	activities: number;
	reactions: number;
	score: number;
}
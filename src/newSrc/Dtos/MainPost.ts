export class MainPostResponse {
    id: string;
    title: string;
    imageLink: string;
    postLink: string;

    constructor(id: string, title: string, imageLink: string, postLink: string) {
        this.id = id;
        this.title = title;
        this.imageLink = imageLink;
        this.postLink = postLink;
    }
}
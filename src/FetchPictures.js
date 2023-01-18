import axios from 'axios';

export class FetchPictures {
    static BASE_URL = 'https://pixabay.com/api/';

    constructor() {
        this.page = 1;
        this.q = null;
    }

    fetchPhotosByQuery(q) {
        const searchParams = {
            params: {
                key: '32926626-9f8218f21c9ddc7b36f942801',
                q: this.q,
                page: this.page,
                per_page: 40,
                orientation: 'horizontal',
                image_type: 'photo',
                safesearch: true,
            },
        };

        return axios.get(`${FetchPictures.BASE_URL}`, searchParams);
    }
}
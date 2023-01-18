import '../src/sass/form.css';
import { FetchPictures } from './fetchPictures';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import Notiflix from 'notiflix';

const searchPictures = document.querySelector('#search-form');
const searchGallery = document.querySelector('.gallery');
const searchBtnEl = document.querySelector('.search-btn');
const guard = document.querySelector('.js-guard');
const options = {
    root: null,
    rootMargin: '300px',
    threshold: 0,
};

let gallery = new SimpleLightbox('.gallery a', {
    captionsData: 'alt',
    captionDelay: 250,
});

let observer = new IntersectionObserver(onPagination, options);

const fetchPictures = new FetchPictures();

const formSubmit = async event => {
    event.preventDefault();

    searchBtnEl.disabled = true;
    searchBtnEl.classList.add('disabled');

    fetchPictures.q = event.target.elements.searchQuery.value;
    fetchPictures.page = 1;

    try {
        const { data } = await fetchPictures.fetchPhotosByQuery();

        if (data.hits.length === 0) {
            Notiflix.Notify.failure(
                'Sorry, there are no images matching your search query. Please try again.'
            );
            event.target.reset();
            searchBtnEl.disabled = false;
            searchBtnEl.classList.remove('disabled');
            searchGallery.innerHTML = '';

            return;
        }

        Notiflix.Notify.success(`Hooray! We found ${data.totalHits} images.`);
        searchGallery.innerHTML = createGalleryCards(data.hits);
        gallery.refresh();
        observer.observe(guard);
    } catch (err) {
        console.log(err);
    }
    searchBtnEl.disabled = false;
    searchBtnEl.classList.remove('disabled');
};

function createGalleryCards(cardInfo) {
    const galleryCardsArr = cardInfo.map(el => {
        return `
  <div class="photo-card">
  <a href="${el.largeImageURL}"><img src="${el.webformatURL}" alt="${el.tags}" loading="lazy" /></a>
  <div class="info">
    <p class="info-item">
      <b>Likes:</b> ${el.likes}
    </p>
    <p class="info-item">
      <b>Views:</b> ${el.views}
    </p>
    <p class="info-item">
      <b>Comments:</b> ${el.comments}
    </p>
    <p class="info-item">
      <b>Downloads:</b> ${el.downloads}
    </p>
  </div>
</div>
        `;
    });

    return galleryCardsArr.join('');
}

function onPagination(entries, observer) {
    entries.forEach(async entry => {
        if (entry.isIntersecting) {
            fetchPictures.page += 1;
            try {
                const { data } = await fetchPictures.fetchPhotosByQuery();

                searchGallery.insertAdjacentHTML(
                    'beforeend',
                    createGalleryCards(data.hits)
                );
                gallery.refresh();

                const { height: cardHeight } = document
                    .querySelector('.gallery')
                    .firstElementChild.getBoundingClientRect();

                window.scrollBy({
                    top: cardHeight * 2,
                    behavior: 'smooth',
                });

                if (data.totalHits === data.total) {
                    Notiflix.Notify.failure(
                        "We're sorry, but you've reached the end of search results."
                    );
                }
            } catch (err) {
                console.log(err);
            }
        }
    });
}

gallery.on('show.simplelightbox', function () { });

searchPictures.addEventListener('submit', formSubmit);
// f
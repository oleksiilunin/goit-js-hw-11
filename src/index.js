import Notiflix from 'notiflix';
import axios from 'axios';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const formEl = document.querySelector('#search-form');
const buttonEl = document.querySelector('.js-search-button');
const galleryEl = document.querySelector('.gallery');

const BASE_URL = 'https://pixabay.com/api/';
const API_KEY = '36088213-4b97604b7362cbb60f40d0588';

const lightbox = new SimpleLightbox('.photo-card img', {
  sourceAttr: 'data-src',
});

formEl.addEventListener('submit', onSubmit);

function onSubmit(evt) {
  evt.preventDefault();
  galleryEl.innerHTML = '';

  const formData = new FormData(formEl);

  const queryText = formData.get('searchQuery');

  if (!queryText) {
    return Notiflix.Notify.info('Enter a search query');
  }
  searchPhotos(queryText);
}

async function searchPhotos(query, page = 1) {
  try {
    const resp = await axios.get(`${BASE_URL}`, {
      params: {
        key: API_KEY,
        q: query,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: true,
        page: page,
        per_page: 40,
      },
    });
    console.dir(resp);

    const photosArr = resp.data.hits;

    if (!photosArr.length) {
      Notiflix.Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
    }

    galleryEl.innerHTML = markupGallery(photosArr);
    lightbox.refresh();
  } catch (error) {
    console.log(error);
    Notiflix.Notify.failure('Oops. Something has gone wrong');
  }
}

function markupGallery(photosArr) {
  const markup = photosArr
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) =>
        `<div class="photo-card">
  <img src="${webformatURL}" alt="${tags}" data-src="${largeImageURL}" loading="lazy" width=200 />
  <div class="info">
    <p class="info-item">
      <b>Likes</b><br>${likes}
    </p>
    <p class="info-item">
      <b>Views</b><br>${views}
    </p>
    <p class="info-item">
      <b>Comments</b><br>${comments}
    </p>
    <p class="info-item">
      <b>Downloads</b><br>${downloads}
    </p>
  </div>
</div>`
    )
    .join('');
  return markup;
}

import Notiflix from 'notiflix';
import axios from 'axios';
import './css/styles.css';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const formEl = document.querySelector('#search-form');
const buttonEl = document.querySelector('.js-search-button');
const buttonPagination = document.querySelector('.js-pagination');
const galleryEl = document.querySelector('.js-gallery');
let per_page = 40;
let page = 1;
let query = '';

const BASE_URL = 'https://pixabay.com/api/';
const API_KEY = '36088213-4b97604b7362cbb60f40d0588';

const lightbox = new SimpleLightbox('.photo-card img', {
  sourceAttr: 'data-src',
});

formEl.addEventListener('change', onInput);
formEl.addEventListener('submit', onSubmit);
buttonPagination.addEventListener('click', onClickPagination);

buttonPagination.style.display = 'none';

function onInput(evt) {
  query = evt.target.value.trim();
  return query;
}

function onSubmit(evt) {
  evt.preventDefault();
  galleryEl.innerHTML = '';

  if (!query) {
    return Notiflix.Notify.info('Enter a search query');
  }

  createGallery();
}

async function createGallery() {
  try {
    const dataImages = await fetchDataImages(query, page);
    const imagesArr = dataImages.hits;
    const totalPages = dataImages.totalHits / per_page;

    if (!imagesArr.length) {
      return Notiflix.Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
    }
    if (dataImages.totalHits <= per_page) {
      buttonPagination.style.display = 'none';
    }

    if (dataImages.totalHits > per_page) {
      buttonPagination.style.display = 'block';
    }

    markupGallery(imagesArr);
    Notiflix.Notify.success(`Hooray! We found ${dataImages.totalHits} images.`);
    lightbox.refresh();
  } catch (error) {
    console.error(error);
  }
}

async function fetchDataImages(query, page) {
  try {
    const resp = await axios.get(`${BASE_URL}`, {
      params: {
        key: API_KEY,
        q: query,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: true,
        page: page,
        per_page: per_page,
      },
    });
    const dataImages = resp.data;
    console.log(dataImages);
    return dataImages;
  } catch (error) {
    console.error(error);
    Notiflix.Notify.failure('Oops. Something has gone wrong');
  }
}

function markupGallery(imagesArr) {
  const markup = imagesArr
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
  <div class="img-thumb">
	<img src="${webformatURL}" alt="${tags}" data-src="${largeImageURL}" loading="lazy" width=200 />
	</div>
  <div class="info">
    <p class="info-item">
      <b>Likes</b>${likes}
    </p>
    <p class="info-item">
      <b>Views</b>${views}
    </p>
    <p class="info-item">
      <b>Comments</b>${comments}
    </p>
    <p class="info-item">
      <b>Downloads</b>${downloads}
    </p>
  </div>
</div>`
    )
    .join('');
  galleryEl.insertAdjacentHTML('beforeend', markup);
  lightbox.refresh();
}

async function onClickPagination() {
  page += 1;
  try {
    const dataImages = await fetchDataImages(query, page);
    const imagesArr = dataImages.hits;
    const totalPages = dataImages.totalHits / per_page;

    if (page > totalPages) {
      Notiflix.Notify.failure(
        "We're sorry, but you've reached the end of search results."
      );
      buttonPagination.style.display = 'none';
    }

    markupGallery(imagesArr);
  } catch (error) {
    console.error(error);
  }
}

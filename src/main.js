import './css/styles.css';
import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';
import { getImagesByQuery } from './js/pixabay-api.js';
import {
  createGallery,
  clearGallery,
  showLoader,
  hideLoader,
  showLoadMoreButton,
  hideLoadMoreButton,
} from './js/render-functions.js';

const form = document.querySelector('.form');
const gallery = document.querySelector('.gallery');


let query = '';
let page = 1;
let totalHits = 0;

form.addEventListener('submit', onSearch);
loadMoreBtn.addEventListener('click', onLoadMore);

async function onSearch(e) {
  e.preventDefault();
  query = e.target.elements.searchQuery.value.trim();
  page = 1;
  clearGallery();
  hideLoadMoreButton();

  if (!query) {
    iziToast.warning({
      title: 'Oops!',
      message: 'Please enter a search term!',
    });
    return;
  }

  try {
    showLoader();
    const data = await getImagesByQuery(query, page);
    totalHits = data.totalHits;

    if (data.hits.length === 0) {
      iziToast.info({
        title: 'No results',
        message: 'Try a different keyword.',
      });
      return;
    }

    createGallery(data.hits);

    if (totalHits > 15) {
      showLoadMoreButton();
    }
  } catch (error) {
    iziToast.error({ title: 'Error', message: 'Failed to fetch images.' });
  } finally {
    hideLoader();
  }
}

async function onLoadMore() {
  page += 1;
  hideLoadMoreButton();
  showLoader();

  try {
    const data = await getImagesByQuery(query, page);
    createGallery(data.hits);
    smoothScroll();

    const loadedImages = document.querySelectorAll('.gallery-item').length;
    if (loadedImages >= totalHits) {
      hideLoadMoreButton();
      iziToast.info({
        message: "We're sorry, but you've reached the end of search results.",
      });
    } else {
      showLoadMoreButton();
    }
  } catch (error) {
    iziToast.error({ message: 'Something went wrong.' });
  } finally {
    hideLoader();
  }
}

function smoothScroll() {
  const { height: cardHeight } =
    document.querySelector('.gallery').firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}

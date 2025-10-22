import { getImagesByQuery } from './js/pixabay-api.js';
import {
  createGallery,
  clearGallery,
  showLoader,
  hideLoader,
  showLoadMoreButton,
  hideLoadMoreButton,
} from './js/render-functions.js';
import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';

let query = '';
let page = 1;
let totalHits = 0;

const form = document.querySelector('.search-form'); // ✅ виправлено
const loadMoreBtn = document.querySelector('.load-more');

form.addEventListener('submit', onSearch);
loadMoreBtn.addEventListener('click', onLoadMore);

async function onSearch(e) {
  e.preventDefault();
  query = e.target.searchQuery.value.trim();
  page = 1;
  clearGallery();
  hideLoadMoreButton();

  if (!query) {
    iziToast.warning({
      title: 'Oops',
      message: 'Please enter a search term!',
    });
    return;
  }

  showLoader();

  try {
    const data = await getImagesByQuery(query, page);
    totalHits = data.totalHits;

    if (data.hits.length === 0) {
      iziToast.info({
        title: 'No results',
        message: 'Nothing found for your query.',
      });
      return;
    }

    createGallery(data.hits);

    // 🔧 Перевірка кількості сторінок одразу
    if (page * 15 < totalHits) {
      showLoadMoreButton();
    } else {
      hideLoadMoreButton();
      iziToast.info({
        title: 'End of results',
        message: "We're sorry, but you've reached the end of search results.",
      });
    }
  } catch (error) {
    iziToast.error({
      title: 'Error',
      message: 'Something went wrong, try again later.',
    });
  } finally {
    hideLoader();
  }
}

async function onLoadMore() {
  page++;
  showLoader();

  try {
    const data = await getImagesByQuery(query, page);
    createGallery(data.hits);

    const totalLoaded = page * 15;

    if (totalLoaded >= totalHits) {
      hideLoadMoreButton();
      iziToast.info({
        title: 'End of results',
        message: "We're sorry, but you've reached the end of search results.",
      });
    }

    const { height: cardHeight } = document
      .querySelector('.gallery')
      .firstElementChild.getBoundingClientRect();

    window.scrollBy({
      top: cardHeight * 2,
      behavior: 'smooth',
    });
  } catch (error) {
    iziToast.error({
      title: 'Error',
      message: 'Something went wrong, try again later.',
    });
  } finally {
    hideLoader();
  }
}

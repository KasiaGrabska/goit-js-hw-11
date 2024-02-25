import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const fetchImagesBtn = document.querySelector('#load-more-btn');
const gallery = document.querySelector('.gallery');
const form = document.querySelector('.search-form');
const loader = document.querySelector('.loader');
const input = document.querySelector('.search-input');
let lightbox;

loader.style.display = 'none';
fetchImagesBtn.style.display = 'none';

let currentPage = 1;
const perPage = 40;

form.addEventListener('submit', async event => {
  event.preventDefault();
  const inputValue = input.value.trim();
  if (!inputValue) return;

  try {
    loader.style.display = 'block';
    const data = await getImages(inputValue, currentPage);
    loader.style.display = 'none';

    if (!data.hits.length) {
      Notiflix.Notify.failure('No images found for this search term');
      gallery.innerHTML = '';
      return;
    }

    Notiflix.Notify.success(
      `Found ${data.totalHits} images for "${inputValue}"`
    );
    gallery.innerHTML = renderImages(data.hits);

    if (!lightbox) {
      lightbox = new SimpleLightbox('.gallery a', {
        captions: true,
        captionsData: 'alt',
        captionDelay: 250,
      });
    }

    fetchImagesBtn.style.display = 'block';
    scrollToTop();
  } catch (error) {
    console.error(error);
    loader.style.display = 'none';
    Notiflix.Notify.failure('Failed to fetch images');
  }
});

async function getImages(name, page) {
  const key = '42409060-380322e351fb08456a6a2d09f';
  const searchParams = new URLSearchParams({
    key: key,
    q: name,
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: true,
    per_page: perPage,
    page: page,
  });

  const response = await fetch(`https://pixabay.com/api/?${searchParams}`);
  if (!response.ok) {
    throw new Error(response.statusText);
  }
  return response.json();
}

fetchImagesBtn.addEventListener('click', async () => {
  try {
    currentPage++;
    loader.style.display = 'block';

    const data = await getImages(input.value.trim(), currentPage);
    loader.style.display = 'none';

    if (!data.hits.length) {
      Notiflix.Notify.info('No more images to load');
      fetchImagesBtn.style.display = 'none';
      return;
    }

    gallery.innerHTML += renderImages(data.hits);

    if (lightbox) {
      lightbox.refresh();
    }
  } catch (error) {
    console.error(error);
    loader.style.display = 'none';
    Notiflix.Notify.failure('Failed to load more images');
  }
});

function renderImages(images) {
  return images
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => {
        return `
      <li class="gallery-item">
        <a class="gallery-link" href="${largeImageURL}">
          <img class="gallery-image" src="${webformatURL}" alt="${tags}" width="298" />
        </a>
        <div class="container-stats">
          <div class="block">
            <h2 class="title">Likes</h2>
            <p class="amount">${likes}</p>
          </div>
          <div class="block">
            <h2 class="title">Views</h2>
            <p class="amount">${views}</p>
          </div>
          <div class="block">
            <h2 class="title">Comments</h2>
            <p class="amount">${comments}</p>
          </div>
          <div class="block">
            <h2 class="title">Downloads</h2>
            <p class="amount">${downloads}</p>
          </div>
        </div>
      </li>`;
      }
    )
    .join('');
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

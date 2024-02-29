let currentPage = 1;
let currentCategory = null;
let currentKeyword = null;
let isLoading = false;
let lastArticleCount = 0;

const searchKeywordInput = document.getElementById('searchKeyword');
const categorySelect = document.getElementById('category');
const newsContainer = document.getElementById('newsContainer');

// Array para armazenar os artigos carregados
let cachedArticles = [];

// Variável para armazenar se uma requisição está em andamento
let isFetching = false;

// Evento de rolagem da janela para carregar mais notícias
window.onscroll = function () {
    // Verifica se uma requisição já está em andamento ou se o usuário já está perto do final da página
    if (!isFetching && (window.innerHeight + window.scrollY) >= document.body.offsetHeight - 10) {
        // Define isFetching para true para evitar múltiplas requisições simultâneas
        isFetching = true;

        // Verifica se estamos buscando por palavra-chave ou categoria e chama a função fetchNews apropriada
        if (currentKeyword) {
            fetchNews(true);
        } else {
            fetchNews(false);
        }
    }
}

function fetchNews(isSearching) {
    // Verifica se há artigos no cache antes de fazer uma nova requisição à API
    if (cachedArticles.length > 0 && currentPage <= Math.ceil(cachedArticles.length / 10)) {
        displayArticlesFromCache();
        return;
    }

    if (isLoading) return;

    isLoading = true;
    let url;
    
    if (isSearching) {
        const keyword = searchKeywordInput.value;
        url = `https://newsapi.org/v2/everything?q=${keyword}&apiKey=${API_KEY}&page=${currentPage}`;
    } else {
        const category = currentCategory || categorySelect.value;
        url = `https://newsapi.org/v2/top-headlines?country=us&category=${category}&apiKey=${API_KEY}&page=${currentPage}`;
    }

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao carregar os dados. Por favor, tente novamente mais tarde.');
            }
            return response.json();
        })
        .then(data => {
            if (currentPage === 1) {
                newsContainer.innerHTML = '';
            }

            const articlesWithImage = data.articles.filter(article => article.urlToImage);

            lastArticleCount = articlesWithImage.length;

            const newsItems = []; // Array para armazenar os itens de notícia

            articlesWithImage.forEach(article => {
                const newsItem = `
                    <div class="container d-flex align-items-center mt-4 pb-3 newsItem">
                        <div class="newsImage">
                            <img src="${article.urlToImage}" alt="${article.title}">
                        </div>
                        <div class="newsContent">
                            <div class="info">
                                <h5>${article.source.name}</h5>
                                <span>|</span>
                                <h5>${article.publishedAt}</h5>
                            </div>
                            <h2>${article.title}</h2>
                            <p>${article.description}</p>
                            <a href="${article.url}" target="_blank">Leia Mais</a>
                        </div>
                    </div>
                `;
                newsItems.push(newsItem); // Adiciona cada item de notícia ao array
            });

            // Junte todos os itens de notícias em uma única string usando o método join()
            newsContainer.innerHTML += newsItems.join('');

            currentPage++;
            isLoading = false;
        })
        .catch(error => {
            displayErrorMessageModal("Ocorreu um erro ao buscar as notícias. Por favor, tente novamente mais tarde.");
            isLoading = false;
        });
}


// Função para exibir artigos do cache
function displayArticlesFromCache() {
    const newsContainer = document.getElementById('newsContainer');
    const startIndex = (currentPage - 1) * 10;
    const endIndex = Math.min(currentPage * 10, cachedArticles.length);

    for (let i = startIndex; i < endIndex; i++) {
        const article = cachedArticles[i];
        const newsItem = `
            <div class="container d-flex align-items-center mt-4 pb-3 newsItem">
                <!-- Estrutura do artigo -->
            </div>
        `;
        newsContainer.innerHTML += newsItem;
    }

    currentPage++;
}




searchKeywordInput.addEventListener('input', function () {
    currentPage = 1;
    currentCategory = null;
    currentKeyword = this.value;
});

document.getElementById('fetchCategory').addEventListener('click', function () {
    currentPage = 1;
    currentKeyword = null;
    fetchNews(false);
});

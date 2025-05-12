console.log('IT’S ALIVE!');

// function $$(selector, context = document) {
//   return Array.from(context.querySelectorAll(selector));
// }

// BUILDING NAV BAR
let pages = [
    { url: '', title: 'Home' },
    { url: 'matchmaking/matchmaking.html', title: 'Find Your Match!' },
    { url: 'writeup.html', title: 'Write-Up' },
    { url: 'https://github.com/gracegmc/MouseMatch', title: 'Github Repo'},
  ];

const BASE_PATH = (location.hostname === "localhost" || location.hostname === "127.0.0.1")
    ? "/projects/project3/MouseMatch/"      // Local server
    : "/MouseMatch/";                       // GitHub Pages repo name

let nav = document.createElement('nav');
document.body.prepend(nav);

for (let p of pages) {
    let url = p.url;
    let title = p.title;

    url = !url.startsWith('http') ? BASE_PATH + url : url;

    let a = document.createElement('a');
    a.href = url;
    a.textContent = title;

    if (a.host === location.host && a.pathname === location.pathname) {
        a.classList.add('current');
    } 

    if (a.host !== location.host) {
        a.target = "_blank";
    } 

    nav.append(a);
}

// SETTING THEME
document.body.insertAdjacentHTML(
    'afterbegin',
    `
      <label class="color-scheme">
          Theme:
          <select>
              <option value="light dark">Automatic</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
          </select>
      </label>`,
);

// Function to set the color scheme to prevent redundant code
function setColorScheme(colorScheme) {
    // Apply the color scheme
    document.documentElement.style.setProperty('color-scheme', colorScheme);
    
    // Save the color-scheme preference to localStorage
    localStorage.colorScheme = colorScheme;
}

const select = document.querySelector('.color-scheme select');

if ("colorScheme" in localStorage) {
    // Apply the saved preference
    setColorScheme(localStorage.colorScheme);
    
    // Update the select element to match
    select.value = localStorage.colorScheme;
}

select.addEventListener('input', function (event) {
    setColorScheme(event.target.value)
});

// fetchJSON
export async function fetchJSON(url) {
    try {
        // Fetch the JSON file from the given URL
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch projects: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
    } catch (error) {
      console.error('Error fetching or parsing JSON data:', error);
    }
}

//render mice 
export function renderMice(mice, containerElement, headingLevel = 'h2') {
    // Validate containerElement
    if (!(containerElement instanceof Element)) {
      console.error('Invalid containerElement provided to renderProjects');
      return;
    }
  
    // Validate headingLevel
    const validHeadings = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
    if (!validHeadings.includes(headingLevel)) {
      console.warn(`Invalid headingLevel "${headingLevel}". Defaulting to "h2".`);
      headingLevel = 'h2';
    }
  
    // Clear the container
    containerElement.innerHTML = '';
    for (let m of mice){
        // Create article element
        const article = document.createElement('article');
  
        //fixing path issues between local and github host
        const BASE_PATH = (location.hostname === "localhost" || location.hostname === "127.0.0.1")
        ? "/labs/lab1/portfolio/"       // Local server
        : "/portfolio/";                // GitHub Pages repo name

        // Handle missing data with fallbacks
        const name = m.name || 'Untitled Mice';
        const gender = m.gender || "no gender defined";
        // const image = m.image || 'https://via.placeholder.com/150';
        const cluster = m.cluster || 'no cluster';
        const description = m.description || 'No description provided';
        let path = m.path || 'mice/mice_not_found.html';



        path = !path.startsWith('http') ? BASE_PATH + path : path;

        // console.log(`project name: ${title}, path: ${path}`)

        // Populate content dynamically
        article.innerHTML = `
            <a href = ${path}>
                <${headingLevel}>${name}</${headingLevel}>
                <p class="gender"> ${gender}</p>
                <p class="cluster"> ${cluster}</p>
                <p>${description}</p>
            </a>
        `;
        // Append article to container
        containerElement.appendChild(article);
    }
}
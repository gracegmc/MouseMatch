import { fetchJSON, renderProjects } from '../global.js';
const mice = await fetchJSON('./mice/mice.json');
const miceContainer = document.querySelector('.mice');
renderProjects(projects, projectsContainer, 'h2');

const form = document.querySelector('form');

form?.addEventListener('submit', function(event) {
    event.preventDefault();

    // store data of form here
    const data = new FormData(this);

    //get the mailto part of the url
    let url = this.action + '?';

    for (let [name, value] of data) {
        url += `${name}=${encodeURIComponent(value)}&`
    }

    location.href = url.slice(0, -1);
});


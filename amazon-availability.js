let parallelLoadCount = 3;

let boxElements = [
    '[data-feature-name="dpFastTrackInsideBuyBox"]',
    '[data-feature-name="promiseBasedBadgeInsideBuyBox"]',
    '[data-feature-name="availabilityInsideBuyBox"]',
    '[data-feature-name="businessOnlySelectionBuyBox"]',
    '[data-feature-name="promiseBasedBadge"]',
    '[data-feature-name="availability"]'
];

let items = [];

document.querySelectorAll('.s-result-list div[data-asin]:not([data-asin=""])').forEach(item => {
    let container = item.querySelector('div.a-section');
    if (!container)
        return;

    let anchor = item.querySelector('h2 a');
    if (!anchor)
        return;

    let name = anchor.querySelector('span');
    if (!name)
        return;

    items.push({
        name: name.innerText,
        url: anchor.href,
        container: container.parentElement
    });
});

document.querySelectorAll('li.zg-item-immersion').forEach(item => {
    let container = item.querySelector('.zg-item');
    if (!container)
        return;

    let anchor = item.querySelector('a');
    if (!anchor)
        return;

    let name = anchor.querySelector('div');
    if (!name)
        return;

    items.push({
        name: ''/*name.innerText*/,
        url: anchor.href,
        container: container
    });
});

items.forEach(item => {
    item.displayElement = document.createElement('div');
    item.displayElement.className = 'amazon-availability-box';
    item.displayElement.innerText = 'Loading availability...';

    item.container.appendChild(item.displayElement);
});

console.log('Checking availability for ' + items.length + ' products...');

let loadItem = function (index) {
    if (index >= items.length)
        return;

    let item = items[index];

    console.log('Checking availability for "' + item.name + '" at: ' + item.url);

    fetch(item.url, {
        credentials: 'same-origin'
    })
    .then(response => {
        if (response.status != 200) {
            console.log('Error (status code ' + response.status + ') loading: ' + item.url);
        } else {
            response.text().then(bodyText => {
                let parser = new DOMParser();
                let doc = parser.parseFromString(bodyText, "text/html");
                item.displayElement.innerHTML = '';

                boxElements.forEach(boxElement => {
                    let el = doc.querySelector(boxElement);
                    if (el)
                        item.displayElement.appendChild(el);
                });

                if (item.displayElement.innerHTML == '')
                    item.displayElement.innerHTML = 'No availability data found.';

            })
        }
    })
    .catch(error => {
        console.log(error);
    })
    .finally(() => {
        loadItem(index + parallelLoadCount);
    });
}

for (let i = 0; i < parallelLoadCount; ++i)
    loadItem(i);

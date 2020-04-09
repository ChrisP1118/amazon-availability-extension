let boxElements = [
    '[data-feature-name="dpFastTrackInsideBuyBox"]',
    '[data-feature-name="promiseBasedBadgeInsideBuyBox"]',
    '[data-feature-name="availabilityInsideBuyBox"]',
    '[data-feature-name="businessOnlySelectionBuyBox"]',
    '[data-feature-name="promiseBasedBadge"]',
    '[data-feature-name="availability"]'
];

let parallelLoadCount = 3;

let blocks = document.querySelectorAll('.s-result-list div[data-asin]:not([data-asin=""])');
console.log('Checking availability for ' + blocks.length + ' products...');

blocks.forEach(block => {
    //let availabilityBlockContainer = block.querySelector('div.s-expand-height div.a-section');
    let availabilityBlockContainer = block.querySelector('div.a-section');

    if (!availabilityBlockContainer)
        return;

    availabilityBlockContainer = availabilityBlockContainer.parentElement;

    let availabilityBlock = document.createElement('div');
    availabilityBlock.className = 'amazon-availability-box';
    availabilityBlock.innerText = 'Loading availability...';

    availabilityBlockContainer.appendChild(availabilityBlock);
})

let loadBlock = function (index) {
    if (index >= blocks.length)
        return;

    let block = blocks[index];
    let availabilityBlock = block.querySelector('div.amazon-availability-box');
    let anchor = block.querySelector('h2 a');
    let name = anchor.querySelector('span').innerText;

    if (!availabilityBlock) {
        console.log('No availability block found for "' + name + '" (at: ' + anchor.href + ')');
        loadBlock(index + parallelLoadCount);
        return;
    }

    console.log('Checking availability for "' + name + '" at: ' + anchor.href);

    fetch(anchor.href, {
        credentials: 'same-origin'
    })
    .then(response => {
        if (response.status != 200) {
            console.log('Error (status code ' + response.status + ') loading: ' + anchor.href);
        } else {
            response.text().then(bodyText => {
                let parser = new DOMParser();
                let doc = parser.parseFromString(bodyText, "text/html");
                availabilityBlock.innerHTML = '';

                boxElements.forEach(boxElement => {
                    let el = doc.querySelector(boxElement);
                    if (el)
                        availabilityBlock.appendChild(el);
                });

                if (availabilityBlock.innerHTML == '')
                    availabilityBlock.innerHTML = 'No availability data found.';

            })
        }
    })
    .catch(error => {
        console.log(error);
    })
    .finally(() => {
        loadBlock(index + parallelLoadCount);
    });
}

for (let i = 0; i < parallelLoadCount; ++i)
    loadBlock(i);

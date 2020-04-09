let boxElements = [
    'dpFastTrackInsideBuyBox',
    'promiseBasedBadgeInsideBuyBox',
    'availabilityInsideBuyBox'
];

let parallelLoadCount = 3;

let blocks = document.querySelectorAll('.s-result-list div[data-asin]');
console.log('Checking availability for ' + blocks.length + ' products...');

let loadBlock = function (index) {
    if (index >= blocks.length)
        return;

    let block = blocks[index];
    let anchor = block.querySelector('h2 a');
    let name = anchor.querySelector('span').innerText;
    let availabilityBlockContainer = block.querySelector('div.s-expand-height');
    console.log('Checking availability for "' + name + '" at: ' + anchor.href);

    fetch(anchor.href, {
        credentials: 'same-origin'
    })
    .then(response => {
        if (response.status != 200) {
            console.log('Error (status code ' + response.status + ') loading: ' + anchor.href);
            return;
        }

        response.text().then(bodyText => {
            let parser = new DOMParser();
            let doc = parser.parseFromString(bodyText, "text/html");
            let buyBox = doc.getElementById('desktop_qualifiedBuyBox');
            
            if (buyBox) {
                let availabilityBlock = document.createElement('div');
                availabilityBlock.className = 'amazon-availability-box';

                boxElements.forEach(boxElement => {
                    let el = buyBox.querySelector('[data-feature-name="' + boxElement + '"]');
                    if (el)
                        availabilityBlock.appendChild(el);
                })

                availabilityBlockContainer.appendChild(availabilityBlock);
            }
        })
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

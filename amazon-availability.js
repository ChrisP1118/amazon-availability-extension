let boxElements = [
    'dpFastTrackInsideBuyBox',
    'promiseBasedBadgeInsideBuyBox',
    'availabilityInsideBuyBox'
]

console.log('Checking availability...');
let blocks = document.querySelectorAll('.s-result-list div[data-asin]');
blocks.forEach((block, index) => {
    if (index < 5) {
        let anchor = block.querySelector('h2 a');
        let name = anchor.querySelector('span').innerText;
        let availabilityBlockContainer = block.querySelector('div.s-expand-height');
        console.log(name + ': ' + anchor.href);

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
        });
    }
});


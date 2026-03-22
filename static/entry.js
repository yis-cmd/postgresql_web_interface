function makeURL () {
    const tableName = document.getElementById('table-input').value;
    const nameInput = document.getElementById('name-input').value;
    return `http://127.0.0.1:6543/${tableName}?name=${nameInput}`
}

async function getData (event) {
    event.preventDefault()

    const page = document.getElementById('page')
    page.innerHTML = ''

    const url = makeURL()

    const dict_of_results = await fetch(url).
    then(res => res.json()).
    catch(err => console.log(`error fetching: `, err))

    const list_of_results = Object.values(dict_of_results)[0]
    for (const user of list_of_results) {
        const userBox = document.createElement('div');
        userBox.className = "users-boxes"
        Object.entries(user).forEach(
            ([attrName, attrValue]) => {
                const attrBox = document.createElement('div');
                const attrNameBox = document.createElement('span');
                const attrValueBox = document.createElement('span');
                attrNameBox.innerText = `${attrName}: `;
                attrValueBox.innerText = attrValue;
                attrBox.append(attrNameBox, attrValueBox)
                userBox.appendChild(attrBox)
            }        
        )
        page.appendChild(userBox)
    }
}
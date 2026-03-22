function translateTypes(rawColumnSpecs) {
    const types_tr = {
        'str':'text',
        'int':'number',
        'float':'number',
        'bool':'text'
    }
    const columnSpecs = {}
    for (const [key, type] of Object.entries(rawColumnSpecs)) {
        columnSpecs[key] = types_tr[type] || 'text'
    }
    return columnSpecs
}

/*get input in the form 
{column_name:column_type}*/
async function setColumnInputs(schema, table) {
    const rawColumnNames = await fetch(`http://127.0.0.1:6543/metadata/columns?schema=${schema}&table=${table}`);
    const rawColumnSpecs = await rawColumnNames.json()
    const columnSpecs = translateTypes(rawColumnSpecs)
    console.log(columnSpecs)
    const columnInputDiv = document.getElementById('enter-column-spec');
    columnInputDiv.innerHTML = ''
    for (const [column, type] of Object.entries(columnSpecs)) {
        const columnInput = document.createElement('input');
        columnInput.type = type
        columnInput.placeholder = column
        columnInput.name = column
        columnInputDiv.appendChild(columnInput)
    }
    const queryButton = document.createElement('button')
    queryButton.type = 'button'
    queryButton.addEventListener('click', () => getData(table))
    queryButton.innerText = 'query'
    columnInputDiv.appendChild(queryButton)
}

/*get input in the form 
{'str' : list[table_name, table_name, ...]}*/
async function setTableNameButtons(schema_name) {
    const tableSelectionDiv = document.getElementById('select-table')
    const rawTableNames = await fetch(`http://127.0.0.1:6543/metadata/tables?schema=${schema_name}`)
    const tableNames = await rawTableNames.json().
    then(res => Object.values(res)[0])
    if (tableNames.length === 0) {
        tableSelectionDiv.innerText = 'no tables in this schema yet'
    } else {
        console.log(tableNames)
        for (const table of tableNames){
            const tableButton = document.createElement('button')
            tableButton.type = 'button'
            tableButton.addEventListener('click', () => setColumnInputs(schema_name, table))
            tableButton.innerText = table
            tableSelectionDiv.appendChild(tableButton)
        }
    }
}

function makeURL (table, params) {
    const head = `http://127.0.0.1:6543/data/${table}`
    const paramsString = new URLSearchParams(params).toString()
    const fullURL = `${head}?${paramsString}`
    console.log(`full URL: ${fullURL}`)
    return fullURL
}

async function getData (table) {
    const formElement = document.getElementById('select-box')
    const formData = new FormData(formElement)
    const dictOfParams = {}
    formData.forEach ((attrValue, attrName) => {
        if (attrValue.trim() !== '') {
            dictOfParams[attrName] = attrValue.trim()
        }
    })
    console.log(dictOfParams)

    const url = makeURL(table ,dictOfParams)

    const page = document.getElementById('page')
    page.innerHTML = ''

    const dict_of_results = await fetch(url).
    then(res => res.json()).
    catch(err => console.log(`error fetching: `, err))

    const list_of_results = Object.values(dict_of_results)[0]
    for (const item of list_of_results) {
        const userBox = document.createElement('div');
        userBox.className = "users-boxes"
        Object.entries(item).forEach(
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

setTableNameButtons('public')
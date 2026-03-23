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

function setGenericElement (elementType, elementText = null, elementID = null, elementClass = null) {
    const newElement = document.createElement(elementType || 'p')
    if (elementText) newElement.innerText = elementText
    if (elementID) newElement.id = elementID
    if (elementClass) newElement.className = elementClass
    return newElement
}

function setUpButton (buttonClass, buttonType, buttonText, buttonID, buttonOnClick) {
    const newButton = setGenericElement('button', buttonText, buttonID, buttonClass)
    newButton.type = buttonType
    newButton.addEventListener('click', buttonOnClick)
    return newButton
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
    const queryButton = setUpButton('query-button', 'button', 'query', null, () => getData(table))
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
            const tableButton = setUpButton('table-names', 'button', table, null,  (() => setColumnInputs(schema_name, table)))
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
        const resultBox = setGenericElement ('div',null, null, elementClass="results-boxes")
        for (const [attrName, attrValue] of Object.entries(item)) {
            const attrBox = setGenericElement ('div',null,null,'result-attr-box')
            const attrNameBox = setGenericElement ('span', `${attrName}: `);
            const attrValueBox = setGenericElement ('span', attrValue);
            attrBox.append(attrNameBox, attrValueBox)
            resultBox.appendChild(attrBox)
        }        
        page.appendChild(resultBox)
    }
}

setTableNameButtons('public')
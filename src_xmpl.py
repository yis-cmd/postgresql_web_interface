from bottle import get, run, static_file, request, response
import os

from data_fetcher import *
from data_fetcher import fetch_metadata

ABS_PATH = os.path.dirname(os.path.abspath(__file__))

@get('/')
def home_page():
    return static_file(filename='index.html', root='./static')

@get('/favicon.ico')
def icon():
    return static_file(filename="favicon.png", root=ABS_PATH)

@get('/static/<filename>')
def static_files(filename):
    return static_file(filename, root='./static')

@get('/metadata/<datatype>')
def metadata(datatype):
    data = list(request.query.values())
    return fetch_metadata(datatype, data)

@get('/<table>')
def junction(table):
    model_class = TABLE_NAMES[table]
    attrs = dict(request.query)
    try:
        conv_attrs = {key:conv_type(model_class, key, str(value)) for key, value in attrs.items()}
    except ValueError:
        return {"error message":[{'error: ' : "incompatible types"}]}
    results = fetch_data(model_class, **conv_attrs)
    response.content_type = 'application/json'
    to_return = {f"{model_class}" :  results}
    print(to_return)
    return to_return

def conv_type(model_class, attr, value:str) -> object:
    column = getattr(model_class, attr)
    py_type = column.type.python_type
    if py_type is bool:
        return value.lower() in ('true', 'y', 't', 'yes', '1')
    return py_type(value)

run(host = 'localhost', port = 6543)
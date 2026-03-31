from datetime import datetime
from sqlalchemy import create_engine, select, Inspector
from sqlalchemy.orm import sessionmaker

from tables import *

__all__ = [
    'fetch_data',
    'TABLE_NAMES',
    'fetch_metadata'
]

engine = create_engine('postgresql+psycopg://python:123456@127.0.0.1/vscode')
Session = sessionmaker(bind=engine)
inspect = Inspector(engine)

def fetch_data(table_name, **kw) -> list[dict]:
    conditions = [getattr(table_name, key) == value for key, value in kw.items()]
    with Session() as session:
        stmt = select(table_name).where(*conditions)
        results = session.execute(stmt).scalars().all()
        return [r.to_dict() for r in results]

def fetch_metadata(datatype, **params) -> dict[str,str] | dict[str,list[str]]:
    try:
        match datatype:
            case 'tables':
                data = inspect.get_table_names(schema=params.get('schema'))
                print(f"{datetime.now()}: response is: {data}")
                return {'tables':data}
            case 'columns':
                raw_data = inspect.get_columns(schema=params.get('schema'), table_name=params.get('table'))
                data = {c.get('name'):c.get('type').python_type.__name__ for c in raw_data}
                print(f"{datetime.now()}: response for columns is: {data}\n{'='*60}")
                return data
            case _:
                return {'error':'unsupported datatype'}
    except Exception:
        return {'error' : 'necessary data not provided'}

if __name__ == "__main__":
    pass
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

def fetch_metadata(datatype, **params):
    try:
        match datatype:
            case 'tables':
                data = inspect.get_table_names(schema=params.get('schema'))
            case 'columns':
                raw_data = inspect.get_columns(schema=params.get('schema'), table_name=params['table'])
                data = [c.get('name') for c in raw_data]
    except Exception:
        data = {'error' : ['necessary data not provided']}
    print(f"response is: {data}")
    return {datatype:data}

if __name__ == "__main__":
    pass
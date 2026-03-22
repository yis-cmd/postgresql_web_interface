from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column

__all__ = [
    "Users",
    "Product",
    "TABLE_NAMES"
]

class Base(DeclarativeBase):
    def to_dict(self):
        return {c.name:getattr(self, c.name) for c in self.__table__.columns}

class Users(Base):
    __tablename__ = 'users'
    id: Mapped[int] = mapped_column(primary_key=True)
    is_active: Mapped[bool] = mapped_column()
    name: Mapped[str] = mapped_column()

class Product(Base):
    __tablename__ = 'product'
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column()
    price: Mapped[int] = mapped_column()
    in_stock: Mapped[bool] = mapped_column()

TABLE_NAMES = {'users' : Users, 'product' : Product}
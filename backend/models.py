from datetime import datetime
from sqlalchemy import *
from sqlalchemy.orm import (scoped_session, sessionmaker, relationship, backref)
from sqlalchemy.ext.declarative import declarative_base

engine = create_engine('sqlite:///database.sqlite3', convert_unicode=True)
db_session = scoped_session(sessionmaker(autocommit=False,
                                        autoflush=False,
                                        bind=engine))

Base = declarative_base()
Base.query = db_session.query_property()

# Models
class Group(Base):
    __tablename__ = 'group'
    name = Column(String(10), primary_key=True)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

class Label_Map(Base):
    __tablename__ = 'label_map'
    raw_id = Column(Integer, primary_key=True)
    usage_id = Column(Integer, primary_key=True)
    frames_id = Column(Integer, primary_key=True)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

class Crowd_Movies(Base):
    __tablename__ = 'crowd_movies'
    raw_id = Column(Integer, primary_key=True)
    video_path = Column(String(255), primary_key=True)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

class Sample(Base):
    __tablename__ = 'sample'
    uuid = Column(String(36), primary_key=True)
    name = Column(String(10), ForeignKey('group.name'))
    apparatus_name = Column(String)
    session_name = Column(String)
    start_time = Column(DateTime)
    subject_name = Column(String)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

    group = relationship(Group, backref=backref('sample', uselist=True, cascade='delete, all'))


'''
This usage class has an AssertionError bug: https://github.com/graphql-python/graphene-sqlalchemy/issues/121.
Trying to link usage_id and frames_id from label_map throw an AssertionError: You need to pass a valid SQLAlchemy Model in Group.Meta, received "<class 'models.Group'>".
This is done for usage_id and frames_id. Will figure this out later; won't spend much time as this schema may very well change.
'''
class Usage(Base):
    __tablename__ = 'usage'
    # PK not clarified - will use composite (UUID, raw_id, usage_id, frames_id)
    uuid = Column(String(36), ForeignKey('sample.uuid'), primary_key=True)
    raw_id = Column(Integer, ForeignKey('label_map.raw_id'))
    # usage_id = Column(Integer, ForeignKey('label_map.usage_id'), primary_key=True)
    # frames_id = Column(Integer, ForeignKey('label_map.frames_id'))
    usage_val = Column(Float)
    frames_val = Column(Float)
    name = Column(String(10), ForeignKey('group.name'))
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

    group = relationship(Group, backref=backref('usage', uselist=True, cascade='delete, all'))
    sample = relationship(Sample, backref=backref('usage', uselist=True, cascade='delete, all'))
    label_map = relationship(Label_Map, backref=backref('usage', uselist=True, cascade='delete, all'))


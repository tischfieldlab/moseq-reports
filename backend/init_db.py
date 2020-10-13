from models import engine, db_session, Base

def main():
    Base.metadata.create_all(bind=engine)
    

if __name__ == '__main__':
    main()
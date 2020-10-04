from models import engine, db_session, Base, Department, Employee

def main():
    Base.metadata.create_all(bind=engine)
    engineering = Department(name='Engineering')
    db_session.add(engineering)
    hr = Department(name='Human Resources')
    db_session.add(hr)

    peter = Employee(name='Peter', department=engineering)
    roy = Employee(name='Roy', department=engineering)
    db_session.add(roy)
    tracy = Employee(name='Tracy', department=hr)
    db_session.add(tracy)
    db_session.commit()

if __name__ == '__main__':
    main()
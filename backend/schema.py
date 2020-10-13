import graphene
from graphene import relay
from graphene_sqlalchemy import SQLAlchemyObjectType, SQLAlchemyConnectionField
from models import db_session, Group as GroupModel, Label_Map as LabelMapModel, Crowd_Movies as CrowdMoviesModel,\
    Sample as SampleModel, Usage as UsageModel

class Group(SQLAlchemyObjectType):
    class Meta:
        model = GroupModel
        interfaces = (relay.Node, )

class Label_Map(SQLAlchemyObjectType):
    class Meta:
        model = LabelMapModel
        interfaces = (relay.Node, )

class Crowd_Movies(SQLAlchemyObjectType):
    class Meta:
        model = CrowdMoviesModel
        interfaces = (relay.Node, )

class Sample(SQLAlchemyObjectType):
    class Meta:
        model = SampleModel
        interfaces = (relay.Node, )

class Usage(SQLAlchemyObjectType):
    class Meta:
        model = UsageModel
        interfaces = (relay.Node, )
    
class Query(graphene.ObjectType):
    node = relay.Node.Field()
    all_groups = SQLAlchemyConnectionField(Group.connection)
    all_label_maps = SQLAlchemyConnectionField(Label_Map.connection)
    all_crowd_movies = SQLAlchemyConnectionField(Crowd_Movies.connection)
    all_samples = SQLAlchemyConnectionField(Sample.connection)
    all_usages = SQLAlchemyConnectionField(Usage.connection)

schema = graphene.Schema(query=Query)

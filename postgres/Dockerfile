FROM postgres:10.3

ADD /tables/ /docker-entrypoint-initdb.d/tables/
ADD /tables/deploy_schemas.sql/ /docker-entrypoint-initdb.d/
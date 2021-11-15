# mytut6_IT5007

git clone -b master https://github.com/LinXin0901/mytut6_it5007.git

systemctl start mongod.service

mongo issuetracker --eval "db.employees.remove({})"

mongo issuetracker scripts/init.mongo.js

screen npm start
